import { SocialLinks } from "../ui/ui";
import { ThemeToggle } from "./ThemeToggle";
import { profile } from "../../content/profile";
import "./Footer.css";

// __BUILD_YEAR__ is a build-time constant (vite.config.js), identical in the SSR and client bundles.
const YEAR = __BUILD_YEAR__;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p className="site-footer__copy">
          © {YEAR} {profile.name}
          <span className="site-footer__sep" aria-hidden="true">·</span>
          <span className="site-footer__built">Built with React + Vite</span>
        </p>
        <SocialLinks />
        <div className="site-footer__actions">
          <ThemeToggle />
          <a className="site-footer__top" href="#home">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
