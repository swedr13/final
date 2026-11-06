// Lazy chunk: only requested for tier >= 1, after load + idle + hero in view.
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  IcosahedronGeometry,
  ShaderMaterial,
  Mesh,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  Group,
  Color,
  AdditiveBlending,
  NormalBlending,
} from "three";
import { orbVertex, orbFragment, pointsVertex, pointsFragment } from "./shaders.js";
import { createInput } from "./input.js";

// Break setup into separate tasks so no single long task blocks input.
const yieldToMain = () =>
  globalThis.scheduler?.yield ? globalThis.scheduler.yield() : new Promise((r) => setTimeout(r, 0));

const SETTINGS = {
  2: { dpr: 1.5, fps: 60, detail: 12, octaves: 3, points: 240, antialias: true },
  1: { dpr: 1.25, fps: 30, detail: 6, octaves: 2, points: 120, antialias: false },
};

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name) => cs.getPropertyValue(name).trim() || "#c770f0";
  const light = document.documentElement.dataset.theme === "light" ||
    (!document.documentElement.dataset.theme && window.matchMedia("(prefers-color-scheme: light)").matches);
  return { a: v("--c-accent"), b: v("--c-accent-2"), rim: v("--c-focus"), dots: v("--c-text-muted"), light };
}

/**
 * Mounts the scene. Returns { unmount }. Calls onFirstFrame after the first frame is
 * on screen (the poster cross-fades out), onFail(reason) on any failure or if the
 * device turns out to be too slow (the gate falls back to the poster for the session).
 */
