import { useEffect, useRef, useState } from 'react';

/**
 * A ```calc block: the step calculator from /lesson-kit/yabc-calc.js.
 * The calculator itself is plain JS in public/ so HTML lessons and the free
 * calculator page use the very same file; this component loads it once and
 * mounts it. `mode`, `enabled`, `locked`, `onReport`, `log` mean the same as
 * for <Quiz>. Reports look like a quiz's, plus `work` (every problem's tape).
 */
const SRC = '/lesson-kit/yabc-calc.js';
let loading = null;
function loadCalc() {
  if (window.YABCCalc) return Promise.resolve(window.YABCCalc);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.onload = () => (window.YABCCalc ? resolve(window.YABCCalc) : reject(new Error('The calculator did not start.')));
      s.onerror = () => { loading = null; reject(new Error('The calculator could not load. Reload the page.')); };
      document.head.appendChild(s);
    });
  }
  return loading;
}

export default function Calc({ calc, mode = 'graded', enabled = true, locked = false, onReport, log }) {
  const host = useRef(null);
  const ctl = useRef(null);
  const latest = useRef({ onReport, log, enabled, locked });
  latest.current = { onReport, log, enabled, locked };
  const [err, setErr] = useState('');

  useEffect(() => {
    let live = true;
    loadCalc().then((C) => {
      if (!live || !host.current) return;
      ctl.current = C.mount(host.current, {
        id: calc.id,
        order: calc.order,
        source: calc.source,
        mode: mode === 'graded' ? 'graded' : 'practice',
        enabled: latest.current.enabled,
        locked: latest.current.locked,
        onReport: (r) => latest.current.onReport?.(r),
        log: (type, data) => latest.current.log?.(type, data),
      });
    }).catch((e) => { if (live) setErr(e.message); });
    return () => { live = false; ctl.current?.destroy(); ctl.current = null; };
  }, [calc.id, calc.source, calc.order, mode]);

  useEffect(() => { ctl.current?.update({ enabled, locked }); }, [enabled, locked]);

  return (
    <div className="calc-island">
      {err && <p className="md-error">{err}</p>}
      <div ref={host} />
    </div>
  );
}
