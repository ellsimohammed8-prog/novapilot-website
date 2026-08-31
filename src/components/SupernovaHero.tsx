import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "./ui/button";
import { Download, ArrowRight, CheckCircle2, ChevronDown, Zap, Shield } from "lucide-react";
import supernovaPhase1 from "../assets/supernova-phase1.jpg";
import supernovaPhase2 from "../assets/supernova-phase2.jpg";
import supernovaPhase3 from "../assets/supernova-phase3.jpg";

gsap.registerPlugin(ScrollTrigger);

export const SupernovaHero: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const baseLayerRef = useRef<HTMLDivElement>(null);
  const suctionLayerRef = useRef<HTMLDivElement>(null);
  const flareRef = useRef<HTMLDivElement>(null);
  const blastLayerRef = useRef<HTMLDivElement>(null);

  // Typography Refs
  const text1Ref = useRef<HTMLDivElement>(null);
  const text2Ref = useRef<HTMLDivElement>(null);
  const text3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Master Scrubbed Timeline across the pinned 400vh stage
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top top",
          end: "+=3500",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Initial States
      gsap.set(text1Ref.current, { y: 0, opacity: 1 });
      gsap.set(text2Ref.current, { y: 80, opacity: 0 });
      gsap.set(text3Ref.current, { y: 100, opacity: 0 });
      gsap.set(suctionLayerRef.current, { opacity: 0 });
      gsap.set(flareRef.current, { scale: 0, opacity: 0 });
      gsap.set(blastLayerRef.current, {
        clipPath: "circle(0% at 50% 50%)",
        webkitClipPath: "circle(0% at 50% 50%)",
      });

      // --- PHASE 1 -> PHASE 2 (0% -> 35%): Exit Text 1, Enter Text 2, Scale down & Rotate Suction ---
      tl.to(
        text1Ref.current,
        {
          y: -100,
          opacity: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      )
        .to(
          text2Ref.current,
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
          },
          0.6
        )
        .to(
          visualRef.current,
          {
            scale: 0.4,
            rotation: 720,
            filter: "brightness(1.5)",
            duration: 2,
            ease: "power2.inOut",
          },
          0
        )
        .to(
          suctionLayerRef.current,
          {
            opacity: 1,
            duration: 1.5,
            ease: "power1.inOut",
          },
          0.3
        )

        // --- PHASE 2 -> PHASE 3 (35% -> 65%): Collapse to Pinpoint & Singularity Flare ---
        .to(
          text2Ref.current,
          {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          2.2
        )
        .to(
          visualRef.current,
          {
            scale: 0.02,
            opacity: 0.1,
            duration: 1.5,
            ease: "power3.in",
          },
          2.2
        )
        .to(
          flareRef.current,
          {
            scale: 4.5,
            opacity: 1,
            duration: 1,
            ease: "expo.out",
          },
          3.2
        )

        // --- PHASE 3 -> PHASE 4 (65% -> 100%): Flare vanishes, Blast Explodes Full Screen ---
        .to(
          flareRef.current,
          {
            scale: 0,
            opacity: 0,
            duration: 0.3,
            ease: "power2.in",
          },
          4.2
        )
        .to(
          visualRef.current,
          {
            scale: 1.05,
            opacity: 1,
            rotation: 720,
            filter: "brightness(1)",
            duration: 1.2,
            ease: "power4.out",
          },
          4.2
        )
        .to(
          blastLayerRef.current,
          {
            clipPath: "circle(160% at 50% 50%)",
            webkitClipPath: "circle(160% at 50% 50%)",
            duration: 2,
            ease: "power3.out",
          },
          4.2
        )
        .to(
          text3Ref.current,
          {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: "power3.out",
          },
          4.6
        );
    }, stageRef);

    return () => ctx.revert();
  }, []);

  // Subtle Mouse Parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!visualRef.current) return;
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;

    gsap.to(visualRef.current, {
      x: x * 25,
      y: y * 25,
      duration: 0.8,
      ease: "power1.out",
    });
  };

  return (
    <div
      ref={stageRef}
      id="scroll-stage"
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-[#08080C] text-white overflow-hidden select-none"
    >
      {/* FULL-SCREEN EDGE-TO-EDGE COSMIC VISUAL CANVAS (100% Width & Height) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div
          ref={visualRef}
          className="absolute inset-0 w-full h-full will-change-transform"
        >
          {/* 1. Base Layer (Phase 1): Full Screen Supernova Core */}
          <div
            ref={baseLayerRef}
            className="absolute inset-0 z-10 w-full h-full"
          >
            <img
              src={supernovaPhase1}
              alt="NovaPilot Base Core"
              className="w-full h-full object-cover object-center"
            />
            {/* Cinematic Gradient Overlays for absolute text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#08080C]/80 via-transparent to-[#08080C]/90" />
          </div>

          {/* 2. Suction Layer (Phase 2): Gravitational Spiral Vortex */}
          <div
            ref={suctionLayerRef}
            className="absolute inset-0 z-20 w-full h-full mix-blend-screen pointer-events-none"
          >
            <img
              src={supernovaPhase2}
              alt="Gravitational Suction Vortex"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* 3. Singularity Light Flare (Phase 3): Pure White Radial Flash */}
          <div
            ref={flareRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-white shadow-[0_0_140px_70px_rgba(255,255,255,1),0_0_240px_120px_rgba(0,82,255,0.9)] z-30 pointer-events-none"
          />

          {/* 4. Blast Layer (Phase 4): Full-Bleed Supernova Explosion */}
          <div
            ref={blastLayerRef}
            className="absolute inset-0 z-40 w-full h-full pointer-events-none"
          >
            <img
              src={supernovaPhase3}
              alt="Supernova Blast Shockwave"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#08080C]/75 via-transparent to-[#08080C]/85" />
          </div>
        </div>
      </div>

      {/* --- FLOATING TYPOGRAPHY OVERLAYS --- */}

      {/* TEXT PHASE 1: Baseline Stability (Top Header Area) */}
      <div className="absolute top-20 sm:top-24 md:top-28 left-0 right-0 w-full max-w-5xl mx-auto px-6 pointer-events-none overflow-hidden text-center z-50">
        <div ref={text1Ref} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-xs font-mono font-medium text-slate-200 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#0052FF] animate-pulse" />
            <span>PHASE 01: BASELINE CORE STABILITY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.03em] leading-[1.05] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Master Live Meetings.{" "}
            <span className="text-[#0052FF]">Completely Undetectable.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Scroll down to witness the Nova singularity compress and unleash zero-latency audio and interview intelligence.
          </p>
        </div>
      </div>

      {/* TEXT PHASE 2: Gravitational Collapse (Centered) */}
      <div className="absolute top-20 sm:top-28 left-0 right-0 w-full max-w-4xl mx-auto px-6 pointer-events-none overflow-hidden text-center z-50">
        <div ref={text2Ref} className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0047AB]/40 border border-[#0047AB]/60 backdrop-blur-md text-xs font-mono font-semibold text-white shadow-lg">
            <Zap className="w-3.5 h-3.5 text-[#0052FF]" />
            <span>PHASE 02: GRAVITATIONAL COLLAPSE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.03em] text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
            Compressing Dual-Stream Audio at 0ms Latency.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto drop-shadow-md">
            Direct hardware WASAPI loopback captures remote interviewer voice and mic stream in pure synchronization.
          </p>
        </div>
      </div>

      {/* TEXT PHASE 3 & 4: Supernova Activated (Bottom Action Area) */}
      <div className="absolute bottom-10 sm:bottom-14 md:bottom-16 left-0 right-0 w-full max-w-4xl mx-auto px-6 text-center z-50 overflow-hidden">
        <div ref={text3Ref} className="space-y-5 bg-[#08080C]/85 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-semibold text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>PHASE 03: SUPERNOVA ACTIVATED — ZERO FOOTPRINT</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
              NovaPilot AI <span className="text-[#0052FF]">Unleashed.</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
              Real-time Whisper transcription + Multi-LLM intelligence streaming to your invisible HUD.
            </p>
          </div>

          {/* Direct Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-1">
            <Button
              asChild
              size="lg"
              className="bg-[#0047AB] hover:bg-[#003888] text-white rounded-xl h-13 px-8 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_25px_rgba(0,71,171,0.45)] cursor-pointer transition-transform hover:scale-105"
            >
              <a href="#download" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Download for Windows (.exe)</span>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-xl h-13 px-7 text-xs font-medium border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-white"
            >
              <a href="#features" className="flex items-center gap-1.5">
                <span>Explore Architecture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% Invisible Screen Share
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Local Whisper Offline STT
            </span>
          </div>
        </div>
      </div>

      {/* Scroll Down Prompt for Phase 1 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[11px] font-mono text-slate-400 pointer-events-none z-50">
        <span>SCROLL TO IGNITE</span>
        <ChevronDown className="w-4 h-4 animate-bounce text-[#0052FF]" />
      </div>
    </div>
  );
};