export async function mount(canvas, stage, { tier, onFirstFrame, onFail, onGyroAvailable }) {
  let settings = { ...SETTINGS[tier] };
  // Loop state is declared up front: resize/theme callbacks can fire while shaders compile.
  let input = null;
  let visible = true;
  let menuOpen = document.getElementById("mobile-menu")?.open === true;
  let motionPaused = document.documentElement.classList.contains("motion-paused");
  let raf = 0;
  let last = 0;
  let running = false;
  let firstFrame = false;
  let elapsed = 0;
  let disposed = false;

  await yieldToMain();
  const renderer = new WebGLRenderer({
    canvas,
    antialias: settings.antialias,
    alpha: true,
    powerPreference: "low-power",
    stencil: false,
    depth: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, settings.dpr));

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 5.2);

  const group = new Group();
  scene.add(group);

  // Orb
  const orbGeo = new IcosahedronGeometry(1, settings.detail);
  const orbMat = new ShaderMaterial({
    vertexShader: orbVertex,
    fragmentShader: orbFragment,
    uniforms: {
      uTime: { value: 0 },
      uAmp: { value: 0.12 },
      uImpulse: { value: 0 },
      uOctaves: { value: settings.octaves },
      uColorA: { value: new Color() },
      uColorB: { value: new Color() },
      uRim: { value: new Color() },
      uLight: { value: 0 },
    },
  });
  const orb = new Mesh(orbGeo, orbMat);
  group.add(orb);

  // Point field: one draw call, decorative only.
  const MAX_POINTS = SETTINGS[2].points;
  const pos = new Float32Array(MAX_POINTS * 3);
  const seed = new Float32Array(MAX_POINTS);
  for (let i = 0; i < MAX_POINTS; i++) {
    const r = 1.55 + Math.random() * 0.75;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.7;
    pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    seed[i] = Math.random();
  }
  const ptsGeo = new BufferGeometry();
  ptsGeo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  ptsGeo.setAttribute("aSeed", new Float32BufferAttribute(seed, 1));
  ptsGeo.setDrawRange(0, settings.points);
  const ptsMat = new ShaderMaterial({
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 5 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uColor: { value: new Color() },
    },
  });
  const points = new Points(ptsGeo, ptsMat);
  group.add(points);

  const applyColors = () => {
    const c = readColors();
    orbMat.uniforms.uColorA.value.set(c.a);
    orbMat.uniforms.uColorB.value.set(c.b);
    orbMat.uniforms.uRim.value.set(c.rim);
    orbMat.uniforms.uLight.value = c.light ? 1 : 0;
    ptsMat.uniforms.uColor.value.set(c.light ? c.b : c.dots);
    ptsMat.blending = c.light ? NormalBlending : AdditiveBlending;
    ptsMat.needsUpdate = true;
  };
  applyColors();

  // Size from the stage box, coalesced to one rAF.
  let sizeRaf = 0;
  const resize = () => {
    sizeRaf = 0;
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, settings.dpr);
    if (dpr !== renderer.getPixelRatio()) {
      renderer.setPixelRatio(dpr);
      ptsMat.uniforms.uPixelRatio.value = dpr;
    }
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  };
  const ro = new ResizeObserver(() => {
    if (!sizeRaf) sizeRaf = requestAnimationFrame(resize);
  });
  ro.observe(stage);
  const onWinResize = () => {
    if (!sizeRaf) sizeRaf = requestAnimationFrame(resize);
  };
  window.addEventListener("resize", onWinResize);
  {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    camera.aspect = width && height ? width / height : 1;
    camera.updateProjectionMatrix();
  }

  // Async shader compile (KHR_parallel_shader_compile) keeps it off the main thread where possible.
  await yieldToMain();
  let hiddenDuringCompile = document.hidden;
  const onCompileVis = () => {
    if (document.hidden) hiddenDuringCompile = true;
  };
  document.addEventListener("visibilitychange", onCompileVis);
  const t0 = performance.now();
  try {
    await renderer.compileAsync(scene, camera);
  } catch {
    renderer.compile(scene, camera);
  }
  const compileMs = performance.now() - t0;
  document.removeEventListener("visibilitychange", onCompileVis);
  if (hiddenDuringCompile) {
    /* wall-clock is meaningless while timers were throttled: skip the verdict */
  } else if (tier === 2 && compileMs > 250) settings = applyTier(1);
  else if (tier === 1 && compileMs > 400) {
    dispose();
    onFail?.("slow-compile");
    return { unmount() {} };
  }

  // Input
  input = createInput(canvas, stage, { onActivity: () => requestRender(), onGyroAvailable });

  // Loop: throttled to the tier's fps, paused off-screen / tab hidden / menu open.
  function active() {
    return visible && !document.hidden && !menuOpen && !motionPaused && !disposed && input !== null;
  }

  // Governor (step-down only). Frame intervals are compared with what the display can deliver:
  // the vsync period is estimated from raw rAF intervals, and the expected throttled interval is
  // a whole number of vsyncs. So 75/90/120/144 Hz panels are not mistaken for slow devices.
  const samples = [];
  const raw = [];
  let lastRaw = 0;
  let governed = false;
  const median = (arr) => [...arr].sort((a, b) => a - b)[arr.length >> 1];
  function govern(dtMs) {
    if (governed) return;
    samples.push(dtMs);
    if (samples.length < 90 || raw.length < 30) return;
    governed = true;
    const vsync = median(raw);
    const frameMs = 1000 / settings.fps;
    const expected = vsync * Math.max(1, Math.ceil((frameMs - 1) / vsync));
    const ratio = median(samples) / expected;
    if (settings.fps === 60 && ratio > 1.35) settings = applyTier(1);
    else if (settings.fps === 30 && ratio > 1.8) {
      unmount();
      onFail?.("slow");
    }
  }

  function applyTier(t) {
    const s = { ...SETTINGS[t], detail: settings.detail };
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, s.dpr));
    ptsMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    orbMat.uniforms.uOctaves.value = s.octaves;
    ptsGeo.setDrawRange(0, s.points);
    const { width, height } = stage.getBoundingClientRect();
    if (width && height) renderer.setSize(width, height, false);
    return s;
  }

  function tick(t) {
    raf = requestAnimationFrame(tick);
    if (lastRaw && raw.length < 60) raw.push(t - lastRaw);
    lastRaw = t;
    const frameMs = 1000 / settings.fps;
    if (t - last < frameMs - 1) return;
    const dtMs = t - last;
    const dt = Math.min(dtMs / 1000, 0.05);
    last = t;
    elapsed += dt;

    const k = input.step(dt);
    group.rotation.y = k.rotY + elapsed * 0.06;
    group.rotation.x = k.rotX;
    orbMat.uniforms.uTime.value = elapsed;
    orbMat.uniforms.uImpulse.value = k.impulse;
    ptsMat.uniforms.uTime.value = elapsed;

    renderer.render(scene, camera);
    if (!firstFrame) {
      firstFrame = true;
      onFirstFrame?.();
    } else {
      govern(dtMs);
    }
    if (!active()) stop();
  }
  function start() {
    if (running || !active()) return;
    running = true;
    last = performance.now();
    lastRaw = 0;
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  function requestRender() {
    start();
  }

  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    input.setVisible(visible);
    if (visible) start();
    else stop();
  });
  io.observe(stage);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVis);
  const onMenu = (e) => {
    menuOpen = !!e.detail;
    if (menuOpen) stop();
    else start();
  };
  window.addEventListener("menutoggle", onMenu);
  const onMotion = (e) => {
    motionPaused = !!e.detail;
    if (motionPaused) stop();
    else start();
  };
  window.addEventListener("motionchange", onMotion);
  const onTheme = () => {
    applyColors();
    if (!running && !disposed) renderer.render(scene, camera);
  };
  window.addEventListener("themechange", onTheme);
  const onLost = (e) => {
    e.preventDefault();
    unmount();
    onFail?.("context-lost");
  };
  canvas.addEventListener("webglcontextlost", onLost);

  start();

  function dispose() {
    disposed = true;
    stop();
    ro.disconnect();
    window.removeEventListener("resize", onWinResize);
    if (sizeRaf) cancelAnimationFrame(sizeRaf);
    orbGeo.dispose();
    orbMat.dispose();
    ptsGeo.dispose();
    ptsMat.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }

  function unmount() {
    if (disposed) return;
    io.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    window.removeEventListener("menutoggle", onMenu);
    window.removeEventListener("motionchange", onMotion);
    window.removeEventListener("themechange", onTheme);
    canvas.removeEventListener("webglcontextlost", onLost);
    input.dispose();
    dispose();
  }

  return { unmount };
}
