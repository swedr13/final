// Copies the latin subsets of the self-hosted fonts into public/fonts so they can be
// preloaded with stable URLs (no third-party font requests at runtime).
import { fileURLToPath } from "node:url";
import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const nm = join(root, "node_modules");
const dest = join(root, "public/fonts");
await mkdir(dest, { recursive: true });

const files = [
  [join(nm, "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"), "inter-var-latin.woff2"],
  [join(nm, "@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2"), "instrument-serif-italic-latin.woff2"],
];
for (const [from, to] of files) {
  await copyFile(from, join(dest, to));
  console.log(`fonts/${to}`);
}
