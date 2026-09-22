/**
 * Checkpoint blocks. In a lesson:
 *
 *   ```quiz
 *   title: Checkpoint 1
 *   points: 2                     (default points per question; 1 if omitted)
 *
 *   1. What is $2x$ when $x = 5$?
 *      - [ ] 7
 *      - [x] 10
 *      - [ ] 25
 *      > Multiply: $2 \cdot 5 = 10$.        (explanation shown after checking)
 *
 *   2. [3 pts] Solve $3x = 12$.
 *      = 4                                  (typed answer; alternatives with |)
 *      ~ 0.01                               (tolerance for numbers; optional)
 *      > Divide both sides by 3.
 *
 *   3. Which are prime? (pick every one)
 *      - [x] 2
 *      - [x] 3
 *      - [ ] 4
 *   ```
 *
 * One [x] → single choice. Several → pick all that apply. A `=` line → typed.
 * Numbers are compared as numbers ("1,200" = "1200" = "$1200"); anything
 * else as trimmed, case-insensitive text.
 */

export function parseQuiz(text, index = 0) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const quiz = { id: `quiz-${index + 1}`, title: '', points: 1, questions: [] };
  let q = null;
  const flush = () => { if (q) { finishQuestion(q, quiz.points); quiz.questions.push(q); q = null; } };

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '    ');
    const t = line.trim();
    if (!q) {
      const meta = /^(title|points|shuffle):\s*(.*)$/i.exec(t);
      if (meta) { const k = meta[1].toLowerCase(); quiz[k] = k === 'points' ? Number(meta[2]) || 1 : meta[2]; continue; }
    }
    const qm = /^(\d+)[.)]\s+(.*)$/.exec(t);
    if (qm) { flush(); q = { n: quiz.questions.length + 1, prompt: [qm[2]], choices: [], answers: null, tol: null, explain: [], points: null }; continue; }
    if (!q) continue;
    let m;
    if ((m = /^-\s*\[( |x|X)\]\s*(.*)$/.exec(t))) { q.choices.push({ text: m[2], correct: m[1].toLowerCase() === 'x' }); continue; }
    if ((m = /^=\s*(.*)$/.exec(t))) { q.answers = m[1].split('|').map((s) => s.trim()).filter(Boolean); continue; }
    if ((m = /^~\s*(.*)$/.exec(t))) { q.tol = Number(m[1]); continue; }
    if ((m = /^>\s?(.*)$/.exec(t))) { q.explain.push(m[1]); continue; }
    if (t === '') { if (q.choices.length === 0 && q.answers === null && q.explain.length === 0) q.prompt.push(''); continue; }
    if (q.explain.length) q.explain.push(t);
    else if (q.choices.length === 0 && q.answers === null) q.prompt.push(t);
  }
  flush();
  if (!quiz.title) quiz.title = `Checkpoint ${index + 1}`;
  quiz.possible = quiz.questions.reduce((n, x) => n + x.points, 0);
  return quiz;
}

function finishQuestion(q, defaultPoints) {
  let prompt = q.prompt.join('\n').trim();
  const pm = /^\[(\d+(?:\.\d+)?)\s*pts?\]\s*/i.exec(prompt);
  if (pm) { q.points = Number(pm[1]); prompt = prompt.slice(pm[0].length); }
  if (q.points == null) q.points = defaultPoints;
  q.prompt = prompt;
  q.explain = q.explain.join('\n').trim();
  const nCorrect = q.choices.filter((c) => c.correct).length;
  q.type = q.choices.length ? (nCorrect > 1 ? 'multi' : 'choice') : 'input';
  q.id = `q${q.n}`;
}

/* ── grading ──────────────────────────────────────────────────────── */
const normText = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const toNumber = (s) => {
  const t = String(s || '').trim().replace(/[$,\s]/g, '').replace(/%$/, '');
  if (t === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) {
    const frac = /^([-+]?\d+)\s*\/\s*(\d+)$/.exec(String(s || '').trim());
    if (frac && Number(frac[2]) !== 0) return Number(frac[1]) / Number(frac[2]);
    return NaN;
  }
  return Number(t);
};

/** Is this response right? `given` is a choice index, an array of indexes, or a string. */
export function grade(q, given) {
  if (q.type === 'choice') return q.choices[given]?.correct === true;
  if (q.type === 'multi') {
    const set = new Set(given || []);
    return q.choices.every((c, i) => c.correct === set.has(i));
  }
  const g = String(given || '');
  return q.answers.some((a) => {
    const an = toNumber(a), gn = toNumber(g);
    if (!Number.isNaN(an) && !Number.isNaN(gn)) return Math.abs(an - gn) <= (q.tol ?? Math.max(1e-9, Math.abs(an) * 1e-6));
    return normText(a) === normText(g);
  });
}

/** What to show as "the answer" once a question is closed. */
export function answerText(q) {
  if (q.type === 'input') return q.answers[0];
  return q.choices.filter((c) => c.correct).map((c) => c.text).join(' · ');
}
