import { skillGroups } from "../content/skills";
import { SectionHead, ExternalLink } from "../components/ui/ui";
import "./Stack.css";

export function Stack() {
  return (
    <section id="stack" className="section stack" aria-labelledby="stack-title">
      <div className="container">
        <SectionHead
          id="stack-title"
          eyebrow="02 — Stack"
          lede="The languages, frameworks and tools I use to take work from idea to production."
        >
          Tools of the <span className="serif accent">trade</span>.
        </SectionHead>

        <div className="stack__groups">
          {skillGroups.map((group, gi) => (
            <div className="stack__group" key={group.title} data-reveal style={{ "--i": gi }}>
              <h3 className="stack__title mono" id={`stack-${gi}`}>{group.title}</h3>
              <ul className="chips" role="list" aria-labelledby={`stack-${gi}`}>
                {group.items.map(({ name, Icon }) => (
                  <li className="chip" key={name}>
                    <Icon aria-hidden="true" focusable="false" className="chip__icon" />
                    <span>{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="stack__more" data-reveal>
          <ExternalLink href="https://github.com/swedr13">See my activity on GitHub</ExternalLink>
        </p>
      </div>
    </section>
  );
}
