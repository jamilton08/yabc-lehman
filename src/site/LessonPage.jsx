import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SiteNav from './SiteNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import Markdown, { useTextFile } from '../md/Markdown.jsx';
import { frontMatter, renderInline } from '../md/render.js';
import { KINDS, findLesson, isPosted, lessonBase, lessonHref, lessonSrc, resolveFile } from './lessons.js';
import './site.css';

/* ── small bits ────────────────────────────────────────────────────── */
const ICONS = {
  md:       <svg viewBox="0 0 20 20" className="ico" aria-hidden="true"><path d="M4 3h9l3 3v11H4z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M7 9h6M7 12h6M7 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  html:     <svg viewBox="0 0 20 20" className="ico" aria-hidden="true"><rect x="2.5" y="4" width="15" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M7 9l-2 1.5L7 12M13 9l2 1.5-2 1.5M11 8l-2 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" /></svg>,
  pdf:      <svg viewBox="0 0 20 20" className="ico" aria-hidden="true"><path d="M4 3h9l3 3v11H4z" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M7 14c1-4 3-4 1-8 3 5 5 6 6 7-3-1-6 0-7 1z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>,
  link:     <svg viewBox="0 0 20 20" className="ico" aria-hidden="true"><path d="M8 12l4-4M11 5h4v4M15 11v4H5V5h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  download: <svg viewBox="0 0 20 20" className="ico" aria-hidden="true"><path d="M10 3v9m0 0l-3-3m3 3l3-3M4 15h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  lesson:   <svg viewBox="0 0 20 20" className="ico" aria-hidden="true"><path d="M10 3l7 7-7 7-7-7z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M10 7.5l2.5 2.5L10 12.5 7.5 10z" fill="currentColor" /></svg>,
};
const fmtClock = (sec) => { const m = Math.floor(sec / 60), s = sec % 60; return `${m}:${String(s).padStart(2, '0')}`; };
const tierFor = (pct) => pct >= 90 ? 'Mastered' : pct >= 75 ? 'Proficient' : pct >= 60 ? 'Developing' : 'Keep going';
const NAME_KEY = 'yabc:student-name';

