/**
 * The Lehman YABC mark, redrawn as inline SVG so it stays crisp at any
 * size and takes the current text color. Four nested diamonds — Y, A, B,
 * C — with the four values along the outer edges.
 *
 *   <YabcMark size={220} />          full mark with the words
 *   <YabcMark size={36} words={false} />   just the diamonds (nav, footer)
 */
const CELLS = [
  { x: 138, y: 138, letter: 'Y' }, // rotates to the top
  { x: 262, y: 138, letter: 'B' }, // right
  { x: 138, y: 262, letter: 'A' }, // left
  { x: 262, y: 262, letter: 'C' }, // bottom
];
// where each cell's centre lands after the 45° turn (for upright letters)
const LETTER_AT = { Y: [200, 112.3], B: [287.7, 200], A: [112.3, 200], C: [200, 287.7] };

function Cell({ x, y }) {
  const sq = (s, fill) => <rect x={x - s / 2} y={y - s / 2} width={s} height={s} fill={fill} />;
  return (
    <g>
      {sq(112, 'currentColor')}
      {sq(92, 'var(--mark-band, #3a3a3a)')}
      {sq(72, 'currentColor')}
      {sq(50, 'var(--mark-paper, #f4f3ef)')}
    </g>
  );
}

export default function YabcMark({ size = 200, words = true, className = '', title = 'The Lehman YABC' }) {
  const vb = words ? '0 0 400 400' : '28 28 344 344';
  return (
    <svg className={`yabc-mark ${className}`} width={size} height={size} viewBox={vb} role="img" aria-label={title}>
      <g transform="rotate(45 200 200)">
        {CELLS.map((c) => <Cell key={c.letter} x={c.x} y={c.y} />)}
        <rect x="195" y="195" width="10" height="10" fill="currentColor" />
      </g>
      <g fontFamily="Archivo, 'Archivo Black', 'Arial Black', sans-serif" fontWeight="700" fontSize="34" textAnchor="middle" fill="currentColor">
        {Object.entries(LETTER_AT).map(([l, [x, y]]) => <text key={l} x={x} y={y + 12}>{l}</text>)}
      </g>
      {words && (
        <g fontFamily="Archivo, Inter, system-ui, sans-serif" fontWeight="600" fontSize="17" letterSpacing="1.4" textAnchor="middle" fill="currentColor">
          <text transform="translate(96 96) rotate(-45)">TRUST</text>
          <text transform="translate(304 96) rotate(45)">RESPECT</text>
          <text transform="translate(96 304) rotate(45)">HONESTY</text>
          <text transform="translate(304 304) rotate(-45)">RESPONSIBILITY</text>
        </g>
      )}
    </svg>
  );
}
