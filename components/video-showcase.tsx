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

  // Dispatch video state to synchronize with Three.js 3D accretion ring
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("novapilot:video-play", { detail: { isPlaying } })
      );
    }
  }, [isPlaying]);

  // Scroll-driven 3D docking transform into Three.js holographic wireframe and accretion ring with mouse parallax
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let animationFrameId: number;
    const mouseTilt = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseTilt.x = x * 3.5;
      mouseTilt.y = -y * 3.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const updateDocking = () => {
      if (!containerRef.current) return;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.max(0.0, Math.min(3.0, (window.scrollY / maxScroll) * 3.0));

      // Scroll progress p in [1.2, 2.4]: docks to 1.0 at p = 2.0
      // Transitions from scale(0.93) rotateX(5deg) translateZ(-60px) -> scale(1.0) rotateX(0deg) translateZ(0px)
      let dock = 0;
      if (p <= 1.2) {
        dock = 0;
      } else if (p < 2.0) {
        dock = (p - 1.2) / 0.8;
      } else if (p <= 2.4) {
        dock = 1.0 - ((p - 2.0) / 0.4) * 0.12;
      } else {
        dock = 0.88;
      }
      dock = Math.max(0, Math.min(1, dock));

      const scale = 0.93 + 0.07 * dock;
      const rotX = 5.0 * (1.0 - dock);
      const transZ = -60.0 * (1.0 - dock);

      containerRef.current.style.transform = `perspective(1200px) scale(${scale.toFixed(4)}) rotateX(${(rotX + mouseTilt.y).toFixed(2)}deg) rotateY(${mouseTilt.x.toFixed(2)}deg) translateZ(${transZ.toFixed(1)}px)`;
      containerRef.current.style.transformStyle = "preserve-3d";
      containerRef.current.style.willChange = "transform";
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateDocking);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateDocking();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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
    <section id="showcase" className={`relative py-16 md:py-24 overflow-hidden bg-transparent ${className}`}>
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
            <span>3D Neural Architecture • Live HUD Demonstration</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            3D Architecture &amp; Live HUD Demo
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Direct high-definition demonstration of NovaPilot&apos;s stealth HUD overlay,
            zero-latency WASAPI loopback audio stream synthesis, and screen-share capture exclusion.
          </p>
        </div>

        {/* 16:9 Video Player Chassis (Strict 16:9 Container Reservation to Guarantee Zero CLS) */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative aspect-video w-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-[#0A0F1C]/40 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_60px_-15px_rgba(6,182,212,0.35)] min-h-[280px] sm:min-h-[460px] group select-none"
        >
          {/* Top Subtle Status Badge */}
          <div className="absolute top-3.5 left-4 z-20 pointer-events-none flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 text-[11px] font-mono text-cyan-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>1080p 60 FPS • 16:9</span>
          </div>

          {/* HTML5 Native Video Tag */}
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload="metadata"
            playsInline
            loop={isLooping}
            className="w-full h-full object-cover cursor-pointer bg-transparent"
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
                    className="w-14 sm:w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    aria-label="Volume Slider"
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

        {/* 3D Architecture Subsystem Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[#0A0F1C]/45 backdrop-blur-xl p-5 text-left transition-all duration-200 hover:border-cyan-400/40 hover:bg-[#0E1626]/70 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-cyan-400">WASAPI Loopback</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">&lt;5ms Latency</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hardware-direct audio ingestion without virtual cables. Sub-millisecond ring buffer with sinc resampler.
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[#0A0F1C]/45 backdrop-blur-xl p-5 text-left transition-all duration-200 hover:border-cyan-400/40 hover:bg-[#0E1626]/70 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-emerald-400">ThinkStripper FSM</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">Zero-Leak Filter</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Finite-State Machine removing internal reasoning tokens on-the-fly for DeepSeek-R1 &amp; Claude 3.7.
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[#0A0F1C]/45 backdrop-blur-xl p-5 text-left transition-all duration-200 hover:border-cyan-400/40 hover:bg-[#0E1626]/70 shadow-lg shadow-black/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-purple-400">Win32 Invisibility</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300">100% Invisible</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              OS-level display capture exclusion API prevents HUD detection across Zoom, Teams, and Google Meet.
            </p>
          </div>
        </div>

        {/* Cryptographic SHA-512 Verification Chip */}
        <div className="mt-4 max-w-5xl mx-auto rounded-xl border border-[rgba(0,212,255,0.15)] bg-[#0A0F1C]/40 backdrop-blur-xl p-3.5 font-mono text-xs text-slate-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white font-semibold">
                Official Cryptographic SHA-512 Integrity Checksum Verified
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Clean &amp; Signed (~489 MB Size)
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyHash}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer text-xs active:scale-95"
              title="Copy SHA-512 Checksum Hash"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Checksum Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SHA-512 Checksum</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
