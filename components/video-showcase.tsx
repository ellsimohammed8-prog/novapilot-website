"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  Minimize2,
  Repeat,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  FileCode,
  Sparkles,
  Download,
} from "lucide-react";

export interface VideoShowcaseProps {
  src?: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

function WindowsIcon({ className = "w-4 h-4" }: { className?: string }) {
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

export default function VideoShowcase({
  src = "/videos/nova-pilot-ai.mp4",
  poster,
  autoPlay = false,
  className = "",
}: VideoShowcaseProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const sha512Checksum =
    "acc168926f7bbb553b954a6fe5c9a8b61797626088a117de653e211feec6e6f6420690a193b9d92c5bcb69f3fe639c231381e4f852212899b0012212fbe914e5";

  // Safe formatting helper mm:ss
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Toggle Play / Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().catch(() => {
        // Autoplay policy fallback
        setIsPlaying(false);
      });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Update time and scrubber position
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
  };

  // Loaded metadata handler for duration
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);
  };

  // Ended handler
  const handleEnded = () => {
    if (!isLooping) {
      setIsPlaying(false);
      setShowControls(true);
    }
  };

  // Timeline scrubber seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const scrubber = scrubberRef.current;
    const video = videoRef.current;
    if (!scrubber || !video || duration <= 0) return;

    const rect = scrubber.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = clickX / rect.width;
    const seekTime = Math.max(0, Math.min(duration, percent * duration));

    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Restart video to beginning
  const handleRestart = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setCurrentTime(0);
    video.play().catch(() => {});
    setIsPlaying(true);
  };

  // Volume slider handler clamped [0, 1]
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = Math.max(0, Math.min(1, parseFloat(e.target.value)));
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
    setIsMuted(newVol === 0);
  };

  // Mute / Unmute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      video.volume = volume > 0 ? volume : 0.8;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Fullscreen toggle with fallback
  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current as any;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if (video && video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Speed toggle (1x -> 1.25x -> 1.5x -> 2x)
  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
  };

  // Auto-hide controls during playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  // Copy SHA-512 checksum
  const handleCopyHash = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(sha512Checksum);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <section id="showcase" className={`relative py-16 md:py-24 overflow-hidden bg-slate-950 ${className}`}>
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -z-10 h-[550px] w-[950px] -translate-x-1/2 rounded-full bg-cyan-950/20 blur-[140px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-10 md:pb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 mb-4 shadow-[0_0_16px_rgba(6,182,212,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Commercial Ad Showcase • 1080p 60 FPS</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Witness NovaPilot AI in Action
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Direct high-definition demonstration of NovaPilot&apos;s stealth HUD overlay,
            zero-latency audio loopback stream synthesis, and screen-share exclusion.
          </p>
        </div>

        {/* 16:9 Video Player Chassis (Strict 16:9 Container Reservation to Guarantee Zero CLS) */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative aspect-video w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-[0_0_60px_-15px_rgba(6,182,212,0.25)] min-h-[280px] sm:min-h-[460px] group select-none"
        >
          {/* Top Chassis Chrome Header Bar */}
          <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-400/40" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-400/40" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-400/40" />
              <span className="ml-2.5 text-xs font-mono text-slate-300 hidden sm:inline">
                novapilot-v2.7.1 :: commercial_showcase.mp4
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300">
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                1920×1080 16:9
              </span>
              <span className="hidden sm:inline px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-300">
                H.264 / AAC
              </span>
            </div>
          </div>

          {/* HTML5 Native Video Tag */}
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload="metadata"
            playsInline
            loop={isLooping}
            className="w-full h-full object-cover cursor-pointer bg-slate-950"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Center Animated Play / Pause Big Button Overlay */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-10 ${
              !isPlaying || showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={togglePlay}
              className="pointer-events-auto w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-cyan-600/90 hover:bg-cyan-500 text-white flex items-center justify-center shadow-[0_0_35px_rgba(6,182,212,0.45)] backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 focus-visible:ring-4 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
              aria-label={isPlaying ? "Pause Video" : "Play Video"}
              title={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white ml-1 fill-white" />
              )}
            </button>
          </div>

          {/* Bottom Absolute Overlay Controls Bar */}
          <div
            className={`absolute bottom-0 inset-x-0 z-20 px-4 sm:px-6 pt-10 pb-4 sm:pb-5 bg-gradient-to-t from-slate-950/95 via-slate-950/80 to-transparent transition-opacity duration-300 ${
              showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Timeline Progress Scrubber */}
            <div className="mb-3.5">
              <div
                ref={scrubberRef}
                onClick={handleSeek}
                className="relative w-full h-2.5 hover:h-3.5 bg-slate-800/80 rounded-full cursor-pointer transition-all duration-150 group/scrubber overflow-hidden"
                role="slider"
                aria-label="Video timeline scrubber"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progressPercent)}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 rounded-full transition-all duration-75"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg ring-2 ring-cyan-400 transition-transform duration-75 scale-90 group-hover/scrubber:scale-110"
                  style={{ left: `calc(${progressPercent}% - 8px)` }}
                />
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-3 text-slate-200">
              {/* Left Group: Play / Pause, Restart, Timestamp */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                  aria-label={isPlaying ? "Pause Video" : "Play Video"}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700/60 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                  aria-label="Restart Video"
                  title="Restart from beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="text-xs font-mono text-slate-300 tabular-nums ml-1">
                  <span className="text-cyan-400 font-semibold">{formatTime(currentTime)}</span>
                  <span className="text-slate-500"> / </span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Right Group: Volume, Loop, Speed, Fullscreen */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Volume & Mute Controls */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700/60">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 min-h-[36px] min-w-[36px] text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden flex items-center justify-center"
                    aria-label={isMuted ? "Unmute Volume" : "Mute Volume"}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-14 sm:w-20 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    aria-label="Volume slider"
                    title="Volume slider"
                  />
                </div>

                {/* Loop Toggle */}
                <button
                  type="button"
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-2 min-h-[40px] min-w-[40px] rounded-lg text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden flex items-center justify-center ${
                    isLooping
                      ? "bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60"
                  }`}
                  aria-label={isLooping ? "Disable Loop" : "Enable Loop"}
                  title={isLooping ? "Loop Enabled" : "Enable Loop"}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Playback Speed */}
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-2.5 py-1.5 min-h-[40px] rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700/60 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                  aria-label="Change playback speed"
                  title="Playback speed"
                >
                  {playbackSpeed}x
                </button>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-2 min-h-[40px] min-w-[40px] rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden flex items-center justify-center"
                  aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Adjacent Executive Download CTA Card */}
        <div className="mt-8 mx-auto max-w-5xl rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>v2.7.1 (Build 2026.3)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
                  <span>Windows 10 / 11 (64-bit)</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Equip NovaPilot Desktop v2.7.1
              </h3>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Direct native installer with hardware WASAPI audio loopback, ThinkStripper reasoning extraction,
                and Win32 screen-share capture exclusion.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <a
                href="https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe"
                download="NovaPilot-AI-Setup-2.7.1.exe"
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 border border-cyan-400/30 shadow-[0_0_24px_rgba(6,182,212,0.3)] transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                aria-label="Download Setup Installer (.exe)"
                title="Download NovaPilot Desktop Installer directly"
              >
                <WindowsIcon className="w-4 h-4 fill-current text-white" />
                <span>Download Setup Installer (.exe)</span>
                <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-black/30 text-cyan-200 border border-cyan-400/30">
                  v2.7.1
                </span>
              </a>

              <a
                href="https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-2.7.1.exe"
                download="NovaPilot-AI-2.7.1.exe"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[44px] rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
                aria-label="Download Portable (.exe)"
                title="Download Portable .exe directly without installation"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download Portable (.exe)</span>
              </a>
            </div>
          </div>

          {/* Cryptographic SHA-512 Checksum Card */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-semibold">Cryptographic SHA-512 Integrity Checksum</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                  SHA-512 Verified
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
                aria-label="Copy SHA-512 checksum"
                title="Copy SHA-512 checksum to clipboard"
              >
                {copiedHash ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Hash</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-2 break-all text-slate-400 select-all font-mono text-[11px] leading-relaxed bg-black/60 p-3 rounded-xl border border-slate-900">
              {sha512Checksum}
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
              <span>
                Verify via PowerShell:{" "}
                <code className="text-slate-300">
                  Get-FileHash NovaPilot-AI-Setup-2.7.1.exe -Algorithm SHA512
                </code>
              </span>
              <span className="text-emerald-400">Release Build: 2026.3 • Stable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
