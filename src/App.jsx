import { useEffect } from "react";
import "./styles/index.css";
import "./components/ui/ui.css";
import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Stack } from "./sections/Stack";
import { Work } from "./sections/Work";
import { Resume } from "./sections/Resume";
import { Contact } from "./sections/Contact";
import { useReveal } from "./hooks/useReveal";

/**
 * Sections use content-visibility:auto for faster first render. Before any in-page jump,
 * switch it off so the scroll target is computed from real heights, not placeholders.
 */
function useSettleBeforeJump() {
  useEffect(() => {
    const settle = (e) => {
      if (e.target.closest?.('a[href^="#"]')) document.documentElement.classList.add("cv-settled");
    };
    const onHash = () => document.documentElement.classList.add("cv-settled");
    document.addEventListener("click", settle, true);
    window.addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("click", settle, true);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);
}

export default function App() {
  useReveal();
  useSettleBeforeJump();
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="ambient" aria-hidden="true" />
      <div className="progress" aria-hidden="true" />
      <div id="top-sentinel" aria-hidden="true" style={{ position: "absolute", top: 0, height: 8, width: 1 }} />
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Stack />
        <Work />
        <Resume />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
