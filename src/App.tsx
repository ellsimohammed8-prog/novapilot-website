import { ThemeProvider } from "./components/theme-provider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AmbientVideoBackground } from "./components/AmbientVideoBackground";
import { Navbar } from "./components/Navbar";
import { VideoHero } from "./components/VideoHero";
import { LiveHudPreview } from "./components/LiveHudPreview";
import { Integrations } from "./components/Integrations";
import { StealthBentoGrid } from "./components/StealthBentoGrid";
import { ShortcutsGuide } from "./components/ShortcutsGuide";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { DownloadCTA } from "./components/DownloadCTA";
import { Footer } from "./components/Footer";
import { LegalModals } from "./components/LegalModals";
import { SlideUpText } from "./components/SlideUpText";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="novapilot-ui-theme">
        <div className="relative min-h-screen text-foreground flex flex-col font-sans selection:bg-[#0047AB] selection:text-white bg-transparent">
          {/* Continuous Ambient Supernova Video Background */}
          <AmbientVideoBackground />

          <Navbar />

          <main className="flex-1 relative z-10">
            {/* HERO SHOWCASE */}
            <VideoHero />

            {/* SECTION 01: INTERACTIVE SCENARIO & STEALTH SIMULATOR */}
            <section id="features" className="border-t border-white/10 py-24 sm:py-32 relative bg-transparent">
              <div className="container px-4 sm:px-6 mx-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="md:col-span-8 space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-[#0052FF] font-semibold uppercase tracking-wider">
                      <span>01 / INTERACTIVE SCENARIO</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
                      Live Interactive Stealth Simulator
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                      Compare what you see on your physical monitor versus what meeting participants see on Zoom, Teams, and Google Meet.
                    </p>
                  </div>
                  <div className="md:col-span-4 text-left md:text-right text-xs font-mono text-slate-400">
                    <span>WDA_EXCLUDEFROMCAPTURE · DWM DIRECTX HOOK</span>
                  </div>
                </div>

                <SlideUpText delay={0.1}>
                  <LiveHudPreview />
                </SlideUpText>
              </div>
            </section>

            {/* SECTION 02: STEALTH ARCHITECTURE & HARDWARE LOOPBACK */}
            <section id="stealth" className="border-t border-white/10 py-24 sm:py-32 relative bg-transparent">
              <div className="container px-4 sm:px-6 mx-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="md:col-span-8 space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                      <span>02 / STEALTH ARCHITECTURE</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
                      Zero-Footprint Signal Isolation
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                      Dual-stream WASAPI loopback, local Whisper transcription, and on-device Qwen2.5 offline diagnostic execution.
                    </p>
                  </div>
                  <div className="md:col-span-4 text-left md:text-right text-xs font-mono text-slate-400">
                    <span>WASAPI HARDWARE LOOPBACK · 0 MB RAM IDLE</span>
                  </div>
                </div>

                <SlideUpText delay={0.1}>
                  <StealthBentoGrid />
                </SlideUpText>
              </div>
            </section>

            {/* SECTION 03: TACTICAL RESPONSE & SHORTCUTS */}
            <section id="models" className="border-t border-white/10 py-24 sm:py-32 relative bg-transparent">
              <div className="container px-4 sm:px-6 mx-auto space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="md:col-span-8 space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-[#0052FF] font-semibold uppercase tracking-wider">
                      <span>03 / TACTICAL RESPONSE</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
                      Sub-12ms Multi-Model Inference
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                      Ultra-low latency streaming from Gemini 2.0 Flash, Claude 3.5 Sonnet, DeepSeek R1, and local Ollama.
                    </p>
                  </div>
                  <div className="md:col-span-4 text-left md:text-right text-xs font-mono text-slate-400">
                    <span>BYOK SUPPORT · 60 FPS RENDER ENGINE</span>
                  </div>
                </div>

                <SlideUpText delay={0.1}>
                  <Integrations />
                </SlideUpText>

                <SlideUpText delay={0.15}>
                  <ShortcutsGuide />
                </SlideUpText>
              </div>
            </section>

            {/* SECTION 04: DIRECT DOWNLOAD & PRODUCTION PRICING */}
            <section id="pricing" className="border-t border-white/10 py-24 sm:py-32 relative bg-transparent">
              <div className="container px-4 sm:px-6 mx-auto space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                  <div className="md:col-span-8 space-y-3">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-[#0052FF] font-semibold uppercase tracking-wider">
                      <span>04 / PRODUCTION DISTRIBUTION</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
                      Download & Pricing Architecture
                    </h2>
                    <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                      Transparent monthly quotas or standalone lifetime licenses with instant automated key delivery.
                    </p>
                  </div>
                  <div className="md:col-span-4 text-left md:text-right text-xs font-mono text-slate-400">
                    <span>WINDOWS 10 & 11 · SHA-512 VERIFIED</span>
                  </div>
                </div>

                <SlideUpText delay={0.1}>
                  <Pricing />
                </SlideUpText>

                <SlideUpText delay={0.15}>
                  <DownloadCTA />
                </SlideUpText>

                <SlideUpText delay={0.1}>
                  <FAQ />
                </SlideUpText>
              </div>
            </section>
          </main>

          <Footer />

          {/* Legal, Compliance & Support Modals */}
          <LegalModals />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
