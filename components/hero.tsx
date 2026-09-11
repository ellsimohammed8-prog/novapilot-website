"use client";

import React from "react";
import Link from "next/link";
import DownloadButton from "@/components/ui/download-button";
import HeroTransformationCanvas from "@/components/hero-transformation-canvas";
import {
  AudioWaveform,
  EyeOff,
  Cpu,
  ShieldCheck,
  ChevronRight,
  Layers,
  Terminal,
  Volume2,
} from "lucide-react";

export default function Hero() {
  const metrics = [
    {
      label: "<5ms Latency",
      sublabel: "WASAPI Loopback",
      icon: AudioWaveform,
      color: "text-emerald-400",
      border: "border-white/[0.08]",
      bg: "bg-[#0F172A]/70",
    },
    {
      label: "100% Invisible",
      sublabel: "Screen-Share Proof",
      icon: EyeOff,
      color: "text-sky-400",
      border: "border-white/[0.08]",
      bg: "bg-[#0F172A]/70",
    },
    {
      label: "ThinkStripper FSM",
      sublabel: "DeepSeek & Claude",
      icon: Cpu,
      color: "text-[#3B82F6]",
      border: "border-white/[0.08]",
      bg: "bg-[#0F172A]/70",
    },
    {
      label: "Zero Cloud Storage",
      sublabel: "Local-First Privacy",
      icon: ShieldCheck,
      color: "text-emerald-400",
      border: "border-white/[0.08]",
      bg: "bg-[#0F172A]/70",
    },
  ];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
      {/* Restrained Architectural Surface Guides (Purged of ungrounded ambient halos) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-[#1D4ED8]/[0.06] via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Eyebrow Chip */}
        <div className="flex justify-center pb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-[#0F172A]/80 text-xs font-mono text-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1D4ED8] animate-pulse" />
            <span className="font-semibold tracking-wide text-white">NOVA-CORE ENGINE v2.7.1</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300 font-sans">Windows 10 &amp; 11 Native (64-bit)</span>
          </div>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            The Executive HUD Copilot for{" "}
            <span className="text-white">
              High-Stakes Remote Calls
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
            Zero-latency dual-stream WASAPI audio capture, real-time reasoning extraction, and 100% stealth screen-share protection for Windows 10 &amp; 11.
          </p>

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
              href="#architecture"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-[#111827] hover:bg-[#1E293B] border border-white/[0.08] hover:border-white/[0.16] transition-all active:scale-[0.98]"
            >
              <span>Explore Architecture</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* 4 Architecture Metric Badges */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 text-left">
            {metrics.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`relative p-3.5 sm:p-4 rounded-xl border ${item.border} ${item.bg} backdrop-blur-md transition-all hover:border-white/[0.16] hover:bg-[#111827]`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-mono font-medium text-slate-400">
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

        {/* 16:9 Interactive Transformation Canvas (Centerpiece Showcase) */}
        <div id="demo" className="mt-12 sm:mt-16">
          <HeroTransformationCanvas className="w-full" />
        </div>

        {/* Executive Subsystem Verification Strip */}
        <div className="mt-6 mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-[#0F172A]/50 text-xs font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <EyeOff className="w-3.5 h-3.5 text-sky-400" />
              <span>Zoom, MS Teams, Meet &amp; Slack Invisibility (WDA_EXCLUDEFROMCAPTURE)</span>
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rust CPAL SPSC Ring Buffer Headroom</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Global Shortcut:</span>
            <kbd className="px-2 py-0.5 rounded bg-[#1E293B] border border-white/[0.08] text-slate-200 text-[11px]">
              Ctrl+Shift+B
            </kbd>
            <kbd className="px-2 py-0.5 rounded bg-[#1E293B] border border-white/[0.08] text-slate-200 text-[11px]">
              Ctrl+B
            </kbd>
          </div>
        </div>
      </div>
    </section>
  );
}
