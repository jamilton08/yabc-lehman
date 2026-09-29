import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import SiteNav from './SiteNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import { downloadText, fmtDuration, generateKeyPair, hasCrypto, importPrivateKey, openResult, parseEnvelopes, toCsv } from './yabcVerify.js';
import './site.css';

const KEY_STORE = 'yabc:verify-private-key';
const fmtDate = (iso) => { try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch { return iso; } };

const fmtPts = (n) => (n == null ? '—' : String(Math.round(n * 10) / 10));
const STATUS = { solved: 'Solved', right: 'Right', wrong: 'Missed', open: 'Not finished', broken: 'Could not load' };
const RELATION = { vertical: 'Vertical angles', linear: 'Linear pair', complementary: 'Complementary', around: 'Around a point', triangle: 'Triangle' };

/** One problem's tape, laid out like the student's screen: = signs lined up, the move under each side. */
function Tape({ p }) {
  const rows = [];
  const row = (key, lr, cls = '', mid = '=') => rows.push(
    <Fragment key={key}><div className={`vf-tl ${cls}`}>{lr[0]}</div><div className={`vf-te ${cls}`}>{mid}</div><div className={`vf-tr ${cls}`}>{lr[1]}</div></Fragment>
  );
  if (p.startSides) row('start', p.startSides);
  let n = 0, restore = null;
  (p.steps || []).forEach((s, i) => {
    if (s.kind === 'hint' || s.kind === 'note') {
      if (restore) { rows.push(<div key={`b${i}`} className="vf-tnote">↩ back to</div>); row(`br${i}`, restore); restore = null; }
      rows.push(<div key={i} className={`vf-tnote${s.kind === 'hint' ? ' hint' : ''}`}>{s.kind === 'hint' ? 'Hint: ' : ''}{s.text} <small>{s.t}s</small></div>);
      return;
    }
    if (!s.undone && restore) { rows.push(<div key={`b${i}`} className="vf-tnote">↩ back to</div>); row(`br${i}`, restore); restore = null; }
    if (!s.undone) n++;
    const u = s.undone ? 'is-undone' : '';
    rows.push(
      <div key={`s${i}`} className={`vf-tsay ${u}`}>
        <b>{s.undone ? '×' : n}</b> {s.say}{s.undone ? ' — undone' : ''}
        <small> · {s.via === 'keys' ? 'keyed' : s.via === 'button' ? 'button' : 'tapped'}{s.at ? ` ${s.at}` : ''} · {s.t}s</small>
      </div>
    );
    if (s.op) row(`o${i}`, [s.op, s.op], `vf-top ${u}`, '');
    row(`t${i}`, s.to, u);
    if (s.undone) restore = s.from;
  });
  if (restore) { rows.push(<div key="bend" className="vf-tnote">↩ back to</div>); row('brend', restore); }
  return <div className="vf-tape">{rows}</div>;
}

/** Calculator blocks in a result: a line per problem, the tape on click. */
function CalcWork({ work }) {
  return work.map((w) => (
    <div key={w.calc} className="vf-calc">
      <h4>{w.title} <small>· {w.moves === 'tap' ? 'tap to move' : w.moves === 'type' ? 'keyed moves' : 'tap or key'}</small></h4>
      {(w.problems || []).map((p) => (
        <details key={p.n} className={`vf-prob st-${p.status}`}>
          <summary>
            <span className="vf-pn">{p.n}</span>
            {p.ask && <span className="vf-ask">{p.ask}</span>}
            <span className="vf-peq">{p.kind === 'spot' ? `Spot ${p.spot}: ` : ''}{p.kind === 'angles' && p.labels ? `${RELATION[p.relation] || p.relation}: ${p.labels.join(', ')}` : p.start || p.eq}</span>
            <span>{STATUS[p.status] || p.status}{p.answer && p.kind !== 'spot' ? ` · ${p.answer}` : ''}</span>
            {(p.kind === 'solve' || p.kind === 'angles') && p.status !== 'broken' && <span>{p.moves} move{p.moves === 1 ? '' : 's'} · par {p.par}{p.hints ? ` · ${p.hints} hint${p.hints === 1 ? '' : 's'}` : ''}{p.undos ? ` · ${p.undos} undo${p.undos === 1 ? '' : 's'}` : ''}</span>}
            {p.kind === 'spot' && <span>{p.tries} check{p.tries === 1 ? '' : 's'}</span>}
            <b>{fmtPts(p.earned)} / {fmtPts(p.possible)}</b>
          </summary>
          {p.error && <p className="bad">{p.error}</p>}
          {p.kind === 'spot' && (
            <div className="vf-spot">
              {(p.picks || []).map((pk, i) => <p key={i}><strong>Check {i + 1}:</strong> {pk.length ? pk.join(', ') : 'nothing picked'}</p>)}
              <p><strong>Right answer:</strong> {(p.answer || []).join(', ') || 'none'}</p>
            </div>
          )}
          {(p.kind === 'solve' || p.kind === 'angles') && !p.error && (<>
            {p.setup && (
              <p className="vf-tmeta"><strong>How the angles are related:</strong> {p.setup.given.length ? p.setup.given.map((g, i) => `${g}${p.setup.done && !p.setup.revealed && i === p.setup.given.length - 1 ? ' ✓' : ' ✗'}`).join(' → ') : 'not picked yet'}{p.setup.revealed ? ' → shown by the calculator' : ''}</p>
            )}
            {(!p.setup || p.setup.given.length > 0) && <Tape p={p} />}
            {p.special?.length > 0 && <p className="vf-tmeta"><strong>What x disappearing means:</strong> {p.special.join(' → ')}</p>}
            {p.measure && (
              <p className="vf-tmeta"><strong>Angle {p.measure.asked}:</strong> {p.measure.given.length ? p.measure.given.map((g) => `${g}°`).join(' → ') : 'not answered'} · right answer {p.measure.answer}{p.measure.missed ? ' (missed)' : ''}</p>
            )}
            {p.check && <p className="vf-tmeta ok">{p.check}</p>}
            {p.blocked?.length > 0 && (
              <p className="vf-tmeta"><strong>Blocked or locked:</strong> {p.blocked.map((b) => `${b.why} (${b.t}s)`).join(' · ')}</p>
            )}
          </>)}
        </details>
      ))}
    </div>
  ));
}

