import { FaArrowRight } from "react-icons/fa";
import { socials } from "../../content/socials";
import "./ui.css";

export function VisuallyHidden({ children, as: Tag = "span" }) {
  return <Tag className="visually-hidden">{children}</Tag>;
}

export function Logo() {
  return (
    <span className="logo" aria-hidden="true">
      Js<span className="logo__dot">.</span>
    </span>
  );
}

/** Link styled as a button. External links get rel/target and screen-reader text. */
export function ButtonLink({ href, children, variant = "primary", external = false, icon = true, download, className = "", ...rest }) {
  const ext = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a className={`btn btn--${variant} ${className}`} href={href} download={download} {...ext} {...rest}>
      <span className="btn__label">{children}</span>
      {icon && <FaArrowRight className="btn__icon" aria-hidden="true" focusable="false" />}
      {external && <VisuallyHidden> (opens in new tab)</VisuallyHidden>}
    </a>
  );
}

export function ExternalLink({ href, children, className = "" }) {
  return (
    <a className={`ext-link ${className}`} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="ext-link__arrow" aria-hidden="true">↗</span>
      <VisuallyHidden> (opens in new tab)</VisuallyHidden>
    </a>
  );
}

export function SocialLinks({ className = "" }) {
  return (
    <ul className={`socials ${className}`} role="list">
      {socials.map(({ label, href, Icon }) => (
        <li key={label}>
          <a className="socials__link" href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} (opens in new tab)`}>
            <Icon aria-hidden="true" focusable="false" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function SectionHead({ id, eyebrow, children, lede }) {
  return (
    <div className="section__head" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{children}</h2>
      {lede && <p className="lede">{lede}</p>}
    </div>
  );
}
