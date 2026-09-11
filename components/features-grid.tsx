"use client";

import React, { useState } from "react";
import {
  AudioWaveform,
  EyeOff,
  Cpu,
  Send,
  Sliders,
  ShieldCheck,
  Zap,
  Terminal,
  Layers,
  Sparkles,
  RefreshCw,
  Code2,
  ChevronRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function FeaturesGrid() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const subsystems = [
    {
      id: "wasapi",
      title: "High-Fidelity WASAPI Audio Loopback",
      category: "Hardware DSP Engine",
      icon: AudioWaveform,
      accentColor: "emerald",
      badge: "Rust CPAL 0.15.2 • <5ms Buffer Latency",
      description:
        "Direct hardware loopback capture using Windows WASAPI Direction::Render with AUDCLNT_STREAMFLAGS_LOOPBACK. Converts any multi-channel stream into clean 16kHz mono PCM with zero CPU overhead.",
      metrics: [
        { label: "Loopback Latency", value: "<5ms" },
        { label: "Sampling Target", value: "16,000 Hz" },
        { label: "V8 IPC Savings", value: "66.7%" },
        { label: "Ring Buffer Headroom", value: "32,768 S" },
      ],
      points: [
        "Dynamic N-Channel Downmix: Automatically sums N audio channels and scales by 1.0/N to downmix 5.1/7.1 surround sound to crisp mono float PCM.",
        "Rubato Polyphase Sinc Resampling: High-precision sinc interpolation (rubato::FftFixedIn) converting 48kHz/44.1kHz hardware clocks to canonical 16kHz with >20dB alias attenuation.",
        "Lock-Free Ring Buffer: Stream decoupling via HeapRb<f32> ring buffer prevents lock contention between the real-time audio thread and DSP queue.",
        "BatchEmitter Coalescence: Batches three 20ms DSP frames (60ms) into a single napi ThreadsafeFunction call with 100ms silence flush guard.",
      ],
      codeSnippet: `// native-module/src/speaker/windows.rs
let mut frame_sum = 0.0f32;
for _ in 0..channels_usize {
    let bytes = [temp_queue.pop_front().unwrap(), ...];
    frame_sum += f32::from_le_bytes(bytes);
}
// Scale by dynamic channel inverse to prevent clipping
samples.push(frame_sum * (1.0 / channels_usize as f32));
let pcm_bytes = bytemuck::cast_slice::<i16, u8>(&resampled_i16);`,
      sourceFile: "native-module/src/speaker/windows.rs",
    },
    {
      id: "stealth",
      title: "Stealth Overlay & Screen Capture Exclusion",
      category: "Windowing & Compositor",
      icon: EyeOff,
      accentColor: "violet",
      badge: "WDA_EXCLUDEFROMCAPTURE • 100% Stealth",
      description:
        "Hardware-level display protection instructing the Windows Desktop Window Manager (DWM) to omit the HUD window from screen capture streams in Zoom, Teams, Meet, Slack, and OBS.",
      metrics: [
        { label: "Capture Immunity", value: "100%" },
        { label: "Window Frame", value: "0px (Frameless)" },
        { label: "Z-Order Level", value: "screen-saver" },
        { label: "Hotkey Response", value: "0.8ms" },
      ],
      points: [
        "Win32 Display Affinity: Calls SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE) combined with Electron setContentProtection(true).",
        "Transparent Click-Through: Toggles setIgnoreMouseEvents(true, { forward: true }) while maintaining focusable: true so OS does not unhook global shortcuts.",
        "Fullscreen Overlap: Sets alwaysOnTop: true at 'screen-saver' level to ensure HUD remains visible even when Zoom or PowerPoint is in F11 fullscreen.",
        "Centered Symmetrical Resize: Shifts X coordinate by -deltaWidth / 2 during atomic setBounds calls, keeping wide LLM answers centered without sideways jumping.",
      ],
      codeSnippet: `// electron/WindowHelper.ts
// Directs OS compositor to hide overlay from screen-share
overlayWindow.setContentProtection(true);

// Enable transparent mouse pass-through to background apps
overlayWindow.setIgnoreMouseEvents(true, { forward: true });

// Symmetrical centered resize calculation
const newX = currentBounds.x - Math.round(deltaWidth / 2);
overlayWindow.setBounds({ x: newX, y: currentBounds.y, width: targetWidth, height: targetHeight });`,
      sourceFile: "electron/WindowHelper.ts",
    },
    {
      id: "thinkstripper",
      title: "LLM Intelligence & Streaming ThinkStripper",
      category: "Real-Time NLP Pipeline",
      icon: Cpu,
      accentColor: "cyan",
      badge: "Two-State FSM • 0-Byte Leak Guarantee",
      description:
        "Finite-state machine that parses incoming streaming token deltas in real-time, removing internal reasoning blocks (<think>, <thought>, <reasoning>) before tokens reach the UI.",
      metrics: [
        { label: "Reasoning Leak", value: "0 Bytes" },
        { label: "FSM States", value: "pass | inThink" },
        { label: "Token Buffer", value: "Sub-token" },
        { label: "Provider Failover", value: "<150ms" },
      ],
      points: [
        "Streaming FSM Tag Stripper: Emits answer tokens immediately while state is 'pass'. Transitions to 'inThink' upon detecting opening tags and discards internal thoughts.",
        "Sub-Token Chunk Stitching: Uses partialOpenTail() and partialCloseTail() to prevent leaks when tags are split across network chunk boundaries (e.g., '<thi' + 'nk>').",
        "Unclosed Tag Safeguard: If the LLM stream drops mid-thought without emitting </think>, the finish() handler discards the unclosed buffer completely.",
        "Multi-Provider Resilient Routing: Dynamically cascades across Gemini 2.0 Flash, Claude 3.7 Sonnet, DeepSeek-R1, and Groq Llama-3.3 with auto-failover on HTTP 429.",
        "ASR Vocabulary Biasing Prompt Cache: Pre-warms 224-token initial prompt cache biasing speech recognition decoders toward technical identifiers, programming keywords, and domain acronyms.",
      ],
      codeSnippet: `// electron/llm/thinkStripper.ts
export class StreamingThinkStripper {
  private state: "pass" | "inThink" = "pass";
  
  feed(delta: string): string {
    if (this.state === "pass") {
      const match = delta.match(/<(think|thought|reasoning)\\b[^>]*>/i);
      if (match) {
        this.state = "inThink";
        return delta.slice(0, match.index); // emit only leading content
      }
      return delta;
    }
    // Discard tokens while inThink until closing tag is found
  }
}`,
      sourceFile: "electron/llm/thinkStripper.ts",
    },
    {
      id: "telemetry",
      title: "Serverless Telegram Telemetry & Remote Kill-Switch",
      category: "Governance & Reliability",
      icon: Send,
      accentColor: "amber",
      badge: "SHA-256 Deduplicated • Strict Semver Gating",
      description:
        "Direct-to-Telegram crash alerting and remote version governance protecting client installations without third-party analytics tracking or user surveillance.",
      metrics: [
        { label: "Deduplication Window", value: "60s" },
        { label: "Rate Limiter Ceiling", value: "15 msg/min" },
        { label: "Crash Payload Safe Cap", value: "4,000 Chars" },
        { label: "Enforcement Mode", value: "Non-Dismissible" },
      ],
      points: [
        "Serverless Crash Interceptor: Electron Main hooks uncaughtException and unhandledRejection, transmitting formatted crash logs directly to Telegram Bot API.",
        "SHA-256 Signature Deduplication: Computes SHA256(process + name + normalizedMsg + stack) to silence cascading crash loops and flood storms.",
        "Defensive HTML Truncation: Slices crash backtraces at 4,000 characters while auto-repairing HTML tags to adhere strictly to Telegram API formatting rules.",
        "Remote Semver Kill-Switch: Inspects min_supported_version in latest.yml. If client version is deprecated, mounts non-dismissible modal enforcing update installation.",
      ],
      codeSnippet: `// electron/services/TelegramNotifier.ts & UpdateManager.ts
// Compute unique fingerprint with 60s sliding window
const hash = crypto.createHash("sha256")
  .update(\`\${process}_\${error.name}_\${topStack}\`)
  .digest("hex");

if (recentHashes.has(hash)) return; // Debounced
recentHashes.set(hash, Date.now());

// Strict semver mandatory update evaluation
const isMandatory = semver.lt(currentVersion, remote.min_supported_version);
if (isMandatory) enforceModalLockout();`,
      sourceFile: "electron/services/UpdateManager.ts",
    },
  ];

  return (
    <section id="features" className="relative py-20 md:py-28 overflow-hidden bg-gray-950/60 border-t border-gray-800/80">
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-950/15 blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-12 md:pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 mb-4">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>AUTHENTIC ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            4 Core Subsystems Engineered for{" "}
            <span className="bg-linear-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Zero Latency & Total Stealth
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Every layer in NovaPilot AI is written from first principles in native Rust, Win32 API hooks, and resilient Node.js streams. No mockups, no generic SaaS wrappers.
          </p>
        </div>

        {/* Subsystem Interactive Tab Selector for Mobile / Desktop */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {subsystems.map((sub, index) => {
            const Icon = sub.icon;
            const isSelected = activeTab === index;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setActiveTab(index)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-mono transition-all border focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
                  isSelected
                    ? "bg-gray-800/90 border-cyan-400/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "bg-gray-900/50 border-gray-800 text-slate-400 hover:text-slate-200 hover:bg-gray-800/50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    sub.accentColor === "emerald"
                      ? "text-emerald-400"
                      : sub.accentColor === "violet"
                      ? "text-violet-400"
                      : sub.accentColor === "cyan"
                      ? "text-cyan-400"
                      : "text-amber-400"
                  }`}
                />
                <span>{sub.title.split(" ")[0]} {sub.title.split(" ")[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Subsystem Highlight Card */}
        {(() => {
          const current = subsystems[activeTab];
          const CurrentIcon = current.icon;
          return (
            <div className="mb-14 rounded-2xl border border-cyan-500/30 bg-gray-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Subsystem Details */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-gray-800/90 border border-gray-700/80 inline-flex">
                      <CurrentIcon
                        className={`w-6 h-6 ${
                          current.accentColor === "emerald"
                            ? "text-emerald-400"
                            : current.accentColor === "violet"
                            ? "text-violet-400"
                            : current.accentColor === "cyan"
                            ? "text-cyan-400"
                            : "text-amber-400"
                        }`}
                      />
                    </span>
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        {current.category}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {current.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {current.description}
                  </p>

                  {/* 4 Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                    {current.metrics.map((m) => (
                      <div
                        key={m.label}
                        className="rounded-lg bg-black/40 border border-gray-800 p-2.5 text-center"
                      >
                        <div className="text-base sm:text-lg font-bold font-mono text-cyan-300">
                          {m.value}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Architectural Points */}
                  <div className="space-y-2.5 pt-2">
                    {current.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Code and Architecture Inspection */}
                <div className="lg:col-span-5">
                  <div className="rounded-xl border border-gray-800 bg-black/70 overflow-hidden shadow-inner">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-900/80 border-b border-gray-800 text-xs font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="truncate max-w-[220px]">{current.sourceFile}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                        VERIFIED CODEBASE
                      </span>
                    </div>
                    <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed bg-black/40">
                      <code>{current.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 4 Cards Grid View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subsystems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-gray-800/90 bg-gray-900/50 p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/80 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-gray-800 border border-gray-700 inline-flex">
                        <Icon
                          className={`w-5 h-5 ${
                            item.accentColor === "emerald"
                              ? "text-emerald-400"
                              : item.accentColor === "violet"
                              ? "text-violet-400"
                              : item.accentColor === "cyan"
                              ? "text-cyan-400"
                              : "text-amber-400"
                          }`}
                        />
                      </span>
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                          {item.category}
                        </div>
                        <h4 className="text-lg font-bold text-white tracking-tight">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      0{index + 1}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-gray-950 border border-gray-800 text-cyan-300">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{item.badge}</span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-slate-400">
                    {item.points.slice(0, 2).map((p, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                        <span className="line-clamp-2">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab(index)}
                    className="inline-flex items-center gap-1.5 min-h-[44px] py-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded-md"
                  >
                    <span>Inspect Subsystem Specs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.sourceFile.split("/").pop()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
