import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="relative border-t border-gray-800/80 bg-gray-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand & System Status */}
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The executive stealth HUD copilot for high-stakes remote calls.
              Native low-latency WASAPI loopback capture, streaming ThinkStripper LLM pipeline,
              and 100% invisible screen-share protection on Windows 10 &amp; 11.
            </p>

            {/* Live Telemetry Health Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-gray-800 bg-gray-900/80 text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium">Core Engine Operational</span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">&lt;5ms WASAPI</span>
              </div>
            </div>
          </div>

          {/* Column 1: Subsystems */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Subsystems
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
                  WASAPI Audio Loopback
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
                  Stealth Overlay Protection
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
                  ThinkStripper FSM
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
                  Serverless Telemetry
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Architecture & Demos */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Interactive
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#architecture" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
                  3D Architecture Visualizer
                </Link>
              </li>
              <li>
                <Link href="#demo" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
                  16:9 Workflow Player
                </Link>
              </li>
              <li>
                <Link href="#specs" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
                  Specifications Matrix
                </Link>
              </li>
              <li>
                <Link href="#download" className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
                  Windows Installer (.exe)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-semibold">
              Privacy &amp; Open Core
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/ellsimohammed8-prog/novapilot-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded"
                >
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ellsimohammed8-prog/novapilot-website/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded"
                >
                  Release Changelog (v2.7.1)
                </a>
              </li>
              <li>
                <span className="text-slate-400 block text-xs leading-normal">
                  Local-First Security: Audio never leaves host memory. Zero cloud database storage.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} NovaPilot AI.</span>
            <span>All rights reserved. Engineered for high-stakes remote operations.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#features" className="hover:text-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
              Security Overview
            </Link>
            <Link href="#specs" className="hover:text-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded">
              Hardware Requirements
            </Link>
            <a
              href="https://github.com/ellsimohammed8-prog/novapilot-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden rounded"
            >
              Source &amp; Releases
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
