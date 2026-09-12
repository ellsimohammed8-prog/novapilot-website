"use client";

import React, { useState } from "react";
import DownloadButton, { WindowsIcon } from "@/components/ui/download-button";
import { useOperatingSystem } from "@/hooks/use-operating-system";
import {
  ShieldCheck,
  HardDrive,
  Cpu,
  Check,
  Copy,
  ExternalLink,
  FileCode,
  Package,
  Terminal,
  Download,
} from "lucide-react";

export default function WindowsCta() {
  const [copiedSha, setCopiedSha] = useState(false);
  const { os, isWindows, architecture, isHydrated } = useOperatingSystem();

  const sha512Hash =
    "acc168926f7bbb553b954a6fe5c9a8b61797626088a117de653e211feec6e6f6420690a193b9d92c5bcb69f3fe639c231381e4f852212899b0012212fbe914e5";

  const handleCopyHash = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sha512Hash).catch(() => {});
    }
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2500);
  };

  const systemRequirements = [
    { label: "Operating System", value: "Windows 10 / 11 (64-bit)", icon: WindowsIcon },
    { label: "Processor Architecture", value: "x64 Intel / AMD (AVX2 supported)", icon: Cpu },
    { label: "Memory (RAM)", value: "4 GB minimum (8 GB recommended)", icon: HardDrive },
    { label: "Storage Required", value: "600 MB free NVMe / SSD space", icon: Package },
  ];

  return (
    <section id="download" className="relative py-20 md:py-28 overflow-hidden bg-[#0B0F19] border-t border-[rgba(255,255,255,0.08)]">
      {/* Subtle executive cobalt glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-[#0047AB]/10 blur-[120px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Executive Chassis Container (#111827 chassis) */}
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-[rgba(255,255,255,0.12)] bg-[#111827] p-8 sm:p-12 shadow-2xl shadow-black/60 backdrop-blur-2xl">
          {/* Badge */}
          <div className="flex justify-center pb-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-xs font-mono text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>OFFICIAL PRODUCTION RELEASE v2.7.1</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#FFFFFF] tracking-tight">
              Equip Your Desktop with{" "}
              <span className="text-[#3B82F6]">
                Stealth AI Supremacy
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Direct installer for Windows 10 &amp; 11 (64-bit). 100% self-contained desktop runtime with native WASAPI audio loopback, zero-leak reasoning extraction, and screen-share exclusion.
            </p>

            {/* Platform detection advisory if on non-Windows */}
            {isHydrated && !isWindows && (
              <div suppressHydrationWarning className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-amber-500/30 bg-amber-950/30 text-xs font-mono text-amber-200">
                <span>Notice: {os === "mac" ? "macOS" : os === "linux" ? "Linux" : "Non-Windows"} browser detected. This installer is built for Windows 10 &amp; 11 (x64).</span>
              </div>
            )}

            {/* Primary Action Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <DownloadButton
                variant="primary"
                showVersion={true}
                showPlatform={false}
                href="https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe"
                label="Download Setup Installer (.exe)"
                className="w-full sm:w-auto px-8 py-4 text-base shadow-[0_0_30px_rgba(0,71,171,0.4)]"
              />
              <a
                href="https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-2.7.1.exe"
                download="NovaPilot-AI-2.7.1.exe"
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-semibold text-[#FFFFFF] bg-[#1E293B] hover:bg-[#334155] border border-[rgba(255,255,255,0.12)] hover:border-white/25 transition-all duration-200 active:scale-[0.98] min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-hidden"
                aria-label="Download Portable (.exe)"
              >
                <Download className="w-4 h-4 text-slate-300" />
                <span>Download Portable (.exe)</span>
              </a>
            </div>

            <div className="mt-3 text-xs font-mono text-slate-400">
              Installer: <span className="text-slate-200">NovaPilot-AI-Setup-2.7.1.exe</span> (~466 MB) • Portable: <span className="text-slate-200">NovaPilot-AI-2.7.1.exe</span> (~466 MB) • Windows 10 &amp; 11 (64-bit)
            </div>
          </div>

          {/* System Requirements Grid (#1E293B cards) */}
          <div className="mt-10 pt-8 border-t border-[rgba(255,255,255,0.08)]">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 text-center mb-6">
              Verified Windows System Requirements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemRequirements.map((req) => {
                const Icon = req.icon;
                return (
                  <div
                    key={req.label}
                    className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1E293B] p-4 text-left transition-colors hover:border-[#1D4ED8]/40"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-1">
                      <Icon className="w-4 h-4 text-[#3B82F6] shrink-0" />
                      <span>{req.label}</span>
                    </div>
                    <div className="text-sm font-semibold text-[#FFFFFF]">
                      {req.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SHA-512 Checksum Verification Card (#1E293B card) */}
          <div className="mt-8 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#1E293B] p-4 font-mono text-xs text-slate-300">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[rgba(255,255,255,0.08)] text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <FileCode className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span className="text-[#FFFFFF] font-semibold">SHA-512 Integrity Checksum</span>
              </div>
              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[32px] rounded-md bg-[#111827] hover:bg-[#334155] text-slate-200 border border-[rgba(255,255,255,0.08)] transition-colors focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-hidden"
                title="Copy SHA-512 checksum"
              >
                {copiedSha ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-2.5 break-all text-slate-300 select-all font-mono leading-relaxed bg-[#111827] p-2.5 rounded-lg border border-[rgba(255,255,255,0.06)]">
              {sha512Hash}
            </div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-slate-400 inline shrink-0" />
                PowerShell: <code className="text-blue-300 bg-black/40 px-1 py-0.5 rounded">Get-FileHash NovaPilot-AI-Setup-2.7.1.exe -Algorithm SHA512</code>
              </span>
              <span className="text-emerald-400">Release Verified 2026-09-09</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
