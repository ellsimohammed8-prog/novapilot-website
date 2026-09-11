"use client";

import React from "react";
import Link from "next/link";
import { useOperatingSystem } from "@/hooks/use-operating-system";

export interface DownloadButtonProps {
  variant?: "primary" | "secondary" | "compact";
  showVersion?: boolean;
  showPlatform?: boolean;
  className?: string;
  label?: string;
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function WindowsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.949-1.558L24 0v11.4H10.949V1.891zM0 12.551h9.75v9.451L0 20.651v-8.1zm10.949 0H24V24l-13.051-1.891V12.551z" />
    </svg>
  );
}

export default function DownloadButton({
  variant = "primary",
  showVersion = true,
  showPlatform = true,
  className = "",
  label,
  href = "https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe",
  target,
  rel,
  onClick,
}: DownloadButtonProps) {
  const { os, isWindows, architecture, isHydrated } = useOperatingSystem();
  const versionTag = "v2.7.1";
  const installerSlug = "NovaPilot-AI-Setup-2.7.1.exe";

  const isDirectDownload = href.endsWith(".exe");
  const isExternal = href.startsWith("http");
  const linkTarget = isDirectDownload ? undefined : (target || (isExternal ? "_blank" : undefined));
  const linkRel = isDirectDownload ? undefined : (rel || (linkTarget === "_blank" ? "noopener noreferrer" : undefined));

  // Platform indicator text
  const platformLabel = isHydrated && !isWindows
    ? os === "mac"
      ? "macOS detected"
      : os === "linux"
      ? "Linux detected"
      : "Non-Windows"
    : "64-bit";

  // Dynamic default label based on OS detection
  const defaultLabel = isWindows || !isHydrated
    ? `Download for Windows (${architecture === "arm64" ? "ARM64" : "64-bit"})`
    : `Download for Windows (${platformLabel})`;

  const displayLabel = label || defaultLabel;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        target={linkTarget}
        rel={linkRel}
        onClick={onClick}
        className={`group inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-[#FFFFFF] bg-[#0047AB] hover:bg-[#1D4ED8] border border-[#1D4ED8]/60 shadow-[0_0_16px_rgba(0,71,171,0.25)] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-hidden ${className}`}
        aria-label={`${displayLabel} ${versionTag} installer (${installerSlug})`}
      >
        <WindowsIcon className="w-3.5 h-3.5 fill-current text-[#FFFFFF] shrink-0" />
        <span className="font-semibold text-[#FFFFFF] tracking-tight">{displayLabel}</span>
        {showPlatform && isHydrated && !isWindows && (
          <span className="text-[10px] font-mono text-amber-200 bg-amber-950/70 border border-amber-500/30 px-1 py-0.5 rounded">
            {platformLabel}
          </span>
        )}
        {showVersion && (
          <span className="text-[10px] font-mono text-blue-100 bg-[#003A8C]/80 px-1 py-0.5 rounded border border-blue-400/20">
            {versionTag}
          </span>
        )}
      </Link>
    );
  }

  if (variant === "secondary") {
    return (
      <Link
        href={href}
        target={linkTarget}
        rel={linkRel}
        onClick={onClick}
        className={`group inline-flex items-center justify-center gap-2.5 px-5 py-3 min-h-[44px] rounded-xl text-sm font-medium text-[#FFFFFF] bg-[#111827] hover:bg-[#1E293B] border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-hidden ${className}`}
        aria-label={`${displayLabel} ${versionTag} installer (${installerSlug})`}
      >
        <WindowsIcon className="w-4 h-4 fill-current text-blue-400 group-hover:text-blue-300 transition-colors shrink-0" />
        <span className="font-medium text-[#FFFFFF]">{displayLabel}</span>
        {showPlatform && isHydrated && !isWindows && (
          <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded">
            {platformLabel}
          </span>
        )}
        {showVersion && (
          <span className="text-xs font-mono text-slate-300 group-hover:text-[#FFFFFF]">
            {versionTag}
          </span>
        )}
      </Link>
    );
  }

  // Primary variant (Deep Cobalt #0047AB / #1D4ED8 + Pure White #FFFFFF)
  return (
    <Link
      href={href}
      target={linkTarget}
      rel={linkRel}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center gap-3 px-6 py-3.5 min-h-[44px] rounded-xl text-sm font-semibold text-[#FFFFFF] bg-[#0047AB] hover:bg-[#1D4ED8] border border-[#1D4ED8]/80 shadow-[0_0_24px_rgba(0,71,171,0.35)] hover:shadow-[0_0_32px_rgba(29,78,216,0.5)] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-hidden ${className}`}
      aria-label={`${displayLabel} ${versionTag} installer (${installerSlug})`}
    >
      <WindowsIcon className="w-4 h-4 fill-current text-[#FFFFFF] shrink-0" />
      <span className="font-semibold text-[#FFFFFF] tracking-tight">
        {displayLabel}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#002D62] text-blue-200 border border-blue-400/30">
          .exe
        </span>
        {showPlatform && isHydrated && !isWindows && (
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-200 border border-amber-500/30">
            {platformLabel}
          </span>
        )}
        {showVersion && (
          <span className="text-[11px] font-mono text-blue-100/90">
            {versionTag}
          </span>
        )}
      </div>
    </Link>
  );
}
