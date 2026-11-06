import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import App from "./App";
import { projects } from "./content/projects";

beforeAll(() => {
  // jsdom lacks these browser APIs.
  window.matchMedia ??= (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });
  window.IntersectionObserver ??= class { observe() {} unobserve() {} disconnect() {} };
  window.ResizeObserver ??= class { observe() {} disconnect() {} };
  window.HTMLDialogElement.prototype.showModal ??= function () { this.open = true; };
  window.HTMLDialogElement.prototype.close ??= function () { this.open = false; this.dispatchEvent(new Event("close")); };
});

afterEach(cleanup);

describe("App", () => {
  it("renders exactly one h1 with the owner's name", () => {
    render(<App />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toMatch(/Junelle Suaybaguio/);
  });

  it("has the landmark structure and a skip link", () => {
    render(<App />);
    expect(screen.getByRole("banner")).toBeTruthy();
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByRole("contentinfo")).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Skip to content" }).getAttribute("href")).toBe("#main");
  });

  it("renders every project and a working filter radiogroup", () => {
    render(<App />);
    const work = document.getElementById("work");
    expect(within(work).getAllByRole("article")).toHaveLength(projects.length);
    const group = within(work).getByRole("radiogroup");
    const radios = within(group).getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["true", "false", "false"]);
    radios[2].click();
    const mobile = projects.filter((p) => p.category === "mobile").length;
    expect(within(work).getAllByRole("article")).toHaveLength(mobile);
  });

  it("labels every icon-only link and opens external links safely", () => {
    render(<App />);
    for (const a of document.querySelectorAll('a[target="_blank"]')) {
      expect(a.getAttribute("rel")).toContain("noopener");
      expect(a.textContent.trim() || a.getAttribute("aria-label")).toBeTruthy();
    }
  });

  it("gives every image alt text", () => {
    render(<App />);
    for (const img of document.querySelectorAll("img")) expect(img.getAttribute("alt")).toBeTruthy();
  });
});
