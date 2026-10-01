/* ============================================================================
   YABC STEP CALCULATOR  v1.2  —  Mr. Cruz · The Lehman YABC
   A calculator for solving linear equations (and inequalities) one move at a
   time. The student decides every move; the calculator does the arithmetic
   and writes the work down on a tape, the way it would look on paper:

         2x + 3 = 11
            −3    −3        subtract 3 from both sides
         2x     = 8

   Every move, undo, hint, and wrong tap goes on the tape and into the
   result file, so the teacher sees how the student got there, not just
   the answer.

   Moves
     tap a term             → move it (the opposite operation to both sides)
     tap a coefficient      → detach it (divide, or multiply by the reciprocal)
     tap a 3 in 3(x + 4)    → distribute it, or detach it
     keypad                 → key in any operation, then "Do it to both sides"
     Combine / Distribute   → tidy one side (like terms, parentheses)
   Terms inside parentheses are locked until they are distributed.

   Inequalities (v1.1) — write <, >, <=, >= (or ≤, ≥) instead of =
     • Every × or ÷ asks "keep the sign or flip it?" — the student decides.
       Only a negative multiplier/divisor flips it. A wrong call is explained
       with numbers, goes on the tape, and caps that problem at half credit.
     • x ends up on the right (6 < x)? The student reads it from x's side
       (x > 6) before it counts as solved.
     • Then they graph it on a number line: open or closed circle, shade left
       or right. Turn that off with  graph: off  in the block.
     • x disappears (4 > −3, 5 < 1): same "every number / no number" choice.
   Equations behave exactly as in v1.0.

   Angle problems (v1.2) — a figure drawn to scale from the labels
       angles linear: 3x + 10 | 2x - 5          rules: vertical (equal),
       angles around: x + 20 | 2x | 3x | 90 | find 3     linear (180),
                                                 complementary (90),
                                                 around (360), triangle (180)
     1. The student picks how the marked angles are related. The calculator
        writes the equation from the rule (two misses → it shows the rule).
     2. They solve it with the usual moves.
     3. They type the angle measure — angle 1 unless "find n" says which.
        (Skipped when that angle is just x.)
     Half credit for a second pick, a second try on the angle, or any of the
     usual reasons (hint, too many moves).

   Where it runs
     • Markdown lessons:  a ```calc block (the site loads this file on its own)
     • HTML lessons:      <script src="/lesson-kit/yabc-calc.js"></script>
                          YABCCalc.mount('#el', { source: '...block text...',
                            mode: 'graded', log: YABC.log, onReport: fn })
     • Free calculator:   YABCCalc.mount('#el', { mode: 'free' })

   The block (same text in markdown or passed as `source`):
       title: Assigned work A
       moves: tap          tap | type | both   (how moves are made; default both)
       points: 2           per problem (default 2)
       slack: 1            moves over par that still earn full points (default 1)
       hints: on           on | off
       graph: on           on | off — graph inequality answers on a number line

       1. 2x + 3 = 11
       2. [3 pts] 7x - 4 = 3x + 12
       3. spot constants: 4x - 7 = 2x + 9       tap-to-identify tasks:
       4. spot coefficients: x/4 + 2 = 3x         constants | x-terms |
       5. spot movable: 3(x + 4) - 5 = 2x         coefficients | movable
          > Optional note, shown once the problem is done.
       6. -3x + 2 >= 14                          an inequality
          ? A question or story, shown above the problem (and in the result).
       7. angles vertical: 3x + 10 | 5x - 20      an angle problem (below)

   Scoring (graded mode)
     solve:  solved with no hint, in par + slack moves or fewer → full points;
             solved any other way → half; not solved → 0.
             "Par" is the fewest moves the textbook route takes.
     spot:   right on the first check → full; second check → half.
     x disappears (no solution / every number): the student says which;
             first try full, second try half.
     inequalities: a wrong keep/flip call, a misread answer, or a second
             try on the graph → half. (Hints and extra moves count as above.)

   API (window.YABCCalc)
     mount(el, opts) → { update({ enabled, locked }), report(), destroy() }
       opts: { source | problems, id, order, title, mode: 'graded'|'practice'|'free',
               enabled, locked, onReport(report), log(type, data) }
     parseBlock(text), parseEquation(text), plan(state), par(state)
   ========================================================================== */
