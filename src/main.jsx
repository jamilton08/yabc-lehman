import { createRoot } from 'react-dom/client';
import Landing from './site/Landing.jsx';
import LessonsIndex from './site/LessonsIndex.jsx';
import CoursePage from './site/CoursePage.jsx';
import LessonPage from './site/LessonPage.jsx';
import VerifyPage from './site/VerifyPage.jsx';

// Tiny path router (public/_redirects makes the host serve index.html for
// every path, so this runs on direct visits too).
//   /                           the front page: intro, how it works, courses
//   /lessons                    the lessons directory + search
//   /lessons/verify             teacher: open students' encrypted result files
//   /lessons/<course>           one course: topics and lesson cards
//   /lessons/<course>/<lesson>  one lesson, with its materials in tabs
const path = window.location.pathname.replace(/\/+$/, '') || '/';
let Page = Landing;
let props = {};
let m;
if (path === '/lessons') Page = LessonsIndex;
else if (path === '/lessons/verify') Page = VerifyPage;
else if ((m = path.match(/^\/lessons\/([^/]+)$/))) { Page = CoursePage; props = { slug: m[1] }; }
else if ((m = path.match(/^\/lessons\/([^/]+)\/([^/]+)$/))) { Page = LessonPage; props = { course: m[1], lesson: m[2] }; }

createRoot(document.getElementById('root')).render(<Page {...props} />);
