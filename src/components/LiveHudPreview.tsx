import React, { useState } from "react";
import { NovaPilotLogoMark } from "./NovaPilotLogo";
import {
  Volume2,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  Layers,
  Monitor,
  Video,
  CheckCircle2,
} from "lucide-react";

export const LiveHudPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"interview" | "negotiation" | "architecture">("interview");
  const [viewMode, setViewMode] = useState<"split" | "interactive">("split");
  const [copied, setCopied] = useState(false);

  const scenarios = {
    interview: {
      title: "System Design: 100k QPS Rate Limiter",
      interviewer: "How would you architect a distributed rate limiter handling 100,000 requests per second across 50 microservices?",
      audioSource: "Google Meet · WASAPI Loopback Audio",
      response: "Use a Token Bucket algorithm backed by Redis Cluster with sliding-window counters and local in-memory L1 cache (Caffeine/Guava) to prevent Redis network saturation at 100k QPS.",
      bulletPoints: [
        "Algorithm: Token Bucket with Redis Cluster + Envoy Proxy filter",
        "Atomicity: Redis Lua script execution for zero race conditions",
        "Fault Tolerance: Graceful local rate limiting fallback on Redis timeout",
      ],
      codeSnippet: `// Redis Token Bucket Lua Script
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local current = tonumber(redis.call('get', key) or "0")
if current + 1 > limit then
    return 0 -- Rejected
else
    redis.call('incrby', key, 1)
    redis.call('expire', key, 1)
    return 1 -- Allowed
end`,
      model: "Gemini 2.0 Flash",
      latency: "120ms latency",
      speed: "48 tokens/sec",
    },
    negotiation: {
      title: "Senior Staff Offer Negotiation",
      interviewer: "Our initial budget caps base salary at $190k and equity at $150k. Does that match your expectations?",
      audioSource: "Zoom Meeting · WASAPI Audio Loopback",
      response: "Gracefully acknowledge the offer, anchor against current market data (Levels.fyi P75 for Senior Staff is $225k base + $220k equity), and highlight immediate ROI on their Kubernetes infrastructure migration.",
      bulletPoints: [
        "Market Anchoring: Benchmark against P75 Staff engineer total comp",
        "Value Proposition: Lead-time reduction on high-throughput pipelines",
        "Counter-Proposal: Propose performance-based 6-month equity cliff acceleration",
      ],
      codeSnippet: `// Negotiation Playbook
1. Anchor: "Based on recent market offers for Staff roles in infra..."
2. Leverage: "I can take ownership of the Q4 Kubernetes migration from Day 1."
3. Ask: "$215k base + $200k equity, or accelerated 6-month review."`,
      model: "Claude 3.5 Sonnet",
      latency: "190ms latency",
      speed: "36 tokens/sec",
    },
    architecture: {
      title: "Kafka Exactly-Once Semantics (EOS)",
      interviewer: "Can you explain how Kafka ensures exactly-once semantics (EOS) across partition boundaries?",
      audioSource: "Microsoft Teams · Audio Stream",
      response: "Kafka achieves EOS via idempotent producers (Producer ID + Monotonic Sequence Numbers) paired with the Transaction Coordinator performing atomic 2-phase commits to the __transaction_state topic.",
      bulletPoints: [
        "Idempotency: enable.idempotence=true rejects duplicate sequence numbers",
        "2-Phase Commit: Coordinator writes PREPARE_COMMIT then COMMITTED markers",
        "Isolation: Consumers with isolation.level=read_committed filter uncommitted records",
      ],
      codeSnippet: `// Kafka Producer Config
Properties props = new Properties();
props.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, "true");
props.put(ProducerConfig.TRANSACTIONAL_ID_CONFIG, "tx-order-stream-01");
producer.initTransactions();`,
      model: "DeepSeek R1",
      latency: "160ms latency",
      speed: "44 tokens/sec",
    },
  };

  const current = scenarios[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto space-y-4">
      {/* View Mode & Scenario Controller Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        {/* Scenario Selectors */}
        <div className="inline-flex p-1 bg-[#111116] rounded-xl border border-white/10 text-xs font-medium backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("interview")}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "interview"
                ? "bg-[#0047AB] text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            System Design
          </button>
          <button
            onClick={() => setActiveTab("negotiation")}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "negotiation"
                ? "bg-[#0047AB] text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Salary Negotiation
          </button>
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === "architecture"
                ? "bg-[#0047AB] text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Deep Architecture
          </button>
        </div>

        {/* Split View vs Full HUD Mode */}
        <div className="inline-flex p-1 bg-[#111116] rounded-xl border border-white/10 text-xs font-medium backdrop-blur-xl">
          <button
            onClick={() => setViewMode("split")}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "split"
                ? "bg-white/10 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#0052FF]" />
            <span>Split Stealth Comparison</span>
          </button>
          <button
            onClick={() => setViewMode("interactive")}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "interactive"
                ? "bg-white/10 text-white font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-[#0052FF]" />
            <span>Full HUD Experience</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === "split" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT SIDE: What YOU See (The Floating Stealth HUD) */}
          <div className="relative rounded-2xl border border-[#0047AB]/40 bg-[#0E0E14] p-6 space-y-4 shadow-2xl overflow-hidden flex flex-col justify-between backdrop-blur-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  WHAT YOU SEE (Physical Monitor)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#0052FF] font-bold bg-[#0052FF]/10 px-2 py-0.5 rounded border border-[#0052FF]/20">
                HUD VISIBLE
              </span>
            </div>

            {/* Simulated Live Audio Stream */}
            <div className="p-4 rounded-xl bg-black/60 border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#0052FF] font-mono font-semibold">
                  <div className="flex items-end gap-0.5 h-3.5">
                    <span className="w-1 bg-[#0052FF] rounded-sm animate-wave-1" />
                    <span className="w-1 bg-[#0052FF] rounded-sm animate-wave-2" />
                    <span className="w-1 bg-[#0052FF] rounded-sm animate-wave-3" />
                    <span className="w-1 bg-[#0052FF] rounded-sm animate-wave-4" />
                  </div>
                  <span className="text-[11px]">WASAPI LOOPBACK</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Whisper Local · 0ms</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-white leading-relaxed">
                "{current.interviewer}"
              </p>
            </div>

            {/* AI Streaming Response HUD */}
            <div className="p-4 rounded-xl bg-[#0047AB]/10 border border-[#0047AB]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>NovaPilot Live Copilot</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">{current.latency}</span>
                  <span>•</span>
                  <span>{current.speed}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {current.response}
              </p>

              <div className="space-y-1 pt-1">
                {current.bulletPoints.map((bp, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                    <span className="text-[#0052FF] font-bold">•</span>
                    <span>{bp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
              <span>Hotkeys: Ctrl+Shift+Space</span>
              <span className="text-emerald-400 font-medium">100% Stealth Active</span>
            </div>
          </div>

          {/* RIGHT SIDE: What ZOOM / TEAMS Sees (Screen Share View) */}
          <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0E] p-6 space-y-4 shadow-2xl overflow-hidden flex flex-col justify-between text-zinc-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  WHAT ZOOM / TEAMS SEES (Screen Share)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                0% OVERLAY VISIBLE
              </span>
            </div>

            {/* Clean Code Editor */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0E0E14] p-4 font-mono text-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-white/[0.06] pb-2">
                <span>solution.ts — VS Code</span>
                <span>UTF-8</span>
              </div>
              <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed font-mono">
                <code>{current.codeSnippet}</code>
              </pre>
            </div>

            {/* Screen Share Confirmation */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Screen Capture: Clean Desktop Stream</span>
              </div>
              <span className="text-slate-400 text-[10px]">WDA_EXCLUDEFROMCAPTURE</span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 text-center pt-1">
              ✓ Remote meeting participants see only your IDE / presentation
            </div>
          </div>
        </div>
      ) : (
        /* FULL INTERACTIVE HUD */
        <div className="rounded-2xl border border-white/10 bg-[#0E0E14] backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
              </div>
              <div className="h-4 w-[1px] bg-white/10 mx-1" />
              <div className="flex items-center gap-2">
                <NovaPilotLogoMark size={16} color="#0052FF" />
                <span className="text-xs font-bold text-white font-mono">
                  NOVAPILOT STEALTH HUD v2.7
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" />
                <span>STEALTH ON (ExcludeFromCapture)</span>
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            <div className="rounded-xl border border-white/[0.08] bg-black/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#0052FF] font-mono font-semibold">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{current.audioSource}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Local Whisper Core</span>
              </div>
              <p className="text-sm sm:text-base font-medium text-white leading-relaxed">
                "{current.interviewer}"
              </p>
            </div>

            <div className="rounded-xl border border-[#0047AB]/30 bg-[#0047AB]/10 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#0047AB]/20 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span className="text-xs font-bold text-white">{current.model} (Streaming)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                    {current.speed}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                {current.response}
              </p>

              <div className="space-y-1.5 pt-1">
                {current.bulletPoints.map((bp, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                    <span className="text-[#0052FF] font-bold">•</span>
                    <span>{bp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono pt-2">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-slate-300">
                  Ctrl+Shift+Space (HUD)
                </span>
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-slate-300">
                  Ctrl+Shift+S (OCR Snip)
                </span>
                <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[11px] text-slate-300">
                  Ctrl+Shift+C (Copilot)
                </span>
              </div>
              <span className="text-emerald-400">100% Local Storage · 0 Telemetry</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
