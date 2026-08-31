import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Check,
  ShieldCheck,
  Key,
  Crown,
} from "lucide-react";

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "lifetime">("monthly");

  const monthlyPlans = [
    {
      name: "Free (BYOK)",
      price: "$0",
      period: "forever",
      description: "Bring your own API keys for Gemini, Claude, OpenAI, Groq, or Local Ollama.",
      badge: "Open BYOK",
      isPopular: false,
      buttonText: "Download Free",
      buttonVariant: "outline" as const,
      url: "#download",
      features: [
        "100% Local Encrypted SQLite database",
        "Undetectable Screen-Share Protection (WDA)",
        "Dual-Stream WASAPI Audio Capture",
        "Local Whisper Offline STT",
        "Vision OCR Screen Snipping (Ctrl+Shift+S)",
        "Local Wi-Fi Phone Mirroring HUD",
        "Windows Credential Vault security",
      ],
    },
    {
      name: "Standard",
      price: "$8",
      period: "/month",
      description: "Essential cloud AI & transcription quotas for casual weekly meetings.",
      badge: null,
      isPopular: false,
      buttonText: "Start Standard",
      buttonVariant: "outline" as const,
      url: "https://luxelabsstudio.lemonsqueezy.com/checkout/buy/ab2240c3-65cb-4b05-8a35-7013214d3d2b",
      features: [
        "500 Cloud AI Answers / mo",
        "200 Minutes Live STT Streaming",
        "20 Real-Time Web Searches",
        "All Free & BYOK capabilities",
        "Multi-Provider Model Switching",
        "Cancel anytime with 1-click",
      ],
    },
    {
      name: "NovaPilot Pro",
      price: "$15",
      period: "/month",
      description: "Complete copilot suite with Pro App capabilities, Profile Intelligence & JD matching.",
      badge: "RECOMMENDED",
      isPopular: true,
      buttonText: "Start NovaPilot Pro",
      buttonVariant: "cobalt" as const,
      url: "https://luxelabsstudio.lemonsqueezy.com/checkout/buy/9fb83a23-6f80-4015-ab26-d0708c7eb90d",
      features: [
        "1,000 High-Speed AI Answers / mo",
        "500 Minutes Live STT Streaming",
        "100 Real-Time Web Searches",
        "Full Pro App Included",
        "Candidate Profile Intelligence Engine",
        "Job Description & Resume Match Matrix",
        "Live Negotiation Coaching cards",
        "Priority Low-Latency WebSocket Routing",
      ],
    },
    {
      name: "Max",
      price: "$25",
      period: "/month",
      description: "High-volume quota designed for active interview loops and sales executives.",
      badge: "HIGH VOLUME",
      isPopular: false,
      buttonText: "Start Max",
      buttonVariant: "outline" as const,
      url: "https://luxelabsstudio.lemonsqueezy.com/checkout/buy/94f2647d-1077-4aa4-90f8-6aab8992e7ea",
      features: [
        "2,000 High-Speed AI Answers / mo",
        "1,000 Minutes Live STT Streaming",
        "200 Real-Time Web Searches",
        "All Pro App capabilities included",
        "DeepSeek R1 & Claude 3.5 Priority Lanes",
        "Executive Strategy Synthesis",
      ],
    },
  ];

  const lifetimePlans = [
    {
      name: "Pro · Yearly License",
      price: "$30",
      originalPrice: "$45",
      period: "/year",
      description: "Single device authorization for full Pro App intelligence with your own API keys.",
      badge: "ANNUAL LICENSE",
      isPopular: false,
      buttonText: "Get Yearly License",
      buttonVariant: "outline" as const,
      url: "https://luxelabsstudio.lemonsqueezy.com/checkout/buy/4f7230a2-8798-480a-8bd3-4a72d0fabbb5",
      features: [
        "1 Year Pro App Device Authorization",
        "Profile Intelligence & Resume Match Engine",
        "Company Background Deep Research",
        "Negotiation Coaching & Live JD Analysis",
        "Use your own unlimited API keys",
        "Instant License Key Delivery via Email",
      ],
    },
    {
      name: "Pro · Lifetime License",
      price: "$50",
      originalPrice: "$99",
      period: "one-time payment",
      description: "Permanent standalone device license. Pay once, use forever without subscriptions.",
      badge: "LIFETIME ACCESS",
      isPopular: true,
      buttonText: "Get Lifetime License",
      buttonVariant: "cobalt" as const,
      url: "https://luxelabsstudio.lemonsqueezy.com/checkout/buy/ed2f9e02-8eb0-40c2-b0e0-74b8a0107d2f",
      features: [
        "Lifetime Pro App License for 1 Device",
        "All future Pro desktop updates included",
        "Profile Intelligence & Resume Analysis unlocked forever",
        "Company Research & Negotiation cards",
        "Seamless Hardware ID deactivation & transfer",
        "Zero recurring monthly fees",
        "Instant license key via Lemon Squeezy",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 sm:py-32 relative">
      {/* Subtle Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#0047AB]/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="container px-4 mx-auto space-y-14">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-foreground">
            Transparent Pricing. Zero Surprises.
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
            Choose managed AI and speech quotas, or purchase a lifetime license and plug in your own API keys.
          </p>

          {/* Billing Switcher */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex p-1 rounded-xl bg-muted/60 dark:bg-[#111116]/90 border border-border/80 dark:border-white/[0.08] text-xs font-semibold backdrop-blur-xl">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  billingCycle === "monthly"
                    ? "bg-[#0047AB] text-white font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-white"
                }`}
              >
                Monthly Quotas (Cloud STT & AI)
              </button>
              <button
                onClick={() => setBillingCycle("lifetime")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  billingCycle === "lifetime"
                    ? "bg-[#0047AB] text-white font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-white"
                }`}
              >
                <span>Standalone Pro Licenses</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        {billingCycle === "monthly" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {monthlyPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all duration-200 ${
                  plan.isPopular
                    ? "border-[#0052FF]/60 bg-card dark:bg-[#111116] shadow-xl shadow-[#0047AB]/10 relative"
                    : "border-border/80 dark:border-white/[0.08] bg-card dark:bg-[#0E0E14] hover:border-cobalt-500/40 dark:hover:border-white/20"
                }`}
              >
                {plan.isPopular && (
                  <div className="text-[10px] font-mono font-bold tracking-widest text-[#0052FF] uppercase">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                    {plan.badge && !plan.isPopular && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-muted dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight font-mono">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{plan.period}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="h-[1px] bg-border/60 dark:bg-white/[0.08]" />

                  <ul className="space-y-2.5 pt-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-[#0052FF] shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <Button
                    asChild
                    variant={plan.isPopular ? "default" : "outline"}
                    className={`w-full rounded-xl h-11 text-xs font-semibold cursor-pointer ${
                      plan.isPopular
                        ? "bg-[#0047AB] hover:bg-[#003888] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_20px_rgba(0,71,171,0.35)]"
                        : "border-border/80 dark:border-white/10 bg-muted/30 dark:bg-white/[0.03] hover:bg-muted dark:hover:bg-white/[0.08] text-foreground dark:text-slate-200"
                    }`}
                  >
                    <a
                      href={plan.url}
                      target={plan.url.startsWith("http") ? "_blank" : undefined}
                      rel={plan.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    >
                      {plan.buttonText}
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {lifetimePlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-7 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-200 ${
                  plan.isPopular
                    ? "border-[#0052FF]/60 bg-card dark:bg-[#111116] shadow-2xl shadow-[#0047AB]/15 relative"
                    : "border-border/80 dark:border-white/[0.08] bg-card dark:bg-[#0E0E14] hover:border-cobalt-500/40 dark:hover:border-white/20"
                }`}
              >
                {plan.isPopular && (
                  <div className="text-[10px] font-mono font-bold tracking-widest text-[#0052FF] uppercase flex items-center gap-1.5">
                    <Crown className="w-3 h-3" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xl text-foreground">{plan.name}</h3>
                    {plan.badge && !plan.isPopular && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted dark:bg-white/5 text-slate-600 dark:text-slate-400">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight font-mono">
                      {plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-base text-slate-400 line-through font-mono">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{plan.period}</span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="h-[1px] bg-border/60 dark:bg-white/[0.08]" />

                  <ul className="space-y-3 pt-1">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4">
                  <Button
                    asChild
                    className={`w-full rounded-xl h-12 text-sm font-semibold cursor-pointer ${
                      plan.isPopular
                        ? "bg-[#0047AB] hover:bg-[#003888] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_25px_rgba(0,71,171,0.35)]"
                        : "border-border/80 dark:border-white/10 bg-muted/30 dark:bg-white/[0.03] hover:bg-muted dark:hover:bg-white/[0.08] text-foreground dark:text-slate-200"
                    }`}
                  >
                    <a
                      href={plan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {plan.buttonText}
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Security & Checkout Trust Footer */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-center pt-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure 256-bit encrypted checkout via Lemon Squeezy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Key className="w-4 h-4 text-[#0052FF]" />
            <span>Instant automated license key delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
};
