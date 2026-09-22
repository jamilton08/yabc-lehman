import YabcMark from './YabcMark.jsx';

export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <YabcMark size={44} words={false} />
      <div>
        <strong>Mr. Cruz · The Lehman YABC</strong>
        <span>Math · Computer Science · Financial Literacy — Young Adult Borough Center at Lehman High School, Bronx, NY</span>
      </div>
      <nav aria-label="Footer">
        <a href="/lessons">Lessons</a>
        <a href="/lessons/verify">Teacher</a>
        <a href="#top">Back to top</a>
      </nav>
    </footer>
  );
}
