import React from "react";
import { Button } from "./ui/button";
import { LiveHudPreview } from "./LiveHudPreview";
import {
  Download,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Subtle Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#0047AB]/10 dark:bg-[#0047AB]/15 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="container px-4 mx-auto space-y-12 md:space-y-16">
        {/* Executive Hero Copy */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[-0.03em] text-[#0B0F19] dark:text-white leading-[1.05]">
            Master Live Meetings & Interviews.{" "}
            <span className="text-[#0052FF]">
              Completely Undetectable.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Dual-stream audio capture, zero-latency local Whisper transcription, and streaming AI intelligence delivered directly to a stealth HUD that remains invisible during Zoom, Teams, and Meet screen-shares.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-[#0047AB] hover:bg-[#003888] text-white rounded-xl h-13 px-8 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_30px_rgba(0,71,171,0.35)] transition-all duration-150 gap-3 cursor-pointer"
            >
              <a href="#download" className="flex items-center gap-2.5">
                <Download className="w-5 h-5" />
                <span>Download for Windows (.exe)</span>
              </a>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-xl h-13 px-7 text-sm font-medium border-border/80 dark:border-white/10 bg-muted/40 dark:bg-white/[0.03] hover:bg-muted dark:hover:bg-white/[0.08] text-[#0B0F19] dark:text-slate-200"
            >
              <a href="#stealth" className="flex items-center gap-2">
                <span>How Stealth Works</span>
                <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </a>
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-8 pt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Local Encrypted Database</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Zero Audio Telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Free Bring-Your-Own-Key (BYOK)</span>
            </div>
          </div>
        </div>

        {/* Interactive HUD Live Simulation */}
        <div className="pt-2">
          <LiveHudPreview />
        </div>
      </div>
    </section>
  );
};
