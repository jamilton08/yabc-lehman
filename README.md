# Mr. Cruz · The Lehman YABC

The class site: Math, Computer Science, and Financial Literacy lessons that open in the browser, with checkpoints that grade themselves and an encrypted result file students turn in on Google Classroom.

Same bones as TechHub (Vite + React, tiny path router, one data file that drives everything) — plus markdown lessons with math, per-lesson materials in tabs, and a shared grading kit.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/  (deploy that folder; public/_redirects handles deep links on Cloudflare/Netlify)
```

## Where things are

| | |
|---|---|
| `src/site/lessons.js` | **The catalog.** Courses → topics → lessons, plus each lesson's materials. Nav, cards, search, and lesson pages all read from here. |
| `src/site/about.js` | Everything the front page says about you. |
| `public/lesson-files/<course>/<lesson>/` | One folder per lesson: `lesson.md` (or `index.html`) plus its materials. |
| `public/lesson-kit/yabc-lesson.js` | The grading kit (clock, log, result card, encryption). Loaded by the site and by every HTML lesson. **Your public key lives here.** |
| `public/lesson-kit/lesson.css` | Shared look for HTML lessons/materials. |
| `public/lesson-template/lesson.html` | Starter for an HTML lesson. |
| `src/md/` | The markdown renderer: math, callouts, code, quiz checkpoints, embeds. |
| `/lessons/verify` | Teacher page — open `.yabc` result files with your private key. |

## Posting a lesson

1. Make a folder `public/lesson-files/<course>/<slug>/` and put `lesson.md` in it (or `index.html` for an interactive HTML lesson).
2. Drop any materials in the same folder: more `.md`, interactive `.html`, `.pdf`, or just a link.
3. Add an entry to `src/site/lessons.js` under the right topic:

```js
{
  slug: 'solving-linear-equations',
  title: 'Solving linear equations',
  description: 'One paragraph for the card.',
  md: 'lesson.md',            // or  file: 'index.html'
  kind: 'lesson',             // lesson | practice | lab | game | quiz | reading
  graded: true,               // ends with a result file
  minutes: 40,
  added: '2026-09-22',
  tags: ['algebra', 'two-step'],
  materials: [
    { title: 'Practice set',   file: 'practice.md',  kind: 'md',   note: '12 problems.' },
    { title: 'Balance scale',  file: 'balance.html', kind: 'html', note: 'Interactive.' },
    { title: 'Reference sheet', href: 'https://…',   kind: 'link' },
  ],
}
```

That's it — build and it's live.

## Writing a markdown lesson

Ordinary markdown, plus:

**Math** — `$x^2$` inline, `$$ … $$` on its own lines (KaTeX). Write `\$` for dollar amounts in a math-heavy page.

**Callouts**
```
> [!KEY] The one rule
> Whatever you do to one side…
```
Kinds: `NOTE TIP KEY DEFINITION EXAMPLE TRY WARNING STEPS QUESTION`. Title is optional.

**Code** — fenced blocks with `python`, `js`, `html`, `css`, `bash`, `json`, `sql` are highlighted and get a Copy button.

**Checkpoints** — a `quiz` block becomes a graded checkpoint. Multiple choice, pick-all-that-apply, or typed answers (numbers compare as numbers; `~` sets a tolerance; alternatives with `|`). Two tries: full credit, then half. Everything the student does is logged into the result file.
````
```quiz
title: Checkpoint 1 — two-step equations
points: 1

1. Solve $3x - 5 = 16$.
   = 7
   > Add 5 to both sides, then divide by 3.

2. [2 pts] What is the first move in $5x + 8 = 3$?
   - [ ] Divide by 5
   - [x] Subtract 8 from both sides
   - [ ] Subtract 3

3. Which are prime? (pick all)
   - [x] 2
   - [x] 3
   - [ ] 4
```
````
In a material (`kind: 'md'`) the same block is a **self-check**: unlimited tries, nothing recorded.

**Embed an interactive material in the page**
````
```embed
line-explorer.html
height: 560
```
````

**Link to a material** — `[practice set](practice.md)` or `[balance scale](balance.html)` switches the lesson page to that tab.

**Hidden answers** — plain `<details><summary>Answers</summary> … </details>` works.

A lesson with at least one `quiz` block gets the Start card (name + clock) and the Finish button that seals the result file. A lesson with no quiz and `graded: true` still gets Start/Finish ("Completed").

## HTML lessons (games, labs, sims)

Copy `public/lesson-template/lesson.html`, rename to `index.html`, build the lesson. It loads the kit with one line and uses four calls:

```js
YABC.lesson({ id: 'my-lesson', title: 'My lesson', version: '1.0', course: 'math', possible: 100 });
YABC.start(name);                     // when the student begins — starts the clock
YABC.log('answer', { q: 1, given: 'b', right: true });   // anything worth keeping
YABC.endScreen('#result', { earned, possible, sections, tier });  // renders the card + seals the file
```

Link `/lesson-kit/lesson.css` for the site's look (set `<body class="math|cs|finance">` for the course color). "Think it, then code it" in `computer-science/` is a full example.

Handing the template to an AI with "build a lesson on X, scored like Y" works well.

## Grading: how the result file works

1. Student finishes → the kit builds a JSON payload (name, times, score, sections, every logged event, answers) → hashes it into an 8-character **badge code** shown on screen → encrypts it with a fresh AES-256-GCM key → wraps that key with **your RSA public key** → downloads `YABC_<lesson>_<name>_<date>.yabc`.
2. Student submits the file in Google Classroom (or pastes the code if downloads are blocked).
3. You open `/lessons/verify`, load `teacher-private-key.jwk` once (it stays in that browser's localStorage), drop the files. You get a table — student, lesson, time, score, tier, badge, and per-question answers — and a CSV download. An edited file simply will not open.

**Keys.** A fresh pair was generated for this site. The public key is in `public/lesson-kit/yabc-lesson.js`. The private key is `teacher-private-key.jwk` — delivered separately, **never** committed (it's in `.gitignore`). Keep a copy somewhere safe; without it no result file can be opened. To rotate keys, use "Need a new key pair?" on the verify page and paste the new public key into the kit — old files stop opening.

## Look

Off-white paper, black ink, one accent per course (math rust, CS cobalt, finance green), Archivo for display type, Inter for body. The YABC mark is redrawn as an inline SVG (`src/site/YabcMark.jsx`) so it stays crisp anywhere; `public/yabc-mark.svg` and `public/favicon.svg` are the standalone versions, and the original banner crop is `public/yabc-logo-original.png`.
