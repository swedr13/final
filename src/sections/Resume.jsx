import { experience, education } from "../content/resume";
import { profile } from "../content/profile";
import { SectionHead, ButtonLink } from "../components/ui/ui";
import { FaDownload } from "react-icons/fa";
import "./Resume.css";

const pdfHref = `${import.meta.env.BASE_URL}${profile.resumePdf}`;

export function Resume() {
  return (
    <section id="resume" className="section resume" aria-labelledby="resume-title">
      <div className="container resume__grid">
        <div className="resume__aside">
          <SectionHead
            id="resume-title"
            eyebrow="04 — Résumé"
            lede="Six roles since 2019, from keeping an office online to building production systems for a public utility."
          >
            Experience, <span className="serif accent">in order</span>.
          </SectionHead>
          <div className="resume__actions" data-reveal>
            <a className="btn btn--primary" href={pdfHref} download>
              <FaDownload className="btn__icon" aria-hidden="true" focusable="false" />
              <span className="btn__label">Download CV</span>
              <span className="hero__cta-meta resume__meta">{profile.resumePdfSize}</span>
            </a>
            <ButtonLink href={pdfHref} variant="ghost" external>
              Open PDF
            </ButtonLink>
          </div>
        </div>

        <div className="resume__main">
          <ol className="timeline" role="list">
            {experience.map((job, i) => (
              <li className="timeline__item" key={`${job.org}-${job.period}`} data-reveal style={{ "--i": i % 2 }}>
                <div className="timeline__head">
                  <h3 className="timeline__role">{job.role}</h3>
                  <p className="timeline__period mono">{job.period}</p>
                </div>
                <p className="timeline__org">{job.org}</p>
                <ul className="timeline__points">
                  {job.points.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <h3 className="resume__subhead mono" data-reveal>Education</h3>
          <ul className="edu" role="list">
            {education.map((e) => (
              <li className="edu__item" key={e.school} data-reveal>
                <div>
                  <p className="edu__school">{e.school}</p>
                  <p className="edu__detail">{e.detail}</p>
                </div>
                <p className="mono edu__period">{e.period}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
