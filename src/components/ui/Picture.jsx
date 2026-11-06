import manifest from "../../assets/img/manifest.json";
import "./Picture.css";

// Every generated variant, resolved to its hashed URL at build time.
const urls = import.meta.glob("../../assets/img/*.{avif,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});
const url = (name, w, ext) => urls[`../../assets/img/${name}-${w}.${ext}`];

/**
 * Responsive AVIF/WebP picture with intrinsic size (CLS 0) and a blurred LQIP
 * placeholder that doubles as the skeleton while the real image loads.
 */
export function Picture({ name, alt, sizes, className = "", loading = "lazy", fetchPriority }) {
  const m = manifest[name];
  if (!m) throw new Error(`Picture: unknown image "${name}"`);
  const srcset = (ext) => m.widths.map((w) => `${url(name, w, ext)} ${w}w`).join(", ");
  const fallbackW = m.widths[Math.min(1, m.widths.length - 1)];
  const lastW = m.widths[m.widths.length - 1];
  const height = Math.round((m.height / m.width) * lastW);

  return (
    <div className={`picture ${className}`} style={{ backgroundImage: `url(${m.lqip})` }}>
      <picture>
        <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
        <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
        <img
          src={url(name, fallbackW, "webp")}
          alt={alt}
          width={lastW}
          height={height}
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
          onLoad={(e) => e.currentTarget.closest(".picture")?.classList.add("is-loaded")}
          ref={(img) => {
            // Cached images can finish before hydration attaches onLoad.
            if (img?.complete && img.naturalWidth) img.closest(".picture")?.classList.add("is-loaded");
          }}
        />
      </picture>
    </div>
  );
}
