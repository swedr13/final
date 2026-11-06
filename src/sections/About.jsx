import { useEffect, useRef } from "react";
import { profile } from "../content/profile";
import { Picture } from "../components/ui/Picture";
import { SectionHead, SocialLinks } from "../components/ui/ui";
import "./About.css";

/** Subtle 3D tilt for the portrait. Fine pointers only, off under reduced motion. */
function useTilt(ref, max = 6) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let pending = null;
    const apply = () => {
      raf = 0;
      if (!pending) return;
      el.style.setProperty("--rx", `${pending.rx}deg`);
      el.style.setProperty("--ry", `${pending.ry}deg`);
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      pending = { rx: (-y * max).toFixed(2), ry: (x * max).toFixed(2) };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      pending = { rx: 0, ry: 0 };
      if (!raf) raf = requestAnimationFrame(apply);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, max]);
}

export function About() {
  const tiltRef = useRef(null);
  useTilt(tiltRef);
  const words = profile.quote.split(" ");

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__media" data-reveal>
          <div className="about__frame" ref={tiltRef}>
            <Picture
              name="avatar"
              alt={`Portrait of ${profile.name}`}
              sizes="(min-width: 64rem) 22rem, (min-width: 48rem) 40vw, 70vw"
              className="about__photo"
            />
          </div>
        </div>

        <div className="about__body">
          <SectionHead id="about-title" eyebrow="01 — About">
            Interfaces that look great and <span className="serif accent">work smoothly</span>.
          </SectionHead>

          {profile.bio.map((p, i) => (
            <p className="about__bio" key={i} data-reveal style={{ "--i": i }}>
              {p}
            </p>
          ))}

          <blockquote className="quote" data-reveal>
            <p className="serif">
              “{words.map((w, i) => (
                <span className="quote__word" key={i}>
                  {w}
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}”
            </p>
            <p className="mono quote__cite">— {profile.name}</p>
          </blockquote>

          <dl className="facts" data-reveal>
            {profile.facts.map((f) => (
              <div className="facts__item" key={f.label}>
                <dt className="mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          <div className="about__social" data-reveal>
            <p className="mono">Find me on</p>
            <SocialLinks />
          </div>
        </div>
      </div>
    </section>
  );
}
