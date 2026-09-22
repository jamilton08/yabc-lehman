import { useEffect } from 'react';
import SiteNav from './SiteNav.jsx';
import SiteFooter from './SiteFooter.jsx';
import YabcMark from './YabcMark.jsx';
import LessonCard from './LessonCard.jsx';
import { ABOUT } from './about.js';
import { COURSES, countLessons, newestLessons } from './lessons.js';
import './site.css';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function Section({ id, num, title, lead, children, alt = false }) {
  return (
    <section className={`sec${alt ? ' sec-alt' : ''}`} id={id}>
      <div className="sec-head">
        {num && <span className="sec-num">{num}</span>}
        <h2>{title}</h2>
        {lead && <p className="sec-lead">{lead}</p>}
      </div>
      <div className="sec-body">{children}</div>
    </section>
  );
}

export default function Landing() {
  useEffect(() => { document.title = 'Mr. Cruz · The Lehman YABC'; }, []);
  const newest = newestLessons(3);
  const total = COURSES.reduce((n, c) => n + countLessons(c), 0);

  return (
    <div className="site" id="top">
      <SiteNav />
      <main>
        <section className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="hero-copy">
            <p className="hero-kicker caps">{ABOUT.program} · Bronx, NY</p>
            <h1>{ABOUT.goesBy}<small>{ABOUT.subjects.join(' · ')}</small></h1>
            <p className="hero-lede">{ABOUT.tagline}</p>
            <div className="hero-actions">
              <a className="btn btn-ink btn-pop" href="/lessons">Browse the lessons</a>
              <a className="btn btn-ghost" href="#how">How grading works</a>
            </div>
          </div>
          <div className="hero-mark">
            <YabcMark size={380} />
          </div>
          <nav className="hero-subjects" aria-label="Courses">
            {COURSES.map((c) => {
              const n = countLessons(c);
              return (
                <a key={c.slug} className={`subject tone-${c.tone}`} href={`/lessons/${c.slug}`}>
                  <span className="subject-mark" aria-hidden="true">{c.mark || c.short.slice(0, 2)}</span>
                  <span><strong>{c.title}</strong><span>{n ? plural(n, 'lesson') : 'Lessons coming soon'}</span></span>
                </a>
              );
            })}
          </nav>
        </section>

        {newest.length > 0 && (
          <Section id="newest" num="01" title="Newest" lead={`${plural(total, 'lesson')} posted so far. The latest ones land here.`}>
            <div className="lesson-grid">
              {newest.map(({ course, lesson }) => <LessonCard key={`${course.slug}/${lesson.slug}`} course={course} lesson={lesson} showCourse />)}
            </div>
          </Section>
        )}

        <Section id="how" num="02" title="How it works" lead="Three steps, no accounts, nothing to install." alt>
          <ol className="steps">
            {ABOUT.howItWorks.map((s) => (
              <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
        </Section>

        <Section id="about" num="03" title={`About ${ABOUT.goesBy}`} lead={ABOUT.programLong}>
          <div className="about">
            <div className="about-text">
              {ABOUT.intro.map((p, i) => <p key={i}>{p}</p>)}
              <p className="contact">
                {ABOUT.contact.classroomNote}
                {ABOUT.contact.email && <> Email: <a href={`mailto:${ABOUT.contact.email}`}>{ABOUT.contact.email}</a></>}
              </p>
            </div>
            <dl className="facts">
              {ABOUT.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}
            </dl>
          </div>
        </Section>

        <Section id="values" num="04" title="The four words on the mark" lead="Trust, respect, honesty, responsibility — what they mean in this room." alt>
          <dl className="values">
            {ABOUT.values.map((v) => <div key={v.title}><dt>{v.title}</dt><dd>{v.text}</dd></div>)}
          </dl>
        </Section>

        <Section id="courses" num="05" title="Courses" lead="Pick a course to see its topics and lessons.">
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
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
