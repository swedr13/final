/**
 * Orb input: fine-pointer parallax, touch drag with intent lock + inertia, tap ripple,
 * and optional gyro (iOS asks permission only from a user gesture).
 * Raw events only store the latest value; all smoothing happens in step(dt) on the frame.
 */
export function createInput(canvas, stage, { onActivity, onGyroAvailable }) {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const MAX = 0.35;

  const target = { x: 0, y: 0 }; // parallax target (rad)
  const cur = { x: 0, y: 0 };
  let dragY = 0; // accumulated drag rotation
  let velY = 0;
  let impulse = 0;
  let lastTap = 0;
  let visible = true;
  let gyroOn = false;
  let gyro = null;

  // Fine pointer parallax relative to the stage centre.
  const onMove = (e) => {
    if (!visible) return;
    const r = stage.getBoundingClientRect();
    const nx = ((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2));
    const ny = ((e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2));
    target.y = Math.max(-1, Math.min(1, nx)) * MAX;
    target.x = Math.max(-1, Math.min(1, ny)) * MAX * 0.6;
    onActivity();
  };
  if (fine) window.addEventListener("pointermove", onMove, { passive: true });

  // Touch/pen drag on the canvas. touch-action: pan-y keeps vertical scrolling native.
  let down = null;
  let locked = false;
  const onDown = (e) => {
    down = { x: e.clientX, y: e.clientY, t: performance.now(), lastX: e.clientX, lastT: performance.now() };
    locked = false;
  };
  const onDrag = (e) => {
    if (!down) return;
    const dx = e.clientX - down.x;
    const dy = e.clientY - down.y;
    if (!locked) {
      if (Math.hypot(dx, dy) < 8) return;
      if (Math.abs(dx) <= Math.abs(dy)) {
        down = null; // vertical intent: let the page scroll
        return;
      }
      locked = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }
    const now = performance.now();
    const step = (e.clientX - down.lastX) * 0.008;
    dragY += step;
    velY = step / Math.max(1, now - down.lastT) * 16.7;
    down.lastX = e.clientX;
    down.lastT = now;
    onActivity();
    // Enable gyro on Android after the first touch on the stage.
    if (gyro && !gyro.needsPermission && !gyroOn) enableGyro();
  };
  const onUp = (e) => {
    if (down && !locked && performance.now() - down.t < 300) {
      const now = performance.now();
      if (now - lastTap > 400) {
        impulse = 1;
        lastTap = now;
        onActivity();
      }
    }
    down = null;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {
      /* not captured */
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onDrag);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  // Gyro
  const gy = { beta: 0, gamma: 0, has: false };
  let neutral = null;
  const onOrient = (e) => {
    if (e.beta == null || e.gamma == null) return;
    const angle = (screen.orientation?.angle ?? 0) % 360;
    let b = e.beta;
    let g = e.gamma;
    // Map to screen axes first, then measure tilt relative to how the phone was first held.
    if (angle === 90) [b, g] = [-g, b];
    else if (angle === 270 || angle === -90) [b, g] = [g, -b];
    if (!neutral || neutral.angle !== angle) neutral = { b, g, angle };
    b -= neutral.b;
    g -= neutral.g;
    const clamp = (v) => Math.max(-20, Math.min(20, v));
    gy.beta += (clamp(b) - gy.beta) * 0.1;
    gy.gamma += (clamp(g) - gy.gamma) * 0.1;
    gy.has = true;
    onActivity();
  };
  function enableGyro() {
    if (gyroOn) return;
    gyroOn = true;
    if (visible) window.addEventListener("deviceorientation", onOrient);
  }
  if (coarse && typeof window.DeviceOrientationEvent !== "undefined") {
    const needsPermission = typeof window.DeviceOrientationEvent.requestPermission === "function";
    gyro = { needsPermission };
    let granted = false;
    try {
      granted = sessionStorage.getItem("gyro") === "granted";
    } catch {
      /* storage blocked */
    }
    if (needsPermission && !granted) {
      onGyroAvailable?.(async () => {
        try {
          const res = await window.DeviceOrientationEvent.requestPermission();
          try {
            sessionStorage.setItem("gyro", res);
          } catch {
            /* storage blocked */
          }
          if (res === "granted") enableGyro();
          return res === "granted";
        } catch {
          return false;
        }
      });
    } else if (needsPermission && granted) {
      enableGyro();
    }
  }

  return {
    setVisible(v) {
      visible = v;
      if (!gyroOn) return;
      if (v) window.addEventListener("deviceorientation", onOrient);
      else window.removeEventListener("deviceorientation", onOrient);
    },
    step(dt) {
      const k = 1 - Math.exp(-8 * dt);
      const tx = gy.has ? (gy.beta / 20) * MAX * 0.6 : target.x;
      const ty = gy.has ? (gy.gamma / 20) * MAX : target.y;
      cur.x += (tx - cur.x) * k;
      cur.y += (ty - cur.y) * k;
      if (!down) {
        dragY += velY * dt * 60;
        velY *= Math.pow(0.92, dt * 60);
        if (Math.abs(velY) < 0.0001) velY = 0;
      }
      impulse = Math.max(0, impulse - dt / 0.9);
      return { rotX: cur.x, rotY: cur.y + dragY, impulse };
    },
    dispose() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onOrient);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onDrag);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    },
  };
}
