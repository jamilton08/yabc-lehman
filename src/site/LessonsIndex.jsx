import { useEffect } from 'react';
import SiteNav from './SiteNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import LessonCard from './LessonCard.jsx';
import SearchBar, { SearchResults } from './SearchBar.jsx';
import { useLessonSearch } from './search.js';
import { COURSES, countLessons, newestLessons } from './lessons.js';
import './site.css';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function LessonsIndex() {
  useEffect(() => { document.title = 'Lessons · Mr. Cruz · The Lehman YABC'; }, []);
  const search = useLessonSearch();
  const newest = newestLessons(6);
  const total = COURSES.reduce((n, c) => n + countLessons(c), 0);

  return (
    <div className="site" id="top">
      <SiteNav />
      <main>
        <header className="r-hero">
          <p className="t-crumb"><a href="/">Home</a> / Lessons</p>
          <h1>Lessons</h1>
          <p className="t-bio">
            Every lesson opens right here — notes with worked examples, checkpoints that grade
            themselves, interactive labs, and the materials that go with them. Pick a course, or
            search everything by title, topic, or type.
          </p>
          <SearchBar search={search} placeholder="Search every lesson — try “slope”, “Python”, or “paycheck”" />
        </header>

        {search.active && (
          <section className="sec" id="results">
            <div className="sec-head"><h2>Results</h2><p className="sec-lead">Best matches first.</p></div>
            <SearchResults search={search} />
          </section>
        )}

        <section className="sec" id="courses">
          <div className="sec-head">
            <h2>Courses</h2>
            <p className="sec-lead">{plural(COURSES.length, 'course')}, {plural(total, 'lesson')} posted so far. More land through the year.</p>
          </div>
          <ol className="course-grid">
            {COURSES.map((c) => {
              const n = countLessons(c);
              return (
                <li key={c.slug} className={`course tone-${c.tone}`}>
                  <a href={`/lessons/${c.slug}`}>
                    <div className="course-band" aria-hidden="true" />
                    <div className="course-top"><h3>{c.title}</h3><span className={`pill${n ? '' : ' muted'}`}>{n ? plural(n, 'lesson') : 'Coming soon'}</span></div>
                    <p>{c.blurb}</p>
                    <ul className="course-topics">
                      {c.topics.map((t) => <li key={t.id}>{t.title}{t.lessons.length > 0 && <small>{t.lessons.length}</small>}</li>)}
                    </ul>
                  </a>
                </li>
              );
            })}
          </ol>
        </section>

        {!search.active && newest.length > 0 && (
          <section className="sec" id="newest">
            <div className="sec-head"><h2>Newest</h2><p className="sec-lead">The latest lessons posted, across every course.</p></div>
            <div className="lesson-grid">
              {newest.map(({ course, lesson }) => <LessonCard key={`${course.slug}/${lesson.slug}`} course={course} lesson={lesson} showCourse />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
