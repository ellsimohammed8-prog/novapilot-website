"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Code2,
  EyeOff,
  AudioWaveform,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Terminal,
  Layers,
  Monitor,
  Video,
  Radio,
  Sliders,
  Maximize2,
  Minimize2,
  Mic,
} from "lucide-react";
import VideoShowcase from "@/components/video-showcase";

type ScenarioType = "coding" | "stealth" | "audio" | "video";

interface DiarizationEntry {
  speaker: string;
  role: "remote" | "local" | "hud";
  time: string;
  text: string;
  channel: "WASAPI Loopback" | "Hardware Mic" | "Neural Core";
}

export default function MediaShowcase() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>("coding");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(38); // 0 to 100
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [showWaveforms, setShowWaveforms] = useState<boolean>(true);
  const [stealthViewMode, setStealthViewMode] = useState<"host" | "zoom">("host");

  const scrubberRef = useRef<HTMLDivElement | null>(null);

  // Playback timer & progress animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return +(prev + 0.25 * playbackSpeed).toFixed(1);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Handle timeline scrubber interaction
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setProgress(+newProgress.toFixed(1));
  };

  // Convert progress (0-100) to formatted timestamp (3m 40s duration)
  const formatTime = (pct: number) => {
    const totalSeconds = 220; // 3:40
    const current = Math.floor((pct / 100) * totalSeconds);
    const mins = Math.floor(current / 60);
    const secs = current % 60;
    return `0${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Sample diarization log for Scenario 3
  const diarizationLogs: DiarizationEntry[] = [
    {
      speaker: "Principal Interviewer",
      role: "remote",
      time: "00:12",
      channel: "WASAPI Loopback",
      text: "Can you explain how you prevent audio thread priority inversion and ensure bounded buffer latency?",
    },
    {
      speaker: "NovaPilot Neural Engine",
      role: "hud",
      time: "00:14",
      channel: "Neural Core",
      text: "Synthesis: Lock-free SPSC ring buffer (HeapRb<f32>), atomic head/tail pointers, zero allocation in audio callback.",
    },
    {
      speaker: "You (Candidate)",
      role: "local",
      time: "00:18",
      channel: "Hardware Mic",
      text: "In real-time audio threads, you never acquire mutex locks. Instead, we use a single-producer single-consumer ring buffer with atomic indices...",
    },
    {
      speaker: "Principal Interviewer",
      role: "remote",
      time: "00:32",
      channel: "WASAPI Loopback",
      text: "Excellent. And how do you bridge those samples into the V8 isolate without causing garbage collection spikes?",
    },
  ];

  return (
    <section id="demo" className="relative py-20 lg:py-28 overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-950/20 blur-[150px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-10 right-20 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-950/20 blur-[130px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-10 md:pb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 mb-4 shadow-[0_0_16px_rgba(16,185,129,0.15)]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>60 FPS Operational Simulation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Live Workflow &amp; Media Showcase
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Experience NovaPilot in action across real-world high-stakes technical
            interviews, stealth screen-share presentations, and multi-channel audio
            stream diarization.
          </p>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          <button
            type="button"
            onClick={() => setActiveScenario("coding")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
              activeScenario === "coding"
                ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                : "bg-gray-900/60 text-slate-400 hover:text-white border border-gray-800 hover:border-gray-700"
            }`}
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>Scenario 1: Live Coding Interview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScenario("stealth")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
              activeScenario === "stealth"
                ? "bg-violet-950 text-violet-300 border border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                : "bg-gray-900/60 text-slate-400 hover:text-white border border-gray-800 hover:border-gray-700"
            }`}
          >
            <EyeOff className="w-4 h-4 text-violet-400" />
            <span>Scenario 2: Stealth Screen-Share Proof</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScenario("audio")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
              activeScenario === "audio"
                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                : "bg-gray-900/60 text-slate-400 hover:text-white border border-gray-800 hover:border-gray-700"
            }`}
          >
            <AudioWaveform className="w-4 h-4 text-emerald-400" />
            <span>Scenario 3: WASAPI Stream Diarization</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScenario("video")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
              activeScenario === "video"
                ? "bg-blue-950 text-blue-300 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                : "bg-gray-900/60 text-slate-400 hover:text-white border border-gray-800 hover:border-gray-700"
            }`}
          >
            <Video className="w-4 h-4 text-blue-400" />
            <span>Scenario 4: 1080p Video Showcase Film</span>
          </button>
        </div>

        {/* 16:9 Widescreen Showcase Container */}
        <div className="relative mx-auto max-w-6xl rounded-3xl bg-gray-950 border border-gray-800 shadow-[0_0_50px_-12px_rgba(6,182,212,0.2)] overflow-hidden">
          {/* Top Chassis Chrome Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-800/80 bg-gray-900/80 backdrop-blur-md">
            {/* Window control dots */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/40" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/40" />
              <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                novapilot-v2.7.1-win32-x64 :: simulation_runtime
              </span>
            </div>

            {/* Live telemetry badges */}
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                60 FPS
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                12ms HUD
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-violet-950/60 border border-violet-500/30 text-violet-400">
                STEALTH ACTIVE
              </span>
            </div>
          </div>

          {/* Active 16:9 Viewport */}
          <div className="relative aspect-auto min-h-[460px] sm:aspect-video w-full bg-gray-950 flex flex-col justify-between overflow-hidden select-none">
            {/* ================================================================= */}
            {/* SCENARIO 1: LIVE CODING INTERVIEW SIMULATION */}
            {/* ================================================================= */}
            {activeScenario === "coding" && (
              <div className="relative w-full h-full p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
                {/* Interview Context Header */}
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center">
                      <Code2 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-400">
                        Interview Stream [Google / Meta Systems Round]
                      </div>
                      <div className="text-sm font-semibold text-white">
                        WASAPI Captured: &quot;Design a thread-safe, lock-free ring buffer for real-time audio in Rust&quot;
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>DeepSeek R1 + ThinkStripper</span>
                  </div>
                </div>

                {/* Bifocal Code & Reasoning Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
                  {/* Left Panel: Raw LLM Output (With <think> tags) */}
                  <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        Raw LLM Inference Stream
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/50 border border-amber-500/30 text-amber-300">
                        Contains &lt;think&gt; Tokens
                      </span>
                    </div>

                    <div className="font-mono text-xs text-slate-400 space-y-2 leading-relaxed max-h-[160px] overflow-y-auto">
                      <div className="text-amber-300/80 text-[11px] bg-amber-950/20 border border-amber-500/20 p-2 rounded-lg">
                        &lt;think&gt;
                        <br />
                        The interviewer is asking for a real-time lock-free ring buffer.
                        Mutex locks cause priority inversion in WASAPI/CoreAudio callbacks.
                        We need single-producer single-consumer (SPSC) using AtomicUsize for head/tail.
                        Rust AtomicI16 for 16-bit audio PCM. Must avoid heap allocations in push().
                        &lt;/think&gt;
                      </div>
                      <div className="text-slate-300">
                        {"// Synthesizing production implementation..."}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between text-[11px] font-mono text-amber-400">
                      <span>Tag Leak Risk: HIGH (Cloud Bots Leak)</span>
                      <span>Filter: ThinkStripper Active</span>
                    </div>
                  </div>

                  {/* Right Panel: NovaPilot Stealth HUD Stream (Stripped & Clean) */}
                  <div className="rounded-2xl bg-cyan-950/30 border border-cyan-500/40 p-4 relative overflow-hidden shadow-[0_0_24px_rgba(6,182,212,0.15)] flex flex-col justify-between">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-cyan-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        NovaPilot Stealth HUD [Clean Output]
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                        0-Byte Reasoning Leak
                      </span>
                    </div>

                    <div className="font-mono text-xs text-cyan-100 bg-gray-950/80 border border-cyan-500/30 p-3 rounded-xl overflow-x-auto leading-relaxed">
                      <pre>
                        <code>{`// High-performance lock-free ring buffer for 16kHz PCM
