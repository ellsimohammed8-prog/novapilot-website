"use client";

import React, { useEffect, useRef, useState } from "react";

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

const TRAIL_COUNT = 12;

export default function Interactive3dCursor() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reticleRef = useRef<HTMLDivElement | null>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Physics and state in refs to guarantee 60 FPS without React re-render overhead
  const mouseRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100 });
  const velocityRef = useRef({ vx: 0, vy: 0, speed: 0, angle: 0 });
  const hoverRef = useRef(false);
  const isCoarsePointer = useRef(false);

  // Initialize 12 trailing micro-particles
  const trailPositions = useRef<TrailPoint[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({
      x: -100,
      y: -100,
      opacity: 0,
      scale: 1,
    }))
  );

  useEffect(() => {
    // Suppress immediately on touch/coarse devices
    if (typeof window !== "undefined") {
      isCoarsePointer.current = window.matchMedia("(pointer: coarse)").matches;
    }
    if (isCoarsePointer.current) {
      return;
    }

    setMounted(true);

    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive = Boolean(
        target.closest("a, button, [role='button'], input, textarea, select, .glass-card, [data-interactive='true'], video")
      );
      hoverRef.current = isInteractive;
    };

    const onMouseLeave = () => {
      mouseRef.current.targetX = -200;
      mouseRef.current.targetY = -200;
      hoverRef.current = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });

    // 60 FPS RAF Physics & Render Loop
    const animate = () => {
      const m = mouseRef.current;
      const prev = prevMouseRef.current;

      // Smooth lerp for primary reticle
      m.x += (m.targetX - m.x) * 0.35;
      m.y += (m.targetY - m.y) * 0.35;

      // Calculate instantaneous velocity and stretch angle
      const dx = m.x - prev.x;
      const dy = m.y - prev.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      velocityRef.current = { vx: dx, vy: dy, speed, angle };
      prevMouseRef.current = { x: m.x, y: m.y };

      const isHovered = hoverRef.current;

      // Reticle transform with velocity stretch and magnetic hover scaling
      if (reticleRef.current) {
        const stretchFactor = Math.min(0.65, speed * 0.018);
        const scaleX = isHovered ? 1.75 : 1 + stretchFactor;
        const scaleY = isHovered ? 1.75 : 1 / (1 + stretchFactor * 0.6);
        const rotation = speed > 0.5 && !isHovered ? angle : 0;

        reticleRef.current.style.transform = `translate3d(${m.x}px, ${m.y}px, 0) rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`;
        reticleRef.current.style.opacity = m.x < 0 ? "0" : "1";

        if (isHovered) {
          reticleRef.current.style.boxShadow = "0 0 25px #00F0FF, inset 0 0 8px rgba(0, 240, 255, 0.4)";
          reticleRef.current.style.borderColor = "#00F0FF";
          reticleRef.current.style.backgroundColor = "rgba(0, 240, 255, 0.12)";
        } else {
          reticleRef.current.style.boxShadow = "0 0 15px #00F0FF";
          reticleRef.current.style.borderColor = "#00F0FF";
          reticleRef.current.style.backgroundColor = "transparent";
        }
      }

      // Update 12 trailing micro-particles
      const trail = trailPositions.current;
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const prevPoint = i === 0 ? m : trail[i - 1];
        const point = trail[i];
        const lagFactor = 0.28 + (1 - i / TRAIL_COUNT) * 0.2;

        point.x += (prevPoint.x - point.x) * lagFactor;
        point.y += (prevPoint.y - point.y) * lagFactor;

        const decay = 1 - i / TRAIL_COUNT;
        point.opacity = m.x < 0 ? 0 : decay * 0.8;
        point.scale = Math.max(0.2, decay);

        const el = trailRefs.current[i];
        if (el) {
          el.style.transform = `translate3d(${point.x}px, ${point.y}px, 0) scale(${point.scale})`;
          el.style.opacity = `${point.opacity}`;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!mounted || isCoarsePointer.current) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        @media (pointer: coarse) {
          .interactive-3d-cursor-overlay {
            display: none !important;
          }
        }
      `}</style>
      <div
        ref={containerRef}
        aria-hidden="true"
        className="interactive-3d-cursor-overlay pointer-events-none fixed inset-0 z-50 overflow-hidden"
      >
        {/* 12-particle micro-trail */}
        {Array.from({ length: TRAIL_COUNT }).map((_, idx) => (
          <div
            key={idx}
            ref={(el) => {
              trailRefs.current[idx] = el;
            }}
            className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full pointer-events-none"
            style={{
              backgroundColor: "#00F0FF",
              boxShadow: "0 0 8px #00F0FF",
              willChange: "transform, opacity",
              opacity: 0,
            }}
          />
        ))}

        {/* Glowing Cyan Reticle with Reticle Ticks & Central Node */}
        <div
          ref={reticleRef}
          className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full border pointer-events-none flex items-center justify-center transition-[background-color,border-color,box-shadow] duration-150"
          style={{
            borderColor: "#00F0FF",
            boxShadow: "0 0 15px #00F0FF",
            willChange: "transform, opacity, box-shadow",
            opacity: 0,
          }}
        >
          {/* Subtle crosshair micro-nodes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-[#00F0FF]/80" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-[#00F0FF]/80" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-1 bg-[#00F0FF]/80" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-0.5 w-1 bg-[#00F0FF]/80" />

          {/* Central energetic cyan core */}
          <div className="w-1 h-1 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
        </div>
      </div>
    </>
  );
}
