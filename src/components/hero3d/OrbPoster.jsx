/**
 * Static stand-in for the WebGL orb: the first-paint visual, and the permanent
 * visual for reduced motion, Save-Data, ?no3d, no WebGL, or a slow device.
 * Coloured with theme tokens, so it follows light/dark with no JS.
 */
export function OrbPoster({ id = "orb", className = "" }) {
  const g = `${id}-g`;
  const rim = `${id}-rim`;
  const glow = `${id}-glow`;
  return (
    <svg className={`orb-poster ${className}`} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0.55" style={{ stopColor: "var(--c-accent)", stopOpacity: 0.28 }} />
          <stop offset="1" style={{ stopColor: "var(--c-accent)", stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={g} cx="38%" cy="32%" r="72%">
          <stop offset="0" style={{ stopColor: "var(--c-accent)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--c-accent-2)" }} />
          <stop offset="1" style={{ stopColor: "var(--c-bg)" }} />
        </radialGradient>
        <radialGradient id={rim} cx="50%" cy="50%" r="50%">
          <stop offset="0.82" style={{ stopColor: "var(--c-focus)", stopOpacity: 0 }} />
          <stop offset="0.97" style={{ stopColor: "var(--c-focus)", stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: "var(--c-focus)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="200" fill={`url(#${glow})`} />
      <circle cx="200" cy="200" r="128" fill={`url(#${g})`} />
      <circle cx="200" cy="200" r="128" fill={`url(#${rim})`} />
      <g style={{ fill: "var(--c-text-muted)" }} opacity="0.55">
        <circle cx="64" cy="140" r="1.6" />
        <circle cx="92" cy="292" r="1.2" />
        <circle cx="330" cy="96" r="1.8" />
        <circle cx="352" cy="250" r="1.2" />
        <circle cx="286" cy="352" r="1.5" />
        <circle cx="140" cy="54" r="1.1" />
        <circle cx="46" cy="214" r="1" />
        <circle cx="244" cy="38" r="1.3" />
      </g>
      <ellipse cx="200" cy="200" rx="176" ry="58" fill="none" style={{ stroke: "var(--c-border-strong)" }} transform="rotate(-18 200 200)" />
    </svg>
  );
}
