import React from "react";
import { NovaPilotLogo } from "./NovaPilotLogo";
import { ShieldCheck, Mail, Lock, FileText, Scale, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const openModal = (modalName: "privacy" | "terms" | "employee-protection" | "support") => {
    window.dispatchEvent(
      new CustomEvent("novapilot:open-modal", { detail: { modal: modalName } })
    );
  };

  return (
    <footer className="border-t border-white/10 bg-[#08080C]/90 backdrop-blur-2xl pt-16 pb-12 text-white">
      <div className="container px-6 mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <NovaPilotLogo size={26} />
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Ultra-low latency, undetectable desktop assistant engineered for high-stakes technical interviews, system design presentations, and executive meetings.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Local Encrypted SQLite · Zero Cloud Audio Telemetry</span>
            </div>
            <div className="pt-1 text-xs text-slate-400 font-mono flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#00F0FF]" />
              <span>Official Support: <a href="mailto:ellsimohammed8@gmail.com" className="text-[#00F0FF] underline hover:text-white">ellsimohammed8@gmail.com</a></span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Product & Systems
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Stealth Simulator
                </a>
              </li>
              <li>
                <a href="#stealth" className="hover:text-white transition-colors">
                  WASAPI Architecture
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-white transition-colors">
                  Multi-LLM Matrix
                </a>
              </li>
              <li>
                <a href="#shortcuts" className="hover:text-white transition-colors">
                  Tactile Shortcuts
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing & Lifetime Licenses
                </a>
              </li>
            </ul>
          </div>

          {/* Legal, Compliance & Employee Shield */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => openModal("employee-protection")}
                  className="hover:text-[#00F0FF] transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Employee Privacy Shield</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal("privacy")}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Privacy Policy (Zero-Log)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal("terms")}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terms & 14-Day Refund</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openModal("support")}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Mail className="w-3.5 h-3.5 text-[#0052FF]" />
                  <span>Contact Help Desk</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Releases & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Distribution
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://github.com/ellsimohammed8-prog/novapilot-ai/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub Releases v2.7.0
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/ellsimohammed8-prog/novapilot-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Open Source Core
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Documentation & FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} NovaPilot AI Systems. Commercial Software Distribution.
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Direct Desk: ellsimohammed8@gmail.com</span>
            <span>•</span>
            <span className="text-emerald-400">Status: All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
