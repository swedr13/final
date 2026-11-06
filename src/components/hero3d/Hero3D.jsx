import { useEffect, useRef, useState } from "react";
import { OrbPoster } from "./OrbPoster";
import { getTier, rememberNo3d, whenIdle } from "./capability";
import "./Hero3D.css";

/**
 * Gate for the 3D "Signal Orb". Renders the SVG poster immediately (it is in the
 * pre-rendered HTML). Only after `load` + idle + hero-in-view does it probe the GPU
 * and lazy-load the three.js chunk. Tier 0 never downloads it.
 */
export function Hero3D() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const [live, setLive] = useState(false);
  const [gyro, setGyro] = useState(null); // null | { request: () => Promise<boolean> }

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let cancelled = false;
    let handle = null;
    let cancelIdle = null;
    let io = null;

    const fail = () => {
      setLive(false);
      setGyro(null);
      handle?.unmount();
      handle = null;
      rememberNo3d();
    };

    const start = async () => {
      const tier = getTier();
      if (!tier || cancelled) return;
      try {
        const { mount } = await import("./scene.js");
        if (cancelled) return;
        handle = await mount(canvas, stage, {
          tier,
          onFirstFrame: () => !cancelled && setLive(true),
          onFail: fail,
          onGyroAvailable: (request) => !cancelled && setGyro({ request }),
        });
        if (cancelled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          handle?.unmount();
          handle = null;
          setLive(false);
          setGyro(null);
        }
      } catch {
        fail();
      }
    };

    const loaded = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", () => resolve(), { once: true });
    });
    const visible = new Promise((resolve) => {
      if (!("IntersectionObserver" in window)) return resolve();
      io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          resolve();
        }
      });
      io.observe(stage);
    });
    Promise.all([loaded, visible]).then(() => {
      if (!cancelled) cancelIdle = whenIdle(start);
    });

    // Switching to reduced motion mid-session drops back to the poster.
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onRm = (e) => {
      if (e.matches) {
        setLive(false);
        setGyro(null);
        handle?.unmount();
        handle = null;
      }
    };
    rm.addEventListener("change", onRm);

    return () => {
      cancelled = true;
      cancelIdle?.();
      io?.disconnect();
      rm.removeEventListener("change", onRm);
      handle?.unmount();
    };
  }, []);

  return (
    <div className="hero__stage" ref={stageRef} data-live={live || undefined} aria-hidden="true">
      <OrbPoster id="hero-orb" className="hero__poster" />
      <canvas ref={canvasRef} className="hero__canvas" />
      {gyro && (
        // The stage is aria-hidden, so this optional enhancement is announced via its own label
        // only to pointer users; drag works without it.
        <button
          type="button"
          className="gyro-chip"
          tabIndex={-1}
          onClick={async () => {
            await gyro.request();
            setGyro(null);
          }}
        >
          Tilt to explore
        </button>
      )}
    </div>
  );
}
