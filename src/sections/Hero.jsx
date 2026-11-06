import { profile } from "../content/profile";
import { Hero3D } from "../components/hero3d/Hero3D";
import { ButtonLink, VisuallyHidden } from "../components/ui/ui";
import { useMotionPause } from "../hooks/useMotionPause";
import "./Hero.css";

const pdfHref = `${import.meta.env.BASE_URL}${profile.resumePdf}`;

function MotionToggle() {
  const { paused, toggle } = useMotionPause();
  return (
    <button type="button" className="motion-toggle" onClick={toggle} aria-pressed={paused}>
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M4 2.5h2.8v11H4zM9.2 2.5H12v11H9.2z" />}
      </svg>
      <span>{paused ? "Play motion" : "Pause motion"}</span>
    </button>
  );
}

export function Hero() {
  const roles = profile.roles;
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">{profile.roles[0]} · {profile.location}</p>

          <h1 id="hero-title" className="hero__title">
            <span className="hero__name">{profile.name}</span>{" "}
            <span className="hero__tagline serif">{profile.tagline}</span>
          </h1>

          <p className="hero__roles">
            <VisuallyHidden>
              {profile.shortName} works as a {roles.slice(0, -1).join(", ")} and {roles[roles.length - 1]}.
            </VisuallyHidden>
            <span className="rotator" aria-hidden="true">
              <span className="rotator__prefix mono">{"// "}</span>
              <span className="rotator__window">
                <span className="rotator__track">
                  {[...roles, roles[0]].map((r, i) => (
                    <span key={i} className="rotator__item">{r}</span>
                  ))}
                </span>
              </span>
            </span>
          </p>

          <p className="hero__intro">{profile.intro}</p>

          <div className="hero__ctas">
            <ButtonLink href="#work">View work</ButtonLink>
            <ButtonLink href={pdfHref} variant="ghost" icon={false} download>
              Download CV <span className="hero__cta-meta">{profile.resumePdfSize}</span>
            </ButtonLink>
          </div>
        </div>

        <Hero3D />
      </div>
      <MotionToggle />
      <a className="hero__scroll" href="#about">
        <span className="hero__scroll-line" aria-hidden="true" />
        <span className="mono">Scroll</span>
        <VisuallyHidden> to the About section</VisuallyHidden>
      </a>
    </section>
  );
}
