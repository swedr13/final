// Injects the server-rendered app into dist/index.html at <!--app--> so the first
// HTML response contains every section (LCP = the hero <h1>, crawlers see content).
// Also inlines the small entry CSS file to save a render-blocking request.
import { readFile, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const ssrDir = join(root, "dist-ssr");

const { render } = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href);
const appHtml = await render();

const indexPath = join(dist, "index.html");
let html = await readFile(indexPath, "utf8");
if (!html.includes("<!--app-->")) throw new Error("dist/index.html is missing the <!--app--> marker");
html = html.replace("<!--app-->", appHtml);

// Inline the entry stylesheet when it is small (removes one render-blocking request).
const INLINE_LIMIT = 40 * 1024;
const cssLinks = [...html.matchAll(/<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g)];
for (const [tag, href] of cssLinks) {
  const base = href.replace(/^.*\/assets\//, "assets/");
  const css = await readFile(join(dist, base), "utf8");
  if (css.length <= INLINE_LIMIT) {
    html = html.replace(tag, `<style>${css}</style>`);
    console.log(`inlined ${base} (${css.length} B)`);
  } else {
    console.log(`kept ${base} external (${css.length} B)`);
  }
}

await writeFile(indexPath, html);
await rm(ssrDir, { recursive: true, force: true });
console.log(`prerendered ${appHtml.length} B of HTML into dist/index.html`);
