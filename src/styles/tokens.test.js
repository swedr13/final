// @vitest-environment node
// WCAG AA contrast check for the design tokens, in both themes.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(fileURLToPath(new URL("./tokens.css", import.meta.url)), "utf8");

function block(selector) {
  const start = css.indexOf(selector);
  const open = css.indexOf("{", start);
  let depth = 1;
  let i = open + 1;
  while (depth && i < css.length) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  const body = css.slice(open + 1, i - 1);
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
}

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const dark = block(":root {");
const light = block(':root[data-theme="light"]');

describe.each([
  ["dark", dark],
  ["light", light],
])("%s theme", (_name, t) => {
  for (const bg of ["c-bg", "c-surface", "c-surface-2"]) {
    it(`body text ≥ 4.5:1 on ${bg}`, () => expect(ratio(t["c-text"], t[bg])).toBeGreaterThanOrEqual(4.5));
    it(`muted text ≥ 4.5:1 on ${bg}`, () => expect(ratio(t["c-text-muted"], t[bg])).toBeGreaterThanOrEqual(4.5));
    it(`accent text ≥ 4.5:1 on ${bg}`, () => expect(ratio(t["c-accent"], t[bg])).toBeGreaterThanOrEqual(4.5));
    it(`focus ring ≥ 3:1 on ${bg}`, () => expect(ratio(t["c-focus"], t[bg])).toBeGreaterThanOrEqual(3));
  }
  it("button label on accent ≥ 4.5:1", () => expect(ratio(t["c-accent-ink"], t["c-accent"])).toBeGreaterThanOrEqual(4.5));
});

it("light block matches the prefers-color-scheme fallback", () => {
  expect(block(":root:not([data-theme])")).toEqual(light);
});
