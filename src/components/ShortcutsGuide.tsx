import React, { useState } from "react";
import { Keyboard, Command, Sparkles, Check, Copy } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  action: string;
  description: string;
  category: "HUD Control" | "Vision & AI" | "Audio";
}

export const ShortcutsGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const shortcuts: ShortcutItem[] = [
    {
      keys: ["Ctrl", "Shift", "Space"],
      action: "Toggle Stealth HUD",
      description: "Instant zero-latency HUD visibility toggle without breaking focus.",
      category: "HUD Control",
    },
    {
      keys: ["Ctrl", "Shift", "S"],
      action: "Screen Snip & Vision OCR",
      description: "Draw a rectangular region over code, diagrams, or questions to trigger multi-modal AI.",
      category: "Vision & AI",
    },
    {
      keys: ["Ctrl", "Shift", "C"],
      action: "Quick Copilot Trigger",
      description: "Generate instant executive synthesis from the active conversation context.",
      category: "Vision & AI",
    },
    {
      keys: ["Ctrl", "Shift", "M"],
      action: "Mute / Unmute STT",
      description: "Pause and resume real-time audio transcription dynamically during sensitive moments.",
      category: "Audio",
    },
    {
      keys: ["Ctrl", "Shift", "▲ / ▼"],
      action: "HUD Opacity Tuning",
      description: "Fine-tune HUD transparency between 20% and 100% to match your desktop wallpaper.",
      category: "HUD Control",
    },
    {
      keys: ["Esc"],
      action: "Emergency Stealth Dismiss",
      description: "Instantly minimize the HUD window to background tray.",
      category: "HUD Control",
    },
  ];

  return (
    <section id="shortcuts" className="py-20 border-t border-border/60 bg-muted/10 dark:bg-black/10">
      <div className="container px-4 mx-auto space-y-12">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-xs font-mono font-medium text-cobalt-600 dark:text-cobalt-400">
            <Keyboard className="w-3.5 h-3.5" />
            <span>Frictionless Control</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Designed for Instant Muscle Memory
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Global Windows hotkeys allow you to command NovaPilot AI without clicking away from your IDE or meeting window.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {shortcuts.map((sc, i) => (
            <div
              key={sc.action}
              className="p-5 rounded-2xl border border-border/80 bg-card hover:border-cobalt-500/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {sc.category}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {sc.keys.map((k, ki) => (
                    <React.Fragment key={k}>
                      <kbd className="px-2.5 py-1 rounded-lg bg-muted/80 dark:bg-zinc-800 border border-border/80 shadow-inner font-mono text-xs font-bold text-foreground">
                        {k}
                      </kbd>
                      {ki < sc.keys.length - 1 && (
                        <span className="text-xs text-muted-foreground font-bold">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <h3 className="font-bold text-base text-foreground pt-1">{sc.action}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {sc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
