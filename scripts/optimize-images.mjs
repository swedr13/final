// One-off image pipeline. Run with `npm run assets` whenever a source image changes.
// Sources:  src/assets/avatar.png, src/assets/projects/*.png, public/favicon.svg
// Outputs:  src/assets/img/*.{avif,webp} + src/assets/img/manifest.json (sizes + LQIP),
//           public/og-image.png, public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { readdir, mkdir, writeFile, readFile } from "node:fs/promises";
import { join, parse } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const src = join(root, "src/assets");
const out = join(src, "img");
await mkdir(out, { recursive: true });

const jobs = [
  { file: join(src, "avatar.png"), name: "avatar", widths: [320, 480, 640], ratio: null, avif: 50, webp: 72 },
];
for (const f of await readdir(join(src, "projects"))) {
  if (!f.endsWith(".png")) continue;
  jobs.push({ file: join(src, "projects", f), name: parse(f).name, widths: [480, 800, 1200], ratio: 16 / 10, avif: 48, webp: 70 });
}

const manifest = {};
for (const job of jobs) {
  const meta = await sharp(job.file).metadata();
  // Project screenshots are cropped from the top to a 16:10 frame so every card is identical.
  const pipeline = () => {
    const s = sharp(job.file);
    if (!job.ratio) return s;
    const h = Math.min(meta.height, Math.round(meta.width / job.ratio));
    return s.extract({ left: 0, top: 0, width: meta.width, height: h });
  };
  const baseH = job.ratio ? Math.min(meta.height, Math.round(meta.width / job.ratio)) : meta.height;
  const widths = job.widths.filter((w) => w <= meta.width);
  if (!widths.length) widths.push(meta.width);
  for (const w of widths) {
    await pipeline().resize({ width: w }).avif({ quality: job.avif, effort: 6 }).toFile(join(out, `${job.name}-${w}.avif`));
    await pipeline().resize({ width: w }).webp({ quality: job.webp }).toFile(join(out, `${job.name}-${w}.webp`));
  }
  const lqip = await pipeline().resize({ width: 24 }).blur(1.2).webp({ quality: 40 }).toBuffer();
  manifest[job.name] = {
    width: meta.width,
    height: baseH,
    widths,
    lqip: `data:image/webp;base64,${lqip.toString("base64")}`,
  };
  console.log(`${job.name}: ${widths.join("/")}w, lqip ${lqip.length} B`);
}
await writeFile(join(out, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

// Icons from the SVG logo on a solid tile.
const pub = join(root, "public");
const logo = await readFile(join(pub, "favicon.svg"));
async function icon(size, file, pad = 0.18) {
  const inner = Math.round(size * (1 - pad * 2));
  const mark = await sharp(logo, { density: 600 }).resize({ width: inner }).png().toBuffer();
  const m = await sharp(mark).metadata();
  await sharp({ create: { width: size, height: size, channels: 4, background: "#0b0a12" } })
    .composite([{ input: mark, left: Math.round((size - m.width) / 2), top: Math.round((size - m.height) / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(join(pub, file));
}
await icon(192, "icon-192.png");
await icon(512, "icon-512.png");
await icon(180, "apple-touch-icon.png", 0.14);

// Open Graph card (1200x630).
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g" cx="78%" cy="40%" r="55%">
      <stop offset="0" stop-color="#c770f0" stop-opacity=".9"/>
      <stop offset=".45" stop-color="#5b4bdb" stop-opacity=".45"/>
      <stop offset="1" stop-color="#0b0a12" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b0a12"/>
  <circle cx="930" cy="260" r="300" fill="url(#g)"/>
  <circle cx="930" cy="260" r="170" fill="none" stroke="#f0c1ff" stroke-opacity=".35" stroke-width="2"/>
  <text x="80" y="200" font-family="Consolas, monospace" font-size="28" fill="#a9a6b8">// Full-Stack Developer · Davao City, PH</text>
  <text x="80" y="330" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="700" font-size="96" fill="#ecebf2">Junelle</text>
  <text x="80" y="440" font-family="Inter, Segoe UI, Arial, sans-serif" font-weight="700" font-size="96" fill="#ecebf2">Suaybaguio</text>
  <text x="80" y="530" font-family="Georgia, serif" font-style="italic" font-size="44" fill="#c770f0">brings designs to life.</text>
</svg>`;
await sharp(Buffer.from(og)).png({ compressionLevel: 9, palette: true }).toFile(join(pub, "og-image.png"));
console.log("icons + og-image written");
