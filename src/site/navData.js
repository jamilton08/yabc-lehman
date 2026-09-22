/**
 * The navbar. entry → a link OR a dropdown; group → a column; item → a link.
 * Add a group or item here and it appears in the menu; nothing else to wire.
 */
import { COURSES, countLessons, newestLessons, lessonHref } from './lessons.js';

const lessonsEntry = () => {
  const newest = newestLessons(4);
  return {
    label: 'Lessons',
    groups: [
      {
        label: 'Courses',
        href: '/lessons',
        search: { action: '/lessons', placeholder: 'Search lessons' },
        items: COURSES.map((c) => {
          const n = countLessons(c);
          return { label: c.title, tone: c.tone, sub: n ? `${n} lesson${n === 1 ? '' : 's'}` : 'coming soon', href: `/lessons/${c.slug}`, soon: n === 0 };
        }),
      },
      ...(newest.length ? [{
        label: 'Newest',
        items: newest.map(({ course, lesson }) => ({ label: lesson.title, sub: course.title, href: lessonHref(course, lesson) })),
      }] : []),
    ],
  };
};

export const NAV = [
  lessonsEntry(),
  ...COURSES.map((c) => ({ label: c.short, href: `/lessons/${c.slug}` })),
  { label: 'How it works', href: '/#how' },
  { label: 'About', href: '/#about' },
];
