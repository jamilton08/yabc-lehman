/**
 * LESSONS — the one file to edit when you post a lesson.
 *
 * Three levels, same as the nav:
 *   course  → /lessons/<slug>                 (Math, Computer Science, Financial Literacy)
 *   topic   → a section on the course page    (#<topic id>)
 *   lesson  → /lessons/<course>/<lesson>
 *
 * Every lesson lives in its own folder:
 *     public/lesson-files/<course>/<lesson slug>/
 * and is ONE of:
 *   md:   'lesson.md'     a markdown lesson rendered on the site. Math with
 *                         $...$ and $$...$$, code blocks, callouts
 *                         (> [!EXAMPLE]), ```quiz checkpoints that produce
 *                         the graded result file, ```embed to drop an
 *                         interactive HTML material into the page.
 *   file: 'index.html'    a self-contained HTML lesson (game, lab, sim)
 *                         shown in a frame. It loads /lesson-kit/yabc-lesson.js
 *                         for the result file — see public/lesson-template/.
 *
 * `materials` (optional) sit beside the lesson in the same folder and show
 * up as tabs on the lesson page:
 *   { title, file: 'practice.html', kind: 'html' }   interactive page, opens in the frame
 *   { title, file: 'notes.md',      kind: 'md' }     more markdown, rendered on the site
 *   { title, file: 'handout.pdf',   kind: 'pdf' }    shown in the frame
 *   { title, href: 'https://…',     kind: 'link' }   opens in a new tab
 *   { title, file: 'data.csv',      kind: 'download' }
 *   add `note` for a one-line description under the tab.
 *
 * `kind` decides the label and the button verb (see KINDS).
 * `graded: true` marks a lesson that ends with a result file (a quiz block
 * in a markdown lesson sets this on its own).
 * `minutes` is a rough time-to-finish. `added` (YYYY-MM-DD) orders "newest".
 * `tags` are extra words the search should find it by.
 */

export const KINDS = {
  lesson:   { label: 'Lesson',   verb: 'Open the lesson' },
  practice: { label: 'Practice', verb: 'Start practicing' },
  lab:      { label: 'Lab',      verb: 'Start the lab' },
  game:     { label: 'Game',     verb: 'Play' },
  quiz:     { label: 'Quiz',     verb: 'Take the quiz' },
  reading:  { label: 'Reading',  verb: 'Read' },
};