(function () {
  'use strict';
  var VERSION = '1.2';
  var MINUS = '−';

  function CalcError(msg) { this.message = msg; this.name = 'CalcError'; }
  CalcError.prototype = Object.create(Error.prototype);
  CalcError.prototype.constructor = CalcError;
  const fail = (msg) => { throw new CalcError(msg); };

  /* ── exact fractions ─────────────────────────────────────────────── */
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { const t = a % b; a = b; b = t; } return a || 1; };
  function F(n, d) {
    if (d === undefined) d = 1;
    if (!Number.isFinite(n) || !Number.isFinite(d)) fail('That number does not work here.');
    if (d === 0) fail('You can’t divide by zero.');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); n /= g; d /= g;
    if (Math.abs(n) > 1e9 || d > 1e9) fail('The numbers got too big for this calculator. Undo and try a different move.');
    return { n: n === 0 ? 0 : n, d: d };
  }
  const fadd = (a, b) => F(a.n * b.d + b.n * a.d, a.d * b.d);
  const fmul = (a, b) => F(a.n * b.n, a.d * b.d);
  const fdiv = (a, b) => { if (b.n === 0) fail('You can’t divide by zero.'); return F(a.n * b.d, a.d * b.n); };
  const fneg = (a) => F(-a.n, a.d);
  const fabs = (a) => F(Math.abs(a.n), a.d);
  const isZero = (a) => a.n === 0;
  const isOne = (a) => a.n === 1 && a.d === 1;
  const isInt = (a) => a.d === 1;
  const feq = (a, b) => a.n === b.n && a.d === b.d;
  const fnum = (a) => a.n / a.d;
  const ONE = { n: 1, d: 1 }, ZERO = { n: 0, d: 1 };
  /** plain text, with a real minus sign: −3, 3/4, −1/2 */
  const ftext = (a) => (a.n < 0 ? MINUS : '') + (a.d === 1 ? Math.abs(a.n) : Math.abs(a.n) + '/' + a.d);

  const clone = (x) => JSON.parse(JSON.stringify(x));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const SIDES = ['L', 'R'];
  const otherSide = (s) => (s === 'L' ? 'R' : 'L');
  const sideName = (s) => (s === 'L' ? 'left' : 'right');

  /* ── the sign between the sides: = < > ≤ ≥ ──────────────────────── */
  const FLIP = { '=': '=', '<': '>', '>': '<', '≤': '≥', '≥': '≤' };
  const REL_WORD = { '=': 'equals', '<': 'is less than', '>': 'is greater than', '≤': 'is less than or equal to', '≥': 'is greater than or equal to' };
  const relOf = (st) => (st && st.rel) || '=';
  const isIneq = (st) => relOf(st) !== '=';
  const fcmp = (a, b) => Math.sign(a.n * b.d - b.n * a.d);
  /** Is "a rel b" true? */
  function holds(a, b, rel) {
    const c = fcmp(a, b);
    if (rel === '<') return c < 0;
    if (rel === '>') return c > 0;
    if (rel === '≤') return c <= 0;
    if (rel === '≥') return c >= 0;
    return c === 0;
  }
  const closedRel = (rel) => rel === '≤' || rel === '≥';
  /** "x < 4" → shade left; "x > 4" → shade right (rel read from x's side). */
  const shadeOf = (rel) => (rel === '<' || rel === '≤' ? 'left' : 'right');
  /** a plain-text minus sign in a typed question line: "x - 4" → "x − 4", "-9" → "−9" */
  const prettyMinus = (s) => String(s || '').replace(/(^|[\s(=,:])-(?=[\d.a-zA-Z(])/g, '$1' + MINUS).replace(/ - /g, ' ' + MINUS + ' ');

  /* ── parsing ─────────────────────────────────────────────────────────
     A side is a list of terms:
       { t: 'k', c }                 a constant
       { t: 'x', c }                 c·x
       { t: 'g', m, items: [...] }   m(…) — one level of parentheses
     Terms are kept as written (nothing is combined), so "3x + x" stays two
     terms until the student combines them. */
  function decimal(raw) {
    if (raw.indexOf('.') < 0) return F(parseInt(raw, 10));
    const parts = raw.split('.'), frac = parts[1] || '';
    const d = Math.pow(10, frac.length);
    return F(parseInt(parts[0] || '0', 10) * d + parseInt(frac || '0', 10), d);
  }

  function tokenize(src) {
    const s = String(src == null ? '' : src)
      .replace(/[−‒–—]/g, '-').replace(/[×·∙⋅*]/g, '*').replace(/÷/g, '/')
      .replace(/[\[{]/g, '(').replace(/[\]}]/g, ')')
      .replace(/<=|=<|≦|⩽/g, '≤').replace(/>=|=>|≧|⩾/g, '≥');
    const out = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const raw = s.slice(i, j);
        if (!/^(\d+\.?\d*|\.\d+)$/.test(raw)) fail('“' + raw + '” is not a number.');
        out.push({ k: 'num', v: decimal(raw) });
        i = j; continue;
      }
      if (/[a-zA-Z]/.test(c)) { out.push({ k: 'var', v: c }); i++; continue; }
      if ('=<>≤≥'.indexOf(c) >= 0) { out.push({ k: 'rel', v: c }); i++; continue; }
      if ('+-*/()'.indexOf(c) >= 0) { out.push({ k: c }); i++; continue; }
      if (c === '^') fail('No exponents here — these are linear equations.');
      fail('The calculator does not know “' + c + '”.');
    }
    return out;
  }

  function parseEquation(src) {
    const toks = tokenize(src);
    const rels = toks.filter((t) => t.k === 'rel');
    if (rels.length !== 1) {
      if (!rels.length) fail('An equation needs an = sign (an inequality needs <, >, ≤ or ≥).');
      fail(rels.every((t) => t.v === '=') ? 'Use just one = sign.' : 'One sign at a time — this has ' + rels.map((t) => t.v).join(' and ') + '. Split it into two problems.');
    }
    const letters = Array.from(new Set(toks.filter((t) => t.k === 'var').map((t) => t.v)));
    if (letters.length > 1) fail('Use one letter for the unknown — this has ' + letters.join(' and ') + '.');
    const v = letters[0] || 'x';
    let p = 0;
    const peek = () => toks[p];
    const next = () => toks[p++];
    const ends = (t) => !t || t.k === 'rel' || t.k === ')';

    function expr(depth) {
      const terms = [];
      if (ends(peek())) fail(depth ? 'There is an empty ( ).' : 'One side of the equation is empty.');
      for (;;) {
        let s = 1, t = peek();
        while (t && (t.k === '+' || t.k === '-')) { if (t.k === '-') s = -s; next(); t = peek(); }
        if (ends(t)) fail('Something is missing after a + or − sign.');
        term(depth, s).forEach((x) => terms.push(x));
        t = peek();
        if (ends(t)) break;
        if (t.k !== '+' && t.k !== '-') fail('The calculator could not read that equation near “' + (t.k === 'num' ? ftext(t.v) : t.v || t.k) + '”.');
      }
      return terms;
    }

    function term(depth, sign) {
      let coef = F(sign), hasVar = false, group = null;
      const factor = () => {
        const t = next();
        if (!t) fail('The equation stops too early.');
        if (t.k === 'num') return { c: t.v };
        if (t.k === 'var') return { c: ONE, x: true };
        if (t.k === '(') {
          if (depth >= 1) fail('One set of parentheses at a time, please.');
          const inner = expr(depth + 1);
          if (!peek() || peek().k !== ')') fail('A “(” is never closed.');
          next();
          if (inner.length === 0) return { c: ZERO };
          if (inner.length === 1) return inner[0].t === 'x' ? { c: inner[0].c, x: true } : { c: inner[0].c };
          return { c: ONE, g: inner };
        }
        if (t.k === ')') fail('There is a “)” with no “(”.');
        fail('The calculator could not read that equation near “' + t.k + '”.');
      };
      const absorb = (f, divide) => {
        if (divide) {
          if (f.x || f.g) fail('Only divide by a number here, not by ' + (f.x ? v : 'an expression') + '.');
          coef = fdiv(coef, f.c);
          return;
        }
        coef = fmul(coef, f.c);
        if (f.x) { if (hasVar || group) fail(v + ' times ' + v + ' is not linear. Keep ' + v + ' multiplied by numbers only.'); hasVar = true; }
        if (f.g) { if (hasVar || group) fail('That multiplies two things with ' + v + ' in them — not linear.'); group = f.g; }
      };
      absorb(factor(), false);
      for (;;) {
        const t = peek();
        if (!t) break;
        if (t.k === '*') { next(); absorb(factor(), false); continue; }
        if (t.k === '/') { next(); absorb(factor(), true); continue; }
        if (t.k === 'num' || t.k === 'var' || t.k === '(') { absorb(factor(), false); continue; }
        break;
      }
      if (isZero(coef)) return [];
      if (group) {
        const items = group.filter((it) => !isZero(it.c));
        if (!items.length) return [];
        if (isOne(coef)) return items;
        return [{ t: 'g', m: coef, items: items }];
      }
      return [{ t: hasVar ? 'x' : 'k', c: coef }];
    }

    const L = expr(0);
    if (!peek() || peek().k !== 'rel') fail(peek() && peek().k === ')' ? 'There is a “)” with no “(”.' : 'The calculator could not find the = sign.');
    const rel = next().v;
    const R = expr(0);
    if (peek()) fail(peek().k === ')' ? 'There is a “)” with no “(”.' : 'The calculator could not read the end of that ' + (rel === '=' ? 'equation.' : 'inequality.'));
    return { v: v, st: { L: L, R: R, rel: rel } };
  }

  /* ── what's on a side ────────────────────────────────────────────── */
  const hasX = (side) => side.some((t) => t.t === 'x' || (t.t === 'g' && hasX(t.items)));
  const hasGroup = (st) => st.L.some((t) => t.t === 'g') || st.R.some((t) => t.t === 'g');
  const xCoef = (side) => side.reduce((a, t) => (t.t === 'x' ? fadd(a, t.c) : t.t === 'g' ? fadd(a, fmul(t.m, xCoef(t.items))) : a), ZERO);
  function evalSide(side, x) {
    return side.reduce((a, t) => (t.t === 'k' ? fadd(a, t.c) : t.t === 'x' ? fadd(a, fmul(t.c, x)) : fadd(a, fmul(t.m, evalSide(t.items, x)))), ZERO);
  }
  function needsCombine(side, only) {
    const n = { x: 0, k: 0 };
    side.forEach((t) => { if (t.t !== 'g') n[t.t]++; });
    return only ? n[only] > 1 : n.x > 1 || n.k > 1;
  }

  /* ── moves (all return a new state) ──────────────────────────────── */
  function mergeInto(side, term) {
    const i = side.findIndex((t) => t.t === term.t);
    const res = side.map(clone);
    if (i < 0) { res.push(clone(term)); return res; }
    const c = fadd(side[i].c, term.c);
    if (isZero(c)) res.splice(i, 1); else res[i] = { t: term.t, c: c };
    return res;
  }
  function scaleSide(side, f) {
    const res = [];
    side.forEach((t) => {
      if (t.t === 'g') {
        const m = fmul(t.m, f);
        if (isOne(m)) t.items.forEach((it) => res.push(clone(it)));
        else res.push({ t: 'g', m: m, items: clone(t.items) });
      } else res.push({ t: t.t, c: fmul(t.c, f) });
    });
    return res;
  }
  function combineSide(side, only) {
    const res = [], at = {};
    side.forEach((t) => {
      if (t.t === 'g' || (only && t.t !== only)) { res.push(clone(t)); return; }
      if (at[t.t] == null) { at[t.t] = res.length; res.push(clone(t)); }
      else res[at[t.t]] = { t: t.t, c: fadd(res[at[t.t]].c, t.c) };
    });
    return res.filter((t) => t.t === 'g' || !isZero(t.c));
  }
  function distributeSide(side, idx) {
    const res = [];
    side.forEach((t, i) => {
      if (t.t === 'g' && (idx == null || idx === i)) t.items.forEach((it) => { const c = fmul(t.m, it.c); if (!isZero(c)) res.push({ t: it.t, c: c }); });
      else res.push(clone(t));
    });
    return res;
  }

  /** + − × ÷ the same thing on both sides. × or ÷ by a negative turns an inequality's sign around. */
  function applyOp(st, op, val, isX, v) {
    v = v || 'x';
    const rel = relOf(st), what = rel === '=' ? 'equation' : 'inequality';
    if (op === '+' || op === '-') {
      if (isZero(val)) fail((op === '+' ? 'Adding' : 'Subtracting') + ' 0 changes nothing.');
      const term = { t: isX ? 'x' : 'k', c: op === '-' ? fneg(val) : val };
      return { L: mergeInto(st.L, term), R: mergeInto(st.R, term), rel: rel };
    }
    if (isX) fail('You can’t ' + (op === '*' ? 'multiply' : 'divide') + ' both sides by ' + v + ' here — the ' + what + ' would stop being linear. Use a number.');
    if (isZero(val)) fail(op === '*' ? 'Multiplying both sides by 0 turns everything into 0 ' + rel + ' 0 and wipes out the ' + what + '. Not allowed.' : 'You can’t divide by zero.');
    if (op === '*' && isOne(val)) fail('Multiplying by 1 changes nothing.');
    if (op === '/' && isOne(val)) fail('Dividing by 1 changes nothing.');
    const f = op === '*' ? val : fdiv(ONE, val);
    return { L: scaleSide(st.L, f), R: scaleSide(st.R, f), rel: f.n < 0 ? FLIP[rel] : rel };
  }
  function applyCombine(st, s, only) {
    const out = { L: s && s !== 'L' ? clone(st.L) : combineSide(st.L, only), R: s && s !== 'R' ? clone(st.R) : combineSide(st.R, only), rel: relOf(st) };
    if (same(out.L, st.L) && same(out.R, st.R)) fail('There is nothing to combine — no two like terms sit on the same side.');
    return out;
  }
  function applyDistribute(st, s, i) {
    if (!hasGroup(st)) fail('There are no parentheses to distribute.');
    return { L: s && s !== 'L' ? clone(st.L) : distributeSide(st.L, s ? i : null), R: s && s !== 'R' ? clone(st.R) : distributeSide(st.R, s ? i : null), rel: relOf(st) };
  }

  /** Is it over?
   *  { kind:'solved', value, flipped, rel }  — rel is read from x's side (6 < x → '>')
   *  { kind:'special', truth } | null */
  function outcome(st) {
    const rel = relOf(st);
    if (!hasX(st.L) && !hasX(st.R)) return { kind: 'special', truth: holds(evalSide(st.L, ZERO), evalSide(st.R, ZERO), rel) };
    const alone = (side) => side.length === 1 && side[0].t === 'x' && isOne(side[0].c);
    const plain = (side) => side.length === 0 || (side.length === 1 && side[0].t === 'k');
    if (alone(st.L) && plain(st.R)) return { kind: 'solved', value: st.R.length ? st.R[0].c : ZERO, flipped: false, rel: rel };
    if (alone(st.R) && plain(st.L)) return { kind: 'solved', value: st.L.length ? st.L[0].c : ZERO, flipped: true, rel: FLIP[rel] };
    return null;
  }

  /* ── the textbook route: next move, par, hints ───────────────────── */
  function plan(st) {
    if (hasGroup(st)) {
      for (const s of SIDES) {
        const o = otherSide(s), side = st[s];
        if (side.length === 1 && side[0].t === 'g' && !hasX(st[o]) && st[o].every((t) => t.t === 'k' && isInt(fdiv(t.c, side[0].m)))) {
          const m = side[0].m;
          return isInt(m) ? { kind: 'op', op: '/', val: m, isX: false, why: 'detach-group', s: s, m: m }
            : { kind: 'op', op: '*', val: fdiv(ONE, m), isX: false, why: 'detach-group', s: s, m: m };
        }
      }
      for (const s of SIDES) { const i = st[s].findIndex((t) => t.t === 'g'); if (i >= 0) return { kind: 'distribute', why: 'distribute', s: s, i: i, m: st[s][i].m }; }
    }
    for (const s of SIDES) if (needsCombine(st[s])) return { kind: 'combine', why: 'combine', s: s };
    const xl = xCoef(st.L), xr = xCoef(st.R);
    if (!isZero(xl) && !isZero(xr)) {
      const drop = fnum(xl) >= fnum(xr) ? 'R' : 'L';
      const c = drop === 'R' ? xr : xl;
      return { kind: 'op', op: c.n > 0 ? '-' : '+', val: fabs(c), isX: true, why: 'move-x', s: drop, c: c };
    }
    if (isZero(xl) && isZero(xr)) return null;
    const xs = !isZero(xl) ? 'L' : 'R';
    const k = st[xs].find((t) => t.t === 'k');
    if (k) return { kind: 'op', op: k.c.n > 0 ? '-' : '+', val: fabs(k.c), isX: false, why: 'move-k', s: xs, c: k.c };
    const c = xs === 'L' ? xl : xr;
    if (!isOne(c)) return isInt(c) ? { kind: 'op', op: '/', val: c, isX: false, why: 'detach', s: xs, c: c } : { kind: 'op', op: '*', val: fdiv(ONE, c), isX: false, why: 'detach', s: xs, c: c };
    return null;
  }
  function applyPlan(st, pl, v) {
    if (pl.kind === 'op') return applyOp(st, pl.op, pl.val, pl.isX, v);
    if (pl.kind === 'combine') return applyCombine(st);
    return applyDistribute(st);
  }
  function par(st, v) {
    let s = clone(st), n = 0;
    for (let guard = 0; guard < 24; guard++) {
      if (outcome(s)) return n;
      const pl = plan(s);
      if (!pl) return n;
      s = applyPlan(s, pl, v);
      n++;
    }
    return n;
  }

  /* ── text versions (tape copy, result file) ──────────────────────── */
  function coefText(a, v) { // a > 0; the coefficient written onto v
    if (isOne(a)) return v;
    if (a.d === 1) return a.n + v;
    return (a.n === 1 ? '' : a.n) + v + '/' + a.d;
  }
  function termText(t, first, v) {
    let neg, body;
    if (t.t === 'k') { neg = t.c.n < 0; body = ftext(fabs(t.c)); }
    else if (t.t === 'x') { neg = t.c.n < 0; body = coefText(fabs(t.c), v); }
    else {
      neg = t.m.n < 0;
      const a = fabs(t.m), inner = '(' + sideText(t.items, v) + ')';
      body = isOne(a) ? inner : a.d === 1 ? a.n + inner : (a.n === 1 ? '' : a.n) + inner + '/' + a.d;
    }
    return first ? (neg ? MINUS : '') + body : (neg ? ' ' + MINUS + ' ' : ' + ') + body;
  }
  const sideText = (terms, v) => (terms.length ? terms.map((t, i) => termText(t, i === 0, v)).join('') : '0');
  const eqText = (st, v) => sideText(st.L, v) + ' ' + relOf(st) + ' ' + sideText(st.R, v);
  const ansText = (rel, value, v) => v + ' ' + rel + ' ' + ftext(value);
  /** a single term with its sign always shown: +3, −2x, +3(x + 4) */
  const termLabel = (t, v) => { const s = termText(t, false, v).trim(); return s[0] === '+' ? '+' + s.slice(2) : MINUS + s.slice(2); };
  const opSym = { '+': '+', '-': MINUS, '*': '×', '/': '÷' };
  function valText(val, isX, v) {
    if (isX) return (val.n < 0 ? '(' + MINUS + coefText(fabs(val), v) + ')' : coefText(val, v));
    const s = ftext(fabs(val));
    return val.n < 0 ? '(' + MINUS + s + ')' : s;
  }
  const opText = (op, val, isX, v) => opSym[op] + valText(val, isX, v);
  function sayOp(op, val, isX, v) {
    const word = isX ? (val.n < 0 ? MINUS : '') + coefText(fabs(val), v) : ftext(val);
    if (op === '+') return 'add ' + word + ' to both sides';
    if (op === '-') return 'subtract ' + word + ' from both sides';
    if (op === '*') return 'multiply both sides by ' + word;
    return 'divide both sides by ' + word;
  }
  const multWord = (m) => (isOne(fabs(m)) ? (m.n < 0 ? MINUS + '1' : '1') : ftext(m));

  /* ── HTML versions ───────────────────────────────────────────────── */
  const numHtml = (a) => (a.d === 1 ? String(Math.abs(a.n)) : '<span class="yc-fr"><span>' + Math.abs(a.n) + '</span><span>' + a.d + '</span></span>');
  const signHtml = (neg, first) => (first ? (neg ? '<span class="yc-sg yc-sg1">' + MINUS + '</span>' : '') : '<span class="yc-sg">' + (neg ? MINUS : '+') + '</span>');
  /* ctx: { v, gran: 'term'|'parts', live, sel, marks, ghost, off } */
  function tgt(path, inner, ctx, cls) {
    const mark = ctx.marks && ctx.marks[path];
    const c = 'yc-t ' + cls + (ctx.sel === path ? ' is-sel' : '') + (mark ? ' is-' + mark : '');
    if (!ctx.live) return '<span class="' + c + '">' + inner + '</span>';
    return '<button type="button" class="' + c + '" data-t="' + path + '" data-fid="t:' + path + '"' + (ctx.off ? ' disabled' : '') + '>' + inner + '</button>';
  }
  function termHtml(t, first, path, ctx) {
    const vv = '<span class="yc-v">' + esc(ctx.v) + '</span>';
    if (t.t === 'k') return tgt(path, signHtml(t.c.n < 0, first) + '<span class="yc-n">' + numHtml(t.c) + '</span>', ctx, 'yc-k');
    if (t.t === 'x') {
      const a = fabs(t.c), neg = t.c.n < 0;
      const coef = isOne(a) ? (ctx.ghost ? '<span class="yc-n yc-ghost">1</span>' : '') : '<span class="yc-n">' + numHtml(a) + '</span>';
      if (ctx.gran === 'parts') return '<span class="yc-term">' + tgt(path + '.c', signHtml(neg, first) + coef, ctx, 'yc-c') + tgt(path + '.v', vv, ctx, 'yc-vt') + '</span>';
      return tgt(path, signHtml(neg, first) + coef + vv, ctx, 'yc-x');
    }
    const a = fabs(t.m), neg = t.m.n < 0;
    const mult = signHtml(neg, first) + (isOne(a) ? '' : '<span class="yc-n">' + numHtml(a) + '</span>');
    const handle = ctx.gran === 'parts' ? '<span class="yc-t yc-m">' + mult + '</span>' : tgt(path + '.m', mult, ctx, 'yc-m');
    const inner = t.items.map((it, j) => termHtml(it, j === 0, path + '.i.' + j, ctx)).join('');
    return '<span class="yc-g">' + handle + '<span class="yc-p">(</span>' + inner + '<span class="yc-p">)</span></span>';
  }
  function sideHtml(terms, base, ctx) {
    if (!terms.length) return '<span class="yc-t yc-zero">0</span>';
    return terms.map((t, i) => termHtml(t, i === 0, base + '.' + i, ctx)).join('');
  }
  function valHtml(val, isX, v) {
    const a = fabs(val), vv = isX ? '<span class="yc-v">' + esc(v) + '</span>' : '';
    const body = (isX && isOne(a) ? '' : numHtml(a)) + vv;
    return val.n < 0 ? '(' + MINUS + body + ')' : body;
  }
  const opHtml = (op, val, isX, v) => '<span class="yc-opsym">' + opSym[op] + '</span>' + valHtml(val, isX, v);
  const relHtml = (rel) => '<span class="yc-rel">' + esc(rel) + '</span>';

  /** A number line for an inequality answer.
   *  circle: 'open' | 'closed' | null, side: 'left' | 'right' | null, tone: 'acc' | 'ok' | 'bad' */
  function nlHtml(value, circle, side, tone, label, narrow) {
    const W = narrow ? 360 : 600, Y = 40, pad = narrow ? 24 : 30, b = fnum(value), whole = isInt(value), span = narrow ? 3 : 5;
    const lo = whole ? b - span : Math.floor(b) - span + 1, hi = whole ? b + span : Math.ceil(b) + span - 1;
    const X = (u) => pad + ((u - lo) / (hi - lo)) * (W - 2 * pad);
    const col = tone === 'ok' ? 'var(--yc-ok)' : tone === 'bad' ? 'var(--yc-bad)' : 'var(--yc-acc)';
    const num = (n) => (n < 0 ? MINUS : '') + Math.abs(n);
    let s = '<svg class="yc-nl" viewBox="0 0 ' + W + ' 76" role="img" aria-label="' + esc(label || 'number line') + '">';
    s += '<line x1="12" y1="' + Y + '" x2="' + (W - 12) + '" y2="' + Y + '" style="stroke:var(--yc-ink);stroke-width:2"/>';
    s += '<polygon points="4,' + Y + ' 15,' + (Y - 6) + ' 15,' + (Y + 6) + '" style="fill:var(--yc-ink)"/><polygon points="' + (W - 4) + ',' + Y + ' ' + (W - 15) + ',' + (Y - 6) + ' ' + (W - 15) + ',' + (Y + 6) + '" style="fill:var(--yc-ink)"/>';
    for (let i = Math.ceil(lo); i <= hi; i++) {
      const x = X(i).toFixed(1);
      s += '<line x1="' + x + '" y1="' + (Y - 7) + '" x2="' + x + '" y2="' + (Y + 7) + '" style="stroke:var(--yc-ink);stroke-width:1.5"/>';
      s += '<text x="' + x + '" y="' + (Y + 27) + '" text-anchor="middle"' + (whole && i === b ? ' class="b"' : '') + '>' + num(i) + '</text>';
    }
    const bx = X(b);
    if (!whole) s += '<line x1="' + bx.toFixed(1) + '" y1="' + (Y - 7) + '" x2="' + bx.toFixed(1) + '" y2="' + (Y + 7) + '" style="stroke:var(--yc-ink);stroke-width:1.5"/><text x="' + bx.toFixed(1) + '" y="' + (Y - 16) + '" text-anchor="middle" class="b">' + esc(ftext(value)) + '</text>';
    if (side) {
      const end = side === 'left' ? 16 : W - 16;
      s += '<line x1="' + bx.toFixed(1) + '" y1="' + Y + '" x2="' + end + '" y2="' + Y + '" style="stroke:' + col + ';stroke-width:7"/>';
      s += side === 'left' ? '<polygon points="2,' + Y + ' 18,' + (Y - 10) + ' 18,' + (Y + 10) + '" style="fill:' + col + '"/>' : '<polygon points="' + (W - 2) + ',' + Y + ' ' + (W - 18) + ',' + (Y - 10) + ' ' + (W - 18) + ',' + (Y + 10) + '" style="fill:' + col + '"/>';
    }
    if (circle) s += '<circle cx="' + bx.toFixed(1) + '" cy="' + Y + '" r="8.5" style="fill:' + (circle === 'closed' ? col : '#fff') + ';stroke:' + col + ';stroke-width:3"/>';
    else s += '<circle cx="' + bx.toFixed(1) + '" cy="' + Y + '" r="8.5" style="fill:#fff;stroke:var(--yc-mute);stroke-width:2;stroke-dasharray:3 3"/>';
    return s + '</svg>';
  }
  const graphWords = (g) => (g.circle ? g.circle + ' circle' : 'no circle') + ', ' + (g.side ? 'shaded ' + g.side : 'no shading');

  /* ── angle problems (v1.2) ───────────────────────────────────────────
     "angles linear: 3x + 10 | 2x - 5 | find 2" — a figure drawn to scale,
     the student picks how the marked angles are related, the calculator
     writes the equation, the student solves it and types the angle. */
  const ANGLE_RELS = {
    vertical: 'vertical', 'vertical-angles': 'vertical', equal: 'vertical',
    linear: 'linear', 'linear-pair': 'linear', line: 'linear', straight: 'linear', 'straight-line': 'linear', supplementary: 'linear',
    complementary: 'complementary', complement: 'complementary', right: 'complementary', 'right-angle': 'complementary',
    around: 'around', 'around-a-point': 'around', point: 'around', full: 'around',
    triangle: 'triangle',
  };
  const ANG = {
    vertical:      { name: 'Vertical angles', pick: 'Equal — vertical angles', total: null, where: 'across from each other where two lines cross', rule: 'vertical angles are equal' },
    linear:        { name: 'Linear pair', pick: 'Add to 180° — a straight line', total: 180, where: 'side by side on a straight line', rule: 'angles on a straight line add up to 180°' },
    complementary: { name: 'Complementary', pick: 'Add to 90° — a right angle', total: 90, where: 'together filling a right angle', rule: 'angles that fill a right angle add up to 90°' },
    around:        { name: 'Around a point', pick: 'Add to 360° — around a point', total: 360, where: 'all the way around one point', rule: 'angles all the way around a point add up to 360°' },
    triangle:      { name: 'Triangle', pick: 'Add to 180° — a triangle', total: 180, where: 'the three corners inside a triangle', rule: 'the angles inside a triangle add up to 180°' },
  };
  /** Read the labels, solve the problem the right way, and check the figure is possible. */
  function angleSetup(spec) {
    const rel = spec.relation, R = ANG[rel];
    if (!R) fail('“' + rel + '” is not an angle rule. Use vertical, linear, complementary, around, or triangle.');
    const labels = spec.labels || [];
    if (rel === 'vertical' && labels.length !== 2) fail('Vertical angles come in pairs — give exactly 2 angles.');
    if (rel === 'triangle' && labels.length !== 3) fail('A triangle has 3 angles — give exactly 3.');
    if (labels.length < 2) fail('Give at least 2 angles, separated by |.');
    let v = null;
    const sides = labels.map((l) => {
      const p = parseEquation('(' + l + ') = 0');
      if (hasX(p.st.L)) { if (v && v !== p.v) fail('Use one letter for the unknown in every angle.'); v = p.v; }
      return p.st.L;
    });
    v = v || 'x';
    if (!sides.some(hasX)) fail('None of the angles has ' + v + ' in it — nothing to solve.');
    const write = rel === 'vertical'
      ? labels[0] + ' = ' + labels[1]
      : labels.map((l, i) => (sides[i].length > 1 || /^\s*[-−]/.test(l) ? '(' + l + ')' : l)).join(' + ') + ' = ' + R.total;
    const st = parseEquation(write).st;
    // solve it directly: a·x + b = c
    const a = fadd(xCoef(st.L), fneg(xCoef(st.R))), b = fadd(evalSide(st.L, ZERO), fneg(evalSide(st.R, ZERO)));
    if (isZero(a)) fail('The ' + v + '-terms cancel out, so ' + v + ' can’t be found. Check the angles.');
    const xv = fdiv(fneg(b), a);
    const values = sides.map((s) => evalSide(s, xv));
    const cap = rel === 'complementary' ? 90 : rel === 'around' ? 360 : 180;
    values.forEach((val, i) => {
      if (fnum(val) <= 0 || fnum(val) >= cap) fail('With ' + v + ' = ' + ftext(xv) + ', angle ' + (i + 1) + ' would be ' + ftext(val) + '°. That figure can’t be drawn — check the angles.');
    });
    let find = spec.find;
    if (find == null) find = Math.max(0, sides.findIndex(hasX));
    if (find < 0 || find >= sides.length) fail('“find ' + (find + 1) + '” — there is no angle ' + (find + 1) + '.');
    const disp = sides.map((s) => sideText(s, v));
    const plainX = sides.map((s) => s.length === 1 && s[0].t === 'x' && isOne(s[0].c));
    return { rel: rel, v: v, sides: sides, disp: disp, deg: disp.map((d, i) => (sides[i].length > 1 ? '(' + d + ')°' : d + '°')), st: st, write: write, xv: xv, values: values, find: find, plainX: plainX };
  }

  /* the figure, drawn to scale (SVG, y down; angles in degrees, counterclockwise) */
  function figHtml(A, hi, tone) {
    const W = 380, H = 230, vals = A.values.map(fnum), n = vals.length;
    const rad = (d) => (d * Math.PI) / 180;
    const pt = (cx, cy, r, d) => [cx + r * Math.cos(rad(d)), cy - r * Math.sin(rad(d))];
    const f1 = (x) => Math.round(x * 10) / 10;
    const ink = 'var(--yc-ink)', acc = tone === 'ok' ? 'var(--yc-ok)' : 'var(--yc-acc)';
    let s = '';
    const line = (a, b, w) => { s += '<line x1="' + f1(a[0]) + '" y1="' + f1(a[1]) + '" x2="' + f1(b[0]) + '" y2="' + f1(b[1]) + '" style="stroke:' + ink + ';stroke-width:' + (w || 2) + ';stroke-linecap:round"/>'; };
    const arrow = (p, d) => { const a = pt(p[0], p[1], -11, d - 22), b = pt(p[0], p[1], -11, d + 22); s += '<polygon points="' + f1(p[0]) + ',' + f1(p[1]) + ' ' + f1(a[0]) + ',' + f1(a[1]) + ' ' + f1(b[0]) + ',' + f1(b[1]) + '" style="fill:' + ink + '"/>'; };
    const ray = (c, d, len) => { const e = pt(c[0], c[1], len, d); line(c, e); arrow(e, d); };
    /** how far out along the bisector a label must sit to clear both sides of its angle */
    const labelR = (d1, d2, i, rMin, rMax) => {
      const hw = A.deg[i].length * 4.5 + 3, hh = 10, half = (d2 - d1) / 2;
      if (half >= 88) return Math.max(rMin, Math.hypot(hw, hh) + 6);
      const need = (d) => hw * Math.abs(Math.sin(rad(d))) + hh * Math.abs(Math.cos(rad(d))) + 4;
      return Math.max(rMin, Math.min(rMax, Math.max(need(d1), need(d2)) / Math.sin(rad(half))));
    };
    /** the mark for one angle (arc, or a square for 90°) + its label; i = which angle */
    const mark = (c, d1, d2, r, i, rMax, outside) => {
      const on = i === hi, span = d2 - d1, mid = (d1 + d2) / 2, sq = Math.abs(vals[i] - 90) < 1e-9;
      if (on) { const a = pt(c[0], c[1], r + 10, d1), b = pt(c[0], c[1], r + 10, d2); s += '<path d="M' + f1(c[0]) + ' ' + f1(c[1]) + ' L' + f1(a[0]) + ' ' + f1(a[1]) + ' A' + (r + 10) + ' ' + (r + 10) + ' 0 ' + (span > 180 ? 1 : 0) + ' 0 ' + f1(b[0]) + ' ' + f1(b[1]) + 'Z" style="fill:' + acc + ';opacity:.16"/>'; }
      const col = on ? acc : ink, w = on ? 2.6 : 1.6;
      if (sq) {
        const q = 13, a = pt(c[0], c[1], q, d1), b = pt(c[0], c[1], q * Math.SQRT2, mid), e = pt(c[0], c[1], q, d2);
        s += '<polyline points="' + f1(a[0]) + ',' + f1(a[1]) + ' ' + f1(b[0]) + ',' + f1(b[1]) + ' ' + f1(e[0]) + ',' + f1(e[1]) + '" style="fill:none;stroke:' + col + ';stroke-width:' + w + '"/>';
      } else {
        const a = pt(c[0], c[1], r, d1), b = pt(c[0], c[1], r, d2);
        s += '<path d="M' + f1(a[0]) + ' ' + f1(a[1]) + ' A' + r + ' ' + r + ' 0 ' + (span > 180 ? 1 : 0) + ' 0 ' + f1(b[0]) + ' ' + f1(b[1]) + '" style="fill:none;stroke:' + col + ';stroke-width:' + w + '"/>';
      }
      const rl = outside ? -(Math.hypot(A.deg[i].length * 4.5 + 3, 10) * 0.85 + 10) : labelR(d1, d2, i, r + 22, rMax || 140);
      const p = pt(c[0], c[1], rl, mid);
      s += '<text x="' + f1(p[0]) + '" y="' + f1(p[1] + 5) + '" text-anchor="middle" class="yc-fl' + (on ? ' on' : '') + '">' + esc(A.deg[i]) + '</text>';
    };
    const rel = A.rel;
    if (rel === 'linear') {
      const c = [W / 2, H - 46];
      line([16, c[1]], [W - 16, c[1]]); arrow([W - 16, c[1]], 0); arrow([16, c[1]], 180);
      let d = 0;
      vals.forEach((val, i) => { if (i) ray(c, d, 150); mark(c, d, d + val, 24 + (i % 2) * 7, i); d += val; });
    } else if (rel === 'vertical') {
      const c = [W / 2, H / 2], th = vals[0], tilt = 12;
      [tilt + th / 2, tilt - th / 2].forEach((dir) => {
        const sn = Math.abs(Math.sin(rad(dir))), cs = Math.abs(Math.cos(rad(dir)));
        const L = Math.min(sn > 1e-6 ? (H / 2 - 16) / sn : 1e9, cs > 1e-6 ? (W / 2 - 16) / cs : 1e9);
        const a = pt(c[0], c[1], L, dir), b = pt(c[0], c[1], L, dir + 180);
        line(a, b); arrow(a, dir); arrow(b, dir + 180);
      });
      mark(c, tilt - th / 2, tilt + th / 2, 26, 0, 165);
      mark(c, tilt + 180 - th / 2, tilt + 180 + th / 2, 26, 1, 165);
    } else if (rel === 'complementary') {
      const c = [W / 2 - 50, H - 50];
      line([16, c[1]], [W - 16, c[1]]); arrow([W - 16, c[1]], 0); arrow([16, c[1]], 180);
      line([c[0], 12], [c[0], H - 8]); arrow([c[0], 12], 90); arrow([c[0], H - 8], 270);
      const q = 13; s += '<polyline points="' + (c[0] - q) + ',' + c[1] + ' ' + (c[0] - q) + ',' + (c[1] + q) + ' ' + c[0] + ',' + (c[1] + q) + '" style="fill:none;stroke:' + ink + ';stroke-width:1.6"/>';
      let d = 0;
      vals.forEach((val, i) => { if (i) ray(c, d, 150); mark(c, d, d + val, 26 + (i % 2) * 7, i); d += val; });
    } else if (rel === 'around') {
      const c = [W / 2, H / 2];
      let d = 90;
      vals.forEach((val, i) => { ray(c, d, H / 2 - 14); d += val; });
      d = 90;
      vals.forEach((val, i) => { mark(c, d, d + val, 20 + (i % 2) * 6, i, 104); d += val; });
    } else if (rel === 'triangle') {
      const [al, be] = vals, ga = vals[2];
      const ac = Math.sin(rad(be)) / Math.sin(rad(ga));
      const P = [[0, 0], [1, 0], [ac * Math.cos(rad(al)), ac * Math.sin(rad(al))]];
      const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
      const minX = Math.min(...xs), maxX = Math.max(...xs), maxY = Math.max(...ys);
      const k = Math.min((W - 90) / (maxX - minX), (H - 76) / maxY);
      const X = P.map((p) => [45 + (p[0] - minX) * k + ((W - 90) - (maxX - minX) * k) / 2, H - 36 - p[1] * k]);
      const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
      s += '<polygon points="' + X.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ') + '" style="fill:none;stroke:' + ink + ';stroke-width:2;stroke-linejoin:round"/>';
      const dirTo = (a, b) => (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI;
      X.forEach((p, i) => {
        let d1 = dirTo(p, X[(i + 1) % 3]), d2 = dirTo(p, X[(i + 2) % 3]);
        let lo = Math.min(d1, d2), hiD = Math.max(d1, d2);
        if (hiD - lo > 180) { const t = lo; lo = hiD; hiD = t + 360; }
        const room = 0.45 * Math.min(len(p, X[(i + 1) % 3]), len(p, X[(i + 2) % 3]));
        mark(p, lo, hiD, 18, i, room, labelR(lo, hiD, i, 40, 1e9) > room);
      });
    }
    return '<svg class="yc-figsvg" viewBox="-20 -6 ' + (W + 40) + ' ' + (H + 12) + '" role="img" aria-label="' + esc(ANG[rel].name + ' figure: ' + A.deg.join(', ')) + '">' + s + '</svg>';
  }

  /* ── the block text ──────────────────────────────────────────────── */
  const SPOTS = {
    constants: 'constants', constant: 'constants', numbers: 'constants',
    'x-terms': 'x-terms', 'x-term': 'x-terms', xterms: 'x-terms', variables: 'x-terms', 'variable-terms': 'x-terms', x: 'x-terms',
    coefficients: 'coefficients', coefficient: 'coefficients', coefs: 'coefficients',
    movable: 'movable', moveable: 'movable', move: 'movable', moves: 'movable',
  };
  function parseBlock(text) {
    const block = { title: '', moves: 'both', points: 2, slack: 1, hints: true, graph: true, problems: [] };
    let cur = null;
    String(text || '').replace(/\r/g, '').split('\n').forEach((raw) => {
      const t = raw.trim();
      if (!t) return;
      let m;
      if (!block.problems.length && (m = /^(title|moves|points|slack|hints|graph)\s*:\s*(.*)$/i.exec(t))) {
        const k = m[1].toLowerCase(), val = m[2].trim();
        if (k === 'title') block.title = val;
        else if (k === 'moves') block.moves = /^tap/i.test(val) ? 'tap' : /^(type|key)/i.test(val) ? 'type' : 'both';
        else if (k === 'points') block.points = Number(val) > 0 ? Number(val) : 2;
        else if (k === 'slack') block.slack = Number(val) >= 0 ? Number(val) : 1;
        else if (k === 'graph') block.graph = !/^(off|no|false|0)$/i.test(val);
        else block.hints = !/^(off|no|false|0)$/i.test(val);
        return;
      }
      if ((m = /^>\s?(.*)$/.exec(t))) { if (cur) cur.note = (cur.note ? cur.note + ' ' : '') + m[1]; return; }
      if ((m = /^\?\s?(.*)$/.exec(t))) { if (cur) cur.ask = (cur.ask ? cur.ask + ' ' : '') + m[1]; return; }
      if ((m = /^(?:\d+[.)]|[-*])\s+(.*)$/.exec(t)) || /[=<>≤≥]/.test(t)) {
        let body = m ? m[1] : t;
        const spec = { kind: 'solve', spot: null, eq: '', points: null, note: '', ask: '' };
        const pm = /^\[(\d+(?:\.\d+)?)\s*pts?\]\s*/i.exec(body);
        if (pm) { spec.points = Number(pm[1]); body = body.slice(pm[0].length); }
        const sm = /^spot\s+([a-z-]+(?:\s+terms)?)\s*:\s*(.*)$/i.exec(body);
        const am = /^angles?\s+([a-z -]+?)\s*:\s*(.*)$/i.exec(body);
        if (am) {
          spec.kind = 'angles';
          spec.relation = ANGLE_RELS[am[1].toLowerCase().replace(/\s+/g, '-')] || am[1].toLowerCase();
          const parts = am[2].split('|').map((s) => s.trim()).filter(Boolean);
          const fm = parts.length && /^find\s+(\d+)$/i.exec(parts[parts.length - 1]);
          if (fm) { spec.find = Number(fm[1]) - 1; parts.pop(); }
          spec.labels = parts;
        } else if (sm) {
          spec.kind = 'spot';
          spec.spot = SPOTS[sm[1].toLowerCase().replace(/\s+/g, '-')] || 'constants';
          body = sm[2];
        } else body = body.replace(/^solve\s*:\s*/i, '');
        spec.eq = body.trim();
        block.problems.push(spec);
        cur = spec;
      }
    });
    block.problems.forEach((p) => { if (p.points == null) p.points = block.points; });
    return block;
  }

  /* ── styles (injected once) ──────────────────────────────────────── */
  const CSS = [
    '.yc{--yc-ink:var(--ink,#121212);--yc-paper:var(--paper,#f4f3ef);--yc-paper2:var(--paper-2,#e9e7e0);--yc-line:var(--line,#d9d6cd);--yc-mute:var(--mute,#5f5c55);--yc-acc:var(--acc,#b5471f);--yc-ok:#1f6f45;--yc-bad:#a83a2a;--yc-warn:#8a5a00;--yc-screen:#171717;--yc-glow:#f3b08f;',
    'container-type:inline-size;font:16px/1.45 var(--font-body,Inter,"Segoe UI",system-ui,sans-serif);color:var(--yc-ink);background:#fff;border:1.5px solid var(--yc-ink);border-radius:14px;box-shadow:6px 6px 0 var(--yc-ink);margin:8px 0;text-align:left}',
    '@supports (color:color-mix(in srgb,red,blue)){.yc{--yc-glow:color-mix(in srgb,var(--yc-acc) 42%,#fff)}}',
    '.yc *{box-sizing:border-box}.yc p{margin:0}.yc button{font:inherit;color:inherit}',
    '.yc.is-off{box-shadow:none;border-style:dashed}',
    '.yc-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px;border-bottom:1.5px solid var(--yc-ink)}',
    '.yc .yc-head h3{margin:0;font:800 19px/1.2 var(--font-display,Archivo,Inter,sans-serif);display:flex;align-items:center;gap:10px;flex-wrap:wrap;letter-spacing:-.01em}',
    '.yc-kind{font-size:11.5px;letter-spacing:.1em;text-transform:uppercase;padding:4px 8px;background:var(--yc-acc);color:#fff;border-radius:5px}',
    '.yc-practice .yc-kind{background:var(--yc-ok)}.yc-free .yc-kind{background:var(--yc-ink)}',
    '.yc-score{font:700 14px var(--font-mono,ui-monospace,Menlo,monospace);background:var(--yc-paper2);padding:5px 10px;border-radius:6px;white-space:nowrap}',
    '.yc .yc-gate{margin:0;padding:12px 18px;font-size:14.5px;color:var(--yc-mute);border-bottom:1px solid var(--yc-line);background:var(--yc-paper)}',
    '.yc-nav{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:12px 18px 0}',
    '.yc-nav .yc-lbl{font:700 11.5px var(--font-display,Archivo,sans-serif);letter-spacing:.1em;text-transform:uppercase;color:var(--yc-mute);margin-right:4px}',
    '.yc-pn{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--yc-ink);background:#fff;font:700 13.5px var(--font-display,Archivo,sans-serif);cursor:pointer;display:grid;place-items:center;padding:0}',
    '.yc-pn:hover{background:var(--yc-paper)}.yc-pn.is-cur{outline:3px solid var(--yc-glow);outline-offset:2px}',
    '.yc-pn.st-solved,.yc-pn.st-right{background:var(--yc-ok);border-color:var(--yc-ok);color:#fff}.yc-pn.st-half{background:#c98a14;border-color:#c98a14;color:#fff}.yc-pn.st-wrong{background:var(--yc-bad);border-color:var(--yc-bad);color:#fff}.yc-pn.st-broken{border-style:dashed;color:var(--yc-mute)}',
    '.yc-task{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;padding:12px 18px 10px}',
    '.yc-task-text{font-size:16px}.yc-task-text b{font-family:var(--font-display,Archivo,sans-serif);margin-right:6px}',
    '.yc-pills{display:flex;gap:6px;flex-wrap:wrap}.yc-pill{font:600 12px var(--font-body,Inter,sans-serif);padding:3px 9px;border-radius:999px;background:var(--yc-paper2);white-space:nowrap}',
    '.yc-screen{margin:0 18px;background:var(--yc-screen);color:var(--yc-paper);border-radius:12px;padding:20px 16px 14px;box-shadow:inset 0 0 0 1.5px #000,inset 0 3px 14px rgba(0,0,0,.5)}',
    '.yc-eqn{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;row-gap:6px;font:800 clamp(24px,6.5cqi,40px)/1.2 var(--font-display,Archivo,Inter,sans-serif);letter-spacing:-.01em;font-variant-numeric:tabular-nums;min-height:1.5em}',
    '.yc-eqs{margin:0 .35em;opacity:.75;font-weight:700}',
    '.yc-t{display:inline-flex;align-items:center;border:1.5px solid transparent;border-radius:8px;padding:.04em .16em;background:none;line-height:1.15;font:inherit;color:inherit}',
    'button.yc-t{cursor:pointer}.yc-screen button.yc-t:hover:not(:disabled){border-color:rgba(255,255,255,.4)}',
    '.yc-screen .yc-t.is-sel{background:var(--yc-glow);color:var(--yc-ink);border-color:var(--yc-glow)}.yc-screen .yc-t.is-sel .yc-v{color:var(--yc-ink)}',
    '.yc-screen .yc-t.is-on{background:#fff;color:var(--yc-ink);border-color:#fff}.yc-screen .yc-t.is-on .yc-v{color:var(--yc-acc)}',
    '.yc-screen .yc-t.is-ok{background:var(--yc-ok);color:#fff;border-color:var(--yc-ok)}.yc-screen .yc-t.is-bad{background:var(--yc-bad);color:#fff;border-color:var(--yc-bad);text-decoration:line-through}.yc-screen .yc-t.is-miss{border:2px dashed #8fd3a8}',
    '.yc-screen .yc-t.is-ok .yc-v,.yc-screen .yc-t.is-bad .yc-v{color:#fff}',
    '.yc-sg{margin:0 .22em 0 .3em;font-weight:700}.yc-sg1{margin:0 .04em 0 0}',
    '.yc-v{font-style:italic;font-family:"Times New Roman",Georgia,serif;font-weight:700;font-size:1.12em;color:var(--yc-acc);padding-right:.04em}.yc-screen .yc-v{color:var(--yc-glow)}',
    '.yc-ghost{opacity:.35}',
    '.yc-fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-size:.56em;line-height:1.05;margin:0 .08em}.yc-fr>span:first-child{border-bottom:.12em solid currentColor;padding:0 .12em .04em}.yc-fr>span:last-child{padding:.04em .12em 0}',
    '.yc-p{font-weight:500;opacity:.85;margin:0 .02em}.yc-g{display:inline-flex;align-items:center}',
    '.yc-term{display:inline-flex;align-items:center;gap:2px}',
    '.yc-screen button.yc-m{min-width:1.1em;justify-content:center}.yc-screen .yc-m:not(button){opacity:1}',
    '.yc-entry{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:14px;padding-top:10px;border-top:1px dashed rgba(255,255,255,.2);font:600 15px var(--font-mono,ui-monospace,Menlo,monospace);color:rgba(244,243,239,.7);min-height:30px}',
    '.yc-entry b{color:var(--yc-glow);font:800 20px var(--font-display,Archivo,sans-serif)}.yc-entry b .yc-v{color:var(--yc-glow)}',
    '.yc-caret{display:inline-block;width:2px;height:1.1em;background:var(--yc-glow);animation:yc-blink 1s steps(2) infinite;vertical-align:middle}',
    '@keyframes yc-blink{50%{opacity:0}}',
    '.yc .yc-msg{margin:10px 18px 0;min-height:1.45em;font-size:14.5px;color:var(--yc-mute)}.yc-msg.bad{color:var(--yc-bad);font-weight:600}.yc-msg.ok{color:var(--yc-ok);font-weight:600}.yc-msg.hint{color:var(--yc-warn);font-weight:600}',
    '.yc-preview{margin:8px 18px 0;padding:10px 14px;border-left:4px solid var(--yc-acc);background:var(--yc-paper);border-radius:0 10px 10px 0;font-size:15px}',
    '.yc-preview.is-idle{border-left-color:var(--yc-line);color:var(--yc-mute)}.yc-preview.is-locked{border-left-color:var(--yc-warn)}',
    '.yc-opts{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}',
    '.yc-opt{font:700 14px var(--font-display,Archivo,sans-serif)!important;padding:8px 13px;border-radius:8px;border:1.5px solid var(--yc-ink);background:var(--yc-ink);color:var(--yc-paper)!important;cursor:pointer}',
    '.yc-opt:hover:not(:disabled){background:#333}.yc-opt.alt{background:#fff;color:var(--yc-ink)!important}.yc-opt.alt:hover:not(:disabled){background:var(--yc-paper2)}.yc-opt:disabled{opacity:.45;cursor:not-allowed}',
    '.yc-tools{display:flex;gap:6px;flex-wrap:wrap;padding:12px 18px 0}',
    '.yc-tool{font:600 13.5px var(--font-body,Inter,sans-serif)!important;padding:7px 11px;border-radius:8px;border:1.5px solid var(--yc-line);background:#fff;cursor:pointer}',
    '.yc-tool:hover:not(:disabled){border-color:var(--yc-ink)}.yc-tool:disabled{opacity:.4;cursor:not-allowed}.yc-tool.is-armed{border-color:var(--yc-warn);background:#fff3d6;color:var(--yc-warn)}',
    '.yc-work{display:grid;grid-template-columns:238px minmax(0,1fr);gap:16px;padding:14px 18px 18px;align-items:start}.yc-work.no-pad{grid-template-columns:minmax(0,1fr)}',
    '@container (max-width:600px){.yc-work{grid-template-columns:minmax(0,1fr)}.yc-pad{max-width:320px;margin:0 auto;width:100%}}',
    '.yc-pad{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}',
    '.yc-key{height:44px;border:1.5px solid var(--yc-ink);border-radius:8px;background:#fff;font:700 18px var(--font-display,Archivo,sans-serif)!important;cursor:pointer;display:grid;place-items:center;padding:0;transition:transform .06s}',
    '.yc-key:hover:not(:disabled){background:var(--yc-paper)}.yc-key:active:not(:disabled){transform:translateY(1px)}.yc-key:disabled{opacity:.4;cursor:not-allowed}',
    '.yc-key.op{background:var(--yc-paper2)}.yc-key.op.is-on{background:var(--yc-ink);color:var(--yc-paper)!important}',
    '.yc-key.fn{font-size:14px!important}.yc-key.x .yc-v{font-size:1.15em}.yc-key.x.is-on{background:var(--yc-ink);color:var(--yc-paper)!important}.yc-key.x.is-on .yc-v{color:var(--yc-glow)}',
    '.yc-key.wide{grid-column:span 2}',
    '.yc-key.go{grid-column:1/-1;height:52px;background:var(--yc-acc);border-color:var(--yc-acc);color:#fff!important;font-size:15px!important;letter-spacing:.04em;text-transform:uppercase;box-shadow:3px 3px 0 var(--yc-ink)}',
    '.yc-key.go:hover:not(:disabled){background:var(--yc-acc);filter:brightness(1.08)}',
    '.yc-tape{border:1.5px solid var(--yc-ink);border-radius:10px;background:#fffdf7;min-width:0;overflow:hidden}',
    '.yc-tape-head{display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px dashed var(--yc-line);font:700 11.5px var(--font-display,Archivo,sans-serif);letter-spacing:.1em;text-transform:uppercase;color:var(--yc-mute)}',
    '.yc-tape-head span:first-child{color:var(--yc-ink)}.yc-tape-head .grow{flex:1}',
    '.yc-copy{font:600 12px var(--font-body,Inter,sans-serif)!important;text-transform:none;letter-spacing:0;padding:4px 9px;border:1px solid var(--yc-line);border-radius:6px;background:#fff;cursor:pointer;color:var(--yc-ink)}.yc-copy:hover{border-color:var(--yc-ink)}',
    '.yc-rows{display:grid;grid-template-columns:minmax(max-content,1fr) auto minmax(max-content,1fr);column-gap:8px;padding:10px 12px 14px;font:700 18px/1.35 var(--font-display,Archivo,Inter,sans-serif);font-variant-numeric:tabular-nums;overflow-x:auto}',
    '.yc-rows>div{padding:3px 0}.yc-rows .yc-t{padding:0;border:0}',
    '.yc-l{justify-self:end;text-align:right;white-space:nowrap}.yc-r{justify-self:start;white-space:nowrap}.yc-e{text-align:center;opacity:.8}',
    '.yc-op{color:var(--yc-acc);font-size:.9em;border-bottom:1.5px solid var(--yc-ink);padding:0 .2em 2px!important;margin-bottom:3px}.yc-opsym{margin-right:.08em}',
    '.yc-say{grid-column:1/-1;contain:inline-size;font:600 12.5px/1.3 var(--font-body,Inter,sans-serif);color:var(--yc-mute);margin-top:8px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}',
    '.yc-say b{display:inline-grid;place-items:center;min-width:20px;height:20px;padding:0 5px;border-radius:10px;background:var(--yc-ink);color:#fff;font:700 11px var(--font-display,Archivo,sans-serif)}',
    '.yc-say i{font-style:normal;opacity:.8}',
    '.yc-rows .is-undone{opacity:.42;text-decoration:line-through;text-decoration-thickness:2px}.yc-say.is-undone b{background:var(--yc-mute)}',
    '.yc-note{grid-column:1/-1;contain:inline-size;font:600 12.5px/1.35 var(--font-body,Inter,sans-serif);margin:8px 0 2px;padding:5px 9px;border-radius:6px;background:var(--yc-paper);color:var(--yc-mute)}',
    '.yc-note.hint{background:#fff3d6;color:var(--yc-warn)}.yc-note.back{background:none;padding:0 0 0 2px}',
    '.yc-note.slip{background:#fbe9e6;color:var(--yc-bad)}.yc-note.good{background:#eaf5ee;color:var(--yc-ok)}',
    '.yc-rows .yc-win{color:var(--yc-ok);font-weight:800}.yc-rows .yc-win .yc-v{color:var(--yc-ok)}.yc-rows .yc-l.yc-win,.yc-rows .yc-r.yc-win{border-bottom:3px double var(--yc-ok)}',
    '.yc .yc-check{grid-column:1/-1;contain:inline-size;margin-top:8px;font:600 13.5px/1.4 var(--font-body,Inter,sans-serif);color:var(--yc-ok)}',
    '.yc .yc-empty{grid-column:1/-1;contain:inline-size;margin-bottom:0;font:500 13.5px var(--font-body,Inter,sans-serif);color:var(--yc-mute);margin-top:6px}',
    '.yc-done{margin:12px 18px 0;padding:12px 14px;border:1.5px solid var(--yc-ok);border-radius:10px;background:#eaf5ee;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center;font-size:15px}',
    '.yc-done.is-half{border-color:#c98a14;background:#fff6e0}.yc-done.is-wrong{border-color:var(--yc-bad);background:#fbe9e6}',
    '.yc-done strong{font:800 18px var(--font-display,Archivo,sans-serif)}.yc-done .grow{flex:1}.yc-done .why{flex-basis:100%;font-size:14px;color:var(--yc-mute)}',
    '.yc-special{margin:8px 18px 0;padding:12px 14px;border:1.5px solid var(--yc-ink);border-radius:10px;background:var(--yc-paper)}',
    '.yc-special .yc-sub{margin-top:6px;font-size:14px;color:var(--yc-mute)}',
    '.yc-special.is-flip{border-color:var(--yc-acc);box-shadow:inset 6px 0 0 var(--yc-acc);padding-left:20px}',
    '.yc .yc-ask{margin:0 18px 12px;padding:10px 14px;border-left:4px solid var(--yc-ink);background:var(--yc-paper);border-radius:0 10px 10px 0;font-size:15.5px;line-height:1.5}',
    '.yc-rel{font-weight:800}',
    '.yc-e .yc-flip{display:inline-block;font:800 10.5px/1 var(--font-display,Archivo,sans-serif);letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--yc-acc);padding:3px 5px;border-radius:4px;vertical-align:middle}',
    '.yc-e.yc-keep{font:600 10.5px var(--font-body,Inter,sans-serif);color:var(--yc-mute);align-self:center}',
    '.yc-graph{margin:10px 18px 0;padding:12px 14px 14px;border:1.5px solid var(--yc-ink);border-radius:10px;background:#fff}',
    '.yc-graph.is-ok{border-color:var(--yc-ok);background:#f3faf5}.yc-graph.is-bad{border-color:var(--yc-bad)}',
    '.yc-graph>p{font-size:15px}',
    '.yc-nl{display:block;width:100%;height:auto;margin:6px 0 4px;overflow:visible}',
    '.yc-nl text{font:600 13px var(--font-mono,ui-monospace,Menlo,monospace);fill:var(--yc-mute)}.yc-nl text.b{font:800 15px var(--font-display,Archivo,sans-serif);fill:var(--yc-ink)}',
    '.yc-gctl{display:flex;flex-wrap:wrap;gap:8px 18px;align-items:center;margin-top:6px}',
    '.yc-gctl .grp{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
    '.yc-gctl .lbl{font:700 11.5px var(--font-display,Archivo,sans-serif);letter-spacing:.1em;text-transform:uppercase;color:var(--yc-mute);margin-right:2px}',
    '.yc-gb{font:700 14px var(--font-display,Archivo,sans-serif)!important;padding:7px 12px;border-radius:8px;border:1.5px solid var(--yc-ink);background:#fff;cursor:pointer;display:inline-flex;align-items:center;gap:6px}',
    '.yc-gb:hover:not(:disabled){background:var(--yc-paper)}.yc-gb.is-on{background:var(--yc-ink);color:var(--yc-paper)!important}.yc-gb.is-on:hover:not(:disabled){background:#333}.yc-gb:disabled{opacity:.45;cursor:not-allowed}',
    '.yc-gb .dot{display:inline-block;width:12px;height:12px;border-radius:50%;border:2.5px solid currentColor}.yc-gb .dot.f{background:currentColor}',
    '.yc-gcheck{margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}',
    '.yc-done .yc-nl{flex-basis:100%;max-width:520px;margin:2px 0 0}',
    '.yc-fig{margin:0 18px 12px;padding:6px 10px;border:1.5px solid var(--yc-line);border-radius:12px;background:#fff;display:flex;justify-content:center}',
    '.yc-figsvg{display:block;width:100%;max-width:440px;height:auto}',
    '.yc-figsvg .yc-fl{font:800 15px var(--font-display,Archivo,Inter,sans-serif);fill:var(--yc-ink);paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}.yc-figsvg .yc-fl.on{fill:var(--yc-acc)}',
    '.yc-setup .yc-opts{margin-top:10px}',
    '.yc-measure{margin:10px 18px 0;padding:12px 14px 14px;border:1.5px solid var(--yc-ink);border-radius:10px;background:#fff}',
    '.yc-measure>p{font-size:15px}.yc-mrow{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px}',
    '.yc-mrow label{display:inline-flex;align-items:center;gap:4px;font:800 20px var(--font-display,Archivo,sans-serif)}',
    '.yc-mrow input{width:7.5em;font:700 18px var(--font-display,Archivo,sans-serif);padding:8px 10px;border:1.5px solid var(--yc-ink);border-radius:8px;background:#fff;color:var(--yc-ink)}',
    '.yc-spot{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 18px 18px}',
    '.yc-spot .yc-note{margin:0;flex-basis:100%}',
    '.yc .yc-err{margin:12px 18px 18px;padding:10px 14px;border:1.5px dashed var(--yc-bad);border-radius:10px;color:var(--yc-bad);font-size:14.5px}',
    '.yc-freebar{display:flex;gap:8px;flex-wrap:wrap;padding:14px 18px 0}',
    '.yc-freebar input{flex:1;min-width:200px;font:600 17px var(--font-display,Archivo,sans-serif);padding:10px 12px;border:1.5px solid var(--yc-ink);border-radius:8px;background:#fff;color:var(--yc-ink)}',
    '.yc-ex{display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:8px 18px 0;font-size:13px;color:var(--yc-mute)}',
    '.yc-ex button{font:600 13px var(--font-body,Inter,sans-serif)!important;padding:4px 9px;border-radius:999px;border:1px solid var(--yc-line);background:#fff;cursor:pointer}.yc-ex button:hover{border-color:var(--yc-ink)}',
    '.yc .yc-blank{margin:0;padding:18px;color:var(--yc-mute);font-size:15px}',
    '.yc button:focus-visible{outline:3px solid var(--yc-glow);outline-offset:2px}.yc:focus{outline:none}',
    '@media (prefers-reduced-motion:reduce){.yc-caret{animation:none}.yc-key{transition:none}}',
    '@media print{.yc{box-shadow:none}.yc-pad,.yc-tools,.yc-preview,.yc-freebar,.yc-ex,.yc-nav,.yc-copy,.yc-entry,.yc-opts{display:none!important}.yc-work{grid-template-columns:1fr}}',
  ].join('\n');
  function injectCss() {
    if (document.getElementById('yabc-calc-css')) return;
    const s = document.createElement('style');
    s.id = 'yabc-calc-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── one calculator on the page ──────────────────────────────────── */
  function mount(el, opts) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) throw new Error('YABCCalc.mount needs an element');
    injectCss();
    const cfg = Object.assign({ mode: 'graded', enabled: true, locked: false, order: 0, id: 'calc-1' }, opts || {});
    const free = cfg.mode === 'free', graded = cfg.mode === 'graded';
    const block = cfg.source != null ? parseBlock(cfg.source) : {
      title: cfg.title || '', moves: cfg.moves || 'both', points: cfg.points || 2, slack: cfg.slack == null ? 1 : cfg.slack, hints: cfg.hints !== false, graph: cfg.graph !== false,
      problems: (cfg.problems || []).map((p) => (typeof p === 'string' ? parseBlock('1. ' + p).problems[0] : p)).filter(Boolean),
    };
    block.hasTriangle = block.problems.some((p) => p.kind === 'angles' && ANGLE_RELS[p.relation] === 'triangle');
    const EXAMPLES = cfg.examples || ['2x + 3 = 11', '7x - 4 = 3x + 12', 'x/4 + 2 = 9', '3(x + 4) = 21', '5 - 2x = 3x - 10', '2x + 5 = 2x + 9'];
    if (!block.title) block.title = free ? 'Step calculator' : 'Solve it step by step';
    const tapMoves = block.moves !== 'type', padShown = block.moves !== 'tap';

    const S = { idx: 0, sel: null, entry: blank(), msg: '', msgKind: '', armed: null, destroyed: false, problems: block.problems.map(makeProblem), freeText: '' };
    const cur = () => S.problems[S.idx] || null;
    function blank() { return { op: null, neg: false, num: '', den: null, x: false }; }

    function makeProblem(spec, i) {
      const P = { n: i + 1, spec: spec, v: 'x', steps: [], hints: 0, undos: 0, status: 'open', earned: 0, t0: null, par: 0, answer: null, check: null, pending: false, sp: { tries: 0, given: [] }, spot: null, error: null, blocked: [],
        slips: [], flipQ: null, reading: null, graphing: null, graph: null, final: null };
      try {
        if (!spec.eq) fail('No equation was given.');
        if (spec.kind === 'angles') {
          const A = angleSetup(spec);
          P.ang = A; P.v = A.v; P.orig = A.st; P.cur = clone(A.st);
          P.par = par(P.orig, P.v);
          P.setup = { given: [], done: false, revealed: false };
          return P;
        }
        const parsed = parseEquation(spec.eq);
        P.v = parsed.v; P.orig = parsed.st; P.cur = clone(parsed.st);
        if (spec.kind === 'solve') {
          if (!hasX(P.orig.L) && !hasX(P.orig.R)) fail('There is no ' + P.v + ' to solve for.');
          if (outcome(P.orig)) fail(P.v + ' is already alone — nothing to solve.');
          P.par = par(P.orig, P.v);
        } else {
          P.spot = { sel: [], tries: 0, given: [], correct: spotAnswer(P.orig, spec.spot), closed: false };
        }
      } catch (e) { P.error = e.message || String(e); P.status = 'broken'; }
      return P;
    }

    /* timing + logging */
    const secs = (P) => (P.t0 ? Math.round((Date.now() - P.t0) / 100) / 10 : 0);
    const log = (type, data) => { try { cfg.log && cfg.log(type, Object.assign({ calc: cfg.id }, data)); } catch (e) { /* not started */ } };
    const isMove = (s) => s.kind === 'op' || s.kind === 'combine' || s.kind === 'distribute';
    const movesOf = (P) => P.steps.filter((s) => isMove(s) && !s.undone).length;
    const live = () => cfg.enabled && !cfg.locked && !S.destroyed;
    /** waiting on a question (keep/flip, read it, graph it, what x vanishing means) — no moves until it is answered */
    const busy = (P) => Boolean(P.pending || P.flipQ || P.reading || P.graphing || P.measuring || (P.setup && !P.setup.done));
    /** past the moves: reading or graphing the answer — undo is off from here */
    const settled = (P) => Boolean(P.reading || P.graphing || P.measuring || (P.setup && !P.setup.done));
    /** a phone-width calculator gets a shorter number line with bigger labels */
    const narrow = () => (el.clientWidth || 600) < 520;

    /* ── scoring ── */
    function scoreOf(P) {
      const pts = P.spec.points;
      if (P.spec.kind === 'spot') { if (P.status !== 'right') return 0; return graded && P.spot.tries > 1 ? pts / 2 : pts; }
      if (P.status !== 'solved') return 0;
      if (!graded) return pts;
      return halfReasons(P).length ? pts / 2 : pts;
    }
    function halfReasons(P) {
      const r = [];
      if (P.hints) r.push('a hint was used');
      if (movesOf(P) > P.par + block.slack) r.push(movesOf(P) + ' moves — full points needs ' + (P.par + block.slack) + ' or fewer');
      if (P.sp.tries > 1) r.push('second try on what the leftover statement means');
      if (P.slips.some((s) => s.kind === 'flip')) r.push('wrong call on keeping or flipping the sign');
      if (P.slips.some((s) => s.kind === 'read')) r.push('misread the answer from ' + P.v + '’s side');
      if (P.graph && P.graph.missed) r.push('the graph was missed');
      else if (P.graph && P.graph.tries > 1) r.push('second try on the graph');
      if (P.setup && P.setup.revealed) r.push('the rule was shown after two wrong picks');
      else if (P.setup && P.setup.given.length > 1) r.push('wrong rule on the first pick');
      if (P.measure && P.measure.missed) r.push('the angle was missed');
      else if (P.measure && P.measure.tries > 1) r.push('second try on the angle');
      return r;
    }
    function totals() {
      let earned = 0, possible = 0, done = true;
      S.problems.forEach((P) => { if (P.status === 'broken') return; possible += P.spec.points; earned += P.earned; if (P.status === 'open') done = false; });
      return { earned: earned, possible: possible, done: done };
    }

    /* ── the report the lesson page (or an HTML lesson) keeps ── */
    function stepOut(s, v) {
      // read / graph / flip-slip notes go out as plain notes (with a tag), so any verify page can show them
      if (!isMove(s)) return s.kind === 'hint' || s.kind === 'note' ? { kind: s.kind, text: s.text, t: s.t } : { kind: 'note', tag: s.kind, text: s.text, t: s.t };
      const o = { kind: s.kind, say: s.say, from: [sideText(s.from.L, v), sideText(s.from.R, v)], to: [sideText(s.to.L, v), sideText(s.to.R, v)], via: s.via, t: s.t };
      if (isIneq(s.from)) { o.fromRel = relOf(s.from); o.rel = relOf(s.to); }
      if (s.kind === 'op') o.op = opText(s.op, s.val, s.isX, v);
      if (s.flip) o.flip = s.flip;
      if (s.at) o.at = s.at;
      if (s.undone) o.undone = true;
      return o;
    }
    function problemOut(P) {
      const o = { n: P.n, kind: P.spec.kind, eq: P.spec.eq, status: P.status, earned: P.earned, possible: P.spec.points };
      if (P.spec.ask) o.ask = P.spec.ask;
      if (P.error) { o.error = P.error; return o; }
      if (P.spec.kind === 'spot') { o.start = eqText(P.orig, P.v); o.spot = P.spec.spot; o.tries = P.spot.tries; o.picks = P.spot.given; o.answer = P.spot.correct.map((p) => labelOf(P, p)); return o; }
      if (P.spec.kind === 'angles') {
        o.relation = P.ang.rel; o.labels = P.ang.disp; o.setup = { given: P.setup.given.slice(), done: P.setup.done, revealed: P.setup.revealed };
        if (P.measure) o.measure = { asked: P.measure.asked, given: P.measure.given.slice(), answer: P.measure.answer, missed: P.measure.missed };
        if (!P.setup.done) { o.par = P.par; o.moves = 0; o.hints = P.hints; o.undos = P.undos; o.steps = P.steps.map((s) => stepOut(s, P.v)); return o; }
      }
      o.start = eqText(P.orig, P.v); o.startSides = [sideText(P.orig.L, P.v), sideText(P.orig.R, P.v)]; o.par = P.par; o.moves = movesOf(P); o.hints = P.hints; o.undos = P.undos;
      if (isIneq(P.orig)) o.startRel = relOf(P.orig);
      if (P.answer) o.answer = P.answer;
      if (P.check) o.check = P.check;
      if (P.sp.tries) o.special = P.sp.given;
      if (P.slips.length) o.slips = P.slips;
      if (P.final && P.final.read) o.read = P.final.read;
      if (P.graph) o.graph = { answer: graphWords(P.graph.answer), given: P.graph.given, tries: P.graph.tries, missed: Boolean(P.graph.missed), done: Boolean(P.graph.done) };
      if (P.blocked.length) o.blocked = P.blocked;
      o.steps = P.steps.map((s) => stepOut(s, P.v));
      return o;
    }
    function report() {
      const t = totals();
      const r = { id: cfg.id, order: cfg.order, kind: 'calc', title: block.title, earned: t.earned, possible: t.possible, done: t.done, work: { title: block.title, moves: block.moves, problems: S.problems.map(problemOut) } };
      try { cfg.onReport && cfg.onReport(r); } catch (e) { /* ignore */ }
      return r;
    }

    /* ── moves ── */
    function say(msg, kind) { S.msg = msg || ''; S.msgKind = kind || ''; }
    const scales = (step) => step.kind === 'op' && (step.op === '*' || step.op === '/');
    const opVerb = (step) => (step.op === '/' ? 'dividing' : 'multiplying');
    function doStep(P, step) {
      if (P.status !== 'open' || busy(P)) return;
      const from = clone(P.cur);
      let to, words;
      if (step.kind === 'op') { to = applyOp(from, step.op, step.val, step.isX, P.v); words = sayOp(step.op, step.val, step.isX, P.v); }
      else if (step.kind === 'combine') { to = applyCombine(from, step.s, step.only); words = 'combine like terms' + (step.s ? ' on the ' + sideName(step.s) : ''); }
      else { to = applyDistribute(from, step.s, step.i); words = 'distribute' + (step.m ? ' the ' + multWord(step.m) : ''); }
      // inequality, × or ÷: the move is legal (applyOp did not throw) — but first the student says keep or flip
      if (isIneq(from) && scales(step) && !step.flip) {
        P.flipQ = { step: step, given: [], t: secs(P) };
        S.sel = null; S.armed = null; say('');
        log('calc', { p: P.n, do: 'ask-flip', op: opText(step.op, step.val, step.isX, P.v) });
        report();
        return;
      }
      if (isIneq(from) && scales(step)) words += step.val.n < 0 ? ' · negative, so ' + relOf(from) + ' flips to ' + relOf(to) : ' · positive, so ' + relOf(from) + ' stays';
      const entry = { kind: step.kind, op: step.op, val: step.val, isX: step.isX, via: step.via || 'tap', at: step.at || null, say: words, from: from, to: to, t: secs(P), undone: false, flip: step.flip || null };
      P.steps.push(entry);
      P.cur = to;
      S.sel = null; S.armed = null;
      const o = outcome(to);
      say('');
      if (o && o.kind === 'solved') {
        if (o.flipped && isIneq(to)) P.reading = { value: o.value, rel: o.rel, order: P.n % 2, given: [] };
        else finishSolved(P, o.rel, o.value, o.flipped);
      } else if (o && o.kind === 'special') {
        P.pending = true; P.truth = o.truth;
      }
      log('calc', { p: P.n, do: step.kind, op: entry.kind === 'op' ? opText(step.op, step.val, step.isX, P.v) : undefined, via: entry.via, to: eqText(to, P.v) });
      report();
    }
    /** a whole number inside the answer, for the check line */
    function testPoint(rel, value) {
      const b = fnum(value);
      if (rel === '<' || rel === '≤') return F(isInt(value) ? value.n - 1 : Math.floor(b));
      return F(isInt(value) ? value.n + 1 : Math.ceil(b));
    }
    /** x is alone on the left: write the answer + check; inequalities go on to the graph */
    function finishSolved(P, rel, value, flipped) {
      if (P.spec.kind === 'angles') { angleStage(P, value, flipped); return; }
      P.answer = ansText(rel, value, P.v);
      const ro = relOf(P.orig);
      if (rel === '=') {
        const l = evalSide(P.orig.L, value), r = evalSide(P.orig.R, value);
        P.check = 'Check ' + P.answer + ' in ' + eqText(P.orig, P.v) + ': ' + ftext(l) + ' = ' + ftext(r) + (feq(l, r) ? ' ✓' : ' ✗');
      } else {
        const tp = testPoint(rel, value), l = evalSide(P.orig.L, tp), r = evalSide(P.orig.R, tp);
        P.check = 'Test ' + P.v + ' = ' + ftext(tp) + ' (it is in ' + P.answer + ') in ' + eqText(P.orig, P.v) + ': ' + ftext(l) + ' ' + ro + ' ' + ftext(r) + (holds(l, r, ro) ? ' ✓' : ' ✗');
      }
      P.final = Object.assign(P.final || {}, { rel: rel, value: value });
      if (rel !== '=' && block.graph) {
        P.graphing = true;
        P.graph = { answer: { circle: closedRel(rel) ? 'closed' : 'open', side: shadeOf(rel) }, circle: null, side: null, given: [], tries: 0, missed: false, done: false };
        say(P.answer + ' — now graph it.', 'ok');
        return;
      }
      P.status = 'solved';
      P.earned = scoreOf(P);
      say(flipped && rel === '=' ? ftext(value) + ' = ' + P.v + ' is the same as ' + P.answer + '.' : '', 'ok');
    }

    /* ── keep or flip? ── */
    function flipExplain(step, choice, rel) {
      const val = step.val, neg = val.n < 0, by = (step.op === '/' ? 'Divide' : 'Multiply') + ' both by ' + ftext(val);
      if (!neg) return 'Not this time. ' + ftext(val) + ' is positive. ' + (step.op === '/' ? 'Dividing' : 'Multiplying') + ' by a positive never flips the sign — not even when a side is negative or the answer will be negative. Only a negative multiplier or divisor flips it.';
      const a = step.op === '/' ? fabs(val) : ONE, b = step.op === '/' ? fmul(F(2), fabs(val)) : F(2);
      const f = step.op === '/' ? fdiv(ONE, val) : val, a2 = fmul(a, f), b2 = fmul(b, f);
      return 'Test it with numbers: ' + ftext(a) + ' < ' + ftext(b) + ' is true. ' + by + ': ' + ftext(a2) + ' and ' + ftext(b2) + '. Is ' + ftext(a2) + ' < ' + ftext(b2) + '? No — ' + ftext(a2) + ' > ' + ftext(b2) + '. A negative turns the order around, so the ' + rel + ' has to flip.';
    }
    function flipAnswer(P, choice) {
      const q = P.flipQ;
      if (!q || P.status !== 'open') return;
      const st = q.step, neg = st.val.n < 0, right = (choice === 'flip') === neg, rel = relOf(P.cur);
      if (q.given.indexOf(choice) >= 0) return;
      q.given.push(choice);
      log('calc', { p: P.n, do: 'flip', op: opText(st.op, st.val, st.isX, P.v), given: choice, right: right });
      if (right) {
        P.flipQ = null;
        doStep(P, Object.assign({}, st, { flip: { asked: rel, given: q.given.slice(), right: q.given.length === 1, flips: neg } }));
        if (!S.msg) say(q.given.length > 1 ? 'Right this time.' : neg ? 'Right — ' + opVerb(st) + ' by a negative flips it.' : 'Right — a positive keeps the sign.', 'ok');
        return;
      }
      P.slips.push({ kind: 'flip', op: opText(st.op, st.val, st.isX, P.v), given: choice, t: secs(P) });
      P.steps.push({ kind: 'slip', text: (choice === 'flip' ? 'flipped' : 'kept') + ' the ' + rel + ' when ' + opVerb(st) + ' by ' + ftext(st.val) + ' — ' + (neg ? 'a negative flips it' : 'a positive keeps it'), t: secs(P) });
      say(flipExplain(st, choice, rel), 'bad');
      report();
    }

    /* ── 6 < x → x > 6 ── */
    function readAnswer(P, rel) {
      const r = P.reading;
      if (!r || P.status !== 'open') return;
      const given = ansText(rel, r.value, P.v), right = rel === r.rel;
      if (r.given.indexOf(given) >= 0) return;
      r.given.push(given);
      log('calc', { p: P.n, do: 'read', given: given, right: right });
      if (right) {
        const from = eqText(P.cur, P.v);
        P.reading = null;
        P.final = { read: { from: from, given: r.given.slice(), right: r.given.length === 1 } };
        P.steps.push({ kind: 'read', text: 'read it from ' + P.v + '’s side: ' + from + ' means ' + given, t: secs(P) });
        finishSolved(P, r.rel, r.value, true);
      } else {
        const from = relOf(P.cur);
        P.slips.push({ kind: 'read', given: given, t: secs(P) });
        P.steps.push({ kind: 'slip', text: 'read ' + eqText(P.cur, P.v) + ' as ' + given, t: secs(P) });
        say('Not quite. Say ' + eqText(P.cur, P.v) + ' out loud: “' + ftext(r.value) + ' ' + REL_WORD[from] + ' ' + P.v + '.” So ' + P.v + ' ' + REL_WORD[r.rel] + ' ' + ftext(r.value) + '. Swap the sides and the sign turns around with them — its point stays aimed at the same number.', 'bad');
      }
      report();
    }

    /* ── graph it ── */
    function graphSet(P, key, val) {
      if (!P.graphing || !P.graph || P.graph.done) return;
      P.graph[key] = val; say('');
    }
    function graphCheck(P) {
      const g = P.graph;
      if (!P.graphing || !g || g.done || !g.circle || !g.side) return;
      const right = g.circle === g.answer.circle && g.side === g.answer.side;
      g.tries++; g.given.push(graphWords(g));
      log('calc', { p: P.n, do: 'graph', given: graphWords(g), right: right });
      const value = P.final.value, rel = P.final.rel;
      if (right || (graded && g.tries >= 2)) {
        if (!right) { g.missed = true; g.circle = g.answer.circle; g.side = g.answer.side; }
        g.done = true; P.graphing = false;
        P.steps.push({ kind: 'graph', text: 'graphed ' + P.answer + ': ' + graphWords(g.answer) + ' from ' + ftext(value) + (right ? (g.tries > 1 ? ' (second try)' : '') : ' (missed twice — shown)'), t: secs(P) });
        P.status = 'solved'; P.earned = scoreOf(P);
        say(right ? (g.tries > 1 ? 'Right on the second check.' : 'That is the graph of ' + P.answer + '.') : 'Not this time. This is the graph of ' + P.answer + ': ' + graphWords(g.answer) + '.', right ? 'ok' : 'bad');
      } else {
        const tp = testPoint(rel, value), parts = [];
        if (g.circle !== g.answer.circle) parts.push(closedRel(rel) ? rel + ' includes ' + ftext(value) + ' itself, so the circle is filled in (closed)' : rel + ' does not include ' + ftext(value) + ' itself, so the circle stays hollow (open)');
        if (g.side !== g.answer.side) parts.push('the numbers that work are on the ' + g.answer.side + ' — ' + ftext(tp) + ' works, and it sits to the ' + g.answer.side + ' of ' + ftext(value));
        say(graded ? 'Not yet. Check both parts: a closed circle only for ≤ or ≥ (the boundary counts), and shade the side where a test number works. One more check — for half credit.'
          : 'Not yet: ' + parts.join('; and ') + '.', 'bad');
      }
      report();
    }

    /* ── angles: pick the rule ── */
    function pickRule(P, rel) {
      const s = P.setup, A = P.ang;
      if (!s || s.done || P.status !== 'open' || !ANG[rel]) return;
      if (s.given.indexOf(ANG[rel].name) >= 0) return;
      if (!P.t0) P.t0 = Date.now();
      s.given.push(ANG[rel].name);
      const right = rel === A.rel;
      log('calc', { p: P.n, do: 'rule', given: ANG[rel].name, right: right });
      if (right || (graded && s.given.length >= 2)) {
        s.done = true; s.revealed = !right;
        say(right ? 'Right — ' + ANG[A.rel].rule + '. The calculator wrote the equation. Now solve it.'
          : 'Not this time. The marked angles are ' + ANG[A.rel].where + ', and ' + ANG[A.rel].rule + '. Here is the equation — solve it.', right ? 'ok' : 'bad');
        const o = outcome(P.cur);
        if (o && o.kind === 'solved') finishSolved(P, o.rel, o.value, o.flipped);
      } else {
        say('Not that one: the marked angles are not ' + ANG[rel].where + '. Look again at where they sit.' + (graded ? ' One more pick — after that the calculator shows you, for half credit.' : ''), 'bad');
      }
      report();
    }
    /** x is found: check the angles, then ask for the one the problem wants (unless that angle is just x) */
    function angleStage(P, xv, flipped) {
      const A = P.ang, v = P.v, vals = A.sides.map((sd) => evalSide(sd, xv)), k = A.find;
      const each = A.disp.map((d, i) => (A.plainX[i] ? '' : d + ' = ') + ftext(vals[i]) + '°');
      if (A.rel === 'vertical') P.check = 'Check ' + v + ' = ' + ftext(xv) + ': ' + each.join(' and ') + (feq(vals[0], vals[1]) ? ' — equal ✓' : ' ✗');
      else {
        const tot = vals.reduce((a, b) => fadd(a, b), ZERO);
        P.check = 'Check ' + v + ' = ' + ftext(xv) + ': ' + each.join(', ') + '; ' + vals.map((x) => ftext(x)).join(' + ') + ' = ' + ftext(tot) + (fnum(tot) === ANG[A.rel].total ? ' ✓' : ' ✗');
      }
      P.final = { value: xv };
      const ans = vals[k];
      if (A.plainX[k]) {
        P.measure = { k: k, asked: '#' + (k + 1) + ', marked ' + A.deg[k], answer: ftext(ans) + '°', value: ans, given: [], tries: 0, missed: false, done: true, auto: true };
        P.answer = v + ' = ' + ftext(xv) + '°';
        P.status = 'solved'; P.earned = scoreOf(P);
        say(flipped ? ftext(xv) + ' = ' + v + ' is the same as ' + v + ' = ' + ftext(xv) + '. The angle marked ' + v + '° is ' + ftext(xv) + '°.' : 'The angle marked ' + v + '° is ' + ftext(xv) + '°.', 'ok');
        return;
      }
      P.measuring = true;
      P.measure = { k: k, asked: '#' + (k + 1) + ', marked ' + A.deg[k], answer: ftext(ans) + '°', value: ans, given: [], tries: 0, missed: false, done: false, draft: '' };
      say((flipped ? ftext(xv) + ' = ' + v + ' means ' : '') + v + ' = ' + ftext(xv) + '. That is ' + v + ' — not the angle yet.', 'ok');
    }
    function readNumber(text) {
      const t = String(text || '').replace(/[°\s]/g, '').replace(/[−–—]/g, '-');
      let m;
      if ((m = /^(-?\d+)\/(\d+)$/.exec(t)) && Number(m[2]) !== 0) return F(Number(m[1]), Number(m[2]));
      if (/^-?(\d+\.?\d*|\.\d+)$/.test(t)) return t[0] === '-' ? fneg(decimal(t.slice(1))) : decimal(t);
      return null;
    }
    function measureCheck(P) {
      const M = P.measure;
      if (!P.measuring || !M || M.done) return;
      const g = readNumber(M.draft);
      if (!g) { say('Type the angle as a number, like 115.', 'bad'); return; }
      const right = feq(g, M.value) || Math.abs(fnum(g) - fnum(M.value)) < 0.01;
      M.tries++; M.given.push(ftext(g));
      log('calc', { p: P.n, do: 'angle', given: ftext(g), right: right });
      const A = P.ang, xv = P.final.value, v = P.v, lbl = A.disp[M.k];
      if (right || (graded && M.tries >= 2)) {
        if (!right) M.missed = true;
        M.done = true; P.measuring = false;
        P.steps.push({ kind: 'measure', text: 'angle marked ' + A.deg[M.k] + ': ' + lbl + ' at ' + v + ' = ' + ftext(xv) + ' is ' + M.answer + (right ? (M.tries > 1 ? ' (second try)' : '') : ' (missed — shown)'), t: secs(P) });
        P.answer = v + ' = ' + ftext(xv) + ', angle = ' + M.answer;
        P.status = 'solved'; P.earned = scoreOf(P);
        say(right ? (M.tries > 1 ? 'Right on the second try.' : 'Right — the angle is ' + M.answer + '.') : 'Not this time. ' + lbl + ' at ' + v + ' = ' + ftext(xv) + ' is ' + M.answer + '.', right ? 'ok' : 'bad');
      } else {
        const isX = feq(g, xv);
        say((isX ? 'That is ' + v + ', not the angle. ' : 'Not quite. ') + 'Plug ' + v + ' = ' + ftext(xv) + ' into ' + lbl + ' and work it out.' + (graded ? ' One more try — for half credit.' : ''), 'bad');
      }
      report();
    }

    function undo(P) {
      if (P.status !== 'open') return;
      if (P.flipQ) { P.flipQ = null; S.sel = null; say('Move cancelled.'); log('calc', { p: P.n, do: 'cancel' }); report(); return; }
      if (settled(P)) return;
      for (let i = P.steps.length - 1; i >= 0; i--) {
        const s = P.steps[i];
        if (isMove(s) && !s.undone) {
          s.undone = true; P.cur = clone(s.from); P.undos++; P.pending = false;
          S.sel = null; say('Undone. It stays on your tape, crossed out.');
          log('calc', { p: P.n, do: 'undo', to: eqText(P.cur, P.v) });
          report();
          return;
        }
      }
      say('Nothing to undo yet.');
    }
    function restart(P) {
      if (P.status !== 'open' || settled(P) || !P.steps.some((s) => isMove(s) && !s.undone)) return;
      P.steps.forEach((s) => { if (isMove(s)) s.undone = true; });
      P.steps.push({ kind: 'note', text: 'Started over', t: secs(P) });
      P.cur = clone(P.orig); P.pending = false; P.flipQ = null; P.undos++;
      S.sel = null; say('Back to the start. Your old steps stay on the tape, crossed out.');
      log('calc', { p: P.n, do: 'restart' });
      report();
    }
    function hintText(P, pl) {
      const v = P.v;
      if (P.setup && !P.setup.done) return 'Look at where the marked angles sit. They are ' + ANG[P.ang.rel].where + '.';
      if (P.measuring) return v + ' = ' + ftext(P.final.value) + '. The angle is marked ' + P.ang.deg[P.measure.k] + ', so put ' + ftext(P.final.value) + ' in for ' + v + ' in ' + P.ang.disp[P.measure.k] + ' and work it out.';
      if (P.flipQ) { const st = P.flipQ.step; return 'Look only at the number you are ' + opVerb(st) + ' by: ' + ftext(st.val) + '. ' + (st.val.n < 0 ? 'It is negative, and multiplying or dividing by a negative flips the sign.' : 'It is positive, and a positive never flips the sign.'); }
      if (P.reading) return 'Read it from ' + v + '’s side: ' + eqText(P.cur, v) + ' says the same thing as ' + ansText(P.reading.rel, P.reading.value, v) + '. The sign turns around when the sides swap.';
      if (P.graphing) { const a = P.graph.answer, rel = P.final.rel, val = ftext(P.final.value); return (a.circle === 'closed' ? 'Closed circle — ' + rel + ' includes ' + val + '.' : 'Open circle — ' + rel + ' does not include ' + val + '.') + ' Shade ' + a.side + ', where ' + ftext(testPoint(rel, P.final.value)) + ' and the other numbers that work are.'; }
      if (!pl) return P.pending ? v + ' is gone. Decide what the statement that is left means.' : v + ' is already alone.';
      const how = pl.kind === 'op' ? sayOp(pl.op, pl.val, pl.isX, v) : '';
      const sign = (c) => (isIneq(P.cur) ? (c.n < 0 ? ' It is negative, so the ' + relOf(P.cur) + ' will flip.' : ' It is positive, so the ' + relOf(P.cur) + ' stays.') : '');
      if (pl.why === 'distribute') return 'Open the parentheses: distribute the ' + multWord(pl.m) + (tapMoves ? ' (tap the ' + multWord(pl.m) + ', or press Distribute).' : ' (press Distribute).');
      if (pl.why === 'detach-group') return 'The parentheses are alone on the ' + sideName(pl.s) + '. Detach the ' + multWord(pl.m) + ': ' + how + '.' + sign(pl.m);
      if (pl.why === 'combine') return 'The ' + sideName(pl.s) + ' side has like terms that are not combined yet. Combine them first.';
      if (pl.why === 'move-x') return v + ' is on both sides. Move ' + termLabel({ t: 'x', c: pl.c }, v) + ' off the ' + sideName(pl.s) + ': ' + how + '.';
      if (pl.why === 'move-k') return 'Clear the ' + termLabel({ t: 'k', c: pl.c }, v) + ' away from the ' + v + '-term: ' + how + '.';
      return 'The ' + v + '-term is alone. Detach its coefficient ' + ftext(pl.c) + ': ' + how + '.' + sign(pl.c);
    }
    function hint(P) {
      if (P.status !== 'open' || !block.hints) return;
      if (graded && !P.hints && S.armed !== P.n) { S.armed = P.n; say('A hint caps this problem at half credit. Press Hint again to see it.', 'hint'); return; }
      S.armed = null;
      const text = hintText(P, busy(P) ? null : plan(P.cur));
      P.hints++;
      P.steps.push({ kind: 'hint', text: text, t: secs(P) });
      P.earned = scoreOf(P);
      say(text, 'hint');
      log('calc', { p: P.n, do: 'hint', text: text });
      report();
    }
    function classify(P, choice) {
      if (!P.pending || P.status !== 'open') return;
      const right = (choice === 'all') === P.truth;
      P.sp.tries++; P.sp.given.push(choice === 'all' ? 'every number' : 'no solution');
      log('calc', { p: P.n, do: 'classify', given: choice, right: right });
      const answer = P.truth ? 'every real number is a solution' : 'no solution';
      if (right) {
        P.status = 'solved'; P.pending = false; P.answer = answer;
        P.check = P.truth ? eqText(P.cur, P.v) + ' is always true.' : eqText(P.cur, P.v) + ' is never true.';
        P.earned = scoreOf(P);
        say('');
      } else if (graded && P.sp.tries >= 2) {
        P.status = 'wrong'; P.pending = false; P.answer = answer; P.earned = 0;
        say('');
      } else say('Not quite. Is ' + eqText(P.cur, P.v) + ' true, or false?' + (graded ? ' One more try — for half credit.' : ''), 'bad');
      report();
    }

    /* ── tap targets ── */
    function locate(P, path) {
      const parts = path.split('.');
      const s = parts[0], i = Number(parts[1]);
      const term = P.cur[s] && P.cur[s][i];
      if (!term) return null;
      if (parts[2] === 'i') return { s: s, i: i, term: term, inner: term.items[Number(parts[3])], part: parts[4] || null };
      return { s: s, i: i, term: term, part: parts[2] || null };
    }
    function labelOf(P, path) {
      const st = P.spec.kind === 'spot' ? P.orig : P.cur;
      const parts = path.split('.');
      const term = st[parts[0]] && st[parts[0]][Number(parts[1])];
      if (!term) return path;
      if (parts[2] === 'm') return multWord(term.m) + ' (multiplies the parentheses)';
      let t = term, rest = parts.slice(2);
      if (rest[0] === 'i') { t = term.items[Number(rest[1])]; rest = rest.slice(2); }
      if (rest[0] === 'c') return 'coefficient ' + ftext(t.c) + ' of ' + termLabel(t, P.v);
      if (rest[0] === 'v') return P.v + ' in ' + termLabel(t, P.v);
      return termLabel(t, P.v) + (parts[2] === 'i' ? ' (inside parentheses)' : '');
    }
    function detachOpt(c, s, v) {
      const lbl = 'Detach the ' + ftext(c) + ': ';
      if (isInt(c)) return { label: lbl + 'divide both sides by ' + ftext(c), step: { kind: 'op', op: '/', val: c, isX: false } };
      return { label: lbl + 'multiply both sides by ' + ftext(fdiv(ONE, c)), step: { kind: 'op', op: '*', val: fdiv(ONE, c), isX: false } };
    }
    function describe(P, path) {
      const hit = locate(P, path);
      if (!hit) return null;
      const v = P.v, where = sideName(hit.s), term = hit.term, out = { desc: '', opts: [], locked: false };
      if (hit.inner) {
        out.locked = true;
        out.desc = '<b>' + esc(termLabel(hit.inner, v)) + '</b> is locked inside the parentheses. It can’t move until you distribute the ' + esc(multWord(term.m)) + ' — or detach the ' + esc(multWord(term.m)) + '.';
        return out;
      }
      if (term.t === 'g') {
        out.desc = '<b>' + esc(multWord(term.m)) + '</b> multiplies everything inside (' + esc(sideText(term.items, v)) + ').';
        out.opts.push({ label: 'Distribute the ' + multWord(term.m), step: { kind: 'distribute', s: hit.s, i: hit.i, m: term.m } });
        if (tapMoves) { const d = detachOpt(term.m, hit.s, v); d.alt = true; out.opts.push(d); }
        else out.desc += ' To detach it instead, key in the operation that undoes multiplying by ' + esc(multWord(term.m)) + '.';
        return out;
      }
      const lbl = termLabel(term, v), side = P.cur[hit.s];
      const moveStep = { kind: 'op', op: term.c.n > 0 ? '-' : '+', val: term.t === 'x' ? fabs(term.c) : fabs(term.c), isX: term.t === 'x' };
      if (term.t === 'k') {
        out.desc = '<b>' + esc(lbl) + '</b> is a constant term on the ' + where + ' — ' + (term.c.n > 0 ? 'added' : 'subtracted') + '.';
        if (tapMoves) out.opts.push({ label: 'Move it: ' + sayOp(moveStep.op, moveStep.val, false, v), step: moveStep });
      } else {
        const hidden = isOne(fabs(term.c));
        out.desc = '<b>' + esc(lbl) + '</b> is ' + (/^[aefhilmnorsx]$/i.test(v) ? 'an ' : 'a ') + esc(v) + '-term on the ' + where + '. Its coefficient is <b>' + esc(ftext(term.c)) + '</b>' + (hidden ? ' (hidden — ' + esc((term.c.n < 0 ? MINUS : '') + v) + ' means ' + esc(ftext(term.c)) + esc(v) + ')' : '') + '.';
        if (tapMoves) {
          out.opts.push({ label: 'Move it: ' + sayOp(moveStep.op, moveStep.val, true, v), step: moveStep });
          if (!isOne(term.c)) { const d = detachOpt(term.c, hit.s, v); d.alt = true; out.opts.push(d); }
          if (!isOne(term.c) && side.length > 1) out.desc += ' Detaching works best once it is alone on its side.';
        }
      }
      if (!tapMoves) out.desc += ' To move it, key in the opposite operation below.';
      if (needsCombine(side, term.t)) out.opts.push({ label: 'Combine the ' + (term.t === 'x' ? v + '-terms' : 'constants') + ' on the ' + where, step: { kind: 'combine', s: hit.s, only: term.t }, alt: true });
      out.opts.forEach((o) => { o.step.at = lbl; o.step.via = 'tap'; });
      return out;
    }

    /* ── spot tasks ── */
    function spotAnswer(st, kind) {
      const out = [];
      SIDES.forEach((s) => st[s].forEach((t, i) => {
        const p = s + '.' + i;
        const visit = (tt, path, top) => {
          if (kind === 'constants' && tt.t === 'k') out.push(path);
          if (kind === 'x-terms' && tt.t === 'x') out.push(path);
          if (kind === 'coefficients' && tt.t === 'x') out.push(path + '.c');
          if (kind === 'movable' && top) out.push(path);
        };
        if (t.t === 'g') t.items.forEach((it, j) => visit(it, p + '.i.' + j, false));
        else visit(t, p, true);
      }));
      return out;
    }
    const SPOT_ASK = {
      constants: 'Tap every <b>constant term</b> — the plain numbers.',
      'x-terms': 'Tap every <b>{v}-term</b> — the terms with {v} in them.',
      coefficients: 'Tap every <b>coefficient</b> — the number multiplied onto {v}. Watch for hidden ones.',
      movable: 'Tap every term you could <b>move</b> right now.',
    };
    function spotCheck(P) {
      const sp = P.spot;
      if (sp.closed) return;
      const sel = new Set(sp.sel), cor = new Set(sp.correct);
      const right = sel.size === cor.size && sp.sel.every((p) => cor.has(p));
      sp.tries++; sp.given.push(sp.sel.map((p) => labelOf(P, p)));
      log('calc', { p: P.n, do: 'spot', picks: sp.sel.map((p) => labelOf(P, p)), right: right });
      if (right) { P.status = 'right'; sp.closed = true; P.earned = scoreOf(P); say(graded && sp.tries > 1 ? 'Right — half credit on the second check.' : 'Right.', 'ok'); }
      else if (graded && sp.tries >= 2) { P.status = 'wrong'; sp.closed = true; P.earned = 0; say('Not this time. Green is right, red should not be picked, dashed ones were missed.', 'bad'); }
      else {
        const wrong = sp.sel.filter((p) => !cor.has(p)).length, missed = sp.correct.filter((p) => !sel.has(p)).length;
        say('Not yet' + (graded ? '' : ' — ' + (wrong ? wrong + ' picked that should not be' : '') + (wrong && missed ? ', ' : '') + (missed ? missed + ' missed' : '')) + '. ' + (graded ? 'Look at each one again — one more check, for half the points.' : 'Try again.'), 'bad');
      }
      report();
    }

    /* ── keypad ── */
    function entryHtml(P) {
      const e = S.entry;
      if (!e.op && !e.num && !e.x && !e.neg) return '<span>' + (tapMoves ? 'tap a term — or key in a move' : 'key in a move, e.g. − 3') + '</span><i class="yc-caret"></i>';
      const val = (e.neg ? MINUS : '') + esc(e.num) + (e.den != null ? '/' + esc(e.den) : '') + (e.x ? '<span class="yc-v">' + esc(P.v) + '</span>' : '');
      return '<span>both sides:</span><b>' + (e.op ? opSym[e.op] + ' ' : '<span style="opacity:.5">?</span> ') + val + '</b><i class="yc-caret"></i>';
    }
    function entryStep(P) {
      const e = S.entry;
      if (!e.op) fail('Pick an operation first: +, −, × or ÷.');
      if (!e.num && !e.x) fail('Type the number to use.');
      if (e.den === '') fail('Finish the fraction — type the bottom number.');
      if (e.den != null && Number(e.den) === 0) fail('A fraction can’t have 0 on the bottom.');
      let val = e.num ? F(parseInt(e.num, 10), e.den ? parseInt(e.den, 10) : 1) : ONE;
      if (e.neg) val = fneg(val);
      const st = { kind: 'op', op: e.op, val: val, isX: e.x, via: 'keys' };
      if (S.sel) { const hit = locate(P, S.sel); if (hit) st.at = hit.inner ? termLabel(hit.inner, P.v) : hit.term.t === 'g' ? multWord(hit.term.m) : termLabel(hit.term, P.v); }
      return st;
    }
    function press(k) {
      const P = cur();
      if (!P || P.status !== 'open' || busy(P) || P.spec.kind === 'spot' || !live()) return;
      const e = S.entry;
      say('');
      if (k === '+' || k === '-' || k === '*' || k === '/') e.op = k;
      else if (/^\d$/.test(k)) {
        if (e.x) { say('Numbers go before ' + P.v + '. Press ⌫ to take the ' + P.v + ' off.', 'bad'); return; }
        if (e.den != null) { if (e.den.length < 4) e.den += k; }
        else if (e.num.length < 5) e.num = e.num === '0' ? k : e.num + k;
      } else if (k === 'x') {
        if (e.den === '') { say('Finish the fraction first.', 'bad'); return; }
        e.x = !e.x;
      } else if (k === 'frac') {
        if (!e.num || e.den != null || e.x) { say(e.den != null ? 'Already a fraction.' : 'Type the top number first, then the fraction bar.', 'bad'); return; }
        e.den = '';
      } else if (k === 'neg') e.neg = !e.neg;
      else if (k === 'back') {
        if (e.x) e.x = false;
        else if (e.den != null) { if (e.den) e.den = e.den.slice(0, -1); else e.den = null; }
        else if (e.num) e.num = e.num.slice(0, -1);
        else if (e.neg) e.neg = false;
        else e.op = null;
      } else if (k === 'clear') S.entry = blank();
      else if (k === 'go') {
        try { doStep(P, entryStep(P)); S.entry = blank(); }
        catch (err) {
          if (!(err instanceof CalcError)) throw err;
          say(err.message, 'bad');
          P.blocked.push({ t: secs(P), why: err.message });
          log('calc', { p: P.n, do: 'blocked', why: err.message });
        }
      }
    }

    /* ── view ── */
    function view() {
      const P = cur();
      const t = totals(), off = !live();
      let h = '<section class="yc yc-' + cfg.mode + (off ? ' is-off' : '') + '" tabindex="-1" aria-label="' + esc(block.title) + '">';
      h += '<header class="yc-head"><h3><span class="yc-kind">' + (graded ? 'Assigned work' : free ? 'Calculator' : 'Practice') + '</span>' + esc(block.title) + '</h3>';
      if (graded) h += '<span class="yc-score">' + fmtPts(t.earned) + ' / ' + fmtPts(t.possible) + ' pts</span>';
      else if (!free && S.problems.length) h += '<span class="yc-score">' + S.problems.filter((p) => p.status === 'solved' || p.status === 'right').length + ' / ' + S.problems.length + ' done</span>';
      h += '</header>';
      if (graded && !cfg.enabled && !cfg.locked) h += '<p class="yc-gate">Type your name at the top of the lesson to start — then this work unlocks.</p>';
      if (cfg.locked) h += '<p class="yc-gate">Sealed — this work is in your result file.</p>';
      if (free) {
        h += '<div class="yc-freebar"><input type="text" data-fid="free-in" class="yc-free-in" placeholder="' + esc(cfg.placeholder || 'Type an equation, like 3x + 5 = 20') + '" value="' + esc(S.freeText) + '" aria-label="Equation" autocomplete="off" spellcheck="false"' + (off ? ' disabled' : '') + ' /><button type="button" class="yc-opt" data-act="free-go" data-fid="free-go"' + (off ? ' disabled' : '') + '>Start solving</button></div>';
        h += '<div class="yc-ex"><span>Try:</span>' + EXAMPLES.map((q) => '<button type="button" data-ex="' + esc(q) + '"' + (off ? ' disabled' : '') + '>' + esc(q.replace(/-/g, MINUS).replace(/<=/g, '≤').replace(/>=/g, '≥')) + '</button>').join('') + '</div>';
      }
      if (S.problems.length > 1) {
        h += '<nav class="yc-nav" aria-label="Problems"><span class="yc-lbl">Problems</span>';
        S.problems.forEach((Q, i) => {
          const st = Q.status === 'solved' || Q.status === 'right' ? (graded && Q.earned < Q.spec.points ? 'half' : Q.status) : Q.status;
          h += '<button type="button" class="yc-pn st-' + st + (i === S.idx ? ' is-cur' : '') + '" data-go="' + i + '" data-fid="pn' + i + '" aria-label="Problem ' + (i + 1) + ', ' + Q.status + '"' + (i === S.idx ? ' aria-current="true"' : '') + '>' + (i + 1) + '</button>';
        });
        h += '</nav>';
      }
      if (!P) return h + (free ? '<p class="yc-blank">' + esc(cfg.blank || 'Type any linear equation above — or pick one to try. You make the moves; the calculator does the arithmetic and writes down your work.') + '</p>' : '<p class="yc-blank">No problems in this block.</p>') + '</section>';
      if (!P.t0 && live()) P.t0 = Date.now();
      h += problemView(P, off);
      return h + '</section>';
    }
    const fmtPts = (n) => (Math.round(n * 10) / 10).toString();

    function problemView(P, off) {
      const v = P.v;
      const ineq = !P.error && isIneq(P.orig);
      let h = '<div class="yc-task"><div class="yc-task-text"><b>' + (free ? 'Solve' : 'Problem ' + P.n) + '</b>';
      if (P.spec.kind === 'spot') h += SPOT_ASK[P.spec.spot].replace(/\{v\}/g, esc(v));
      else if (P.spec.kind === 'angles') h += 'Read the figure and pick the rule. Then solve for <i>' + esc(v) + '</i> and find the angle.';
      else h += 'Get <i>' + esc(v) + '</i> alone' + (ineq && block.graph ? ', then graph it' : '') + '. ' + (tapMoves && padShown ? 'Tap a term or key in a move.' : tapMoves ? 'Tap the terms to make your moves.' : 'Key in each move.');
      h += '</div><div class="yc-pills">';
      if (P.spec.kind !== 'spot' && !P.error) h += '<span class="yc-pill" title="The fewest moves the textbook route takes">Par ' + P.par + '</span>';
      if (graded) h += '<span class="yc-pill">' + fmtPts(P.spec.points) + ' pt' + (P.spec.points === 1 ? '' : 's') + '</span>';
      h += '</div></div>';
      if (P.spec.ask) h += '<p class="yc-ask">' + esc(prettyMinus(P.spec.ask)) + '</p>';
      if (P.error) return h + '<p class="yc-err">Could not load “' + esc(P.spec.eq) + '”: ' + esc(P.error) + '</p>';

      const open = P.status === 'open';
      if (P.spec.kind === 'spot') {
        const sp = P.spot, marks = {};
        if (sp.closed) {
          const cor = new Set(sp.correct);
          sp.correct.forEach((p) => { marks[p] = sp.sel.indexOf(p) >= 0 ? 'ok' : 'miss'; });
          sp.sel.forEach((p) => { if (!cor.has(p)) marks[p] = 'bad'; });
        } else sp.sel.forEach((p) => { marks[p] = 'on'; });
        const ctx = { v: v, gran: P.spec.spot === 'coefficients' ? 'parts' : 'term', live: true, sel: null, marks: marks, ghost: P.spec.spot === 'coefficients', off: off || sp.closed };
        h += '<div class="yc-screen"><div class="yc-eqn">' + sideHtml(P.orig.L, 'L', ctx) + '<span class="yc-eqs">' + esc(relOf(P.orig)) + '</span>' + sideHtml(P.orig.R, 'R', ctx) + '</div></div>';
        h += '<p class="yc-msg ' + S.msgKind + '" aria-live="polite">' + esc(S.msg) + '</p>';
        h += '<div class="yc-spot">';
        if (!sp.closed) h += '<button type="button" class="yc-opt" data-act="spot-check" data-fid="spot-check"' + (off || !open ? ' disabled' : '') + '>' + (sp.tries ? 'Check again' : 'Check') + '</button><span class="yc-pill">' + sp.sel.length + ' picked</span>';
        else h += '<span class="yc-pill">' + (P.status === 'right' ? '✓ ' : '') + (graded ? fmtPts(P.earned) + ' / ' + fmtPts(P.spec.points) + ' pts' : P.status === 'right' ? 'Done' : 'Closed') + '</span>' + nextBtn(off);
        if (sp.closed && P.spec.note) h += '<p class="yc-note">' + esc(P.spec.note) + '</p>';
        h += '</div>';
        return h;
      }

      if (P.spec.kind === 'angles') {
        const hiA = P.measuring || (P.measure && !P.measure.auto) ? P.measure.k : -1;
        h += '<div class="yc-fig">' + figHtml(P.ang, hiA, open ? 'acc' : 'ok') + '</div>';
        if (!P.setup.done) {
          const s = P.setup, rels = ['vertical', 'linear', 'complementary', 'around'].concat(block.hasTriangle ? ['triangle'] : []);
          h += '<p class="yc-msg ' + S.msgKind + '" aria-live="polite">' + esc(S.msg) + '</p>';
          h += '<div class="yc-special yc-setup"><p><b>How are the marked angles related?</b> Pick the rule. The calculator writes the equation from your pick.</p><div class="yc-opts">'
            + rels.map((r) => '<button type="button" class="yc-opt' + (s.given.indexOf(ANG[r].name) >= 0 ? ' alt' : '') + '" data-rule="' + r + '" data-fid="rule-' + r + '"' + (off || s.given.indexOf(ANG[r].name) >= 0 ? ' disabled' : '') + '>' + esc(ANG[r].pick) + '</button>').join('')
            + '</div></div>';
          if (block.hints) h += '<div class="yc-tools" role="group" aria-label="Tools"><button type="button" class="yc-tool' + (S.armed === P.n ? ' is-armed' : '') + '" data-act="hint" data-fid="hint"' + (off ? ' disabled' : '') + '>' + (S.armed === P.n ? 'Show hint (half credit)' : 'Hint') + '</button></div>';
          return h + '<div style="height:18px"></div>';
        }
      }
      const ctx = { v: v, gran: 'term', live: open && !busy(P), sel: S.sel, off: off };
      h += '<div class="yc-screen"><div class="yc-eqn">' + sideHtml(P.cur.L, 'L', ctx) + '<span class="yc-eqs">' + esc(relOf(P.cur)) + '</span>' + sideHtml(P.cur.R, 'R', ctx) + '</div>';
      if (padShown && open && !busy(P)) h += '<div class="yc-entry" aria-live="polite">' + entryHtml(P) + '</div>';
      h += '</div>';
      h += '<p class="yc-msg ' + S.msgKind + '" aria-live="polite">' + esc(S.msg) + '</p>';

      if (!open) h += doneHtml(P, off);
      else if (P.flipQ) {
        const st = P.flipQ.step, rel = relOf(P.cur), g = P.flipQ.given, d = (c) => (off || g.indexOf(c) >= 0 ? ' disabled' : '');
        h += '<div class="yc-special is-flip"><p>You are about to <b>' + esc(sayOp(st.op, st.val, st.isX, v)) + '</b>. What happens to the <b>' + esc(rel) + '</b>?</p><div class="yc-opts">'
          + '<button type="button" class="yc-opt" data-act="flip-keep" data-fid="flip-keep"' + d('keep') + '>Keep it: ' + esc(rel) + '</button>'
          + '<button type="button" class="yc-opt" data-act="flip-flip" data-fid="flip-flip"' + d('flip') + '>Flip it: ' + esc(FLIP[rel]) + '</button>'
          + '<button type="button" class="yc-opt alt" data-act="flip-cancel" data-fid="flip-cancel"' + (off ? ' disabled' : '') + '>Cancel the move</button></div>'
          + '<p class="yc-sub">Adding and subtracting never change the sign. Multiplying or dividing might — you decide.</p></div>';
      } else if (P.reading) {
        const r = P.reading, a = [r.rel, FLIP[r.rel]];
        if (r.order) a.reverse();
        h += '<div class="yc-special"><p><b>' + esc(v) + ' is alone</b> — but on the right: <b>' + esc(eqText(P.cur, v)) + '</b>. Read it from ' + esc(v) + '’s side. Which one says the same thing?</p><div class="yc-opts">'
          + a.map((rel, i) => { const t = ansText(rel, r.value, v); return '<button type="button" class="yc-opt" data-read="' + esc(rel) + '" data-fid="read' + i + '"' + (off || r.given.indexOf(t) >= 0 ? ' disabled' : '') + '>' + esc(t) + '</button>'; }).join('')
          + '</div></div>';
      } else if (P.graphing) {
        h += graphHtml(P, off);
      } else if (P.measuring) {
        const M = P.measure;
        h += '<div class="yc-measure"><p><b>' + esc(v) + ' = ' + esc(ftext(P.final.value)) + '.</b> Now find the angle: what is the measure of the angle marked <b>' + esc(P.ang.deg[M.k]) + '</b>?</p>'
          + '<div class="yc-mrow"><label><input type="text" inputmode="decimal" class="yc-mi" data-fid="measure-in" value="' + esc(M.draft) + '" aria-label="Angle measure in degrees" autocomplete="off" spellcheck="false"' + (off ? ' disabled' : '') + ' />°</label>'
          + '<button type="button" class="yc-opt" data-act="m-check" data-fid="m-check"' + (off ? ' disabled' : '') + '>' + (M.tries ? 'Check again' : 'Check') + '</button>'
          + (graded && M.tries ? '<span class="yc-pill">Last try — half credit</span>' : '') + '</div></div>';
      } else if (P.pending) {
        h += '<div class="yc-special"><p><b>' + esc(v) + ' is gone.</b> You are left with <b>' + esc(eqText(P.cur, v)) + '</b>. What does that mean?</p><div class="yc-opts">'
          + '<button type="button" class="yc-opt" data-act="sp-none" data-fid="sp-none"' + (off ? ' disabled' : '') + '>No number works — no solution</button>'
          + '<button type="button" class="yc-opt" data-act="sp-all" data-fid="sp-all"' + (off ? ' disabled' : '') + '>Every number works</button></div></div>';
      } else {
        const d = S.sel ? describe(P, S.sel) : null;
        if (d) {
          h += '<div class="yc-preview' + (d.locked ? ' is-locked' : '') + '"><p>' + d.desc + '</p>';
          if (d.opts.length) h += '<div class="yc-opts">' + d.opts.map((o, i) => '<button type="button" class="yc-opt' + (o.alt ? ' alt' : '') + '" data-opt="' + i + '" data-fid="opt' + i + '"' + (off ? ' disabled' : '') + '>' + esc(o.label) + '</button>').join('') + '</div>';
          h += '</div>';
        } else {
          h += '<div class="yc-preview is-idle"><p>' + (tapMoves ? 'Tap any term to see what it is and what you can do with it. <b>Terms move. Coefficients detach.</b>' : 'Tap any term to see what it is. Then key in the move and press <b>Do it to both sides</b>.') + '</p></div>';
        }
      }

      if (open) {
        const moves = P.steps.some((s) => isMove(s) && !s.undone), b = busy(P), done = settled(P);
        h += '<div class="yc-tools" role="group" aria-label="Tools">'
          + '<button type="button" class="yc-tool" data-act="combine" data-fid="combine"' + (off || b || !(needsCombine(P.cur.L) || needsCombine(P.cur.R)) ? ' disabled' : '') + '>Combine like terms</button>'
          + '<button type="button" class="yc-tool" data-act="distribute" data-fid="distribute"' + (off || b || !hasGroup(P.cur) ? ' disabled' : '') + '>Distribute</button>'
          + '<button type="button" class="yc-tool" data-act="undo" data-fid="undo"' + (off || done || !(moves || P.flipQ) ? ' disabled' : '') + '>↩ Undo</button>'
          + '<button type="button" class="yc-tool" data-act="restart" data-fid="restart"' + (off || done || !moves ? ' disabled' : '') + '>Start over</button>'
          + (block.hints ? '<button type="button" class="yc-tool' + (S.armed === P.n ? ' is-armed' : '') + '" data-act="hint" data-fid="hint"' + (off ? ' disabled' : '') + '>' + (S.armed === P.n ? 'Show hint (half credit)' : 'Hint') + '</button>' : '')
          + '</div>';
      }
      const pad = padShown && open;
      h += '<div class="yc-work' + (pad ? '' : ' no-pad') + '">' + (pad ? padHtml(P, off || busy(P)) : '') + tapeHtml(P) + '</div>';
      return h;
    }
    function graphHtml(P, off) {
      const g = P.graph, fin = P.final, d = off ? ' disabled' : '';
      const on = (k, val) => (g[k] === val ? ' is-on' : '');
      let h = '<div class="yc-graph"><p><b>Graph ' + esc(P.answer) + '.</b> Pick the circle, then the side to shade.</p>';
      h += nlHtml(fin.value, g.circle, g.side, 'acc', 'Your graph: ' + graphWords(g), narrow());
      h += '<div class="yc-gctl"><div class="grp" role="group" aria-label="Circle"><span class="lbl">Circle</span>'
        + '<button type="button" class="yc-gb' + on('circle', 'open') + '" data-act="g-open" data-fid="g-open" aria-pressed="' + (g.circle === 'open') + '"' + d + '><span class="dot"></span>Open</button>'
        + '<button type="button" class="yc-gb' + on('circle', 'closed') + '" data-act="g-closed" data-fid="g-closed" aria-pressed="' + (g.circle === 'closed') + '"' + d + '><span class="dot f"></span>Closed</button></div>'
        + '<div class="grp" role="group" aria-label="Shade"><span class="lbl">Shade</span>'
        + '<button type="button" class="yc-gb' + on('side', 'left') + '" data-act="g-left" data-fid="g-left" aria-pressed="' + (g.side === 'left') + '"' + d + '>← Left</button>'
        + '<button type="button" class="yc-gb' + on('side', 'right') + '" data-act="g-right" data-fid="g-right" aria-pressed="' + (g.side === 'right') + '"' + d + '>Right →</button></div></div>';
      h += '<div class="yc-gcheck"><button type="button" class="yc-opt" data-act="g-check" data-fid="g-check"' + (off || !g.circle || !g.side ? ' disabled' : '') + '>' + (g.tries ? 'Check again' : 'Check my graph') + '</button>'
        + (graded && g.tries ? '<span class="yc-pill">Last check — half credit</span>' : '') + '</div>';
      return h + '</div>';
    }
    function nextBtn(off) {
      const nxt = S.problems.findIndex((q, i) => i > S.idx && q.status === 'open');
      const any = nxt >= 0 ? nxt : S.problems.findIndex((q) => q.status === 'open');
      return any >= 0 && any !== S.idx ? '<span class="grow"></span><button type="button" class="yc-opt" data-go="' + any + '" data-fid="next"' + (off ? ' disabled' : '') + '>Problem ' + (any + 1) + ' →</button>' : '';
    }
    function doneHtml(P, off) {
      const ok = P.status === 'solved', half = ok && graded && P.earned < P.spec.points;
      let h = '<div class="yc-done' + (!ok ? ' is-wrong' : half ? ' is-half' : '') + '"><strong>' + (ok && !P.sp.tries ? 'Solved: ' : ok ? 'Right: ' : 'Answer: ') + esc(P.answer) + '</strong>';
      h += '<span>' + movesOf(P) + ' move' + (movesOf(P) === 1 ? '' : 's') + ' · par ' + P.par + '</span>';
      if (graded) h += '<span>' + fmtPts(P.earned) + ' / ' + fmtPts(P.spec.points) + ' pts</span>';
      h += nextBtn(off);
      if (P.graph && P.graph.done) h += nlHtml(P.final.value, P.graph.answer.circle, P.graph.answer.side, P.graph.missed ? 'bad' : 'ok', 'Graph of ' + P.answer, narrow());
      if (half) h += '<span class="why">Half credit: ' + esc(halfReasons(P).join('; ')) + '.</span>';
      if (P.spec.note) h += '<span class="why">' + esc(P.spec.note) + '</span>';
      return h + '</div>';
    }
    function padHtml(P, off) {
      const e = S.entry, d = off ? ' disabled' : '';
      const k = (key, label, cls, aria) => '<button type="button" class="yc-key ' + (cls || '') + '" data-key="' + key + '" data-fid="k' + key + '"' + (aria ? ' aria-label="' + aria + '"' : '') + d + '>' + label + '</button>';
      const op = (key, label, aria) => k(key, label, 'op' + (e.op === key ? ' is-on' : ''), aria);
      return '<div class="yc-pad" role="group" aria-label="Keypad">'
        + op('+', '+', 'add') + op('-', MINUS, 'subtract') + op('*', '×', 'multiply') + op('/', '÷', 'divide')
        + k('7', '7') + k('8', '8') + k('9', '9') + k('x', '<span class="yc-v">' + esc(P.v) + '</span>', 'x' + (e.x ? ' is-on' : ''), P.v)
        + k('4', '4') + k('5', '5') + k('6', '6') + k('frac', '<span class="yc-fr"><span>a</span><span>b</span></span>', 'fn', 'fraction bar')
        + k('1', '1') + k('2', '2') + k('3', '3') + k('neg', '(' + MINUS + ')', 'fn', 'make it negative')
        + k('0', '0', 'wide') + k('back', '⌫', 'fn', 'backspace') + k('clear', 'C', 'fn', 'clear')
        + k('go', 'Do it to both sides', 'go')
        + '</div>';
    }
    function rowHtml(st, v, cls) {
      const c = cls ? ' ' + cls : '';
      const ctx = { v: v, gran: 'term', live: false };
      return '<div class="yc-l' + c + '">' + sideHtml(st.L, 'L', ctx) + '</div><div class="yc-e' + c + '">' + esc(relOf(st)) + '</div><div class="yc-r' + c + '">' + sideHtml(st.R, 'R', ctx) + '</div>';
    }
    function tapeHtml(P) {
      const v = P.v;
      let h = '<div class="yc-tape"><div class="yc-tape-head"><span>Your work</span><span>' + movesOf(P) + ' move' + (movesOf(P) === 1 ? '' : 's') + '</span><span class="grow"></span>'
        + (P.steps.length ? '<button type="button" class="yc-copy" data-act="copy" data-fid="copy">Copy</button>' : '') + '</div><div class="yc-rows">';
      if (P.spec.kind === 'angles' && P.setup) {
        P.setup.given.forEach((g, i) => { const last = i === P.setup.given.length - 1, ok = last && P.setup.done && !P.setup.revealed; h += '<div class="yc-note ' + (ok ? 'good' : 'slip') + '">' + (ok ? '✓ ' : '✗ ') + 'picked: ' + esc(g) + '</div>'; });
        if (P.setup.done) h += '<div class="yc-note' + (P.setup.revealed ? '' : ' good') + '">' + esc((P.setup.revealed ? 'Shown: ' : '') + ANG[P.ang.rel].rule + ', so ' + P.ang.write.replace(/-/g, MINUS)) + '</div>';
      }
      h += rowHtml(P.orig, v, '');
      let n = 0, restore = null;
      const flush = () => { if (restore) { h += '<div class="yc-note back">↩ back to</div>' + rowHtml(restore, v, ''); restore = null; } };
      const lastLive = (() => { for (let i = P.steps.length - 1; i >= 0; i--) if (isMove(P.steps[i]) && !P.steps[i].undone) return i; return -1; })();
      P.steps.forEach((s, i) => {
        if (!isMove(s)) { const good = s.kind === 'read' || s.kind === 'graph' || s.kind === 'measure'; flush(); h += '<div class="yc-note' + (s.kind === 'hint' ? ' hint' : s.kind === 'slip' ? ' slip' : good ? ' good' : '') + '">' + (s.kind === 'hint' ? 'Hint: ' : s.kind === 'slip' ? '✗ ' : good ? '✓ ' : '') + esc(s.text) + '</div>'; return; }
        if (!s.undone) { if (restore) flush(); n++; }
        const u = s.undone ? ' is-undone' : '';
        h += '<div class="yc-say' + u + '"><b>' + (s.undone ? '×' : n) + '</b><span>' + esc(s.say) + (s.undone ? ' — undone' : '') + '</span>' + (s.at ? '<i>· ' + (s.via === 'keys' ? 'keyed, with ' : 'tapped ') + esc(s.at) + '</i>' : s.via === 'keys' ? '<i>· keyed</i>' : '') + '</div>';
        if (s.kind === 'op') { const o = opHtml(s.op, s.val, s.isX, v); h += '<div class="yc-l yc-op' + u + '">' + o + '</div><div class="yc-e' + u + '">' + (s.flip && s.flip.flips ? '<span class="yc-flip" title="The sign flips">flip</span>' : '') + '</div><div class="yc-r yc-op' + u + '">' + o + '</div>'; }
        const win = !s.undone && i === lastLive && P.status === 'solved' && !P.sp.tries;
        h += rowHtml(s.to, v, (win ? 'yc-win' : '') + u);
        if (s.undone) restore = s.from;
      });
      if (restore) flush();
      if (!P.steps.length) h += '<p class="yc-empty">Your moves will be written here, step by step.</p>';
      if (P.check && P.status === 'solved') h += '<p class="yc-check">' + esc(P.check) + '</p>';
      else if (P.status === 'wrong' && P.answer) h += '<p class="yc-check" style="color:var(--yc-bad)">' + esc(eqText(P.cur, v)) + ' → ' + esc(P.answer) + '</p>';
      return h + '</div></div>';
    }

    /* plain-text copy of the work */
    function workText(P) {
      const v = P.v, lines = P.spec.kind === 'angles' ? [ANG[P.ang.rel].name + ': ' + P.ang.deg.join(', '), 'Rule: ' + ANG[P.ang.rel].rule + ', so ' + P.ang.write, '  ' + eqText(P.orig, v)] : ['Solve: ' + eqText(P.orig, v), '  ' + eqText(P.orig, v)];
      let n = 0;
      P.steps.forEach((s) => {
        if (!isMove(s)) { lines.push('  [' + (s.kind === 'hint' ? 'hint: ' : '') + s.text + ']'); return; }
        const tag = s.undone ? '(undone) ' : ++n + '. ';
        lines.push('     ' + tag + s.say + (s.kind === 'op' ? '   ' + opText(s.op, s.val, s.isX, v) + ' | ' + opText(s.op, s.val, s.isX, v) : ''));
        lines.push('  ' + eqText(s.to, v) + (s.undone ? '   (undone)' : ''));
      });
      if (P.answer) lines.push('Answer: ' + P.answer);
      if (P.check) lines.push(P.check);
      return lines.join('\n');
    }
    async function copyWork(P) {
      const text = workText(P);
      try { await navigator.clipboard.writeText(text); say('Copied your work — paste it anywhere.', 'ok'); }
      catch (e) {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { /* no */ }
        ta.remove(); say(ok ? 'Copied your work.' : 'Copy was blocked — select the tape and copy it by hand.', ok ? 'ok' : 'bad');
      }
      render();
    }

    function freeLoad(text) {
      const t = String(text || '').trim();
      S.freeText = t;
      if (!t) { say('Type an equation first.', 'bad'); return; }
      const P = makeProblem({ kind: 'solve', eq: t, points: 0, note: '' }, 0);
      if (P.error) { say(P.error, 'bad'); return; }
      S.problems = [P]; S.idx = 0; S.sel = null; S.entry = blank(); say(''); S.focusRoot = true;
      log('calc', { do: 'free', eq: t });
    }

    /* ── render + events ── */
    function render() {
      if (S.destroyed) return;
      const a = document.activeElement;
      const fid = a && el.contains(a) ? a.getAttribute('data-fid') : null;
      const hadRoot = a && a.classList && a.classList.contains('yc') && el.contains(a);
      const inputSel = a && a.tagName === 'INPUT' && el.contains(a) ? [a.selectionStart, a.selectionEnd] : null;
      el.innerHTML = view();
      if (S.focusRoot) { S.focusRoot = false; const r = el.querySelector('.yc'); if (r) r.focus({ preventScroll: true }); return; }
      if (fid) {
        const f = el.querySelector('[data-fid="' + (window.CSS && CSS.escape ? CSS.escape(fid) : fid) + '"]');
        if (f && !f.disabled) { f.focus({ preventScroll: true }); if (inputSel && f.setSelectionRange) try { f.setSelectionRange(inputSel[0], inputSel[1]); } catch (e) { /* ok */ } }
        else { const r = el.querySelector('.yc'); if (r) r.focus({ preventScroll: true }); }
      } else if (hadRoot) { const r = el.querySelector('.yc'); if (r) r.focus({ preventScroll: true }); }
    }
    function guard(fn) {
      try { fn(); }
      catch (err) { if (!(err instanceof CalcError)) throw err; say(err.message, 'bad'); const P = cur(); if (P) { P.blocked.push({ t: secs(P), why: err.message }); log('calc', { p: P.n, do: 'blocked', why: err.message }); } }
      render();
    }
    function onClick(ev) {
      handleClick(ev);
      const a = document.activeElement;
      if (!S.destroyed && (!a || !el.contains(a))) { const r = el.querySelector('.yc'); if (r) r.focus({ preventScroll: true }); }
    }
    function handleClick(ev) {
      const b = ev.target.closest('button');
      if (!b || !el.contains(b) || b.disabled) return;
      const P = cur();
      if (b.hasAttribute('data-ex')) { freeLoad(b.getAttribute('data-ex')); render(); return; }
      if (b.getAttribute('data-act') === 'free-go') { const inp = el.querySelector('.yc-free-in'); freeLoad(inp ? inp.value : ''); render(); return; }
      if (!live()) return;
      if (b.hasAttribute('data-go')) { S.idx = Number(b.getAttribute('data-go')); S.sel = null; S.entry = blank(); S.armed = null; say(''); render(); return; }
      if (!P) return;
      if (b.hasAttribute('data-key')) { guard(() => press(b.getAttribute('data-key'))); return; }
      if (b.hasAttribute('data-t')) {
        const path = b.getAttribute('data-t');
        if (P.spec.kind === 'spot') {
          if (P.spot.closed) return;
          const i = P.spot.sel.indexOf(path);
          if (i >= 0) P.spot.sel.splice(i, 1); else P.spot.sel.push(path);
          say(''); render(); return;
        }
        S.sel = S.sel === path ? null : path;
        say('');
        if (S.sel) {
          const d = describe(P, S.sel);
          if (d && d.locked) { P.blocked.push({ t: secs(P), why: 'tapped ' + labelOf(P, path) }); log('calc', { p: P.n, do: 'locked', at: labelOf(P, path) }); }
        }
        render(); return;
      }
      if (b.hasAttribute('data-opt')) { const d = S.sel ? describe(P, S.sel) : null; const o = d && d.opts[Number(b.getAttribute('data-opt'))]; if (o) guard(() => doStep(P, o.step)); return; }
      if (b.hasAttribute('data-read')) { readAnswer(P, b.getAttribute('data-read')); render(); return; }
      if (b.hasAttribute('data-rule')) { guard(() => pickRule(P, b.getAttribute('data-rule'))); return; }
      const act = b.getAttribute('data-act');
      if (act === 'flip-keep' || act === 'flip-flip') { guard(() => flipAnswer(P, act === 'flip-flip' ? 'flip' : 'keep')); return; }
      if (act === 'flip-cancel') { undo(P); render(); return; }
      if (act === 'g-open' || act === 'g-closed') { graphSet(P, 'circle', act.slice(2)); render(); return; }
      if (act === 'g-left' || act === 'g-right') { graphSet(P, 'side', act.slice(2)); render(); return; }
      if (act === 'g-check') { graphCheck(P); render(); return; }
      if (act === 'm-check') { measureCheck(P); render(); return; }
      if (act === 'combine') guard(() => doStep(P, { kind: 'combine', via: 'button' }));
      else if (act === 'distribute') guard(() => doStep(P, { kind: 'distribute', via: 'button' }));
      else if (act === 'undo') { undo(P); render(); }
      else if (act === 'restart') { restart(P); render(); }
      else if (act === 'hint') { hint(P); render(); }
      else if (act === 'sp-none' || act === 'sp-all') { classify(P, act === 'sp-all' ? 'all' : 'none'); render(); }
      else if (act === 'spot-check') { spotCheck(P); render(); }
      else if (act === 'copy') copyWork(P);
    }
    const KEYMAP = { '+': '+', '-': '-', '−': '-', '*': '*', 'x': 'x', 'X': 'x', Enter: 'go', '=': 'go', Backspace: 'back', Delete: 'clear', Escape: 'clear' };
    function onKey(ev) {
      const tag = ev.target && ev.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (ev.key === 'Enter' && ev.target.classList.contains('yc-free-in')) { ev.preventDefault(); freeLoad(ev.target.value); render(); }
        else if (ev.key === 'Enter' && ev.target.classList.contains('yc-mi')) { ev.preventDefault(); const P = cur(); if (P && live()) { P.measure.draft = ev.target.value; measureCheck(P); render(); } }
        return;
      }
      if (ev.ctrlKey || ev.metaKey || ev.altKey) { if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') { const P = cur(); if (P && live()) { ev.preventDefault(); undo(P); render(); } } return; }
      const P = cur();
      if (!P || !live() || P.spec.kind === 'spot' || P.status !== 'open' || !padShown || busy(P)) return;
      let k = KEYMAP[ev.key];
      if (/^\d$/.test(ev.key)) k = ev.key;
      if (ev.key === P.v || ev.key === P.v.toUpperCase()) k = 'x';
      if (ev.key === '/') k = S.entry.op && S.entry.num && S.entry.den == null && !S.entry.x ? 'frac' : '/';
      if (!k) return;
      if (k === 'go' && ev.target.tagName === 'BUTTON' && ev.key === 'Enter' && !ev.target.hasAttribute('data-key')) return; // Enter on a button presses that button
      ev.preventDefault();
      guard(() => press(k));
    }
    function onInput(ev) {
      if (!ev.target.classList) return;
      if (ev.target.classList.contains('yc-free-in')) S.freeText = ev.target.value;
      else if (ev.target.classList.contains('yc-mi')) { const P = cur(); if (P && P.measure) P.measure.draft = ev.target.value; }
    }
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKey);
    el.addEventListener('input', onInput);

    render();
    report();
    return {
      update(o) { if (!o) return; if ('enabled' in o) cfg.enabled = Boolean(o.enabled); if ('locked' in o) cfg.locked = Boolean(o.locked); render(); },
      report: report,
      destroy() { S.destroyed = true; el.removeEventListener('click', onClick); el.removeEventListener('keydown', onKey); el.removeEventListener('input', onInput); el.innerHTML = ''; },
      get state() { return S; },
    };
  }

  const API = {
    version: VERSION, mount: mount, parseBlock: parseBlock, parseEquation: parseEquation,
    plan: plan, par: par, outcome: outcome, applyOp: applyOp, applyCombine: applyCombine, applyDistribute: applyDistribute,
    eqText: eqText, holds: holds, angleSetup: angleSetup, F: F, CalcError: CalcError,
  };
  if (typeof window !== 'undefined') window.YABCCalc = API;
  if (typeof module === 'object' && module.exports) module.exports = API;
})();
