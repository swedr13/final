import { useRef } from "react";
import { Picture } from "../components/ui/Picture";
import { VisuallyHidden } from "../components/ui/ui";

/** Cursor-following spotlight, rAF-coalesced, fine pointers only (CSS gates the visual). */
function useSpotlight() {
  const ref = useRef(null);
  const raf = useRef(0);
  const onPointerMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el || raf.current) return;
    const { clientX, clientY } = e;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - r.left}px`);
      el.style.setProperty("--my", `${clientY - r.top}px`);
    });
  };
  return { ref, onPointerMove };
}

export function ProjectCard({ project, index }) {
  const { title, summary, tags, image, links, category } = project;
  const primary = links.demo || links.repo;
  const spot = useSpotlight();
  const titleId = `p-${project.slug}`;

  return (
    <article className="card" ref={spot.ref} onPointerMove={spot.onPointerMove} aria-labelledby={titleId} data-reveal="sd" style={{ "--i": index % 3 }}>
      <Picture
        name={image}
        alt={`${title} ${category === "mobile" ? "app" : "website"} screenshot`}
        sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
        className="card__media"
      />
      <div className="card__body">
        <div className="card__meta mono">
          <span>{category === "mobile" ? "Mobile" : "Web"}</span>
          {!primary && <span className="card__badge">Private / internal</span>}
        </div>
        <h3 className="card__title" id={titleId}>
          {primary ? (
            <a className="card__link" href={primary} target="_blank" rel="noopener noreferrer">
              {title}
              <VisuallyHidden> (opens in new tab)</VisuallyHidden>
            </a>
          ) : (
            title
          )}
        </h3>
        <p className="card__summary">{summary}</p>
        <ul className="card__tags mono" role="list" aria-label="Technologies">
          {tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        {(links.demo || links.repo) && (
          <div className="card__actions">
            {links.demo && (
              <a className="card__action" href={links.demo} target="_blank" rel="noopener noreferrer">
                Live site <span aria-hidden="true">↗</span>
                <VisuallyHidden> for {title} (opens in new tab)</VisuallyHidden>
              </a>
            )}
            {links.repo && (
              <a className="card__action" href={links.repo} target="_blank" rel="noopener noreferrer">
                Code <span aria-hidden="true">↗</span>
                <VisuallyHidden> for {title} on GitHub (opens in new tab)</VisuallyHidden>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
