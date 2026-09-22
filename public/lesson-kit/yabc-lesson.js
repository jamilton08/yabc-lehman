/* ============================================================================
   YABC LESSON KIT  v1.0  —  Mr. Cruz · The Lehman YABC
   One shared file. Every lesson loads it with

       <script src="/lesson-kit/yabc-lesson.js"></script>

   (the site itself loads it too, so markdown lessons with checkpoints use
   the very same code). It gives a lesson three things:

     1. A clock.   YABC.start(name) when the student begins. The kit records
                   wall-clock time and "active" time (tab visible).
     2. A log.     YABC.log(type, data) for anything worth remembering —
                   answers, hints, retries. Ends up inside the result file.
     3. A result.  YABC.endScreen(el, {...scores}) renders the standard result
                   card: name, score, time taken, badge code, and a button
                   that downloads the encrypted result file the student
                   submits in Google Classroom.

   The file is encrypted with the teacher's PUBLIC key below (RSA-OAEP
   wrapping an AES-256-GCM key). It can only be opened with the matching
   private key, on the site's /lessons/verify page. Students can't read or
   edit it, and any edit makes it fail to open.

   API (all on window.YABC):
     YABC.lesson({ id, title, version, course, possible })   once, at load
     YABC.start(name)                                        when work begins
     YABC.log(type, data)                                    any time
     YABC.elapsed()   -> { seconds, activeSeconds }
     YABC.finish({ earned, possible, sections, tier, extra }) -> Promise<result>
     YABC.endScreen(el, { earned, possible, sections, tier, extra, note })
                      -> Promise<result>   (calls finish, renders the card)
     YABC.download()  / YABC.copyCode()                      after finish
     YABC.reset()                                            forget the session
   ========================================================================== */