export const COURSES = [
  {
    slug: 'math',
    title: 'Math',
    short: 'Math',
    mark: 'M',
    tone: 'math',
    blurb: 'Algebra, functions, geometry, and statistics — worked out step by step, with practice you check yourself.',
    topics: [
      {
        id: 'equations',
        title: 'Equations & inequalities',
        blurb: 'Undo what was done to x.',
        lessons: [
          {
            slug: 'moving-terms-and-coefficients',
            title: 'Terms that move, coefficients that detach',
            description: 'Algebra 1, lesson one: read an equation before you solve it. Name the constants, the $x$-terms, and the coefficients (hidden ones too), move terms by doing the opposite to both sides, and detach the coefficient last. You solve the assigned problems on a step calculator that writes down every move you make, and that work goes into your result file.',
            md: 'lesson.md',
            kind: 'lesson',
            graded: true,
            minutes: 45,
            added: '2026-09-29',
            tags: ['Algebra 1', 'algebra', 'terms', 'like terms', 'constant', 'coefficient', 'variable term', 'inverse operations', 'both sides', 'step calculator', 'distribute', 'parentheses', 'Regents'],
            materials: [
              { title: 'Step calculator', file: 'calculator.html', kind: 'html', note: 'Type any equation and solve it move by move. Copy or print your work.' },
              { title: 'Extra practice', file: 'practice.md', kind: 'md', note: 'More problems on the same calculator. Hints are free and nothing is recorded.' },
            ],
          },
          {
            slug: 'solving-linear-equations',
            title: 'Solving linear equations',
            description: 'Every one-variable equation is a locked box, and the key is doing the same thing to both sides. Two-step equations, variables on both sides, distributing, and the two weird cases (no solution, all solutions) — with three checkpoints that count.',
            md: 'lesson.md',
            kind: 'lesson',
            graded: true,
            minutes: 40,
            added: '2026-09-22',
            tags: ['algebra', 'equations', 'inverse operations', 'two-step', 'distributive property', 'variables on both sides', 'Regents'],
            materials: [
              { title: 'Practice set', file: 'practice.md', kind: 'md', note: '12 problems, answers hidden until you want them.' },
              { title: 'Balance scale', file: 'balance.html', kind: 'html', note: 'See both sides move when you do the same thing to each.' },
              { title: 'Regents reference sheet', href: 'https://www.nysed.gov/state-assessment/high-school-regents-examinations', kind: 'link', note: 'The formula sheet you get on the exam.' },
            ],
          },
          {
            slug: 'solving-linear-inequalities',
            title: 'Solving linear inequalities',
            description: 'Algebra 1. Same moves as equations, plus one new rule: multiply or divide by a negative and the sign flips. Read $<$, $>$, $\\le$, $\\ge$ from words, test values, and graph the answer on a number line. On the step calculator you decide "keep or flip?" on every multiply or divide, read answers like $6 < x$ from $x$\'s side, and graph each answer. It ends with Regents-style word problems.',
            md: 'lesson.md',
            kind: 'lesson',
            graded: true,
            minutes: 45,
            added: '2026-10-01',
            tags: ['Algebra 1', 'algebra', 'inequalities', 'inequality', 'less than', 'greater than', 'at least', 'at most', 'flip the sign', 'negative', 'number line', 'open circle', 'closed circle', 'graphing', 'test point', 'word problems', 'step calculator', 'Regents'],
            materials: [
              { title: 'Number line explorer', file: 'number-line.html', kind: 'html', note: 'Drag a test number along any inequality, and see why multiplying by a negative turns the order around.' },
              { title: 'Step calculator', file: 'calculator.html', kind: 'html', note: 'Type any equation or inequality and solve it move by move. Copy or print your work.' },
              { title: 'Extra practice', file: 'practice.md', kind: 'md', note: 'More problems on the same calculator, including stories and when-x-disappears. Nothing is recorded.' },
            ],
          },
        ],
      },
      {
        id: 'functions',
        title: 'Functions & graphs',
        blurb: 'Lines first, then everything that is not a line.',
        lessons: [
          {
            slug: 'slope-and-y-intercept',
            title: 'Slope and the y-intercept',
            description: 'What $y = mx + b$ actually says: where a line starts and how fast it climbs. Read slope off a graph, off a table, and off two points, then drag a live line around until it clicks.',
            md: 'lesson.md',
            kind: 'lesson',
            graded: true,
            minutes: 35,
            added: '2026-09-22',
            tags: ['slope', 'y-intercept', 'linear', 'graphing', 'rate of change', 'rise over run', 'y = mx + b'],
            materials: [
              { title: 'Line explorer', file: 'line-explorer.html', kind: 'html', note: 'Drag m and b. Watch the line and the table change together.' },
            ],
          },
          {
            slug: 'function-notation',
            title: 'What f(x) means',
            description: 'Algebra 2, lesson one. $f(x)$ is "f of x," not f times x. Plug in to find $f(3)$, solve to find when $f(x) = 3$ (on the step calculator), read both off a graph, and see domain and range as the shadows a graph casts on the axes.',
            md: 'lesson.md',
            kind: 'lesson',
            graded: true,
            minutes: 50,
            added: '2026-09-29',
            tags: ['Algebra 2', 'functions', 'function notation', 'f(x)', 'evaluate', 'input', 'output', 'domain', 'range', 'vertical line test', 'graph', 'step calculator', 'Regents'],
            materials: [
              { title: 'Function reader', file: 'function-reader.html', kind: 'html', note: 'Drag along a graph to read f(a), or drag a line to solve f(x) = b. Shows domain and range.' },
              { title: 'Extra practice', file: 'practice.md', kind: 'md', note: 'Plug in, solve, and "which question is it?" Nothing is recorded.' },
            ],
          },
        ],
      },
      {
        id: 'geometry',
        title: 'Geometry',
        blurb: 'Shapes, angles, and proof.',
        lessons: [
          {
            slug: 'angles-and-crossing-lines',
            title: 'Angles where lines cross',
            description: 'Geometry, lesson one. When two lines cross, the angles follow rules that never break: a linear pair adds up to 180°, vertical angles are equal, a corner is 90°, and all the way around is 360°. Drag the lines until you believe it. Then read a figure, pick the rule, let the calculator write the equation, solve for $x$, and find the angle.',
            md: 'lesson.md',
            kind: 'lesson',
            graded: true,
            minutes: 45,
            added: '2026-09-29',
            tags: ['Geometry', 'angles', 'vertical angles', 'linear pair', 'supplementary', 'complementary', 'around a point', 'vertex', 'ray', 'segment', 'naming angles', 'step calculator', 'Regents'],
            materials: [
              { title: 'Angle explorer', file: 'angle-explorer.html', kind: 'html', note: 'Drag two crossing lines, a split right angle, or rays around a point. The rules hold every time.' },
              { title: 'Extra practice', file: 'practice.md', kind: 'md', note: 'More angle problems on the calculator, plus a triangle preview. Nothing is recorded.' },
            ],
          },
        ],
      },
      { id: 'statistics', title: 'Statistics & probability', blurb: 'What the data says, and how sure you can be.', lessons: [] },
    ],
  },
  {
    slug: 'computer-science',
    title: 'Computer Science',
    short: 'CS',
    mark: 'CS',
    tone: 'cs',
    blurb: 'Breaking a problem down until a computer can do it — then writing it in Python, right in the browser.',
    topics: [
      {
        id: 'thinking-like-a-computer',
        title: 'Thinking like a computer',
        blurb: 'Say it in plain English first. Then in code.',
        lessons: [
          {
            slug: 'think-it-then-code-it',
            title: 'Think it, then code it',
            description: 'Five real situations — a bake sale count, locker labels, messy name badges, letter grades, a password checker. For each one you first write how you would handle it as a person, then write it in Python in the built-in editor and pass the tests. Variables, loops, strings, if/else.',
            file: 'index.html',
            kind: 'lab',
            graded: true,
            minutes: 60,
            added: '2026-09-22',
            tags: ['Python', 'variables', 'loops', 'for', 'while', 'strings', 'if', 'else', 'input', 'print', 'range', 'split', 'logic', 'algorithm', 'editor', 'beginner'],
            materials: [
              { title: 'Python cheat sheet', file: 'cheatsheet.md', kind: 'md', note: 'Everything the lab uses, on one page.' },
            ],
          },
        ],
      },
      { id: 'python', title: 'Python', blurb: 'Functions, lists, dictionaries, files.', lessons: [] },
      { id: 'web', title: 'Web basics', blurb: 'HTML, CSS, and a little JavaScript.', lessons: [] },
      { id: 'data', title: 'Working with data', blurb: 'Spreadsheets, CSVs, and charts that tell the truth.', lessons: [] },
    ],
  },
  {
    slug: 'financial-literacy',
    title: 'Financial Literacy',
    short: 'Finance',
    mark: '$',
    tone: 'finance',
    blurb: 'Paychecks, budgets, banks, credit, and the math that decides whether money works for you or against you.',
    topics: [
      {
        id: 'paychecks',
        title: 'Paychecks & taxes',
        blurb: 'Why the number on the check is smaller than the number you were promised.',
        lessons: [
          {
            slug: 'reading-a-paycheck',
            title: 'Reading a paycheck',
            description: 'Gross pay, FICA, federal and state withholding, net pay — line by line on a real-looking NYC pay stub. Then run your own numbers through the paycheck calculator and check what a raise is actually worth after taxes.',
            md: 'lesson.md',
            kind: 'lesson',
            graded: true,
            minutes: 35,
            added: '2026-09-22',
            tags: ['paycheck', 'pay stub', 'gross pay', 'net pay', 'FICA', 'Social Security', 'Medicare', 'withholding', 'W-4', 'taxes', 'hourly', 'overtime'],
            materials: [
              { title: 'Paycheck calculator', file: 'paycheck-calculator.html', kind: 'html', note: 'Hourly rate and hours in, take-home pay out.' },
              { title: 'IRS: how withholding works', href: 'https://www.irs.gov/individuals/tax-withholding-estimator', kind: 'link', note: 'The official estimator, for when you have a real W-4 to fill out.' },
            ],
          },
        ],
      },
      { id: 'budgeting', title: 'Budgeting', blurb: 'A plan for every dollar before it shows up.', lessons: [] },
      { id: 'banking-and-credit', title: 'Banking & credit', blurb: 'Accounts, interest, credit scores, and the cost of borrowing.', lessons: [] },
      { id: 'saving-and-investing', title: 'Saving & investing', blurb: 'Compound growth, risk, and time.', lessons: [] },
    ],
  },
];

