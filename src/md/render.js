/**
 * Markdown → HTML for lessons and materials.
 *
 * On top of ordinary markdown (GitHub flavor: tables, task lists, fences):
 *   math       $x^2$ inline, $$ … $$ on its own lines. Also \( … \) and \[ … \].
 *              A bare dollar amount like $1,200 is usually left alone (the
 *              closing $ has to touch a non-space and not be followed by a
 *              digit) — but write \$ for money in a math-heavy page to be safe.
 *   callouts   > [!NOTE] Optional title        also TIP, KEY, DEFINITION,
 *              > body…                          EXAMPLE, TRY, WARNING, STEPS
 *   code       ```python … ``` is highlighted (python, js, html, css, bash, json, sql)
 *   quiz       ```quiz … ``` becomes an interactive checkpoint (see quiz.js)
 *   embed      ```embed            drops an HTML material into the page
 *              line-explorer.html
 *              height: 480
 *              ```
 *   files      images and links written relative to the lesson folder
 *              ("balance.html", "figure.png") are resolved against `base`;
 *              a link to a material (.md/.html in the same folder) switches
 *              the lesson page to that tab.
 *
 * render(md, { base }) → { html, islands, outline }
 *   islands: [{ kind: 'quiz', index, quiz }] — mounted by <Markdown> as React
 *   outline: [{ id, text, level }] — h2/h3 for the side rail
 */
import { Marked } from 'marked';
import katex from 'katex';
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import plaintext from 'highlight.js/lib/languages/plaintext';
import { parseQuiz } from './quiz.js';

hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('text', plaintext);

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slugify = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
const isRelative = (u) => u && !/^(?:[a-z]+:|\/|#)/i.test(u);
const isMaterial = (u) => /\.(md|html?|pdf)(?:[?#].*)?$/i.test(u);

const tex = (src, display) => {
  try { return katex.renderToString(src, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'html' }); }
  catch (e) { return `<code class="math-error">${esc(src)}</code>`; }
};

/* ── math ─────────────────────────────────────────────────────────── */
const blockMath = {
  name: 'blockMath', level: 'block',
  start(src) { const m = src.match(/(?:^|\n)(?:\$\$|\\\[)/); return m ? m.index + (m[0].startsWith('\n') ? 1 : 0) : undefined; },
  tokenizer(src) {
    const m = /^(?:\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\])(?:\n+|$)/.exec(src);
    if (m) return { type: 'blockMath', raw: m[0], text: (m[1] ?? m[2]).trim() };
  },
  renderer(tok) { return `<div class="math-block">${tex(tok.text, true)}</div>\n`; },
};
const inlineMath = {
  name: 'inlineMath', level: 'inline',
  start(src) { const m = src.match(/\$(?!\s)|\\\(/); return m ? m.index : undefined; },
  tokenizer(src) {
    const m = /^(?:\$(?!\s)((?:\\\$|[^$\n])+?)(?<!\s)\$(?!\d)|\\\(((?:[^\\]|\\(?!\)))+?)\\\))/.exec(src);
    if (m) return { type: 'inlineMath', raw: m[0], text: (m[1] ?? m[2]).replace(/\\\$/g, '$') };
  },
  renderer(tok) { return tex(tok.text, false); },
};

/* ── callouts ─────────────────────────────────────────────────────── */
const CALLOUTS = {
  note: 'Note', tip: 'Tip', key: 'Key idea', definition: 'Definition', example: 'Example',
  try: 'Try it', warning: 'Watch out', steps: 'Steps', info: 'Info', question: 'Think about it',
};
const callout = {
  name: 'callout', level: 'block',
  start(src) { const m = src.match(/(?:^|\n)> ?\[!\w+\]/); return m ? m.index + (m[0].startsWith('\n') ? 1 : 0) : undefined; },
  tokenizer(src) {
    const m = /^> ?\[!(\w+)\][ \t]*([^\n]*)(?:\n|$)((?:>[^\n]*(?:\n|$))*)/.exec(src);
    if (!m) return;
    const type = m[1].toLowerCase();
    const body = m[3].split('\n').map((l) => l.replace(/^> ?/, '')).join('\n');
    const title = m[2].trim();
    return { type: 'callout', raw: m[0], kind: CALLOUTS[type] ? type : 'note', title, titleTokens: title ? this.lexer.inlineTokens(title) : [], tokens: this.lexer.blockTokens(body) };
  },
  renderer(tok) {
    return `<aside class="callout callout-${tok.kind}"><div class="callout-title"><span class="callout-kind">${esc(CALLOUTS[tok.kind])}</span>${tok.title ? `<span class="callout-name">${this.parser.parseInline(tok.titleTokens)}</span>` : ''}</div><div class="callout-body">${this.parser.parse(tok.tokens)}</div></aside>\n`;
  },
};

/* ── the renderer ─────────────────────────────────────────────────── */
let ctx = null; // { base, islands, outline, ids }

function resolve(u) {
  if (!ctx || !isRelative(u)) return u;
  if (isMaterial(u)) return `#material:${u}`;
  return ctx.base + u;
}
function resolveAsset(u) { return ctx && isRelative(u) ? ctx.base + u : u; }

function embedHtml(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const file = lines.find((l) => !/^\w+:/.test(l)) || '';
  const opt = {};
  lines.forEach((l) => { const m = /^(\w+):\s*(.+)$/.exec(l); if (m) opt[m[1].toLowerCase()] = m[2]; });
  const h = parseInt(opt.height || '480', 10);
  const src = resolveAsset(file);
  return `<figure class="md-embed"><iframe src="${esc(src)}" title="${esc(opt.title || file)}" style="height:${h}px" loading="lazy" allow="fullscreen; clipboard-write"></iframe>${opt.caption ? `<figcaption>${esc(opt.caption)}</figcaption>` : ''}<a class="md-embed-open" href="${esc(src)}" target="_blank" rel="noreferrer">Open in a new tab ↗</a></figure>\n`;
}

const renderer = {
  heading(tok) {
    const text = this.parser.parseInline(tok.tokens);
    let id = slugify(tok.text);
    if (ctx) { let n = 1, base = id; while (ctx.ids.has(id)) id = `${base}-${++n}`; ctx.ids.add(id); if (tok.depth === 2 || tok.depth === 3) ctx.outline.push({ id, text: tok.text.replace(/\$[^$]*\$/g, '').trim(), level: tok.depth }); }
    return `<h${tok.depth} id="${id}">${text}<a class="h-anchor" href="#${id}" aria-label="Link to this section">#</a></h${tok.depth}>\n`;
  },
  code(tok) {
    const lang = (tok.lang || '').trim().toLowerCase();
    if (lang === 'quiz') {
      if (!ctx) return '';
      const index = ctx.islands.length;
      ctx.islands.push({ kind: 'quiz', index, quiz: parseQuiz(tok.text, index) });
      return `<div class="md-island" data-island="quiz" data-index="${index}"></div>\n`;
    }
    if (lang === 'embed') return embedHtml(tok.text);
    if (lang === 'math') return `<div class="math-block">${tex(tok.text, true)}</div>\n`;
    const known = lang && hljs.getLanguage(lang);
    const body = known ? hljs.highlight(tok.text, { language: lang, ignoreIllegals: true }).value : esc(tok.text);
    return `<div class="code-block"><div class="code-bar"><span>${esc(known ? hljs.getLanguage(lang).name : lang || 'code')}</span><button type="button" class="code-copy" data-copy>Copy</button></div><pre class="hljs"><code class="language-${esc(lang || 'text')}">${body}</code></pre></div>\n`;
  },
  image(tok) {
    const href = resolveAsset(tok.href);
    if (/\.html?(?:[?#].*)?$/i.test(tok.href)) {
      return `<figure class="md-embed"><iframe src="${esc(href)}" title="${esc(tok.text || tok.href)}" style="height:${esc(tok.title || '480')}px" loading="lazy" allow="fullscreen; clipboard-write"></iframe><a class="md-embed-open" href="${esc(href)}" target="_blank" rel="noreferrer">Open in a new tab ↗</a></figure>`;
    }
    return `<figure class="md-figure"><img src="${esc(href)}" alt="${esc(tok.text)}" loading="lazy" />${tok.title ? `<figcaption>${esc(tok.title)}</figcaption>` : ''}</figure>`;
  },
  link(tok) {
    const href = resolve(tok.href);
    const text = this.parser.parseInline(tok.tokens);
    const ext = /^https?:\/\//i.test(href);
    return `<a href="${esc(href)}"${ext ? ' target="_blank" rel="noreferrer"' : ''}${tok.title ? ` title="${esc(tok.title)}"` : ''}>${text}${ext ? '<span class="ext" aria-hidden="true"> ↗</span>' : ''}</a>`;
  },
  table(tok) {
    let head = '<tr>' + tok.header.map((c) => `<th${c.align ? ` style="text-align:${c.align}"` : ''}>${this.parser.parseInline(c.tokens)}</th>`).join('') + '</tr>';
    let body = tok.rows.map((r) => '<tr>' + r.map((c) => `<td${c.align ? ` style="text-align:${c.align}"` : ''}>${this.parser.parseInline(c.tokens)}</td>`).join('') + '</tr>').join('');
    return `<div class="table-wrap"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>\n`;
  },
};

const marked = new Marked({ gfm: true, breaks: false, extensions: [blockMath, inlineMath, callout], renderer });

/** Render one markdown document. Never throws. */
export function render(md, { base = '' } = {}) {
  ctx = { base, islands: [], outline: [], ids: new Set() };
  let html = '';
  try { html = marked.parse(String(md || '')); }
  catch (e) { html = `<p class="md-error">Could not render this page: ${esc(e.message)}</p>`; }
  const out = { html, islands: ctx.islands, outline: ctx.outline };
  ctx = null;
  return out;
}

/** Inline-only markdown (quiz prompts, choices). */
export function renderInline(md) {
  try { return marked.parseInline(String(md || '')); } catch { return esc(md); }
}

/** Pull `key: value` front matter off the top of a markdown file. */
export function frontMatter(md) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(md);
  if (!m) return { meta: {}, body: md };
  const meta = {};
  m[1].split('\n').forEach((l) => { const k = /^(\w[\w-]*):\s*(.*)$/.exec(l); if (k) meta[k[1]] = k[2].trim(); });
  return { meta, body: md.slice(m[0].length) };
}
