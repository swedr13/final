// @vitest-environment node
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import App from "./App";

describe("pre-render safety", () => {
  it("renders the whole page in Node without touching browser globals", () => {
    expect(typeof window).toBe("undefined");
    const html = renderToString(<App />);
    expect(html).toContain("Junelle Suaybaguio");
    for (const id of ["home", "about", "stack", "work", "resume", "contact"]) expect(html).toContain(`id="${id}"`);
  });

  it("never puts the email address in plain text or a mailto: link", () => {
    const html = renderToString(<App />);
    expect(html).not.toMatch(/mailto:/);
    expect(html).not.toMatch(/junelleXIII@gmail\.com/i);
  });
});
