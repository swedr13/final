/**
 * Device capability tier for the 3D hero.
 *   0 = static poster only, 1 = light scene (30fps, DPR ≤ 1.25), 2 = full scene (60fps, DPR ≤ 1.5)
 * Must only be called from an idle callback after `load`: it creates a throwaway
 * WebGL context, which costs 10–50 ms of main-thread time.
 */
export function getTier() {
  const mq = (q) => window.matchMedia(q).matches;
  if (new URLSearchParams(window.location.search).has("no3d")) return 0;
  try {
    if (sessionStorage.getItem("tier") === "0") return 0;
  } catch {
    /* storage blocked */
  }
  if (mq("(prefers-reduced-motion: reduce)")) return 0;
  const c = navigator.connection;
  if (c?.saveData || /(^|-)2g/.test(c?.effectiveType ?? "")) return 0;

  let gl = null;
  try {
    gl = document
      .createElement("canvas")
      .getContext("webgl2", { failIfMajorPerformanceCaveat: true, powerPreference: "low-power" });
  } catch {
    gl = null;
  }
  if (!gl) return 0;
  // Software rasterisers (no real GPU) would burn the CPU: show the poster instead.
  let renderer = "";
  try {
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    renderer = String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || "");
  } catch {
    renderer = "";
  }
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  if (/swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(renderer)) return 0;

  const mem = navigator.deviceMemory ?? 4;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = mq("(pointer: coarse)");
  if (mem < 4 || cores < 4) return coarse ? 0 : 1;
  return coarse ? 1 : 2;
}

export function rememberNo3d() {
  try {
    sessionStorage.setItem("tier", "0");
  } catch {
    /* storage blocked */
  }
}

/** requestIdleCallback with a timeout, falling back to setTimeout (Safari). */
export function whenIdle(cb, timeout = 2500) {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 200);
  return () => clearTimeout(id);
}