/** Teacher page: open students' encrypted .yabc result files. */
export default function VerifyPage() {
  useEffect(() => { document.title = 'Verify result files · Mr. Cruz · The Lehman YABC'; }, []);

  const [keyText, setKeyText] = useState(() => { try { return localStorage.getItem(KEY_STORE) || ''; } catch { return ''; } });
  const [key, setKey] = useState(null);
  const [keyMsg, setKeyMsg] = useState('');
  useEffect(() => {
    let live = true;
    if (!keyText.trim()) { setKey(null); setKeyMsg(''); return; }
    importPrivateKey(keyText).then((k) => { if (live) { setKey(k); setKeyMsg('Key loaded. It stays in this browser until you forget it.'); } })
      .catch((e) => { if (live) { setKey(null); setKeyMsg(e.message); } });
    return () => { live = false; };
  }, [keyText]);
  const saveKey = (t) => { setKeyText(t); try { if (t.trim()) localStorage.setItem(KEY_STORE, t); else localStorage.removeItem(KEY_STORE); } catch { /* private mode */ } };
  const keyFile = useRef(null);
  const onKeyFile = async (list) => { const f = list && list[0]; if (f) saveKey(await f.text()); if (keyFile.current) keyFile.current.value = ''; };

  const [fresh, setFresh] = useState(null);
  const makePair = async () => {
    if (!window.confirm('Make a NEW key pair? Files sealed with the current key will no longer open here, and you must paste the new public key into public/lesson-kit/yabc-lesson.js.')) return;
    const pair = await generateKeyPair();
    setFresh(pair);
    downloadText('teacher-private-key.jwk', JSON.stringify(pair.privateJwk, null, 2) + '\n', 'application/json');
    saveKey(JSON.stringify(pair.privateJwk));
  };

  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(null);
  const [paste, setPaste] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInput = useRef(null);

  const addEnvelopes = async (items) => {
    if (!key) return;
    setBusy(true);
    const next = [];
    for (const { envelope, file } of items) {
      const r = await openResult(envelope, key);
      const p = r.payload;
      next.push({
        id: `${envelope.badge}-${file}-${next.length}`,
        student: p ? p.student.name : envelope.student,
        lesson: p ? p.lesson.id : envelope.lesson,
        title: p ? p.lesson.title : envelope.title,
        course: p ? p.lesson.course : '',
        finished: p ? p.finished : envelope.finished,
        seconds: p ? p.seconds : null,
        activeSeconds: p ? p.activeSeconds : null,
        earned: p ? p.score.earned : null,
        possible: p ? p.score.possible : null,
        percent: p ? p.score.percent : null,
        tier: p ? p.tier : null,
        badge: envelope.badge,
        status: r.ok ? 'OK' : `FAILED — ${r.error}`,
        ok: r.ok, file, payload: p,
      });
    }
    setRows((old) => { const seen = new Set(old.map((r) => r.badge + r.file)); return [...old, ...next.filter((r) => !seen.has(r.badge + r.file))]; });
    setBusy(false);
  };

  const onFiles = async (list) => {
    const items = [];
    for (const f of Array.from(list || [])) {
      const text = await f.text();
      const envs = parseEnvelopes(text);
      envs.forEach((envelope) => items.push({ envelope, file: f.name }));
      if (!envs.length) items.push({ envelope: { yabc: 1, badge: '—', student: '—', lesson: '—', finished: '', data: '', key: '', iv: '' }, file: `${f.name} (not a result file)` });
    }
    await addEnvelopes(items);
    if (fileInput.current) fileInput.current.value = '';
  };
  const onPaste = async () => { const envs = parseEnvelopes(paste); await addEnvelopes(envs.map((envelope, i) => ({ envelope, file: `pasted #${i + 1}` }))); setPaste(''); };

  const dupNames = useMemo(() => { const by = new Map(); rows.forEach((r) => { if (r.ok) { const k = `${r.student}|${r.lesson}`; by.set(k, (by.get(k) || 0) + 1); } }); return by; }, [rows]);
  const sorted = useMemo(() => rows.slice().sort((a, b) => a.lesson.localeCompare(b.lesson) || a.student.localeCompare(b.student) || (a.finished || '').localeCompare(b.finished || '')), [rows]);

  return (
    <div className="site" id="top">
      <SiteNav />
      <main>
        <header className="r-hero">
          <p className="t-crumb"><a href="/">Home</a> / <a href="/lessons">Lessons</a> / Verify</p>
          <h1>Verify result files</h1>
          <p className="t-bio">
            Students finish a lesson and download a <code>.yabc</code> file. Drop those files here to see who did
            what, when, how long it took, the score, and every answer. Files are encrypted; nothing opens
            without your private key, and a file edited after it was made will not open at all.
          </p>
        </header>

        {!hasCrypto() && (
          <section className="sec"><div className="sec-head"><h2>Needs https</h2></div><p className="empty">This page has to run on a secure page (https or localhost) to decrypt anything.</p></section>
        )}

        <section className="sec" id="key">
          <div className="sec-head"><h2>Your key</h2><p className="sec-lead">Load the private key once. It is saved in this browser only — never in the site.</p></div>
          <div>
            <label className={`vf-drop${key ? ' is-off' : ''}`} style={{ marginBottom: 10 }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onKeyFile(e.dataTransfer.files); }}>
              <input ref={keyFile} type="file" accept=".jwk,.json,.txt" onChange={(e) => onKeyFile(e.target.files)} />
              <strong>{key ? 'Key loaded — drop a different teacher-private-key.jwk to switch' : 'Drop teacher-private-key.jwk here, or click to choose'}</strong>
              <span>Or paste its contents below.</span>
            </label>
            <textarea className="vf-key" rows={3} value={keyText} spellCheck={false} placeholder='{"kty":"RSA","d":"…" …}  — the contents of teacher-private-key.jwk' onChange={(e) => saveKey(e.target.value)} aria-label="Private key (JWK)" />
            <div className="vf-row">
              <p className={`vf-msg${key ? ' ok' : keyText.trim() ? ' bad' : ''}`}>{keyMsg || 'No key loaded yet.'}</p>
              {keyText && <button type="button" className="btn btn-ghost btn-sm" onClick={() => saveKey('')}>Forget key</button>}
            </div>
            <details className="vf-details">
              <summary>Need a new key pair?</summary>
              <p>
                This makes a fresh pair, downloads the private key, and loads it here. You then paste the public key into
                <code> public/lesson-kit/yabc-lesson.js</code> (one file — every lesson loads it) and redeploy. Files sealed
                with the old key will not open with the new one.
              </p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={makePair} disabled={!hasCrypto()}>Generate a new key pair</button>
              {fresh && (<>
                <p style={{ marginTop: 12 }}>Public key — replace <code>PUBLIC_KEY</code> in the kit with this:</p>
                <textarea className="vf-key" rows={3} readOnly value={JSON.stringify(fresh.publicJwk)} onFocus={(e) => e.target.select()} aria-label="New public key" />
              </>)}
            </details>
          </div>
        </section>

        <section className="sec" id="files">
          <div className="sec-head"><h2>Result files</h2><p className="sec-lead">Drop as many as you like. Pasted codes work too — one per line.</p></div>
          <div>
            <label className={`vf-drop${key ? '' : ' is-off'}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}>
              <input ref={fileInput} type="file" multiple accept=".yabc,.json,.txt" disabled={!key} onChange={(e) => onFiles(e.target.files)} />
              <strong>{key ? 'Drop .yabc files here, or click to choose' : 'Load your key first'}</strong>
              <span>Any number at once. Duplicates are skipped.</span>
            </label>
            <div className="vf-paste">
              <textarea rows={3} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Or paste result codes here" aria-label="Pasted result codes" disabled={!key} />
              <button type="button" className="btn btn-ink" onClick={onPaste} disabled={!key || !paste.trim() || busy}>Open pasted codes</button>
            </div>

            {rows.length > 0 && (<>
              <div className="vf-toolbar">
                <span>{rows.filter((r) => r.ok).length} opened{rows.some((r) => !r.ok) ? `, ${rows.filter((r) => !r.ok).length} failed` : ''}</span>
                <button type="button" className="btn btn-ghost" onClick={() => downloadText(`yabc-results-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(sorted), 'text/csv')}>Download CSV</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setRows([]); setOpen(null); }}>Clear</button>
              </div>
              <div className="vf-scroll">
                <table className="vf-table">
                  <thead><tr><th>Student</th><th>Lesson</th><th>Finished</th><th>Time</th><th>Score</th><th>Tier</th><th>Code</th><th>Status</th></tr></thead>
                  <tbody>
                    {sorted.map((r) => (
                      <Fragment key={r.id}>
                        <tr className={`${r.ok ? '' : 'is-bad'}${open === r.id ? ' is-open' : ''}`} onClick={() => setOpen(open === r.id ? null : r.id)}>
                          <td>{r.student}{r.ok && dupNames.get(`${r.student}|${r.lesson}`) > 1 && <span className="pill muted" title="More than one file for this student and lesson">×{dupNames.get(`${r.student}|${r.lesson}`)}</span>}</td>
                          <td>{r.title || r.lesson}{r.course && <small> · {r.course}</small>}</td>
                          <td>{r.finished ? fmtDate(r.finished) : '—'}</td>
                          <td>{r.seconds != null ? fmtDuration(r.seconds) : '—'}{r.activeSeconds != null && r.activeSeconds < r.seconds - 60 ? <small> ({fmtDuration(r.activeSeconds)} active)</small> : null}</td>
                          <td>{r.earned != null ? <><b>{r.earned}</b> / {r.possible}{r.percent != null && <small> {r.percent}%</small>}</> : '—'}</td>
                          <td>{r.tier || '—'}</td>
                          <td><code>{r.badge}</code></td>
                          <td className={r.ok ? 'ok' : 'bad'}>{r.status}</td>
                        </tr>
                        {open === r.id && (
                          <tr className="vf-detail">
                            <td colSpan={8}>
                              <div className="vf-detail-grid">
                                <div>
                                  <p><strong>File:</strong> {r.file}</p>
                                  {r.payload && <p><strong>Started:</strong> {fmtDate(r.payload.started)} · <strong>Lesson version:</strong> {r.payload.lesson.version} · <strong>Kit:</strong> {r.payload.kit}</p>}
                                  {r.payload?.sections?.length > 0 && (
                                    <table className="syl-table"><thead><tr><th>Section</th><th>Result</th></tr></thead><tbody>
                                      {r.payload.sections.map((s, i) => <tr key={i}><td>{s.title}</td><td>{s.status != null ? s.status : `${s.earned}${s.possible != null ? ` / ${s.possible}` : ''}`}</td></tr>)}
                                    </tbody></table>
                                  )}
                                  {r.payload?.extra?.work?.length > 0 && <CalcWork work={r.payload.extra.work} />}
                                  {r.payload?.extra?.answers?.length > 0 && (
                                    <table className="syl-table" style={{ marginTop: 10 }}><thead><tr><th>Checkpoint</th><th>Question</th><th>Answer given</th><th>Tries</th><th>Result</th></tr></thead><tbody>
                                      {r.payload.extra.answers.flatMap((c) => (c.answers || []).map((a) => (
                                        <tr key={`${c.quiz}-${a.q}`}><td>{c.quiz}</td><td>{a.q}</td><td>{Array.isArray(a.given) ? a.given.map((i) => `#${i + 1}`).join(', ') : typeof a.given === 'number' ? `#${a.given + 1}` : String(a.given ?? '')}</td><td>{a.tries}</td><td>{a.status} · {a.earned}</td></tr>
                                      )))}
                                    </tbody></table>
                                  )}
                                </div>
                                {r.payload && (
                                  <details>
                                    <summary>{r.payload.events.length} logged events · raw data</summary>
                                    <pre>{JSON.stringify({ extra: r.payload.extra, events: r.payload.events, env: r.payload.env }, null, 1)}</pre>
                                  </details>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
