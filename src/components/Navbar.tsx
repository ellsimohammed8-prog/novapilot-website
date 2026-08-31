import { useState, useEffect } from "react";
import { NovaPilotLogo } from "./NovaPilotLogo";
import { Button } from "./ui/button";
import { Download, Menu, X, Volume2, VolumeX } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "Stealth Architecture", href: "#stealth" },
  { label: "AI Models", href: "#models" },
  { label: "Shortcuts", href: "#shortcuts" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleGlobalAudio = () => {
    const nextState = !isAudioMuted;
    setIsAudioMuted(nextState);
    window.dispatchEvent(
      new CustomEvent("novapilot:toggle-audio", { detail: { muted: nextState } })
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#0B0F19]/80 backdrop-blur-2xl border-b border-white/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container flex h-18 items-center justify-between px-6 mx-auto">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-2 focus-visible:outline-none">
          <NovaPilotLogo size={26} />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-slate-200 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all duration-150"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Sound Controller + Primary Download CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Sound Toggle Button */}
          <button
            onClick={toggleGlobalAudio}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all duration-200 border cursor-pointer ${
              !isAudioMuted
                ? "bg-[#0052FF]/20 border-[#0052FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
            title={isAudioMuted ? "Play Audio" : "Mute Audio"}
          >
            {!isAudioMuted ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#00F0FF] animate-pulse" />
                <span>SOUND ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span>SOUND OFF</span>
              </>
            )}
          </button>

          {/* Download CTA Button */}
          <Button
            asChild
            size="sm"
            className="bg-[#0047AB] hover:bg-[#003888] text-white font-bold rounded-xl h-10 px-5 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_20px_rgba(0,71,171,0.5)] transition-all hover:scale-105 duration-150 cursor-pointer"
          >
            <a href="#download" className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleGlobalAudio}
            className="p-2 rounded-xl bg-white/10 text-white border border-white/10"
          >
            {!isAudioMuted ? <Volume2 className="w-4 h-4 text-[#00F0FF]" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-white/15 bg-[#0B0F19]/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
            <Button
              asChild
              className="w-full bg-[#0047AB] hover:bg-[#003888] text-white rounded-xl gap-2 h-12 shadow-[0_6px_20px_rgba(0,71,171,0.5)] font-bold"
              onClick={() => setIsOpen(false)}
            >
              <a href="#download" className="flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                <span>Download for Windows x64</span>
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
