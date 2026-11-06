import { useCallback, useSyncExternalStore } from "react";

// WCAG 2.2.2 Pause, Stop, Hide: a user-controlled pause for every looping animation
// (role rotator, orb poster, scroll cue, WebGL orb). State lives on <html class="motion-paused">;
// the <head> script restores a saved choice before first paint.
const listeners = new Set();
const CLASS = "motion-paused";

const read = () => document.documentElement.classList.contains(CLASS);
const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export function useMotionPause() {
  const paused = useSyncExternalStore(subscribe, read, () => false);
  const toggle = useCallback(() => {
    const next = !read();
    document.documentElement.classList.toggle(CLASS, next);
    try {
      if (next) localStorage.setItem("motion", "paused");
      else localStorage.removeItem("motion");
    } catch {
      /* storage blocked */
    }
    listeners.forEach((l) => l());
    window.dispatchEvent(new CustomEvent("motionchange", { detail: next }));
  }, []);
  return { paused, toggle };
}
