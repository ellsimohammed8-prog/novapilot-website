import Link from "next/link";
import React from "react";

export function NovaPilotLogo({
  size = 24,
  color = "#06B6D4",
  accentColor = "#FFFFFF",
  className = "",
}: {
  size?: number;
  color?: string;
  accentColor?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NovaPilot AI Logo Mark"
    >
      {/* Master Geometric N Silhouette */}
      <path
        d="M 80 944 L 80 200 L 200 80 L 330 80 L 694 580 L 694 80 L 944 80 L 944 824 L 824 944 L 694 944 L 330 444 L 330 944 Z"
        fill={color}
      />
      {/* Precision Pilot Chevron Cut */}
      <polygon
        points="472,450 552,512 472,574 512,574 592,512 512,450"
        fill={accentColor}
      />
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight text-white group ${className}`}
      aria-label="NovaPilot AI Home"
    >
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 border border-gray-700/80 group-hover:border-cyan-500/60 transition-colors shadow-sm overflow-hidden">
        <NovaPilotLogo size={20} color="#06B6D4" accentColor="#FFFFFF" />
      </div>
      <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-sans">
        <span>NovaPilot</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-950/50 text-cyan-400 font-mono font-medium leading-none">
          AI
        </span>
      </span>
    </Link>
  );
}
