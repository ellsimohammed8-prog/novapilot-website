import React from "react";
import { Button } from "./ui/button";
import {
  Download,
  ArrowRight,
  CheckCircle2,
  Volume2,
  EyeOff,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { LiveHudPreview } from "./LiveHudPreview";

export const VideoHero: React.FC = () => {
  const triggerAudio = () => {
    window.dispatchEvent(
      new CustomEvent("novapilot:toggle-audio", { detail: { muted: false } })
    );
  };

  return (
    <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
      {/* Luminous Ambient Light Flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-[#0052FF]/20 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="container px-4 sm:px-6 mx-auto space-y-10 md:space-y-14">
        {/* Executive Copy */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Release & Sound Prompt Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/25 text-white text-xs font-mono font-semibold backdrop-blur-xl shadow-[0_0_20px_rgba(0,82,255,0.3)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
            <span className="text-white">NovaPilot AI v2.7.0</span>
            <span className="text-white/40">•</span>
            <span className="text-[#00F0FF]">Live Cosmic Edition</span>
          </div>

          {/* Master Headline - Radiant, Crisp, Illuminated */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.035em] leading-[1.04] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            Master Live Meetings.{" "}
            <span className="bg-gradient-to-r from-[#00F0FF] via-[#0052FF] to-[#3B82F6] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,82,255,0.8)]">
              Completely Undetectable.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-slate-100 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            Dual-stream WASAPI audio capture, zero-latency local Whisper transcription, and streaming AI intelligence delivered to a stealth HUD that stays 100% invisible on Zoom & Teams.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-[#0052FF] hover:bg-[#0042D0] text-white rounded-2xl h-14 px-8 text-base font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_35px_rgba(0,82,255,0.6)] transition-all hover:scale-105 duration-150 gap-3 cursor-pointer"
            >
              <a href="#download" className="flex items-center gap-2.5">
                <Download className="w-5 h-5" />
                <span>Download for Windows (.exe)</span>
              </a>
            </Button>

            <button
              onClick={triggerAudio}
              className="w-full sm:w-auto rounded-2xl h-14 px-7 text-sm font-bold border border-white/30 bg-white/10 hover:bg-white/20 text-white backdrop-blur-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Volume2 className="w-4 h-4 text-[#00F0FF]" />
              <span>Turn On Sound 🔊</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-8 pt-2 text-xs sm:text-sm text-slate-200 font-semibold drop-shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
              <span>100% Invisible Screen Share</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
              <span>Local Offline Whisper STT</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
              <span>Bring Your Own Key (Free BYOK)</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Stealth Simulator Showcase (Semi-Transparent Liquid Glass) */}
        <div className="pt-4 max-w-5xl mx-auto">
          <div className="p-2 sm:p-4 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_0_60px_rgba(0,82,255,0.25)]">
            <LiveHudPreview />
          </div>
        </div>
      </div>
    </section>
  );
};
