import React from "react";

// "Js." logo as inline SVG. The fill follows the --imp-text-color CSS variable,
// so it changes automatically when the theme changes.
function Logo({ height = 36, ...props }) {
  return (
    <svg
      viewBox="0 0 120 60"
      height={height}
      role="img"
      aria-label="Js."
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text
        x="0"
        y="50"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="60"
        fill="var(--imp-text-color)"
      >
        Js.
      </text>
    </svg>
  );
}

export default Logo;