/* ── helpers ──────────────────────────────────────────────────────── */

export const getCourse = (slug) => COURSES.find((c) => c.slug === slug) || null;

/** The folder a lesson's files are served from. */
export const lessonBase = (course, lesson) => `/lesson-files/${course.slug}/${lesson.slug}/`;

/** Resolve a file name (or URL) relative to the lesson's folder. */
export const resolveFile = (course, lesson, file) => {
  if (!file) return '';
  if (/^(https?:)?\/\//.test(file) || file.startsWith('/')) return file;
  return lessonBase(course, lesson) + file;
};

/** The URL the frame loads for an HTML lesson (empty for markdown lessons). */
export const lessonSrc = (course, lesson) => (lesson.file ? resolveFile(course, lesson, lesson.file) : '');

export const isPosted = (lesson) => Boolean(lesson.file || lesson.md);

export const lessonHref = (course, lesson) => `/lessons/${course.slug}/${lesson.slug}`;

/** Every lesson, flattened, with its course and topic attached. */
export const allLessons = () =>
  COURSES.flatMap((course) =>
    course.topics.flatMap((topic) => topic.lessons.map((lesson) => ({ course, topic, lesson })))
  );

export const countLessons = (course) => course.topics.reduce((n, t) => n + t.lessons.filter(isPosted).length, 0);

/** Newest lessons first (only posted ones). */
export const newestLessons = (n = 4) =>
  allLessons()
    .filter(({ lesson }) => isPosted(lesson))
    .sort((a, b) => (b.lesson.added || '').localeCompare(a.lesson.added || ''))
    .slice(0, n);

/** Find one lesson by course + lesson slug; also returns its neighbors in the topic. */
export const findLesson = (courseSlug, lessonSlug) => {
  const course = getCourse(courseSlug);
  if (!course) return null;
  for (const topic of course.topics) {
    const i = topic.lessons.findIndex((l) => l.slug === lessonSlug);
    if (i >= 0) {
      return { course, topic, lesson: topic.lessons[i], prev: topic.lessons[i - 1] || null, next: topic.lessons[i + 1] || null };
    }
  }
  return null;
};
