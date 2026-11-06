import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { projects, categories } from "../content/projects";
import { SectionHead } from "../components/ui/ui";
import { ProjectCard } from "./ProjectCard";
import "./Work.css";

const counts = Object.fromEntries(
  categories.map((c) => [c.id, c.id === "all" ? projects.length : projects.filter((p) => p.category === c.id).length]),
);
const isValid = (v) => categories.some((c) => c.id === v);

function ProjectFilter({ value, onChange }) {
  const refs = useRef([]);
  const onKeyDown = (e) => {
    const i = categories.findIndex((c) => c.id === value);
    let next = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % categories.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + categories.length) % categories.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = categories.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(categories[next].id);
    refs.current[next]?.focus();
  };
  return (
    // Roving tabindex: the checked radio is the single tab stop, so the group itself is not focusable.
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div className="filter" role="radiogroup" aria-label="Filter projects by type" onKeyDown={onKeyDown}>
      {categories.map((c, i) => {
        const checked = c.id === value;
        return (
          <button
            key={c.id}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className="filter__opt"
            onClick={() => onChange(c.id)}
          >
            {c.label}
            <span className="filter__count mono" aria-hidden="true">{counts[c.id]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Work() {
  // Always "all" on the server and on first client render; ?f= is applied after hydration.
  const [filter, setFilter] = useState("all");
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    const f = new URLSearchParams(window.location.search).get("f");
    if (f && isValid(f) && f !== "all") setFilter(f);
  }, []);

  const change = (v) => {
    if (v === filter) return;
    const update = () => flushSync(() => setFilter(v));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduce) document.startViewTransition(update);
    else update();

    const url = new URL(window.location.href);
    if (v === "all") url.searchParams.delete("f");
    else url.searchParams.set("f", v);
    window.history.replaceState(null, "", url);

    const label = categories.find((c) => c.id === v).label.toLowerCase();
    setAnnounce(`Showing ${counts[v]} ${v === "all" ? "" : `${label} `}projects`.replace(/\s+/g, " "));
  };

  const shown = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <section id="work" className="section work" aria-labelledby="work-title">
      <div className="container">
        <SectionHead
          id="work-title"
          eyebrow="03 — Selected work"
          lede="Production systems, client websites and mobile apps — from water-district operations to regenerative-medicine marketing."
        >
          Things I've <span className="serif accent">shipped</span>.
        </SectionHead>

        <div className="work__bar">
          <ProjectFilter value={filter} onChange={change} />
          <p className="work__count mono" aria-hidden="true">
            {String(shown.length).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </p>
        </div>
        <p className="visually-hidden" aria-live="polite">{announce}</p>

        <ul className="work__grid" role="list">
          {shown.map((p, i) => (
            <li key={p.slug} className={`work__cell${p.featured ? " is-featured" : ""}`} style={{ viewTransitionName: `card-${p.slug}` }}>
              <ProjectCard project={p} index={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
