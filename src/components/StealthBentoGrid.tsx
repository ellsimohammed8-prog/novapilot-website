import React, { useState, useRef } from "react";
import {
  EyeOff,
  Mic,
  Crop,
  Bot,
  Smartphone,
  ShieldCheck,
  Zap,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  ArrowUpRight,
  Activity,
  QrCode,
  Sliders,
  CheckCircle,
} from "lucide-react";

export const StealthBentoGrid: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState(false);

  return (
    <section id="stealth" className="py-24 sm:py-32 relative">
      <div className="container px-4 mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-xs font-mono font-medium text-cobalt-600 dark:text-cobalt-400">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Stealth Engineering</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Engineered for Absolute Discretion.
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Every layer of NovaPilot AI is designed from the ground up to protect your privacy, eliminate meeting friction, and remain completely invisible to remote participants.
          </p>
        </div>

        {/* Bento Grid 2.0 */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Invisible Screen-Share Protection (Span 2 cols) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
                <EyeOff className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
                  <span>Windows Native API</span>
                  <span>•</span>
                  <span>Zero Screen-Share Footprint</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Invisible Screen-Share Protection
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Utilizes <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-foreground">SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)</code>. When you share your desktop or application window on Zoom, Teams, Meet, or Webex, the HUD is rendered strictly to your physical display and filtered out of video capture streams.
                </p>
              </div>
            </div>

            {/* Interactive Visual Graphic */}
            <div className="p-4 rounded-2xl bg-muted/40 dark:bg-black/40 border border-border/60 font-mono text-xs text-muted-foreground space-y-2">
              <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span>DWM DirectX Composition Pipeline</span>
                <span>STATUS: FILTERED (0% OVERLAY)</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                <div className="p-2 rounded-lg bg-background border border-border/50 text-foreground font-semibold">
                  Zoom Share: ✓
                </div>
                <div className="p-2 rounded-lg bg-background border border-border/50 text-foreground font-semibold">
                  Teams Call: ✓
                </div>
                <div className="p-2 rounded-lg bg-background border border-border/50 text-foreground font-semibold">
                  Meet Tab: ✓
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Dual-Stream Audio Capture (Span 2 cols) */}
          <div className="md:col-span-1 lg:col-span-2 rounded-3xl border border-border/80 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-cobalt-500/40 hover:shadow-xl transition-all duration-300">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center text-cobalt-600 dark:text-cobalt-400 shadow-sm">
                <Mic className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-cobalt-600 dark:text-cobalt-400 font-semibold uppercase tracking-wider">
                  <span>WASAPI Hardware Loopback</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">
                  Dual-Stream Audio Capture
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Concurrently taps into speaker loopback (interviewer voice) and microphone (your voice) without virtual audio cables or echo feedback lag. Transcribes locally on your CPU/GPU using Whisper.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 p-3.5 rounded-xl bg-muted/40 dark:bg-black/30 border border-border/50 text-center">
                <div className="text-xl font-bold text-foreground font-mono">0 ms</div>
                <div className="text-[11px] text-muted-foreground font-sans">Echo Latency</div>
              </div>
              <div className="flex-1 p-3.5 rounded-xl bg-muted/40 dark:bg-black/30 border border-border/50 text-center">
                <div className="text-xl font-bold text-foreground font-mono">100%</div>
                <div className="text-[11px] text-muted-foreground font-sans">Local Whisper</div>
              </div>
            </div>
          </div>

          {/* Card 3: Screen Snipping & Vision OCR */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-indigo-500/40 hover:shadow-lg transition-all duration-300">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                <Crop className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-foreground">Screen Intelligence & OCR</h4>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted border text-xs font-mono font-semibold text-foreground">Ctrl+Shift+S</kbd> to drag a box over coding problems, system diagrams, or slide decks for instant AI vision breakdown.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-semibold flex items-center justify-between">
              <span>Multi-Modal OCR</span>
              <span>Active</span>
            </div>
          </div>

          {/* Card 4: 100% Offline Diagnostic Support */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-amber-500/40 hover:shadow-lg transition-all duration-300">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-foreground">100% Offline Qwen 2.5</h4>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Embedded diagnostic assistant with on-demand quantized <code className="font-mono text-xs">Qwen2.5-0.5B</code> weights. Automatically unloads from RAM after 5 minutes of inactivity.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-mono font-semibold flex items-center justify-between">
              <span>0 MB RAM Idle</span>
              <span>Auto-Unload</span>
            </div>
          </div>

          {/* Card 5: Mobile Phone HUD Mirroring */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-sky-500/40 hover:shadow-lg transition-all duration-300">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-foreground">Stealth Phone Mirroring</h4>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                Prefer looking at your phone instead of your monitor? Scan a secure local Wi-Fi QR code to stream answers directly to your phone browser.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-mono font-semibold flex items-center justify-between">
              <span>Local WebSocket</span>
              <span>Encrypted</span>
            </div>
          </div>

          {/* Card 6: Encrypted SQLite & Windows Vault */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 flex flex-col justify-between space-y-5 group hover:border-purple-500/40 hover:shadow-lg transition-all duration-300">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-foreground">Local Encrypted Vault</h4>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                All meeting history and notes stay strictly on your disk in an encrypted SQLite DB. API keys are locked inside Windows Credential Vault (<code className="font-mono text-xs">keytar</code>).
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono font-semibold flex items-center justify-between">
              <span>Zero Cloud Resale</span>
              <span>100% Local</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
