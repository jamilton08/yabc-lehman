import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { render } from './render.js';
import Quiz from './Quiz.jsx';
import 'katex/dist/katex.min.css';
import './md.css';

/**
 * Renders a markdown string. Quiz blocks become live <Quiz> components
 * (mounted through portals into the placeholders the renderer left).
 *
 *   source      the markdown text
 *   base        the lesson folder, for relative images / embeds
 *   mode        'graded' | 'practice'   (how quizzes behave)
 *   enabled     graded quizzes stay locked until the student has started
 *   onQuiz      ({ id, title, earned, possible, done, answers }) per checkpoint
 *   onOutline   ([{ id, text, level }]) once rendered
 *   onMaterial  (file) when the reader clicks a link to a sibling material
 */
export default function Markdown({ source, base = '', mode = 'practice', enabled = true, locked = false, onQuiz, onOutline, onMaterial, log, className = '' }) {
  const host = useRef(null);
  const out = useMemo(() => render(source, { base }), [source, base]);
  const [mounts, setMounts] = useState([]);

  useEffect(() => { onOutline?.(out.outline); }, [out]); // eslint-disable-line react-hooks/exhaustive-deps

  // find the placeholders after the HTML lands, then portal quizzes into them
  useLayoutEffect(() => {
    const el = host.current;
    if (!el) return;
    const found = Array.from(el.querySelectorAll('.md-island[data-island="quiz"]')).map((node) => ({ node, island: out.islands[Number(node.dataset.index)] })).filter((m) => m.island);
    setMounts(found);
  }, [out]);

  // copy buttons and material links
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const onClick = async (e) => {
      const copy = e.target.closest('[data-copy]');
      if (copy) {
        const code = copy.closest('.code-block')?.querySelector('code')?.innerText || '';
        try { await navigator.clipboard.writeText(code); copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy'; }, 1500); } catch { copy.textContent = 'Select it'; }
        return;
      }
      const a = e.target.closest('a[href^="#material:"]');
      if (a) { e.preventDefault(); onMaterial?.(decodeURIComponent(a.getAttribute('href').slice('#material:'.length))); }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [onMaterial]);

  return (
    <>
      <div ref={host} className={`md ${className}`} dangerouslySetInnerHTML={{ __html: out.html }} />
      {mounts.map(({ node, island }) => createPortal(
        <Quiz key={island.quiz.id} quiz={island.quiz} mode={mode} enabled={enabled} locked={locked} onReport={onQuiz} log={log} />, node
      ))}
    </>
  );
}

/** Small hook: fetch a text file, with loading/error state. */
export function useTextFile(url) {
  const [state, setState] = useState({ text: null, error: null, loading: Boolean(url) });
  useEffect(() => {
    if (!url) { setState({ text: null, error: null, loading: false }); return; }
    let live = true;
    setState({ text: null, error: null, loading: true });
    fetch(url, { cache: 'no-cache' })
      .then((r) => { if (!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.text(); })
      .then((text) => { if (live) setState({ text, error: null, loading: false }); })
      .catch((e) => { if (live) setState({ text: null, error: e.message, loading: false }); });
    return () => { live = false; };
  }, [url]);
  return state;
}
