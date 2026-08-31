import React, { useState } from "react";
import {
  Shield,
  Lock,
  FileText,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Send,
  X,
  ExternalLink,
  Cpu,
  EyeOff,
  Scale,
} from "lucide-react";
import { Button } from "./ui/button";

export const LegalModals: React.FC = () => {
  const [activeModal, setActiveModal] = useState<
    "privacy" | "terms" | "employee-protection" | "support" | null
  >(null);

  const [formSent, setFormSent] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formMessage) return;
    
    // Open mailto link directly to the official support email
    window.location.href = `mailto:ellsimohammed8@gmail.com?subject=NovaPilot Support Request from ${encodeURIComponent(
      formEmail
    )}&body=${encodeURIComponent(formMessage)}`;

    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setFormEmail("");
      setFormMessage("");
      setActiveModal(null);
    }, 3000);
  };

  // Expose global listener for footer / button clicks
  React.useEffect(() => {
    const handleOpenModal = (e: CustomEvent<{ modal: any }>) => {
      setActiveModal(e.detail.modal);
    };

    window.addEventListener("novapilot:open-modal" as any, handleOpenModal);
    return () =>
      window.removeEventListener("novapilot:open-modal" as any, handleOpenModal);
  }, []);

  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0E0E14] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* --- MODAL 1: PRIVACY POLICY --- */}
        {activeModal === "privacy" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-[#0052FF]/20 text-[#00F0FF] border border-[#0052FF]/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Privacy & Data Policy</h2>
                <p className="text-xs text-slate-400 font-mono">Last Updated: August 2026 · GDPR & CCPA Aligned</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">1. Core Privacy Philosophy: Zero Audio Telemetry</h3>
                <p>
                  NovaPilot AI is engineered with a strict <strong>Zero Data Retention</strong> architecture. Audio captured via WASAPI hardware loopback is transcribed locally in volatile RAM and is <strong>never uploaded, recorded to disk, sold, or stored on remote cloud servers</strong>.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">2. Local-First Cryptographic Vault</h3>
                <p>
                  Meeting transcripts and user notes are stored strictly on your physical machine inside an encrypted SQLite database (<code className="text-[#00F0FF] font-mono">AES-256</code>). API credentials are secured directly within the <strong>Windows Credential Vault (Keytar)</strong> and never leave your operating system.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">3. Third-Party LLM Providers (BYOK)</h3>
                <p>
                  When using Bring-Your-Own-Key (BYOK) with OpenAI, Anthropic, Google Gemini, Groq, or DeepSeek, requests are dispatched directly from your device to the respective provider's HTTPS endpoint. NovaPilot acts solely as a local interface pipeline and maintains zero middleware logging.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">4. Contact Privacy Officer</h3>
                <p>
                  For data inquiries or custom enterprise audits, reach out directly to our privacy desk at{" "}
                  <a href="mailto:ellsimohammed8@gmail.com" className="text-[#00F0FF] underline font-semibold">
                    ellsimohammed8@gmail.com
                  </a>.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* --- MODAL 2: TERMS OF SERVICE & REFUNDS --- */}
        {activeModal === "terms" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-[#0052FF]/20 text-[#00F0FF] border border-[#0052FF]/30">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Terms of Service & Licensing</h2>
                <p className="text-xs text-slate-400 font-mono">Official Commercial Distribution Terms</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">1. Commercial License & Hardware ID</h3>
                <p>
                  Purchasing a Lifetime or Pro Subscription grants a single non-transferable license per designated Windows workstation. Hardware ID deactivation and transfer between laptops is supported seamlessly within settings.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">2. 14-Day Money-Back Guarantee (Lemon Squeezy)</h3>
                <p>
                  Every purchase processed via Lemon Squeezy is backed by our full 14-day no-questions-asked refund policy. If NovaPilot AI does not meet your technical expectations, email{" "}
                  <a href="mailto:ellsimohammed8@gmail.com" className="text-[#00F0FF] underline font-semibold">
                    ellsimohammed8@gmail.com
                  </a>{" "}
                  for an immediate refund.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">3. Fair Use & Prohibited Conduct</h3>
                <p>
                  Users agree to use NovaPilot AI in accordance with applicable local workplace regulations and professional interview conduct standards.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* --- MODAL 3: EMPLOYEE PROTECTION & LEGAL COMPLIANCE --- */}
        {activeModal === "employee-protection" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Employee Protection & Legal Compliance Guide</h2>
                <p className="text-xs text-slate-400 font-mono">How NovaPilot Protects Engineers in High-Stakes Calls</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-200">
                  <span className="font-bold text-white block">Real-Time Ephemeral Processing (No Wiretapping Risk)</span>
                  Unlike meeting recording bots that store raw audio files and trigger legal wiretapping / consent restrictions, NovaPilot processes speech in ephemeral RAM and deletes it instantaneously.
                </div>
              </div>

              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">1. Invisible to Enterprise Surveillance Software</h3>
                <p>
                  When remote employers or interview platforms use Zoom, Microsoft Teams, Google Meet, or background proctoring suites, NovaPilot invokes the Windows native kernel flag <code className="text-[#00F0FF] font-mono">SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)</code>. The HUD is rendered strictly on your physical monitor's display buffer and is completely excluded from video capture and screen recordings.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">2. Zero Audio Cable Hooks</h3>
                <p>
                  NovaPilot utilizes direct Windows Core Audio WASAPI Loopback. It does not install suspicious virtual audio cables (like VB-Cable or BlackHole) that workplace IT tools can detect in device managers.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="font-bold text-white text-sm">3. Offline Diagnostic Mode (0 MB Network Traffic)</h3>
                <p>
                  For maximum paranoia in locked-down corporate networks, users can enable 100% offline mode powered by local Whisper STT and quantized Qwen2.5 weights, generating zero external network packets.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* --- MODAL 4: CONTACT & SUPPORT DESK --- */}
        {activeModal === "support" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-[#0052FF]/20 text-[#00F0FF] border border-[#0052FF]/30">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Direct Support & Enterprise Desk</h2>
                <p className="text-xs text-slate-400 font-mono">Direct Support: ellsimohammed8@gmail.com</p>
              </div>
            </div>

            {formSent ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-white">Opening Mail Client...</h3>
                <p className="text-xs text-slate-300">
                  Your message draft has been prepared to <span className="text-[#00F0FF]">ellsimohammed8@gmail.com</span>. We typically respond within 2-4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSupportSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    Your Work / Personal Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="engineer@company.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0052FF] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 mb-1">
                    How can we assist you? (License activation, bug report, enterprise inquiry)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your question or issue in detail..."
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/15 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#0052FF] text-sm resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    Direct Email: <a href="mailto:ellsimohammed8@gmail.com" className="text-[#00F0FF] underline">ellsimohammed8@gmail.com</a>
                  </span>

                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-[#0052FF] hover:bg-[#003888] text-white rounded-xl h-11 px-6 text-xs font-bold shadow-lg gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Support</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
