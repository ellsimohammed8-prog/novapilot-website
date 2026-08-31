import React, { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import novaVideo from "../assets/nova.mp4";

export const AmbientVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Handled by browser policy
      });
    }

    // Listen for global audio toggle events from Navbar or Hero
    const handleToggleAudio = (e: CustomEvent<{ muted: boolean }>) => {
      if (videoRef.current) {
        videoRef.current.muted = e.detail.muted;
        setIsMuted(e.detail.muted);
        if (videoRef.current.paused) {
          videoRef.current.play();
        }
      }
    };

    window.addEventListener("novapilot:toggle-audio" as any, handleToggleAudio);
    return () => window.removeEventListener("novapilot:toggle-audio" as any, handleToggleAudio);
  }, []);

  const toggleSound = () => {
    if (!videoRef.current) return;
    const nextMuteState = !isMuted;
    videoRef.current.muted = nextMuteState;
    setIsMuted(nextMuteState);
    if (videoRef.current.paused) {
      videoRef.current.play();
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none -z-50 overflow-hidden select-none bg-[#0B0F19]">
      {/* Bright, Vibrant Full-Color Video Layer */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover object-center opacity-95 transition-all duration-700 filter brightness-110 contrast-105"
      >
        <source src={novaVideo} type="video/mp4" />
      </video>

      {/* Subtle Luminous Overlay - Clean & Bright without pitch-black obscuring */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/40 via-transparent to-[#0B0F19]/60 pointer-events-none" />

      {/* Floating Interactive Audio Controller Pill (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <button
          onClick={toggleSound}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-2xl cursor-pointer ${
            !isMuted
              ? "bg-[#0052FF] border-white/30 text-white shadow-[0_0_25px_rgba(0,82,255,0.6)] animate-pulse"
              : "bg-[#0B0F19]/80 border-white/20 text-slate-200 hover:bg-[#0047AB] hover:text-white"
          }`}
          title={isMuted ? "Unmute Background Sound" : "Mute Sound"}
        >
          {!isMuted ? (
            <>
              <Volume2 className="w-4 h-4 text-white animate-bounce" />
              <span className="text-xs font-mono font-bold tracking-wide">AUDIO: ON</span>
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-white rounded-full animate-wave-1" />
                <span className="w-0.5 bg-white rounded-full animate-wave-2" />
                <span className="w-0.5 bg-white rounded-full animate-wave-3" />
              </div>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono font-medium">CLICK FOR SOUND</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
