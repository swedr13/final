import { useEffect, useRef, useState } from "react";
import { NAV } from "./nav";
import { SocialLinks } from "../ui/ui";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Mobile navigation as a native modal <dialog>: the browser makes the page inert,
 * contains Tab focus and closes on Escape. Transitions are CSS-only (@starting-style).
 */
export function MobileMenu({ active }) {
  const dialogRef = useRef(null);
  const toggleRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setOpen(false);
      window.dispatchEvent(new CustomEvent("menutoggle", { detail: false }));
      // Safeguard for engines that don't restore focus to the opener.
      if (!dialog.contains(document.activeElement)) toggleRef.current?.focus({ preventScroll: true });
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  // Close if the viewport grows past the mobile breakpoint while open.
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 48rem)");
    const onChange = (e) => e.matches && dialogRef.current?.open && dialogRef.current.close();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setOpen(true);
    window.dispatchEvent(new CustomEvent("menutoggle", { detail: true }));
    dialog.querySelector("a")?.focus();
  };
  const closeMenu = () => dialogRef.current?.close();

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={open ? closeMenu : openMenu}
      >
        <span /><span /><span />
      </button>

      {/* Backdrop click-to-close is a pointer convenience; Escape and the Close button are the keyboard paths. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        id="mobile-menu"
        ref={dialogRef}
        className="mobile-menu"
        aria-label="Site menu"
        onClick={(e) => {
          // Clicking the ::backdrop targets the dialog element itself.
          if (e.target === e.currentTarget) closeMenu();
        }}
      >
        <div className="mobile-menu__panel">
          <div className="mobile-menu__top">
            <span className="mono">Menu</span>
            <button type="button" className="menu-toggle is-open" aria-label="Close menu" onClick={closeMenu}>
              <span /><span /><span />
            </button>
          </div>
          <nav aria-label="Mobile">
            <ul className="mobile-menu__list" role="list">
              {[{ id: "home", label: "Home" }, ...NAV].map(({ id, label }, i) => (
                <li key={id} style={{ "--i": i }}>
                  <a href={`#${id}`} onClick={closeMenu} aria-current={active === id ? "true" : undefined}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mobile-menu__foot">
            <SocialLinks />
            <ThemeToggle />
          </div>
        </div>
      </dialog>
    </>
  );
}
