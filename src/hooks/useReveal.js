import { useEffect } from "react";

/**
 * Fallback for browsers without CSS scroll-driven animations (mainly Firefox).
 * Where `animation-timeline: view()` is supported the <head> script has already
 * added `sd-reveal` and CSS does all the work, so this hook does nothing.
 */
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (CSS.supports?.("animation-timeline: view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const els = document.querySelectorAll('[data-reveal]:not([data-reveal="sd"])');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    // Elements already on screen are revealed immediately so nothing blinks out.
    const vh = window.innerHeight;
    els.forEach((el) => {
      if (el.getBoundingClientRect().top < vh) el.classList.add("is-in");
      else io.observe(el);
    });
    root.classList.add("io-reveal");
    return () => io.disconnect();
  }, []);
}
