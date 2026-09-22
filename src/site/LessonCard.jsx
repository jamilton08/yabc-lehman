import { useEffect, useRef, useState } from 'react';
import { KINDS, isPosted, lessonHref, lessonSrc } from './lessons.js';
import { renderInline } from '../md/render.js';

const PREVIEW_W = 1280;
const PREVIEW_H = 800;

/** HTML lessons: the real page, loaded lazily in a scaled-down frame. */
export function LessonScreen({ src, title }) {
  const box = useRef(null);
  const [scale, setScale] = useState(0);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / PREVIEW_W));
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '240px' });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);
  return (
    <div className="lesson-screen" ref={box}>
      {near && scale > 0 && (
        <iframe src={src} title={`Preview of ${title}`} aria-hidden="true" tabIndex={-1} loading="lazy" sandbox="allow-scripts allow-same-origin"
          style={{ width: PREVIEW_W, height: PREVIEW_H, transform: `scale(${scale})` }} />
      )}
    </div>
  );
}

/** Markdown lessons: a cover in the course color. */
function LessonCover({ course, lesson, kind }) {
  return (
    <div className="lesson-screen">
      <div className="lesson-cover">
        <div className="lesson-cover-kicker"><span>{course.title}</span><span>{kind.label}</span></div>
        <div className="lesson-cover-title" dangerouslySetInnerHTML={{ __html: renderInline(lesson.title) }} />
      </div>
    </div>
  );
}

export default function LessonCard({ course, topic, lesson, showCourse = false }) {
  const posted = isPosted(lesson);
  const kind = KINDS[lesson.kind] || KINDS.lesson;
  const graded = lesson.graded === true;
  const mats = lesson.materials || [];
  return (
    <article className={`lesson-card tone-${course.tone}${posted ? '' : ' is-soon'}`}>
      {lesson.file ? <LessonScreen src={lessonSrc(course, lesson)} title={lesson.title} />
        : posted ? <LessonCover course={course} lesson={lesson} kind={kind} />
        : <div className="lesson-screen"><div className="lesson-screen-off">Coming soon</div></div>}
      <div className="lesson-body">
        <div className="lesson-meta">
          {(showCourse || topic) && (
            <span className="lesson-cat">{showCourse && course.title}{topic && <span className="lesson-topic">{showCourse ? ' / ' : ''}{topic.title}</span>}</span>
          )}
          <span className="pill">{kind.label}</span>
          {lesson.minutes && <span className="pill">{lesson.minutes} min</span>}
          {graded && posted && <span className="pill graded">Graded</span>}
        </div>
        <h3>{posted ? <a href={lessonHref(course, lesson)} dangerouslySetInnerHTML={{ __html: renderInline(lesson.title) }} /> : lesson.title}</h3>
        <p dangerouslySetInnerHTML={{ __html: renderInline(lesson.description) }} />
        {mats.length > 0 && <div className="lesson-mats">{mats.map((m) => <span key={m.title}>{m.title}</span>)}</div>}
        <span className="lesson-go">{posted ? `${kind.verb} →` : 'Not posted yet'}</span>
      </div>
    </article>
  );
}
