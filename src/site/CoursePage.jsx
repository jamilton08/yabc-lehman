import { useEffect } from 'react';
import SiteNav from './SiteNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import LessonCard from './LessonCard.jsx';
import SearchBar, { SearchResults } from './SearchBar.jsx';
import { useLessonSearch } from './search.js';
import { COURSES, countLessons, getCourse } from './lessons.js';
import './site.css';

export default function CoursePage({ slug }) {
  const c = getCourse(slug);
  const search = useLessonSearch({ course: c ? c.slug : '' });
  useEffect(() => { document.title = c ? `${c.title} · Mr. Cruz · The Lehman YABC` : 'Not found'; }, [c]);

  if (!c) {
    return (
      <div className="site"><SiteNav />
        <main className="page"><h1>No course at that address.</h1><p><a href="/lessons">Back to lessons</a></p></main>
        <SiteFooter />
      </div>
    );
  }
  const total = countLessons(c);

  return (
    <div className={`site tone-${c.tone}`} id="top">
      <SiteNav />
      <main>
        <header className={`r-hero tone-${c.tone}`}>
          <p className="t-crumb"><a href="/">Home</a> / <a href="/lessons">Lessons</a> / {c.title}</p>
          <h1>{c.title}</h1>
          <p className="t-bio">{c.blurb}</p>
          {total > 0 && <SearchBar search={search} compact placeholder={`Search in ${c.title}`} label={`Search lessons in ${c.title}`} />}
          {!search.active && (
            <nav className="t-tabs" aria-label="Topics">
              {c.topics.map((t) => <a key={t.id} href={`#${t.id}`}>{t.title}{t.lessons.length > 0 && <small>{t.lessons.length}</small>}</a>)}
            </nav>
          )}
        </header>

        {search.active && (
          <section className="sec" id="results">
            <div className="sec-head"><h2>Results</h2><p className="sec-lead">Across every topic in {c.title}.</p></div>
            <SearchResults search={search} showCourse={false} />
          </section>
        )}

        {!search.active && c.topics.map((t) => (
          <section className="sec topic" id={t.id} key={t.id}>
            <div className="sec-head"><h2>{t.title}</h2>{t.blurb && <p className="sec-lead">{t.blurb}</p>}</div>
            {t.lessons.length === 0
              ? <p className="empty">No lessons posted in this topic yet. They show up here as they are assigned.</p>
              : <div className="lesson-grid">{t.lessons.map((l) => <LessonCard key={l.slug} course={c} lesson={l} />)}</div>}
          </section>
        ))}

        <section className="sec">
          <div className="sec-head"><h2>Other courses</h2></div>
          <ul className="t-others">
            {COURSES.filter((o) => o.slug !== c.slug).map((o) => (
              <li key={o.slug}><a href={`/lessons/${o.slug}`}><strong>{o.title}</strong><span>{o.blurb}</span></a></li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
