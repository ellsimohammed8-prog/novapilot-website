import React from "react";
import { Cpu, Video, Zap, Bot, Layers, Shield } from "lucide-react";

export const Integrations: React.FC = () => {
  const meetingPlatforms = [
    { name: "Zoom", badge: "ExcludeCapture Tested", color: "#2D8CFF" },
    { name: "Microsoft Teams", badge: "Dual-Audio Loopback", color: "#6264A7" },
    { name: "Google Meet", badge: "Chrome Tab Compatible", color: "#00832D" },
    { name: "Cisco Webex", badge: "Stealth Verified", color: "#005073" },
    { name: "Slack Huddles", badge: "Low Latency Audio", color: "#ECB22E" },
    { name: "Discord Calls", badge: "Voice Channel Loopback", color: "#5865F2" },
  ];

  const aiProviders = [
    {
      name: "Google Gemini",
      models: "Gemini 2.0 Flash & 1.5 Pro",
      highlight: "Recommended (Ultra-fast streaming)",
      tag: "BYOK / Pro",
    },
    {
      name: "Anthropic Claude",
      models: "Claude 3.5 Sonnet & Haiku",
      highlight: "Elite code & nuance reasoning",
      tag: "BYOK / Pro",
    },
    {
      name: "OpenAI",
      models: "GPT-4o & GPT-4o-mini",
      highlight: "Versatile general intelligence",
      tag: "BYOK / Pro",
    },
    {
      name: "DeepSeek",
      models: "DeepSeek V3 & R1 Reasoning",
      highlight: "Deep technical & math reasoning",
      tag: "BYOK / Pro",
    },
    {
      name: "Groq LPUs",
      models: "Llama 3.3 70B (300+ t/s)",
      highlight: "Near-instant speech responses",
      tag: "BYOK",
    },
    {
      name: "Local Ollama",
      models: "Qwen 2.5, Llama 3.2, Mistral",
      highlight: "100% Private Offline Inference",
      tag: "Offline",
    },
  ];

  return (
    <section id="models" className="py-20 border-y border-border/60 bg-muted/20 dark:bg-black/20">
      <div className="container px-4 mx-auto space-y-16">
        {/* Meeting Platforms Compatibility */}
        <div className="space-y-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground">
            <Video className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
            <span>Universal Meeting Compatibility</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Seamlessly Injects Into Any Video Call
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            NovaPilot AI operates at the Windows OS audio-session layer. No awkward bots join your meeting, no webhooks required, and no plugin installations needed.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
            {meetingPlatforms.map((platform) => (
              <div
                key={platform.name}
                className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border/80 bg-card hover:border-cobalt-500/40 hover:shadow-sm transition-all text-center space-y-1.5"
              >
                <span className="font-semibold text-sm text-foreground">{platform.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{platform.badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Providers Grid */}
        <div className="space-y-8 pt-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-xs font-mono text-cobalt-600 dark:text-cobalt-400">
              <Bot className="w-3.5 h-3.5" />
              <span>Multi-Provider AI Architecture</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
              Choose Your Brain. Switch in Real-Time.
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Connect your own API keys for free or use built-in high-speed NovaPilot Pro routing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiProviders.map((provider) => (
              <div
                key={provider.name}
                className="p-5 rounded-2xl border border-border/80 bg-card hover:border-cobalt-500/40 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-base group-hover:text-cobalt-600 dark:group-hover:text-cobalt-400 transition-colors">
                    {provider.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-muted text-muted-foreground border border-border">
                    {provider.tag}
                  </span>
                </div>
                <div className="text-xs font-mono text-cobalt-600 dark:text-cobalt-400 font-medium">
                  {provider.models}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {provider.highlight}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
