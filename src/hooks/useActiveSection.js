import { useEffect, useState } from "react";

/** Returns the id of the section currently in the reading band (null on the server). */
export function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  const key = ids.join(",");

  useEffect(() => {
    const els = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    if (!els.length || !("IntersectionObserver" in window)) return;
    // Track every section's state: one batch can contain several entries during fast scrolls,
    // so "last entry wins" would be wrong. The first section (in page order) in the band wins.
    const inBand = new Set();
    const order = els.map((el) => el.id);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id);
          else inBand.delete(e.target.id);
        }
        const next = order.find((id) => inBand.has(id));
        if (next) setActive(next);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return active;
}
