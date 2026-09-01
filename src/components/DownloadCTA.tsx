import React, { useState } from "react";
import { Button } from "./ui/button";
import { NovaPilotLogoMark } from "./NovaPilotLogo";
import {
  Download,
  ShieldCheck,
  Package,
  Copy,
  Check,
  Monitor,
} from "lucide-react";

export const DownloadCTA: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<"installer" | "portable">("installer");

  // Official SHA-512 Checksum from latest.yml build
  const sha512Checksum = "vNbPK67tyzGaaCSY7AJDy52op0hO9p459Jmgccez2G8phSLCGtJqmR/oS2r0/8PzIx4U/hrQO9PEDI7+srvf9A==";

  const handleDownload = (format: "installer" | "portable") => {
    setSelectedFormat(format);
    setDownloading(true);

    const localPath =
      format === "installer"
        ? "/downloads/NovaPilot-AI-Setup-2.7.0.exe"
        : "/downloads/NovaPilot-AI-Portable-2.7.0.exe";

    const filename =
      format === "installer" ? "NovaPilot-AI-Setup-2.7.0.exe" : "NovaPilot-AI-Portable-2.7.0.exe";

    const link = document.createElement("a");
    link.href = localPath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
    }, 4000);
  };

  const copyChecksum = () => {
    navigator.clipboard.writeText(sha512Checksum);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <section id="download" className="py-24 relative overflow-hidden bg-transparent">
      <div className="container px-4 mx-auto max-w-5xl">
        <div className="relative rounded-3xl border border-white/15 bg-[#0E0E14]/90 backdrop-blur-2xl p-8 sm:p-12 md:p-16 text-center space-y-10 shadow-[0_0_80px_rgba(0,71,171,0.2)] overflow-hidden">
          {/* Subtle Ambient Flare */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#0052FF]/20 blur-[130px] pointer-events-none -z-10" />

          {/* Central Logo */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#0052FF] text-white flex items-center justify-center shadow-[0_0_30px_rgba(0,82,255,0.5)] border border-white/30">
              <NovaPilotLogoMark size={34} color="#FFFFFF" accentColor="#0052FF" />
            </div>
            <span className="text-xs font-mono text-slate-300 font-bold tracking-wider uppercase bg-white/10 px-3 py-1 rounded-full border border-white/10">
              Official Production Release · v2.7.0 (Latest)
            </span>
          </div>

          {/* Title & Value Summary */}
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
              Download NovaPilot AI for Windows
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Ultra-fast, local-first meeting copilot with dual-stream WASAPI loopback audio capture, embedded Whisper STT, and invisible screen-share protection.
            </p>
          </div>

          {/* Download Action Box */}
          <div className="max-w-xl mx-auto p-6 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl space-y-6 shadow-2xl">
            {/* Format Selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-medium">
              <button
                onClick={() => setSelectedFormat("installer")}
                className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold ${
                  selectedFormat === "installer"
                    ? "bg-[#0052FF] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Setup Installer (.exe)</span>
              </button>
              <button
                onClick={() => setSelectedFormat("portable")}
                className={`py-2.5 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer font-bold ${
                  selectedFormat === "portable"
                    ? "bg-[#0052FF] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Portable Executable</span>
              </button>
            </div>

            {/* Direct Download Button */}
            <Button
              onClick={() => handleDownload(selectedFormat)}
              size="lg"
              className="w-full bg-[#0052FF] hover:bg-[#0042D0] text-white rounded-xl h-14 text-base font-extrabold shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_30px_rgba(0,82,255,0.5)] gap-3 cursor-pointer transition-all hover:scale-105 duration-150"
            >
              {downloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Starting Direct Download...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>
                    Download {selectedFormat === "installer" ? "Setup Installer (.exe)" : "Portable Binary"}
                  </span>
                </>
              )}
            </Button>

            {/* File Info Meta */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono text-slate-400 text-center border-t border-white/10 pt-4">
              <div>
                <span className="block text-white font-bold text-xs">560 MB</span>
                <span>File Size</span>
              </div>
              <div>
                <span className="block text-white font-bold text-xs">x64 (64-bit)</span>
                <span>Win 10 & 11</span>
              </div>
              <div>
                <span className="block text-emerald-400 font-bold text-xs">SHA-512</span>
                <span>Verified Clean</span>
              </div>
            </div>
          </div>

          {/* Quick 3-Step Setup */}
          <div className="max-w-3xl mx-auto text-left space-y-4 pt-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 text-center">
              Quick 3-Step Getting Started Guide
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#00F0FF] font-bold text-sm">
                  <span className="w-6 h-6 rounded-md bg-[#0052FF]/20 flex items-center justify-center text-xs">1</span>
                  <span>Install & Open</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Run the downloaded <code className="font-mono text-white font-bold">.exe</code> file. The app installs silently in seconds.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#00F0FF] font-bold text-sm">
                  <span className="w-6 h-6 rounded-md bg-[#0052FF]/20 flex items-center justify-center text-xs">2</span>
                  <span>Join Any Meeting</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Start or join Zoom, Teams, Meet, or Webex. Audio connects automatically via WASAPI.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <span className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                  <span>Press Ctrl+Shift+Space</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toggle the invisible stealth HUD anytime to view real-time transcripts and AI suggestions.
                </p>
              </div>
            </div>
          </div>

          {/* Checksum Security Copy Bar */}
          <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-400 font-mono">
            <span className="hidden sm:inline">SHA-512 Checksum:</span>
            <code className="px-2 py-1 rounded bg-black/60 border border-white/15 text-[10px] text-slate-300 max-w-[200px] sm:max-w-none truncate">
              {sha512Checksum}
            </code>
            <button
              onClick={copyChecksum}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
              title="Copy SHA-512 Checksum"
            >
              {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
