import { useEffect, useRef, useState } from 'react';
import YabcMark from './YabcMark.jsx';
import { NAV } from './navData.js';

/**
 * Sticky navbar with a mega-menu for Lessons. Desktop: click opens a panel.
 * Mobile: the burger opens a drawer where the dropdown is an accordion.
 */
export default function SiteNav() {
  const [open, setOpen] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [flip, setFlip] = useState(false);
  const ref = useRef(null);
  const here = typeof window !== 'undefined' ? window.location.pathname : '/';

  useEffect(() => {
    if (open === null) return;
    const panel = ref.current?.querySelector('.nav-dd.is-open .nav-panel');
    if (!panel) return;
    setFlip(panel.getBoundingClientRect().right > window.innerWidth - 8);
  }, [open]);

  useEffect(() => {
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(null); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(null); setDrawer(false); } };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  return (
    <header className={`site-nav${drawer ? ' drawer-open' : ''}`} ref={ref}>
      <a className="site-brand" href="/">
        <YabcMark size={38} words={false} />
        <span className="brand-text"><strong>Mr. Cruz</strong><span>The Lehman YABC</span></span>
      </a>

      <button type="button" className="site-burger" aria-expanded={drawer} aria-label="Menu" onClick={() => setDrawer((d) => !d)}>
        <span /><span /><span />
      </button>

      <nav className="site-links" aria-label="Site">
        {NAV.map((entry, i) => entry.groups ? (
          <div key={entry.label} className={`nav-dd${open === i ? ' is-open' : ''}${open === i && flip ? ' flip' : ''}`}>
            <button type="button" aria-expanded={open === i} onClick={() => { setFlip(false); setOpen(open === i ? null : i); }}>
              {entry.label}
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>
            </button>
            <div className="nav-panel" role="group" aria-label={entry.label}>
              {entry.groups.map((g) => (
                <div key={g.label} className="nav-group">
                  {g.href ? <a className="nav-group-title" href={g.href} onClick={() => setOpen(null)}>{g.label}</a> : <div className="nav-group-title">{g.label}</div>}
                  {g.search && (
                    <form className="nav-search" action={g.search.action} method="get" role="search">
                      <input type="search" name="q" placeholder={g.search.placeholder} aria-label={g.search.placeholder} autoComplete="off" />
                      <button type="submit">Go</button>
                    </form>
                  )}
                  <ul>
                    {g.items.map((it) => (
                      <li key={it.label} className={it.tone ? `tone-${it.tone}` : ''}>
                        <a href={it.href} className={it.soon ? 'is-soon' : ''} onClick={() => { setOpen(null); setDrawer(false); }}>
                          {it.tone && <span className="dot" aria-hidden="true" />}{it.label}{it.sub && <small>{it.sub}</small>}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <a key={entry.label} href={entry.href} className={here === entry.href ? 'is-here' : ''} onClick={() => setDrawer(false)}>{entry.label}</a>
        ))}
        <a className="site-cta" href="/lessons">Browse lessons</a>
      </nav>
    </header>
  );
}
