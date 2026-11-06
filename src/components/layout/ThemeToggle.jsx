import { useTheme } from "../../hooks/useTheme";

const LABEL = { system: "System", light: "Light", dark: "Dark" };

export function ThemeToggle({ className = "" }) {
  const { mode, cycle, next } = useTheme();
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      data-mode={mode}
      onClick={cycle}
      aria-label={`Theme: ${LABEL[mode]}. Switch to ${LABEL[next]}`}
      title={`Theme: ${LABEL[mode]}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="theme-toggle__icon">
        {/* Sun (light) */}
        <g className="ti-sun">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
        </g>
        {/* Moon (dark) */}
        <path className="ti-moon" d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z" />
        {/* Monitor (system) */}
        <g className="ti-system">
          <rect x="3" y="4.5" width="18" height="12" rx="2" />
          <path d="M8.5 20h7M12 16.5V20" />
        </g>
      </svg>
    </button>
  );
}
