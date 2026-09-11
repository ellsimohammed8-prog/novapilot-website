"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./logo";
import DownloadButton from "./download-button";
import { useOperatingSystem } from "@/hooks/use-operating-system";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { os, isWindows, isHydrated } = useOperatingSystem();

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#architecture", label: "3D Architecture" },
    { href: "#demo", label: "Live Demo" },
    { href: "#specs", label: "Specifications" },
    { href: "#download", label: "Download" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0B0F19]/90 border-b border-[rgba(255,255,255,0.08)] transition-all duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Logo & Version / OS Status Tag */}
          <div className="flex items-center gap-3">
            <Logo />
            <div className="hidden sm:inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border border-emerald-500/30 bg-emerald-950/40 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                v2.7.1-production
              </span>
              {isHydrated && !isWindows && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border border-amber-500/30 bg-amber-950/40 text-amber-300">
                  {os === "mac" ? "macOS detected" : os === "linux" ? "Linux detected" : "Cross-platform"}
                </span>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 min-h-[44px] inline-flex items-center text-xs lg:text-sm font-medium text-slate-300 hover:text-[#FFFFFF] rounded-lg hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-hidden"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Header Action CTAs */}
          <div className="flex items-center gap-3">
            {/* GitHub Repo Quick Link */}
            <a
              href="https://github.com/ellsimohammed8-prog/novapilot-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg border border-[rgba(255,255,255,0.08)] text-slate-300 hover:text-[#FFFFFF] hover:border-white/20 bg-[#111827] transition-colors focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-hidden"
              aria-label="NovaPilot AI GitHub Repository"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
            </a>

            {/* Desktop Dynamic OS Download CTA */}
            <DownloadButton
              variant="compact"
              showVersion={false}
              showPlatform={false}
              href="#download"
              label={isHydrated && !isWindows ? "Download for Windows (x64)" : "Download for Windows (64-bit)"}
              className="hidden sm:inline-flex"
            />

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2.5 min-w-[44px] min-h-[44px] rounded-lg text-slate-300 hover:text-[#FFFFFF] hover:bg-[#1E293B] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[rgba(255,255,255,0.08)] bg-[#0B0F19]/95 space-y-2">
            <div className="flex items-center px-3 py-1 mb-2 gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono border border-emerald-500/30 bg-emerald-950/40 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                v2.7.1-production
              </span>
              {isHydrated && !isWindows && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono border border-amber-500/30 bg-amber-950/40 text-amber-300">
                  {os === "mac" ? "macOS detected" : os === "linux" ? "Linux detected" : "Cross-platform"}
                </span>
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 min-h-[44px] text-sm font-medium text-slate-300 hover:text-[#FFFFFF] hover:bg-[#1E293B] rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:outline-hidden"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 px-3">
              <DownloadButton
                variant="compact"
                showVersion={true}
                href="#download"
                label={isHydrated && !isWindows ? "Download for Windows (x64)" : "Download for Windows (64-bit)"}
                className="w-full justify-center py-2.5 min-h-[44px] text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
