"use client";

// 280px radius dynamic radial reveal mask configuration
const MASK_RADIUS_PX = 280; // 280px spotlight radius for active power reveal

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface HeroTransformationCanvasProps {
  className?: string;
}

export default function HeroTransformationCanvas({ className = "" }: HeroTransformationCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLayerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Interaction tracking refs (avoids re-triggering React renders)
  const isPointerActiveRef = useRef<boolean>(false);
  const targetCoordsRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const currentCoordsRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const lastActiveTimestampRef = useRef<number>(Date.now());
  const prefersReducedMotionRef = useRef<boolean>(false);

  // Telemetry HUD state (throttled/batched for zero-jank UI display)
  const [telemetry, setTelemetry] = useState({
    normX: "0.500",
    normY: "0.500",
    pixelX: 800,
    pixelY: 450,
    mode: "AUTONOMOUS RADAR SWEEP",
  });

  // Calculate normalized coordinates [0.0, 1.0] and clamped pixel offsets
  const normalizeCoords = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    if (!rect || rect.width === 0 || rect.height === 0) {
      return { normX: 0.5, normY: 0.5, px: 0, py: 0 };
    }
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const clampedX = Math.max(0, Math.min(rect.width, relX));
    const clampedY = Math.max(0, Math.min(rect.height, relY));
    const normX = clampedX / rect.width;
    const normY = clampedY / rect.height;
    return { normX, normY, px: clampedX, py: clampedY };
  }, []);

  // Update DOM mask properties at 60 FPS without React state jank
  const updateRevealMask = useCallback((pixelX: number, pixelY: number) => {
    if (!containerRef.current) return;
    containerRef.current.style.setProperty("--mouse-x", `${pixelX.toFixed(1)}px`);
    containerRef.current.style.setProperty("--mouse-y", `${pixelY.toFixed(1)}px`);

    if (activeLayerRef.current) {
      const maskValue = `radial-gradient(circle ${MASK_RADIUS_PX}px at ${pixelX.toFixed(1)}px ${pixelY.toFixed(1)}px, black 35%, rgba(0,0,0,0.85) 60%, transparent 100%)`;
      activeLayerRef.current.style.maskImage = maskValue;
      activeLayerRef.current.style.webkitMaskImage = maskValue;
    }
  }, []);

  // Main 60 FPS GPU-composited coordinate engine & autonomous scanning loop
  useEffect(() => {
    // Check prefers-reduced-motion accessibility query
    if (typeof window !== "undefined") {
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotionRef.current = motionQuery.matches;

      const handleMotionChange = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
      };
      motionQuery.addEventListener("change", handleMotionChange);

      let lastTelemetryUpdate = 0;

      const renderLoop = (timeMs: number) => {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const width = rect.width || 1000;
          const height = rect.height || 562.5;

          const now = Date.now();
          const isUserActive = isPointerActiveRef.current;
          const idleTime = now - lastActiveTimestampRef.current;
          const reducedMotion = prefersReducedMotionRef.current;

          if (reducedMotion) {
            // Static centered preview for sensitive users
            currentCoordsRef.current = { x: 0.5, y: 0.5 };
            const px = width * 0.5;
            const py = height * 0.5;
            updateRevealMask(px, py);
          } else if (isUserActive) {
            // Easing / lerping towards user target coordinates (lerp factor 0.16)
            const lerpFactor = 0.16;
            currentCoordsRef.current.x += (targetCoordsRef.current.x - currentCoordsRef.current.x) * lerpFactor;
            currentCoordsRef.current.y += (targetCoordsRef.current.y - currentCoordsRef.current.y) * lerpFactor;

            const px = currentCoordsRef.current.x * width;
            const py = currentCoordsRef.current.y * height;
            updateRevealMask(px, py);
          } else if (idleTime > 600) {
            // Autonomous sinusoidal scanning radar sweep across the 16:9 canvas
            // Clean trigonometric cycles: sweepX via sin, sweepY via cos
            const timeSec = timeMs * 0.001;
            const autoNormX = Math.sin(timeSec * 0.75) * 0.38 + 0.5;
            const autoNormY = Math.cos(timeSec * 0.5) * 0.28 + 0.5;

            // Gentle lerp into radar path
            const lerpFactor = 0.08;
            currentCoordsRef.current.x += (autoNormX - currentCoordsRef.current.x) * lerpFactor;
            currentCoordsRef.current.y += (autoNormY - currentCoordsRef.current.y) * lerpFactor;

            const px = currentCoordsRef.current.x * width;
            const py = currentCoordsRef.current.y * height;
            updateRevealMask(px, py);
          } else {
            // Settle towards center before resuming autonomous sweep
            const px = currentCoordsRef.current.x * width;
            const py = currentCoordsRef.current.y * height;
            updateRevealMask(px, py);
          }

          // Throttle React telemetry HUD updates to 10 FPS (every 100ms) to guarantee 60 FPS animation
          if (timeMs - lastTelemetryUpdate > 100) {
            lastTelemetryUpdate = timeMs;
            const curX = currentCoordsRef.current.x;
            const curY = currentCoordsRef.current.y;
            setTelemetry({
              normX: curX.toFixed(3),
              normY: curY.toFixed(3),
              pixelX: Math.round(curX * width),
              pixelY: Math.round(curY * height),
              mode: reducedMotion
                ? "STATIC ACCESSIBILITY CENTER"
                : isUserActive
                ? "ACTIVE POINTER TRACKING"
                : "AUTONOMOUS RADAR SWEEP",
            });
          }
        }

        animationFrameRef.current = requestAnimationFrame(renderLoop);
      };

      animationFrameRef.current = requestAnimationFrame(renderLoop);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        motionQuery.removeEventListener("change", handleMotionChange);
      };
    }
  }, [normalizeCoords, updateRevealMask]);

  // Pointer Movement Handlers
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const { normX, normY } = normalizeCoords(e.clientX, e.clientY, rect);
    targetCoordsRef.current = { x: normX, y: normY };
    isPointerActiveRef.current = true;
    lastActiveTimestampRef.current = Date.now();
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
  };

  const handlePointerLeave = () => {
    isPointerActiveRef.current = false;
    lastActiveTimestampRef.current = Date.now();
  };

  // Mobile Touch Event Handlers (onTouchStart, onTouchMove, onTouchEnd, onTouchCancel)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const { normX, normY } = normalizeCoords(touch.clientX, touch.clientY, rect);
    targetCoordsRef.current = { x: normX, y: normY };
    currentCoordsRef.current = { x: normX, y: normY };
    isPointerActiveRef.current = true;
    lastActiveTimestampRef.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const { normX, normY } = normalizeCoords(touch.clientX, touch.clientY, rect);
    targetCoordsRef.current = { x: normX, y: normY };
    isPointerActiveRef.current = true;
    lastActiveTimestampRef.current = Date.now();
  };

  const handleTouchEnd = () => {
    isPointerActiveRef.current = false;
    lastActiveTimestampRef.current = Date.now();
  };

  const handleTouchCancel = () => {
    isPointerActiveRef.current = false;
    lastActiveTimestampRef.current = Date.now();
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      {/* 16:9 Aspect Ratio Master Container */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        style={{
          "--mouse-x": "50%",
          "--mouse-y": "50%",
        } as React.CSSProperties}
        className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-[#0B0F19] border border-white/[0.08] hover:border-[#1D4ED8]/40 shadow-2xl transition-all duration-300 select-none cursor-crosshair"
      >
        {/* Layer 1: Base Calm State (Dormant HUD Blueprint) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <Image
            src="/images/hero-calm-state.svg"
            alt="NovaPilot AI Architecture — Dormant HUD Blueprint"
            fill
            sizes="(max-width: 1280px) 100vw, 1024px"
            priority
            className="object-cover w-full h-full"
          />
        </div>

        {/* Layer 2: Top Active Power State (Luminescent Cobalt Surges) */}
        {/* Composited via hardware-accelerated CSS mask-image radial reveal */}
        <div
          ref={activeLayerRef}
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200"
          style={{
            maskImage: `radial-gradient(circle ${MASK_RADIUS_PX}px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 35%, rgba(0,0,0,0.85) 60%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle ${MASK_RADIUS_PX}px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 35%, rgba(0,0,0,0.85) 60%, transparent 100%)`,
          }}
        >
          <Image
            src="/images/hero-active-state.svg"
            alt="NovaPilot AI Architecture — Active Cobalt Power Surge"
            fill
            sizes="(max-width: 1280px) 100vw, 1024px"
            priority
            className="object-cover w-full h-full"
          />
        </div>

        {/* Ambient Top Control Strip */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none px-3 py-1.5 rounded-lg bg-[#0B0F19]/85 backdrop-blur-md border border-white/[0.06] text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
            <span className="text-white font-semibold tracking-wider">
              16:9 DUAL-STATE ARCHITECTURE VIEWPORT
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="hidden sm:inline-block">
              MODE: <strong className="text-sky-400">{telemetry.mode}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              COORDINATES:{" "}
              <strong className="text-white font-semibold">
                [{telemetry.normX}, {telemetry.normY}]
              </strong>
            </span>
          </div>
        </div>

        {/* Dynamic Spotlight Reticle Follower */}
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3B82F6]/30 transition-transform duration-75"
          style={{
            left: `var(--mouse-x, 50%)`,
            top: `var(--mouse-y, 50%)`,
            width: `${MASK_RADIUS_PX * 2}px`,
            height: `${MASK_RADIUS_PX * 2}px`,
          }}
        >
          <div className="absolute inset-x-1/2 top-0 h-3 w-px -translate-x-1/2 bg-[#60A5FA]" />
          <div className="absolute inset-x-1/2 bottom-0 h-3 w-px -translate-x-1/2 bg-[#60A5FA]" />
          <div className="absolute inset-y-1/2 left-0 h-px w-3 -translate-y-1/2 bg-[#60A5FA]" />
          <div className="absolute inset-y-1/2 right-0 h-px w-3 -translate-y-1/2 bg-[#60A5FA]" />
        </div>

        {/* Bottom Interactive Prompt & Telemetry Chip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none px-3 py-1.5 rounded-lg bg-[#0B0F19]/85 backdrop-blur-md border border-white/[0.06] text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-slate-300">
              Hover cursor or drag touch across viewport to reveal live WASAPI stream &amp; ThinkStripper reasoning circuits
            </span>
            <span className="md:hidden text-slate-300">
              Touch-drag across viewport to reveal active circuits
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            <span className="text-slate-500">RADIUS:</span>
            <span className="text-white font-semibold">{MASK_RADIUS_PX}px</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">60 FPS GPU MASK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