pub struct AudioRingBuffer {
    buffer: Vec<AtomicI16>,
    head: AtomicUsize,
    tail: AtomicUsize,
    capacity: usize,
}

impl AudioRingBuffer {
    #[inline(always)]
    pub fn push(&self, sample: i16) -> Result<(), ()> {
        let head = self.head.load(Ordering::Relaxed);
        let next_head = (head + 1) % self.capacity;
        if next_head == self.tail.load(Ordering::Acquire) {
            return Err(()); // Buffer full: zero allocation drop
        }
        self.buffer[head].store(sample, Ordering::Release);
        self.head.store(next_head, Ordering::Release);
        Ok(())
    }
}`}</code>
                      </pre>
                    </div>

                    <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                      <span>Latency: 18ms TTFT</span>
                      <span className="text-emerald-400">Identity: First-Person Persona</span>
                    </div>
                  </div>
                </div>

                {/* Audio capture indicator */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-gray-800/80 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>WASAPI Loopback Capture: 16,000 Hz Mono PCM</span>
                  </div>
                  <div>Status: Real-Time Stream Synchronized</div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SCENARIO 2: STEALTH SCREEN-SHARE PROOF (BIFOCAL COMPARISON) */}
            {/* ================================================================= */}
            {activeScenario === "stealth" && (
              <div className="relative w-full h-full p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
                {/* Header with Bifocal Mode Switch */}
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-500/40 flex items-center justify-center">
                      <EyeOff className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-400">
                        Screen-Share Capture Exclusion Proof
                      </div>
                      <div className="text-sm font-semibold text-white">
                        Win32 SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE = 0x00000011)
                      </div>
                    </div>
                  </div>

                  {/* Bifocal toggle switch */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900 border border-gray-800">
                    <button
                      type="button"
                      onClick={() => setStealthViewMode("host")}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                        stealthViewMode === "host"
                          ? "bg-violet-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5 inline mr-1" />
                      Your Screen (Host)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStealthViewMode("zoom")}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                        stealthViewMode === "zoom"
                          ? "bg-rose-600 text-white shadow-md"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 inline mr-1" />
                      Zoom / Teams Sees
                    </button>
                  </div>
                </div>

                {/* Screen Preview Simulation */}
                <div className="relative my-auto rounded-2xl bg-slate-900/90 border border-gray-800 p-4 h-[220px] flex flex-col justify-between overflow-hidden">
                  {/* Fake IDE / Meeting Background */}
                  <div className="space-y-2 opacity-60">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="w-3 h-3 rounded bg-blue-500/40 inline-block" />
                      <span>VS Code — main.rs (Screen Share Active in Zoom Meeting #891-230-112)</span>
                    </div>
                    <div className="font-mono text-xs text-slate-500 pl-4 border-l border-slate-700">
                      <div>pub fn process_meeting_stream() -&gt; Result&lt;AudioBuffer, AudioError&gt; &#123;</div>
                      <div className="pl-4">let frame = capture_hardware_stream()?;</div>
                      <div className="pl-4">resample_polyphase(&amp;frame, 16000);</div>
                      <div>&#125;</div>
                    </div>
                  </div>

                  {/* Mode A: What You See (Floating HUD visible) */}
                  {stealthViewMode === "host" ? (
                    <div className="absolute inset-x-8 top-12 p-3.5 rounded-2xl bg-gray-950/95 border border-violet-500/60 shadow-[0_0_30px_rgba(139,92,246,0.3)] backdrop-blur-xl animate-in fade-in zoom-in duration-200">
                      <div className="flex items-center justify-between text-xs font-mono mb-2">
                        <span className="text-violet-300 font-bold flex items-center gap-1.5">
                          <EyeOff className="w-3.5 h-3.5 text-violet-400" />
                          NovaPilot Stealth HUD [VISIBLE TO YOU ONLY]
                        </span>
                        <span className="text-emerald-400 text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                          Click-Through Active (Cmd+Shift+B)
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 font-sans leading-relaxed">
                        • Recommended Answer: Highlight the <strong className="text-violet-300">polyphase sinc filter</strong> attenuation curve (&gt;20 dB alias rejection). Mention zero heap memory allocation in the audio render callback.
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Window Level: screen-saver</span>
                        <span>DWM Exclusion: Active</span>
                      </div>
                    </div>
                  ) : (
                    /* Mode B: What Zoom Sees (Zero trace of HUD) */
                    <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
                      <div className="text-center px-4 py-2 rounded-xl bg-gray-950/70 border border-emerald-500/40 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="text-xs font-mono font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          100% Invisible on Zoom / Teams / Meet Screen-Share
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          The OS compositor renders pure desktop — Zero HUD pixels leak into capture buffer
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Watermark notice */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10 border-t border-gray-800 pt-2">
                    <span className="text-violet-400">
                      Mode: {stealthViewMode === "host" ? "Host Display (Local Monitor)" : "Remote Screen-Share Stream"}
                    </span>
                    <span>SetWindowDisplayAffinity: 0x00000011</span>
                  </div>
                </div>

                {/* Bottom specs */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-gray-800/80 pt-2">
                  <div>Compatibility: Zoom, Teams, Meet, Slack Huddles, OBS</div>
                  <div className="text-emerald-400">Zero Black Screen Glitches</div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SCENARIO 3: WASAPI AUDIO STREAM DIARIZATION */}
            {/* ================================================================= */}
            {activeScenario === "audio" && (
              <div className="relative w-full h-full p-4 sm:p-6 lg:p-8 flex flex-col justify-between overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
                      <AudioWaveform className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-400">
                        Multi-Channel WASAPI Audio Diarization
                      </div>
                      <div className="text-sm font-semibold text-white">
                        Dual-Stream Capture: System Loopback + Hardware Microphone
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-emerald-400">
                    <span>16,000 Hz CANONICAL_STT</span>
                    <span>&lt; 5ms Buffer</span>
                  </div>
                </div>

                {/* Dual Waveform Visualizers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto">
                  {/* Channel 0: Remote System Loopback */}
                  <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                        <AudioWaveform className="w-3.5 h-3.5 text-emerald-400" />
                        Channel 0: System Loopback (Interviewer)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                        48kHz -&gt; 16kHz Sinc
                      </span>
                    </div>

                    {/* Animated Waveform Oscilloscope Bars */}
                    <div className="h-12 flex items-center justify-between gap-1 px-2 bg-gray-950/80 rounded-xl border border-emerald-500/20">
                      {[32, 65, 80, 45, 95, 70, 40, 60, 85, 90, 55, 75, 40, 85, 60, 30].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full bg-emerald-400/80 transition-all duration-150"
                            style={{
                              height: isPlaying ? `${Math.max(15, (h * (progress % 10)) / 6)}%` : "20%",
                            }}
                          />
                        )
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>RMS: -18.4 dB</span>
                      <span className="text-emerald-400">VAD: Speech Active</span>
                    </div>
                  </div>

                  {/* Channel 1: Local Hardware Microphone */}
                  <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/40">
                    <div className="flex items-center justify-between text-xs font-mono mb-2">
                      <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-cyan-400" />
                        Channel 1: Hardware Mic (Local Candidate)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                        16kHz PCM Direct
                      </span>
                    </div>

                    {/* Animated Waveform Oscilloscope Bars */}
                    <div className="h-12 flex items-center justify-between gap-1 px-2 bg-gray-950/80 rounded-xl border border-cyan-500/20">
                      {[20, 35, 50, 85, 65, 40, 75, 90, 45, 60, 30, 80, 50, 35, 25, 45].map(
                        (h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full bg-cyan-400/80 transition-all duration-150"
                            style={{
                              height: isPlaying ? `${Math.max(15, (h * ((100 - progress) % 10)) / 6)}%` : "25%",
                            }}
                          />
                        )
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>RMS: -24.1 dB</span>
                      <span className="text-cyan-400">Noise Floor Gate: Passed</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Diarization Feed */}
                <div className="rounded-xl bg-gray-900/80 border border-gray-800 p-3 space-y-1.5 max-h-[90px] overflow-y-auto">
                  {diarizationLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono flex items-start gap-2 text-slate-300"
                    >
                      <span className="text-slate-500 text-[10px] mt-0.5">[{log.time}]</span>
                      <span
                        className={`font-semibold text-[11px] ${
                          log.role === "remote"
                            ? "text-emerald-400"
                            : log.role === "local"
                            ? "text-cyan-400"
                            : "text-violet-400"
                        }`}
                      >
                        {log.speaker}:
                      </span>
                      <span className="text-slate-200 text-xs truncate">{log.text}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-t border-gray-800/80 pt-2">
                  <div>Zero Echo Feedback: Dual Ring Buffer Separation</div>
                  <div className="text-emerald-400">Diarization Accuracy: 99.8%</div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* SCENARIO 4: 1080P COMMERCIAL VIDEO SHOWCASE FILM */}
            {/* ================================================================= */}
            {activeScenario === "video" && (
              <div className="relative w-full h-full p-2 sm:p-4 overflow-y-auto">
                <VideoShowcase className="py-2" />
              </div>
            )}
          </div>

          {/* Bottom Interactive Chrome Controls & Scrubber */}
          <div className="px-4 sm:px-6 py-3.5 border-t border-gray-800/80 bg-gray-900/90 backdrop-blur-md">
            {/* Interactive Timeline Scrubber */}
            <div className="mb-3">
              <div
                ref={scrubberRef}
                onClick={handleScrubberClick}
                className="relative w-full h-2 bg-gray-800 rounded-full cursor-pointer overflow-hidden group"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-emerald-500 via-cyan-500 to-violet-500 rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md transition-all duration-75 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  style={{ left: `calc(${progress}% - 7px)` }}
                />
              </div>
            </div>

            {/* Playback Actions Bar */}
            <div className="flex items-center justify-between gap-4">
              {/* Play / Pause & Scrubber Time */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                  aria-label={isPlaying ? "Pause Simulation" : "Play Simulation"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setProgress(0)}
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg bg-gray-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                  aria-label="Restart Simulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="text-xs font-mono text-slate-300 tabular-nums">
                  <span className="text-cyan-400">{formatTime(progress)}</span>
                  <span className="text-slate-400"> / </span>
                  <span>03:40</span>
                </div>
              </div>

              {/* Auxiliary Controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Waveform Toggle */}
                <button
                  type="button"
                  onClick={() => setShowWaveforms(!showWaveforms)}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
                    showWaveforms
                      ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
                      : "bg-gray-800 text-slate-400"
                  }`}
                >
                  <AudioWaveform className="w-3.5 h-3.5" />
                  <span>Waveform</span>
                </button>

                {/* Speed Selector */}
                <button
                  type="button"
                  onClick={() => {
                    const speeds = [1, 1.5, 2];
                    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                    setPlaybackSpeed(nextSpeed);
                  }}
                  className="px-3 py-2 min-h-[44px] rounded-lg bg-gray-800 hover:bg-gray-700 text-slate-300 text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                >
                  {playbackSpeed}x Speed
                </button>

                {/* Audio Mute Toggle */}
                <button
                  type="button"
                  onClick={() => setIsAudioMuted(!isAudioMuted)}
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg bg-gray-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                  aria-label={isAudioMuted ? "Unmute Audio" : "Mute Audio"}
                >
                  {isAudioMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
