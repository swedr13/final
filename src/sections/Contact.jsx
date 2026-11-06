import { useEffect, useRef, useState } from "react";
import { FaRegCopy, FaCheck } from "react-icons/fa";
import { profile, emailAddress } from "../content/profile";
import { OrbPoster } from "../components/hero3d/OrbPoster";
import { SocialLinks } from "../components/ui/ui";
import "./Contact.css";

export function Contact() {
  // The address is assembled only after hydration, so it is never a plain mailto: in the HTML.
  const [email, setEmail] = useState(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef(0);

  useEffect(() => {
    setEmail(emailAddress());
    return () => clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    const addr = emailAddress();
    let ok = false;
    try {
      await window.navigator.clipboard.writeText(addr);
      ok = true;
    } catch {
      ok = false;
    }
    setCopied(ok);
    setToast(ok ? "Email address copied to clipboard" : `Couldn't copy — the address is ${addr}`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      setToast("");
    }, 1600);
  };

  const obfuscated = `${profile.email.user} [at] ${profile.email.domain.replace(".", " [dot] ")}`;

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <OrbPoster id="contact-orb" className="contact__orb" />
      <div className="container contact__inner">
        <p className="eyebrow" data-reveal>05 — Contact</p>
        <h2 id="contact-title" className="contact__title">
          Let's build something <span className="serif accent">beautiful</span> together.
        </h2>
        <p className="lede contact__lede" data-reveal>
          Open to full-time roles, freelance projects and collaborations. The fastest way to reach me is email.
        </p>

        <div className="contact__actions" data-reveal>
          {email ? (
            <a className="btn btn--primary contact__email" href={`mailto:${email}`}>
              <span className="btn__label">{email}</span>
            </a>
          ) : (
            <span className="btn btn--primary contact__email" data-user={profile.email.user} data-domain={profile.email.domain}>
              <span className="btn__label">{obfuscated}</span>
            </span>
          )}
          <button type="button" className="btn btn--ghost" onClick={copy} disabled={!email} aria-describedby="copy-status">
            {copied ? (
              <FaCheck className="btn__icon" aria-hidden="true" focusable="false" />
            ) : (
              <FaRegCopy className="btn__icon" aria-hidden="true" focusable="false" />
            )}
            <span className="btn__label">{copied ? "Copied" : "Copy email"}</span>
          </button>
        </div>

        <div className="contact__social" data-reveal>
          <SocialLinks />
          <p className="mono contact__where">Based in {profile.location} · GMT+8</p>
        </div>
      </div>

      <div className="toast-region" role="status" aria-live="polite" id="copy-status">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </section>
  );
}
