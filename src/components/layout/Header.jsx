import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NAV } from "./nav";
import { useActiveSection } from "../../hooks/useActiveSection";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";
import { Logo, VisuallyHidden } from "../ui/ui";
import { profile } from "../../content/profile";
import "./Header.css";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
// "home" is tracked too, so no link stays highlighted after scrolling back to the hero.
const SECTION_IDS = ["home", ...NAV.map((n) => n.id)];

export function Header() {
  // "top" (transparent) → "solid" (scrolled, still over the hero; no blur over WebGL) → "glass" (past the hero).
  const [state, setState] = useState("top");
  const active = useActiveSection(SECTION_IDS);
  const listRef = useRef(null);
  const [indicator, setIndicator] = useState(null);

  useEffect(() => {
    const sentinel = document.getElementById("top-sentinel");
    const hero = document.getElementById("home");
    if (!sentinel || !hero || !("IntersectionObserver" in window)) return;
    let atTop = true;
    let heroVisible = true;
    const update = () => setState(atTop ? "top" : heroVisible ? "solid" : "glass");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === sentinel) atTop = e.isIntersecting;
        if (e.target === hero) heroVisible = e.isIntersecting;
      }
      update();
    }, { rootMargin: "-64px 0px 0px 0px" });
    io.observe(sentinel);
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  // Single underline that glides to the active link.
  useIsoLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !active) {
      setIndicator(null);
      return;
    }
    const measure = () => {
      const link = list.querySelector(`a[href="#${active}"]`);
      if (!link) return;
      setIndicator({ x: link.offsetLeft, w: link.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [active]);

  return (
    <header className="site-header" data-state={state}>
      <div className="site-header__inner container">
        <a className="site-header__brand" href="#home">
          <Logo />
          <VisuallyHidden>{profile.name}, back to top</VisuallyHidden>
        </a>

        <nav className="site-nav" aria-label="Primary">
          <ul className="site-nav__list" role="list" ref={listRef}>
            {NAV.map(({ id, label }) => (
              <li key={id}>
                <a className="site-nav__link" href={`#${id}`} aria-current={active === id ? "true" : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <span
            className="site-nav__indicator"
            aria-hidden="true"
            style={indicator ? { "--x": `${indicator.x}px`, "--w": `${indicator.w}px`, opacity: 1 } : undefined}
          />
        </nav>

        <div className="site-header__actions">
          <ThemeToggle />
          <a className="site-header__gh" href={profile.siteRepo} target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
            <VisuallyHidden> (source of this site, opens in new tab)</VisuallyHidden>
          </a>
          <MobileMenu active={active} />
        </div>
      </div>
    </header>
  );
}
