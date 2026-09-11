"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Shield,
  Zap,
  SlidersHorizontal,
  Layers,
  Cpu,
  Lock,
  Monitor,
  HardDrive,
} from "lucide-react";

export default function SpecsTable() {
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const comparisonRows = [
    {
      id: "audio",
      dimension: "Audio Capture Architecture & Latency",
      category: "audio",
      icon: SlidersHorizontal,
      novapilot: {
        title: "Hardware WASAPI Loopback (Rust CPAL 0.15.2)",
        details:
          "Direct OS render endpoint capture with AUDCLNT_STREAMFLAGS_LOOPBACK. Dynamic N-channel downmix to 16kHz mono PCM. Lock-free HeapRb buffer, <5ms latency.",
        status: "pass",
        metric: "<5ms Latency",
      },
      genericBots: {
        title: "WebRTC Mic Capture / Virtual Audio Cable",
        details:
          "Relies on browser getUserMedia or third-party virtual audio driver cables. Prone to driver conflicts, channel inversion, and 150ms–400ms buffer latency.",
        status: "fail",
        metric: "150ms–400ms",
      },
    },
    {
      id: "stealth",
      dimension: "Meeting Stealth & Screen-Share",
      category: "stealth",
      icon: Shield,
      novapilot: {
        title: "Win32 WDA_EXCLUDEFROMCAPTURE",
        details:
          "Directs OS compositor to omit HUD from screen capture in Zoom, Teams, Meet, Slack, and OBS. Transparent click-through with zero focus theft.",
        status: "pass",
        metric: "100% invisible",
      },
      genericBots: {
        title: "Invasive Cloud Bot Attendee",
        details:
          "Injects a visible bot user into the call roster ('Notetaker AI has joined the meeting'). Triggers recording consent banners and audible alerts.",
        status: "fail",
        metric: "Visible to all",
      },
    },
    {
      id: "reasoning",
      dimension: "Reasoning Tag Filter (Chain-of-Thought)",
      category: "ai",
      icon: Cpu,
      novapilot: {
        title: "StreamingThinkStripper Two-State FSM",
        details:
          "Real-time token streaming filter stripping <think>, <thought>, and <reasoning> blocks with 0-byte leak guarantee across network chunk boundaries.",
        status: "pass",
        metric: "0-byte leak",
      },
      genericBots: {
        title: "Unfiltered Raw Stream or Post-Processing",
        details:
          "Leaks raw chain-of-thought tokens directly into the UI, or applies naive post-hoc regex that introduces 2–5 second output delays.",
        status: "fail",
        metric: "Tokens leak",
      },
    },
    {
      id: "privacy",
      dimension: "Data Privacy & Storage",
      category: "privacy",
      icon: Lock,
      novapilot: {
        title: "100% Local-First Architecture",
        details:
          "Zero raw audio files are stored or uploaded to intermediate company servers. Local SQLite database and direct-to-provider HTTPS inference.",
        status: "pass",
        metric: "Zero cloud audio",
      },
      genericBots: {
        title: "Cloud-Hosted Recordings & Transcripts",
        details:
          "All meeting audio is piped to cloud infrastructure, transcribed on third-party servers, and frequently retained to train proprietary models.",
        status: "fail",
        metric: "Cloud stored",
      },
    },
    {
      id: "integration",
      dimension: "Platform Compatibility & Integration",
      category: "system",
      icon: Monitor,
      novapilot: {
        title: "Native Windows 10 & 11 Desktop (x64)",
        details:
          "Global keyboard shortcuts (CmdOrCtrl+B, CmdOrCtrl+Shift+B) with 10s health recovery. Inertial 250ms decay scrolling without window focus.",
        status: "pass",
        metric: "Native OS hooks",
      },
      genericBots: {
        title: "Web Browser Tab or Chrome Extension",
        details:
          "Trapped inside a browser sandbox. Inactive when backgrounded; requires active tab focus to register key combinations; hotkeys collide with meeting apps.",
        status: "fail",
        metric: "Sandbox only",
      },
    },
    {
      id: "footprint",
      dimension: "System Resource Footprint",
      category: "system",
      icon: HardDrive,
      novapilot: {
        title: "Native Rust DSP + BatchEmitter (3:1)",
        details:
          "Bytemuck zero-copy casting with 3-frame audio batching cuts V8 IPC boundary crossings by 66.7%. Lightweight footprint: <120MB RAM, <1% CPU.",
        status: "pass",
        metric: "<120MB RAM",
      },
      genericBots: {
        title: "Heavy Chromium Audio Contexts",
        details:
          "Consumes 500MB–1.2GB RAM. Continuous WebRTC audio processing spins laptop fans and triggers microphone stutter and dropped frames.",
        status: "fail",
        metric: ">600MB RAM",
      },
    },
  ];

  const filteredRows =
    filterCategory === "all"
      ? comparisonRows
      : comparisonRows.filter((r) => r.category === filterCategory);

  return (
    <section id="specs" className="relative py-20 md:py-28 overflow-hidden bg-gray-950/80 border-t border-gray-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 mb-4">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>ARCHITECTURAL BENCHMARK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            NovaPilot AI Desktop vs.{" "}
            <span className="text-cyan-400">
              Generic Cloud Meeting Bots
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Side-by-side technical evaluation across 6 critical operational dimensions. See why executive teams choose native local hardware loopback over cloud attendees.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: "all", label: "All Dimensions (6)" },
            { id: "audio", label: "Audio Capture" },
            { id: "stealth", label: "Stealth & Screen-Share" },
            { id: "ai", label: "Reasoning FSM" },
            { id: "privacy", label: "Privacy & Storage" },
            { id: "system", label: "System & Resources" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3.5 py-2 min-h-[44px] rounded-lg text-xs font-mono transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
                filterCategory === cat.id
                  ? "bg-cyan-600 text-white font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "bg-gray-900 border border-gray-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 shadow-xl backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/90 text-xs font-mono uppercase tracking-wider text-slate-400">
                <th scope="col" className="py-4 px-6 w-1/4">
                  Technical Dimension
                </th>
                <th scope="col" className="py-4 px-6 w-[42%] bg-cyan-950/30 border-x border-cyan-500/20 text-cyan-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>NovaPilot AI Desktop v2.7.1</span>
                  </div>
                </th>
                <th scope="col" className="py-4 px-6 w-[33%] text-slate-400">
                  Generic Cloud Meeting Bots
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/80 text-sm">
              {filteredRows.map((row) => {
                const Icon = row.icon;
                return (
                  <tr key={row.id} className="hover:bg-gray-800/40 transition-colors">
                    {/* Dimension Name */}
                    <td className="py-5 px-6 font-semibold text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-gray-800 border border-gray-700 text-cyan-400">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>{row.dimension}</span>
                      </div>
                    </td>

                    {/* NovaPilot Column */}
                    <td className="py-5 px-6 bg-cyan-950/15 border-x border-cyan-500/20">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {row.novapilot.title}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                              {row.novapilot.metric}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                            {row.novapilot.details}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Generic Bots Column */}
                    <td className="py-5 px-6">
                      <div className="flex items-start gap-2.5">
                        <XCircle className="w-5 h-5 text-rose-400/80 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-300">
                              {row.genericBots.title}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-950/50 border border-rose-500/30 text-rose-300">
                              {row.genericBots.metric}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                            {row.genericBots.details}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View */}
        <div className="lg:hidden space-y-6">
          {filteredRows.map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.id}
                className="rounded-xl border border-gray-800 bg-gray-900/70 p-5 space-y-4"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-gray-800 text-white font-bold text-base">
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{row.dimension}</span>
                </div>

                {/* NovaPilot Card Sub-Section */}
                <div className="p-3.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-cyan-300">
                      NovaPilot AI Desktop
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      {row.novapilot.metric}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {row.novapilot.title}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {row.novapilot.details}
                  </p>
                </div>

                {/* Generic Bots Card Sub-Section */}
                <div className="p-3.5 rounded-lg border border-gray-800 bg-black/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      Generic Cloud Bots
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-950/40 border border-rose-500/30 text-rose-300">
                      {row.genericBots.metric}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-300">
                    {row.genericBots.title}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {row.genericBots.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
