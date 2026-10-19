/**
 * The three segments, in the order they draw. Each is 110° of the ring
 * (`.anim-esg-segment`'s dash, animations.css), turned to its place; the label rides an arc
 * laid along the segment's middle, inside the ring for Social and
 * Governance and outside it for Environment, which reads along the bottom.
 */
const SEGMENTS = [
  {
    key: 'social',
    label: 'SOCIAL',
    rotate: 160,
    arc: 'M 66.56 248.57 A 142 142 0 0 1 200 58',
    stroke: 'stroke-esg-social',
    ink: 'fill-esg-social-ink',
  },
  {
    key: 'governance',
    label: 'GOVERNANCE',
    rotate: -80,
    arc: 'M 224.65 60.16 A 142 142 0 0 1 322.97 271',
    stroke: 'stroke-esg-governance',
    ink: 'fill-esg-governance-ink',
  },
  {
    key: 'environment',
    label: 'ENVIRONMENT',
    rotate: 40,
    arc: 'M 63.17 279 A 158 158 0 0 0 321.03 301.56',
    stroke: 'stroke-esg-environment',
    ink: 'fill-esg-environment-ink',
  },
] as const;

/** One wheel per page, so the arcs' ids need no uniquifying. */
const arcId = (key: string): string => `esg-wheel-arc-${key}`;

/**
 * The ESG emblem — a ring in three segments, Social, Governance and
 * Environment, round a disc lettered ESG, inside a slowly turning dotted
 * orbit.
 *
 * Drawn to `Our Key ESG Metrics v2.dc.html`, which takes the wheel from
 * `ESG Animated Banner.dc.html` and restyles it for the black ground: the
 * centre disc goes from cyan to the page's near-black with a hairline, the
 * lettering to DIN in white, and the segment colours stay as they were. It
 * fills its box, which sizes it — see `--spacing-esg-wheel`.
 *
 * All motion is CSS (`anim-esg-*` in animations.css), so this needs no
 * client JavaScript, and all of it is gated on reduced motion there: a
 * visitor who has asked for less sees the finished emblem, still.
 *
 * One image to assistive technology: the name says what it shows, and the
 * lettering inside it is not read out a second time.
 *
 * Coordinates are the design's, in a 400 × 400 user space. Colours are
 * tokens, applied as `stroke-*`/`fill-*` utilities rather than attributes.
 */
export function EsgWheel() {
  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="ESG emblem: Environment, Social and Governance"
      className="block size-full overflow-visible"
    >
      <defs>
        {SEGMENTS.map((segment) => (
          <path key={segment.key} id={arcId(segment.key)} d={segment.arc} />
        ))}
      </defs>

      <circle
        className="anim-esg-orbit fill-none stroke-esg-orbit"
        cx="200"
        cy="200"
        r="192"
        strokeWidth="2"
        strokeDasharray="2 10"
        strokeLinecap="round"
      />
      <circle className="fill-none stroke-esg-track" cx="200" cy="200" r="122" strokeWidth="16" />

      {SEGMENTS.map((segment, index) => (
        <circle
          key={segment.key}
          className={`anim-esg-segment anim-esg-segment-${String(index + 1)} fill-none ${segment.stroke}`}
          cx="200"
          cy="200"
          r="150"
          strokeWidth="60"
          transform={`rotate(${String(segment.rotate)} 200 200)`}
        />
      ))}

      <g className="font-sans" fontWeight="700" fontSize="21" letterSpacing="2.5">
        {SEGMENTS.map((segment, index) => (
          <text
            key={segment.key}
            className={`anim-esg-label anim-esg-label-${String(index + 1)} ${segment.ink}`}
          >
            <textPath href={`#${arcId(segment.key)}`} startOffset="50%" textAnchor="middle">
              {segment.label}
            </textPath>
          </text>
        ))}
      </g>

      <g className="anim-esg-core">
        <circle
          className="fill-esg-core stroke-outline-dark"
          cx="200"
          cy="200"
          r="112"
          strokeWidth="1"
        />
        <text
          className="fill-white font-sans"
          x="200"
          y="226"
          textAnchor="middle"
          fontSize="78"
          letterSpacing="2"
        >
          ESG
        </text>
      </g>
    </svg>
  );
}