(function () {
  'use strict';
  var KIT = '1.0';
  var SITE = 'Mr. Cruz · The Lehman YABC';

  /* Mr. Cruz's public key. If the pair is ever regenerated on
     /lessons/verify, replace this whole object — and keep the private key
     out of the repo (it is in .gitignore). */
  var PUBLIC_KEY = {"kty":"RSA","n":"s4JjHoL0FrSnZlbgvoqNsSw04pa7EuSYNVRxPRU8hhAQ-UuLB5zJSkkbom4bKwno5Py9XaMaSKU-NUY2KXLT9NI7IMfXmV6vUvBKqyCQ_yg_fnaV1JGRCf7FKwElKC6tZQgQeCzFzpJgZLoesy_eWz4ZrDTkJUBOe-338U9uBqLY4qwHIXp5WUIPDIpxeyYHmnrH1-nHUj6HrPEiEJDYBsp-gpBuvuhgkt31tEoB1CvmdpvYL-OZXl3h6uVe0gR1XBp7YlNqidYrL0DvDM7aLbjBwiZjiPpRRqWtcmXs_dVEDYli6EmOQi9awKKjgNgCOkrWF-QFpz78_6VIuCCo7Q","e":"AQAB","alg":"RSA-OAEP-256","ext":true};

  var cfg = null;      // lesson config
  var ses = null;      // current session
  var ticker = null;   // active-time interval
  var result = null;   // { badge, filename, text, envelope, payload }

  /* ---------- small helpers ---------- */
  var enc = new TextEncoder();
  function b64(buf) {
    var bytes = new Uint8Array(buf), s = '';
    for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDuration(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    if (h) return h + ' h ' + pad(m) + ' min';
    if (m) return m + ' min ' + pad(s) + ' s';
    return s + ' s';
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return iso; }
  }
  function slug(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'student'; }
  function stamp(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '_' + pad(d.getHours()) + pad(d.getMinutes()); }

  /* Badge code: 8 characters from a SHA-256 of the result, shown on screen
     so a screenshot can be matched to its file. */
  var ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';
  function badgeFrom(hashBuf) {
    var bytes = new Uint8Array(hashBuf), out = '';
    for (var i = 0; i < 8; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
    return out.slice(0, 4) + '-' + out.slice(4);
  }

  function needSubtle() {
    if (!(window.crypto && crypto.subtle)) {
      throw new Error('Result files need a secure page (https). Open this lesson from the class site and finish again.');
    }
  }

  /* ---------- public API ---------- */
  function lesson(c) {
    if (!c || !c.id || !c.title) throw new Error('YABC.lesson needs { id, title }');
    cfg = { version: '1.0', course: '', possible: 100 };
    for (var k in c) cfg[k] = c[k];
    return YABC;
  }

  function start(name) {
    if (!cfg) throw new Error('Call YABC.lesson({...}) before YABC.start(name)');
    name = String(name || '').trim().replace(/\s+/g, ' ');
    if (name.length < 2) throw new Error('YABC.start needs the student\'s name');
    ses = { name: name, started: new Date().toISOString(), t0: Date.now(), active: 0, events: [] };
    result = null;
    clearInterval(ticker);
    ticker = setInterval(function () { if (document.visibilityState === 'visible') ses.active += 1; }, 1000);
    log('start');
    return YABC;
  }

  function reset() { clearInterval(ticker); ses = null; result = null; return YABC; }

  function log(type, data) {
    if (!ses) return YABC;
    var e = { t: Math.round((Date.now() - ses.t0) / 100) / 10, type: String(type) };
    if (data && typeof data === 'object') for (var k in data) if (k !== 't' && k !== 'type') e[k] = data[k];
    if (ses.events.length < 800) ses.events.push(e);
    return YABC;
  }

  function elapsed() {
    if (!ses) return { seconds: 0, activeSeconds: 0 };
    return { seconds: Math.round((Date.now() - ses.t0) / 1000), activeSeconds: ses.active };
  }

  /* Build, seal, and keep the result. Resolves to { badge, filename, text, payload }. */
  async function finish(opts) {
    if (!cfg || !ses) throw new Error('YABC.start(name) was never called');
    needSubtle();
    opts = opts || {};
    clearInterval(ticker);
    var finished = new Date();
    var el = elapsed();
    var earned = Number(opts.earned || 0), possible = Number(opts.possible || cfg.possible || 0);
    var payload = {
      kit: KIT,
      lesson: { id: cfg.id, title: cfg.title, version: cfg.version, course: cfg.course },
      student: { name: ses.name },
      started: ses.started,
      finished: finished.toISOString(),
      seconds: el.seconds,
      activeSeconds: el.activeSeconds,
      score: { earned: earned, possible: possible, percent: possible ? Math.round(1000 * earned / possible) / 10 : null },
      tier: opts.tier || null,
      sections: (opts.sections || []).map(function (s) { return { id: s.id, title: s.title, earned: s.earned, possible: s.possible, status: s.status }; }),
      extra: opts.extra || null,
      events: ses.events,
      env: { tz: Intl.DateTimeFormat().resolvedOptions().timeZone, ua: navigator.userAgent, url: location.href.split('?')[0] },
    };
    var hash = await crypto.subtle.digest('SHA-256', enc.encode(JSON.stringify(payload)));
    var badge = badgeFrom(hash);
    payload.badge = badge;

    /* header travels in the clear but is authenticated (AES-GCM additional data) */
    var header = { yabc: 1, kit: KIT, lesson: cfg.id, title: cfg.title, student: ses.name, finished: payload.finished, badge: badge };
    var pub = await crypto.subtle.importKey('jwk', PUBLIC_KEY, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['wrapKey']);
    var aes = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv, additionalData: enc.encode(JSON.stringify(header)) }, aes, enc.encode(JSON.stringify(payload)));
    var wrapped = await crypto.subtle.wrapKey('raw', aes, pub, { name: 'RSA-OAEP' });
    var envelope = {};
    for (var k in header) envelope[k] = header[k];
    envelope.key = b64(wrapped); envelope.iv = b64(iv); envelope.data = b64(data);

    result = {
      badge: badge,
      filename: 'YABC_' + cfg.id + '_' + slug(ses.name) + '_' + stamp(finished) + '.yabc',
      text: JSON.stringify(envelope),
      payload: payload,
    };
    return result;
  }

  function download() {
    if (!result) throw new Error('Nothing to download yet — call YABC.finish first');
    var blob = new Blob([result.text], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = result.filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    return result.filename;
  }

  async function copyCode() {
    if (!result) throw new Error('Nothing to copy yet — call YABC.finish first');
    try { await navigator.clipboard.writeText(result.text); return true; }
    catch (e) {
      var ta = document.createElement('textarea'); ta.value = result.text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e2) {}
      ta.remove(); return ok;
    }
  }

  /* ---------- the standard end screen ---------- */
  var CSS = '.yabc-card{--yabc-ink:#121212;--yabc-mute:#5f5c55;--yabc-line:#d9d6cd;--yabc-paper:#f4f3ef;--yabc-accent:var(--yabc-color,#121212);--yabc-ok:#1f6f45;--yabc-bad:#a83a2a;'
    + 'font-family:Inter,"Segoe UI",system-ui,sans-serif;color:var(--yabc-ink);background:#fff;border:1.5px solid var(--yabc-ink);border-radius:14px;padding:22px 24px;margin:20px 0;line-height:1.45;box-shadow:6px 6px 0 var(--yabc-ink)}'
    + '.yabc-card *{box-sizing:border-box}.yabc-head{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--yabc-mute)}.yabc-head b{color:var(--yabc-ink)}'
    + '.yabc-name{font-family:Archivo,Inter,sans-serif;font-size:24px;font-weight:800;margin:8px 0 2px;letter-spacing:-.01em}.yabc-score{font-size:15px;margin:0 0 12px}.yabc-score b{font-family:Archivo,Inter,sans-serif;font-size:32px;font-weight:800}.yabc-score .yabc-tier{display:inline-block;margin-left:8px;padding:3px 10px;border-radius:999px;background:var(--yabc-accent);color:#fff;font-size:13px;font-weight:600;vertical-align:middle}'
    + '.yabc-facts{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:0 0 14px;font-size:14px}.yabc-facts dt{color:var(--yabc-mute)}.yabc-facts dd{margin:0}.yabc-facts code{font-family:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace;font-size:15px;letter-spacing:.08em;font-weight:600;background:var(--yabc-paper);padding:1px 6px;border-radius:4px}'
    + '.yabc-secs{width:100%;border-collapse:collapse;font-size:14px;margin:0 0 14px}.yabc-secs td{padding:6px 0;border-top:1px solid var(--yabc-line)}.yabc-secs td:last-child{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600}'
    + '.yabc-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.yabc-btn{font:600 15px Inter,"Segoe UI",system-ui,sans-serif;padding:11px 18px;border-radius:8px;border:1.5px solid var(--yabc-ink);background:var(--yabc-ink);color:#fff;cursor:pointer}.yabc-btn:hover{background:#333}.yabc-btn.yabc-alt{background:transparent;color:var(--yabc-ink)}.yabc-btn.yabc-alt:hover{background:var(--yabc-paper)}.yabc-btn:focus-visible{outline:3px solid #b9b5a8;outline-offset:2px}.yabc-btn:disabled{opacity:.55;cursor:wait}'
    + '.yabc-note{margin:12px 0 0;font-size:13.5px;color:var(--yabc-mute)}.yabc-status{margin:8px 0 0;font-size:14px;min-height:1.4em}.yabc-status.ok{color:var(--yabc-ok)}.yabc-status.bad{color:var(--yabc-bad)}'
    + '@media print{.yabc-actions,.yabc-note,.yabc-status{display:none}}';

  function injectCss() {
    if (document.getElementById('yabc-kit-css')) return;
    var s = document.createElement('style'); s.id = 'yabc-kit-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* Renders the card into `el` and seals the result. Resolves with the result. */
  async function endScreen(el, opts) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) throw new Error('YABC.endScreen needs an element');
    injectCss();
    opts = opts || {};
    var elp = elapsed();
    var possible = Number(opts.possible || cfg.possible || 0), earned = Number(opts.earned || 0);
    var pct = possible ? Math.round(100 * earned / possible) : null;
    var secs = (opts.sections || []).map(function (s) {
      var right = s.status != null ? esc(s.status) : (s.possible != null ? esc(s.earned) + ' / ' + esc(s.possible) : esc(s.earned));
      return '<tr><td>' + esc(s.title) + '</td><td>' + right + '</td></tr>';
    }).join('');
    el.innerHTML = '<div class="yabc-card">'
      + '<div class="yabc-head"><span><b>' + esc(SITE) + '</b> · result</span><span>' + esc(cfg.title) + '</span></div>'
      + '<div class="yabc-name">' + esc(ses ? ses.name : '') + '</div>'
      + '<div class="yabc-score"><b>' + esc(earned) + '</b> / ' + esc(possible) + (pct != null ? ' <span>(' + pct + '%)</span>' : '') + (opts.tier ? '<span class="yabc-tier">' + esc(opts.tier) + '</span>' : '') + '</div>'
      + '<dl class="yabc-facts"><dt>Finished</dt><dd>' + esc(fmtDate(new Date().toISOString())) + '</dd>'
      + '<dt>Time taken</dt><dd>' + esc(fmtDuration(elp.seconds)) + (elp.activeSeconds < elp.seconds - 60 ? ' <span style="color:var(--yabc-mute)">(' + esc(fmtDuration(elp.activeSeconds)) + ' with the tab open)</span>' : '') + '</dd>'
      + '<dt>Code</dt><dd><code class="yabc-badge">........</code></dd></dl>'
      + (secs ? '<table class="yabc-secs"><tbody>' + secs + '</tbody></table>' : '')
      + '<div class="yabc-actions"><button type="button" class="yabc-btn yabc-dl" disabled>Download your result file</button><button type="button" class="yabc-btn yabc-alt yabc-copy" disabled>Copy result code</button></div>'
      + '<p class="yabc-note">' + esc(opts.note || 'Submit the file in Google Classroom. If downloads are blocked, copy the code and paste it instead. The file is encrypted: only Mr. Cruz can open it.') + '</p>'
      + '<p class="yabc-status" aria-live="polite">Preparing your result file…</p>'
      + '</div>';
    var status = el.querySelector('.yabc-status'), dl = el.querySelector('.yabc-dl'), cp = el.querySelector('.yabc-copy');
    try {
      var r = await finish(opts);
      el.querySelector('.yabc-badge').textContent = r.badge;
      status.textContent = 'Ready: ' + r.filename;
      dl.disabled = false; cp.disabled = false;
      dl.onclick = function () { try { download(); status.className = 'yabc-status ok'; status.textContent = 'Downloaded ' + r.filename + ' — now submit it.'; } catch (e) { status.className = 'yabc-status bad'; status.textContent = e.message; } };
      cp.onclick = async function () { var ok = await copyCode(); status.className = 'yabc-status ' + (ok ? 'ok' : 'bad'); status.textContent = ok ? 'Code copied — paste it into your submission.' : 'Copy failed. Use the download instead.'; };
      return r;
    } catch (e) {
      status.className = 'yabc-status bad';
      status.textContent = e.message || String(e);
      throw e;
    }
  }

  var YABC = {
    kit: KIT, site: SITE,
    get verifyUrl() { return location.origin + '/lessons/verify'; },
    lesson: lesson, start: start, reset: reset, log: log, elapsed: elapsed,
    finish: finish, download: download, copyCode: copyCode, endScreen: endScreen,
    get result() { return result; },
    get session() { return ses ? { name: ses.name, started: ses.started } : null; },
    get config() { return cfg; },
    fmtDuration: fmtDuration,
  };
  window.YABC = YABC;
})();