/* ── the markdown stage: article + rail ────────────────────────────── */
function MdStage({ course, lesson, file, graded, onMaterial }) {
  const url = resolveFile(course, lesson, file);
  const { text, error, loading } = useTextFile(url);
  const doc = useMemo(() => (text != null ? frontMatter(text) : null), [text]);
  const [outline, setOutline] = useState([]);
  const [current, setCurrent] = useState('');
  const [quizzes, setQuizzes] = useState({});
  const [name, setName] = useState(() => { try { return sessionStorage.getItem(NAME_KEY) || ''; } catch { return ''; } });
  const [started, setStarted] = useState(null);
  const [tick, setTick] = useState(0);
  const [finished, setFinished] = useState(false);
  const [err, setErr] = useState('');
  const resultRef = useRef(null);
  const kit = typeof window !== 'undefined' ? window.YABC : null;

  const onQuiz = useCallback((r) => setQuizzes((q) => ({ ...q, [r.id]: r })), []);
  const list = useMemo(() => Object.values(quizzes).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })), [quizzes]);
  const possible = list.reduce((n, q) => n + q.possible, 0);
  const earned = list.reduce((n, q) => n + q.earned, 0);
  const hasChecks = list.length > 0;
  const gradable = graded && (hasChecks || lesson.graded);

  useEffect(() => { if (!started) return; const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, [started]);

  // highlight the section in view
  useEffect(() => {
    if (!outline.length) return;
    const els = outline.map((o) => document.getElementById(o.id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setCurrent(vis[0].target.id);
    }, { rootMargin: '-80px 0px -70% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [outline]);

  const start = () => {
    const n = name.trim();
    if (n.length < 2) { setErr('Type your full name first.'); return; }
    if (!kit) { setErr('The grading kit did not load. Reload the page.'); return; }
    try {
      kit.lesson({ id: lesson.slug, title: lesson.title, version: doc?.meta?.version || '1.0', course: course.slug, possible });
      kit.start(n);
      try { sessionStorage.setItem(NAME_KEY, n); } catch { /* private mode */ }
      setStarted(Date.now()); setErr('');
    } catch (e) { setErr(e.message); }
  };

  const log = useCallback((type, data) => { try { kit?.log(type, data); } catch { /* not started */ } }, [kit]);

  const finish = async () => {
    if (!kit || !started) return;
    const pct = possible ? Math.round(100 * earned / possible) : 100;
    const open = list.filter((q) => !q.done).length;
    if (open && !window.confirm(`${open} checkpoint${open === 1 ? '' : 's'} still ha${open === 1 ? 's' : 've'} unanswered questions. Finish anyway? Unanswered questions score 0.`)) return;
    setFinished(true);
    try {
      await kit.endScreen(resultRef.current, {
        earned, possible,
        sections: list.map((q) => ({ id: q.id, title: q.title, earned: q.earned, possible: q.possible })),
        tier: possible ? tierFor(pct) : 'Completed',
        extra: { answers: list.map((q) => ({ quiz: q.id, answers: q.answers })) },
      });
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) { setErr(e.message); }
  };

  const elapsed = started ? Math.round((Date.now() - started) / 1000) + tick * 0 : 0;

  if (loading) return <div className="paper"><p className="stage-loading">Loading…</p></div>;
  if (error || !doc) return <div className="paper"><p className="empty">Could not load <code>{file}</code> ({error}). Is the file in <code>{lessonBase(course, lesson)}</code>?</p></div>;

  const enabled = !gradable || Boolean(started);

  return (
    <div className={`paper${gradable ? '' : ' paper-plain'}`}>
      <article className="paper-main">
        <Markdown source={doc.body} base={lessonBase(course, lesson)} mode={gradable ? 'graded' : 'practice'} enabled={enabled} locked={finished}
          onQuiz={onQuiz} onOutline={setOutline} onMaterial={onMaterial} log={log} />
        {gradable && (
          <div className="finish-zone" id="finish">
            <h2>Finish</h2>
            <p>
              {hasChecks ? <>Done with every checkpoint? Finish to seal your result — <b>{earned} / {possible}</b> so far — and download the file you submit in Google Classroom.</>
                : <>When you are done, finish to get the result file you submit in Google Classroom.</>}
            </p>
            {!finished && <button type="button" className="btn btn-ink btn-pop" disabled={!started} onClick={finish}>{started ? 'Finish and get my result file' : 'Start the lesson first (top of the side panel)'}</button>}
            {err && <p className="session-err">{err}</p>}
            <div ref={resultRef} />
          </div>
        )}
      </article>
      <aside className="rail">
        {gradable && (
          <div className="session">
            {!started ? (
              <>
                <h3>Start here</h3>
                <p>Your name goes on the result file. The clock starts when you press Start.</p>
                <input type="text" value={name} placeholder="First and last name" autoComplete="name" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') start(); }} aria-label="Your name" />
                <button type="button" className="btn btn-ink" onClick={start}>Start</button>
                {err && <p className="session-err">{err}</p>}
              </>
            ) : (
              <div className="session-live">
                <div className="session-who">{kit?.session?.name || name}</div>
                <div className="session-row"><span>Time</span><b>{fmtClock(elapsed)}</b></div>
                {hasChecks && (<>
                  <div className="session-row"><span>Points</span><b>{earned} / {possible}</b></div>
                  <div className="meter" aria-hidden="true"><i style={{ width: `${possible ? (100 * earned) / possible : 0}%` }} /></div>
                  <ul className="session-checks">
                    {list.map((q) => <li key={q.id} className={q.done ? 'done' : ''}><span>{q.title}</span><b>{q.earned}/{q.possible}</b></li>)}
                  </ul>
                </>)}
                {finished ? <span className="session-done">Sealed. Download your file below.</span>
                  : <a className="btn btn-ghost btn-sm" href="#finish">Jump to finish</a>}
              </div>
            )}
          </div>
        )}
        {outline.length > 0 && (
          <div className="rail-outline">
            <h4>On this page</h4>
            <ul className="outline">
              {outline.map((o) => <li key={o.id} className={`l${o.level}${current === o.id ? ' is-on' : ''}`}><a href={`#${o.id}`}>{o.text}</a></li>)}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}

/* ── a markdown material (practice set, notes): no grading ─────────── */
function MdMaterial({ course, lesson, file, onMaterial }) {
  const url = resolveFile(course, lesson, file);
  const { text, error, loading } = useTextFile(url);
  const doc = useMemo(() => (text != null ? frontMatter(text) : null), [text]);
  if (loading) return <div className="mat-stage"><p className="stage-loading">Loading…</p></div>;
  if (error || !doc) return <div className="mat-stage"><p className="empty">Could not load <code>{file}</code> ({error}).</p></div>;
  return <div className="mat-stage"><Markdown source={doc.body} base={lessonBase(course, lesson)} mode="practice" onMaterial={onMaterial} /></div>;
}

/* ── the page ──────────────────────────────────────────────────────── */
export default function LessonPage({ course: courseSlug, lesson: lessonSlug }) {
  const hit = findLesson(courseSlug, lessonSlug);
  const frame = useRef(null);

  const tabs = useMemo(() => {
    if (!hit) return [];
    const { course, lesson } = hit;
    const main = { id: 'lesson', title: 'Lesson', kind: lesson.md ? 'md' : 'html', file: lesson.md || lesson.file, src: lesson.md ? resolveFile(course, lesson, lesson.md) : lessonSrc(course, lesson), isLesson: true };
    const mats = (lesson.materials || []).map((m) => ({
      id: m.file || m.href, title: m.title, kind: m.kind || (m.href ? 'link' : /\.md$/i.test(m.file) ? 'md' : /\.pdf$/i.test(m.file) ? 'pdf' : 'html'),
      file: m.file, src: m.href || resolveFile(course, lesson, m.file), note: m.note,
    }));
    return [main, ...mats];
  }, [hit]);

  const [tabId, setTabId] = useState(() => new URLSearchParams(window.location.search).get('tab') || 'lesson');
  const tab = tabs.find((t) => t.id === tabId && t.kind !== 'link' && t.kind !== 'download') || tabs[0];

  useEffect(() => {
    document.title = hit ? `${hit.lesson.title} · ${hit.course.title} · Mr. Cruz` : 'Not found · Mr. Cruz';
  }, [hit]);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (tab?.id === 'lesson') p.delete('tab'); else if (tab) p.set('tab', tab.id);
    const qs = p.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, [tab]);

  const openMaterial = useCallback((file) => {
    const t = tabs.find((x) => x.file === file || x.id === file || x.src?.endsWith('/' + file));
    if (!t) return;
    if (t.kind === 'link' || t.kind === 'download') { window.open(t.src, '_blank', 'noreferrer'); return; }
    setTabId(t.id);
    document.getElementById('stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [tabs]);

  if (!hit || !isPosted(hit.lesson)) {
    return (
      <div className="site"><SiteNav />
        <main className="page">
          <h1>{hit ? 'This lesson is not posted yet.' : 'No lesson at that address.'}</h1>
          <p><a href={hit ? `/lessons/${hit.course.slug}` : '/lessons'}>{hit ? `Back to ${hit.course.title}` : 'Back to lessons'}</a></p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { course, topic, lesson, prev, next } = hit;
  const kind = KINDS[lesson.kind] || KINDS.lesson;
  const others = topic.lessons.filter((l) => l.slug !== lesson.slug && isPosted(l));
  const isFrame = tab.kind === 'html' || tab.kind === 'pdf';
  const fullscreen = () => { const el = frame.current; if (!el) return; if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen?.(); };

  return (
    <div className={`site lesson-view tone-${course.tone}`} id="top">
      <SiteNav />
      <main>
        <div className="lesson-bar">
          <div className="lesson-bar-text">
            <p className="t-crumb">
              <a href="/lessons">Lessons</a> / <a href={`/lessons/${course.slug}`}>{course.title}</a> / <a href={`/lessons/${course.slug}#${topic.id}`}>{topic.title}</a>
            </p>
            <h1 dangerouslySetInnerHTML={{ __html: renderInline(lesson.title) }} />
          </div>
          <div className="lesson-tools">
            {prev && isPosted(prev) && <a className="btn btn-ghost" href={lessonHref(course, prev)}>← Previous</a>}
            {next && isPosted(next) && <a className="btn btn-ghost" href={lessonHref(course, next)}>Next →</a>}
            {isFrame && <button type="button" className="btn btn-ghost" onClick={fullscreen}>Fullscreen</button>}
            {isFrame && <a className="btn btn-ink" href={tab.src} target="_blank" rel="noreferrer">Open in a new tab ↗</a>}
          </div>
        </div>

        {tabs.length > 1 && (
          <div className="mat-tabs" role="tablist" aria-label="Lesson and materials" id="stage">
            {tabs.map((t) => t.kind === 'link' || t.kind === 'download' ? (
              <a key={t.id} className="mat-tab" href={t.src} target="_blank" rel="noreferrer" {...(t.kind === 'download' ? { download: '' } : {})}>{ICONS[t.kind]}{t.title}<small>↗</small></a>
            ) : (
              <button key={t.id} type="button" role="tab" aria-selected={tab.id === t.id} className={`mat-tab${tab.id === t.id ? ' is-on' : ''}`} onClick={() => setTabId(t.id)}>
                {ICONS[t.isLesson ? 'lesson' : t.kind]}{t.title}
              </button>
            ))}
          </div>
        )}

        <div className="lesson-stage">
          {tab.kind === 'md' && tab.isLesson && <MdStage key={tab.id} course={course} lesson={lesson} file={tab.file} graded onMaterial={openMaterial} />}
          {tab.kind === 'md' && !tab.isLesson && <MdMaterial key={tab.id} course={course} lesson={lesson} file={tab.file} onMaterial={openMaterial} />}
          {isFrame && (<>
            <iframe key={tab.id} ref={frame} className="lesson-frame" src={tab.src} title={tab.title === 'Lesson' ? lesson.title : tab.title} allow="fullscreen; clipboard-write" allowFullScreen />
            <p className="stage-note"><span>{tab.isLesson ? 'The lesson runs in this frame.' : `${tab.title} runs in this frame.`} Cramped? Use Fullscreen or open it in its own tab.</span>{tab.isLesson && lesson.graded && <span>Finishing gives you a result file to submit.</span>}</p>
          </>)}
        </div>

        <section className="sec" id="about">
          <div className="sec-head">
            <h2>About</h2>
            <p className="sec-lead">Part of {topic.title} in {course.title}.</p>
          </div>
          <div>
            <div className="lesson-meta">
              <span className="pill">{kind.label}</span>
              {lesson.minutes && <span className="pill">About {lesson.minutes} min</span>}
              {lesson.graded && <span className="pill graded">Graded — ends with a result file</span>}
            </div>
            <p className="lesson-about" dangerouslySetInnerHTML={{ __html: renderInline(lesson.description) }} />

            {tabs.length > 1 && (<>
              <h3 className="lesson-more">Materials</h3>
              <ul className="mat-list">
                {tabs.slice(1).map((t) => (
                  <li key={t.id}>
                    {t.kind === 'link' || t.kind === 'download'
                      ? <a href={t.src} target="_blank" rel="noreferrer"><span className="ico">{ICONS[t.kind]}</span><span><strong>{t.title} ↗</strong>{t.note && <span>{t.note}</span>}</span></a>
                      : <button type="button" onClick={() => openMaterial(t.id)}><span className="ico">{ICONS[t.kind]}</span><span><strong>{t.title}</strong>{t.note && <span>{t.note}</span>}</span></button>}
                  </li>
                ))}
              </ul>
            </>)}

            {others.length > 0 && (<>
              <h3 className="lesson-more">More in {topic.title}</h3>
              <ul className="t-others">
                {others.map((l) => <li key={l.slug}><a href={lessonHref(course, l)}><strong>{l.title}</strong><span>{(KINDS[l.kind] || KINDS.lesson).label}{l.minutes ? ` · ${l.minutes} min` : ''}</span></a></li>)}
              </ul>
            </>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
