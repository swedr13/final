import { useCallback, useEffect, useSyncExternalStore } from "react";

// Theme modes: "system" (follow the OS), "light", "dark".
// The <head> bootstrap script in index.html applies a stored choice before first paint.
const listeners = new Set();
const KEY = "theme";
const ORDER = ["system", "light", "dark"];

function read() {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

function subscribe(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function resolvedTheme() {
  const t = read();
  if (t !== "system") return t;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function syncThemeColor() {
  const color = resolvedTheme() === "light" ? "#faf9fc" : "#0b0a12";
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", color));
}

function apply(mode) {
  const root = document.documentElement;
  if (mode === "system") delete root.dataset.theme;
  else root.dataset.theme = mode;
  try {
    if (mode === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, mode);
  } catch {
    /* storage unavailable (private mode) — the choice lasts for this page view */
  }
  syncThemeColor();
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent("themechange", { detail: resolvedTheme() }));
}

export function setTheme(mode) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (document.startViewTransition && !reduce) {
    document.startViewTransition(() => apply(mode));
  } else {
    apply(mode);
  }
}

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, read, () => "system");

  // While on "system", follow OS changes live (and keep the 3D colours in sync).
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (read() !== "system") return;
      syncThemeColor();
      listeners.forEach((l) => l());
      window.dispatchEvent(new CustomEvent("themechange", { detail: resolvedTheme() }));
    };
    syncThemeColor();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const cycle = useCallback(() => {
    setTheme(ORDER[(ORDER.indexOf(read()) + 1) % ORDER.length]);
  }, []);

  return { mode, cycle, next: ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length] };
}
