"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import DownloadButton from "@/components/ui/download-button";
import {
  AudioWaveform,
  EyeOff,
  Cpu,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const METRICS = [
  {
    label: "<5ms Latency",
    sublabel: "WASAPI Loopback",
    icon: AudioWaveform,
    color: "text-emerald-400",
    // Quadrant 0: Top-Left
    quadrant: { x: -100, y: -25, z: -120, yaw: -10 },
  },
  {
    label: "100% Invisible",
    sublabel: "Screen-Share Proof",
    icon: EyeOff,
    color: "text-sky-400",
    // Quadrant 1: Top-Right
    quadrant: { x: 100, y: -25, z: -120, yaw: 10 },
  },
  {
    label: "ThinkStripper FSM",
    sublabel: "DeepSeek & Claude",
    icon: Cpu,
    color: "text-[#3B82F6]",
    // Quadrant 2: Bottom-Left
    quadrant: { x: -100, y: 25, z: -120, yaw: -10 },
  },
  {
    label: "Zero Cloud Storage",
    sublabel: "Local-First Privacy",
    icon: ShieldCheck,
    color: "text-emerald-400",
    // Quadrant 3: Bottom-Right
    quadrant: { x: 100, y: 25, z: -120, yaw: 10 },
  },
];

export default function Hero() {
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [hoveredBadge, setHoveredBadge] = useState<number | null>(null);

  // Direct DOM refs for GPU-composited 60 FPS CSS 3D transforms
  const heroTextRef = useRef<HTMLDivElement | null>(null);
  const badgeRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleBadgeHover = useCallback((index: number | null) => {
    setHoveredBadge(index);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("novapilot:badge-hover", { detail: { index } })
      );
    }
  }, []);

  // True 3D Spatial Scrollytelling Animation Loop
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouse tilt tracking
    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseTilt({ x: x * 4, y: -y * 4 });
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let animationFrameId: number;

    const updateSpatialTransforms = () => {
      if (prefersReducedMotion) return;

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.max(0.0, Math.min(3.0, (window.scrollY / maxScroll) * 3.0));

      // 1. Hero Headline & Subtitle Z-Axis Choreography
      // Recedes backward into depth (Z: 0 -> -450px, scale: 1.0 -> 0.52, spatial dispersion blur)
      if (heroTextRef.current) {
        const pHero = Math.max(0, Math.min(1.0, p / 0.95));
        const z = -450 * pHero;
        const scale = 1.0 - 0.48 * pHero;
        const y = 110 * pHero;
        const blur = 8 * pHero;
        const opacity = Math.max(0, 1.0 - Math.pow(pHero, 1.6) * 1.05);

        heroTextRef.current.style.transform = `perspective(1200px) translate3d(0, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
        heroTextRef.current.style.filter = `blur(${blur.toFixed(1)}px)`;
        heroTextRef.current.style.opacity = `${opacity.toFixed(3)}`;
        heroTextRef.current.style.transformStyle = "preserve-3d";
        heroTextRef.current.style.willChange = "transform, filter, opacity";
      }

      // 2. Phase 2: 4 Key Feature Badges Peripheral Quadrant Gliding
      // Glides inward from peripheral offsets into locked grid framing cosmic particle burst
      const isMobile = window.innerWidth < 640;
      const mobileDampening = isMobile ? 0.35 : 1.0;
      // Progress across Phase 1 to Phase 2 (p: 0.10 -> 0.85)
      const pFeat = Math.max(0, Math.min(1.0, (p - 0.10) / 0.75));
      // Smoothstep easing: 3x^2 - 2x^3
      const smoothEase = pFeat * pFeat * (3 - 2 * pFeat);
      // Badges start at peripheral offsets when scrolling starts and lock into (0,0,0) at Phase 2
      const offsetMultiplier = 1.0 - smoothEase;

      METRICS.forEach((item, idx) => {
        const badgeEl = badgeRefs.current[idx];
        if (!badgeEl) return;

        const q = item.quadrant;
        const curX = q.x * mobileDampening * offsetMultiplier;
        const curY = q.y * mobileDampening * offsetMultiplier;
        const curZ = q.z * offsetMultiplier;
        const curYaw = q.yaw * offsetMultiplier;

        badgeEl.style.transform = `perspective(1200px) translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, ${curZ.toFixed(1)}px) rotateY(${curYaw.toFixed(1)}deg)`;
        badgeEl.style.transformStyle = "preserve-3d";
        badgeEl.style.willChange = "transform";
      });
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateSpatialTransforms);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateSpatialTransforms();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24">
      {/* Restrained Architectural Surface Guides (Purged of ungrounded ambient halos) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-[#1D4ED8]/[0.06] via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Chip */}
        <div className="flex justify-center pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-[#0A0F1C]/80 backdrop-blur-md text-xs font-mono text-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
            <span className="font-semibold tracking-wide text-white">NOVA-CORE ENGINE v2.7.1</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-sans">Windows 10 &amp; 11 Native (64-bit)</span>
          </div>
        </div>

        {/* Hero Interactive 3D Card with Dynamic Tilt and Dark Scrim */}
        <div
          className="relative mx-auto max-w-4xl text-center transition-transform duration-200 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${mouseTilt.y}deg) rotateY(${mouseTilt.x}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Contrast Protection Scrim: Guarantees 100% Text Legibility & Contrast over 3D Nebula */}
          <div
            className="pointer-events-none absolute -inset-8 -z-10 rounded-3xl bg-radial from-[#0B0F19]/85 via-[#0B0F19]/60 to-transparent blur-2xl"
            aria-hidden="true"
          />

          {/* Receding 3D Typography Container (Direct DOM ref GPU-composited CSS 3D transform) */}
          <div ref={heroTextRef} className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1] drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
              The Executive HUD Copilot for{" "}
              <span className="text-white">
                High-Stakes Remote Calls
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-200 leading-relaxed max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              Zero-latency dual-stream WASAPI audio capture, real-time reasoning extraction, and 100% stealth screen-share protection for Windows 10 &amp; 11.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <DownloadButton
              variant="primary"
              showVersion={true}
              href="https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe"
              label="Download NovaPilot Desktop"
              className="w-full sm:w-auto px-8 py-3.5 text-base bg-[#1D4ED8] hover:bg-[#2563EB] text-white border border-[#1D4ED8] shadow-[0_4px_20px_-2px_rgba(29,78,216,0.45)]"
            />
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-[#111827]/80 hover:bg-[#1E293B] border border-white/[0.08] hover:border-white/[0.16] backdrop-blur-md transition-all active:scale-[0.98]"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Phase 2: 4 Architecture Metric Badges (Dark Glassmorphism with 3D Quadrant Gliding) */}
          <div
            id="features"
            className="scroll-mt-24 mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-left"
          >
            {METRICS.map((item, idx) => {
              const Icon = item.icon;
              const isHovered = hoveredBadge === idx;
              return (
                <div
                  key={item.label}
                  ref={(el) => {
                    badgeRefs.current[idx] = el;
                  }}
                  onMouseEnter={() => handleBadgeHover(idx)}
                  onMouseLeave={() => handleBadgeHover(null)}
                  className={`relative p-3.5 sm:p-4 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[#0A0F1C]/50 backdrop-blur-xl transition-all duration-200 shadow-lg shadow-black/30 cursor-pointer ${
                    isHovered
                      ? "border-cyan-400/60 bg-[#0E1626]/80 shadow-[0_0_20px_rgba(0,212,255,0.25)] -translate-y-1"
                      : "hover:border-cyan-400/30 hover:bg-[#0E1626]/70 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-mono font-medium text-slate-300">
                      {item.sublabel}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white tracking-tight">
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
