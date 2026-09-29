import { useEffect, useMemo, useState } from 'react';
import { renderInline } from './render.js';
import { answerText, grade } from './quiz.js';

/**
 * One checkpoint. `mode`:
 *   'graded'   — two tries (full, then half credit), then locked; every
 *                check is logged to the kit and the score goes in the
 *                result file. Needs `enabled` (the student has started).
 *   'practice' — unlimited tries, nothing recorded.
 * `onReport({ id, title, earned, possible, done, answers })` fires on every change.
 */
export default function Quiz({ quiz, mode = 'graded', enabled = true, locked = false, onReport, log }) {
  const [state, setState] = useState(() => Object.fromEntries(quiz.questions.map((q) => [q.id, { given: q.type === 'multi' ? [] : q.type === 'input' ? '' : null, tries: 0, status: 'open', earned: 0 }])));
  const graded = mode === 'graded';

  const totals = useMemo(() => {
    const earned = quiz.questions.reduce((n, q) => n + state[q.id].earned, 0);
    const done = quiz.questions.every((q) => state[q.id].status !== 'open');
    const answers = quiz.questions.map((q) => ({ q: q.id, given: state[q.id].given, tries: state[q.id].tries, status: state[q.id].status, earned: state[q.id].earned }));
    return { earned, done, answers };
  }, [state, quiz]);

  useEffect(() => {
    onReport?.({ id: quiz.id, order: quiz.order, kind: 'quiz', title: quiz.title, earned: totals.earned, possible: quiz.possible, done: totals.done, answers: totals.answers });
  }, [totals]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (id, patch) => setState((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const check = (q) => {
    const st = state[q.id];
    const right = grade(q, st.given);
    const tries = st.tries + 1;
    let status, earned = st.earned;
    if (right) { status = 'right'; earned = graded ? (tries === 1 ? q.points : q.points / 2) : q.points; }
    else if (!graded) status = 'retry';
    else status = tries >= 2 ? 'wrong' : 'retry';
    set(q.id, { tries, status, earned });
    log?.('check', { quiz: quiz.id, q: q.id, try: tries, right, given: st.given });
  };

  const answered = (q) => {
    const g = state[q.id].given;
    return q.type === 'choice' ? g != null : q.type === 'multi' ? g.length > 0 : String(g).trim() !== '';
  };

  return (
    <section className={`quiz quiz-${mode}${enabled ? '' : ' is-off'}`} aria-label={quiz.title}>
      <header className="quiz-head">
        <h3><span className="quiz-kind">{graded ? 'Checkpoint' : 'Self-check'}</span>{quiz.title}</h3>
        <span className="quiz-score">{graded ? <>{totals.earned} / {quiz.possible} pts</> : <>{quiz.questions.filter((q) => state[q.id].status === 'right').length} / {quiz.questions.length} right</>}</span>
      </header>
      {!enabled && graded && <p className="quiz-gate">Type your name at the top of the lesson to start — then this checkpoint unlocks.</p>}
      <ol className="quiz-list">
        {quiz.questions.map((q) => {
          const st = state[q.id];
          const closed = st.status === 'right' || st.status === 'wrong' || locked;
          const canCheck = enabled && !closed && answered(q);
          return (
            <li key={q.id} className={`quiz-q is-${st.status}${closed ? ' is-closed' : ''}`}>
              <div className="quiz-prompt">
                <span className="quiz-n">{q.n}</span>
                <div className="quiz-prompt-text" dangerouslySetInnerHTML={{ __html: renderInline(q.prompt) }} />
                <span className="quiz-pts">{q.points} pt{q.points === 1 ? '' : 's'}</span>
              </div>

              {q.type !== 'input' ? (
                <div className="quiz-choices" role={q.type === 'choice' ? 'radiogroup' : 'group'}>
                  {q.choices.map((c, i) => {
                    const on = q.type === 'choice' ? st.given === i : st.given.includes(i);
                    return (
                      <label key={i} className={`quiz-choice${on ? ' on' : ''}${closed && c.correct ? ' is-correct' : ''}`}>
                        <input
                          type={q.type === 'choice' ? 'radio' : 'checkbox'} name={`${quiz.id}-${q.id}`} checked={on} disabled={closed || !enabled}
                          onChange={() => set(q.id, { given: q.type === 'choice' ? i : on ? st.given.filter((x) => x !== i) : [...st.given, i], status: st.status === 'retry' ? 'open' : st.status })}
                        />
                        <span className="quiz-box" aria-hidden="true" />
                        <span dangerouslySetInnerHTML={{ __html: renderInline(c.text) }} />
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="quiz-input">
                  <input
                    type="text" value={st.given} disabled={closed || !enabled} placeholder="Your answer" autoComplete="off" spellCheck={false}
                    onChange={(e) => set(q.id, { given: e.target.value, status: st.status === 'retry' ? 'open' : st.status })}
                    onKeyDown={(e) => { if (e.key === 'Enter' && canCheck) check(q); }}
                    aria-label={`Answer to question ${q.n}`}
                  />
                </div>
              )}

              <div className="quiz-foot">
                {!closed && <button type="button" className="btn btn-ink btn-sm" disabled={!canCheck} onClick={() => check(q)}>{st.status === 'retry' ? 'Check again' : 'Check'}</button>}
                {st.status === 'right' && <span className="quiz-verdict ok">Correct{graded && st.tries > 1 ? ' — half credit on the second try' : ''}.</span>}
                {st.status === 'retry' && <span className="quiz-verdict warn">{graded ? 'Not yet. One more try — for half the points.' : 'Not yet. Try again.'}</span>}
                {st.status === 'wrong' && <span className="quiz-verdict bad">Not this time. Answer: <b dangerouslySetInnerHTML={{ __html: renderInline(answerText(q)) }} /></span>}
              </div>
              {(st.status === 'right' || st.status === 'wrong') && q.explain && (
                <div className="quiz-explain" dangerouslySetInnerHTML={{ __html: renderInline(q.explain) }} />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
