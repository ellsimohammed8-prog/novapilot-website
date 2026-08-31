import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { HelpCircle } from "lucide-react";

export const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "How does the stealth mode work? Is it really invisible during screen sharing?",
      answer:
        "Yes, 100%. NovaPilot AI utilizes the Windows native desktop window management API: SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE). This instructs the Windows Desktop Window Manager (DWM) composition pipeline to omit the HUD window from screen capture APIs used by Zoom, Microsoft Teams, Google Meet, Cisco Webex, Discord, and OBS, while rendering it crisply on your physical monitor.",
    },
    {
      question: "Does NovaPilot AI upload or sell my audio recordings?",
      answer:
        "Never. NovaPilot AI is architected with a strict local-first privacy philosophy. All audio transcription runs locally on your PC via embedded Whisper models. Your meeting notes, transcripts, and history are stored strictly in an encrypted SQLite database on your local machine (%AppData%/NovaPilot/database.sqlite). No audio streams or transcripts are ever stored or sold.",
    },
    {
      question: "Can I use my own AI model API keys for free?",
      answer:
        "Yes! NovaPilot AI fully supports Bring Your Own Key (BYOK). You can input your own API keys for Google Gemini (Flash & Pro), Anthropic Claude, OpenAI, Groq LPUs, DeepSeek, OpenRouter, or even connect a 100% offline local Ollama instance at no monthly subscription charge.",
    },
    {
      question: "How does the Dual-Stream Audio (WASAPI Loopback) capture work?",
      answer:
        "NovaPilot directly hooks into the Windows WASAPI audio subsystem. It captures audio coming through your speaker/headphones (what the other party is saying) and your microphone (what you say) in parallel. This eliminates echo latency and requires zero virtual audio cable installations.",
    },
    {
      question: "How does the Screen Snip OCR (Ctrl + Shift + S) feature work?",
      answer:
        "When triggered, NovaPilot dims your screen and allows you to drag a precision bounding box over any LeetCode problem, system design diagram, recruiter slide, or error traceback. The snip is passed to the multi-modal vision engine (or local OCR) to generate real-time answers directly in your HUD.",
    },
    {
      question: "What are the minimum PC hardware requirements?",
      answer:
        "NovaPilot AI runs on Windows 10 and Windows 11 (64-bit). For standard cloud routing & Whisper-base, 8 GB RAM and any modern multi-core CPU is sufficient. For offline local Whisper & Qwen2.5 weights, 16 GB RAM and an optional discrete GPU are recommended.",
    },
    {
      question: "If I purchase a Lifetime License, can I transfer it to another computer?",
      answer:
        "Yes. In Settings → License, simply click 'Deactivate License'. This frees up your license key on our authentication server, allowing you to activate it immediately on your new machine.",
    },
  ];

  return (
    <section id="faq" className="py-24 sm:py-32 border-t border-border/60">
      <div className="container px-4 mx-auto max-w-4xl space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt-500/10 border border-cobalt-500/20 text-xs font-mono font-medium text-cobalt-600 dark:text-cobalt-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Everything you need to know about NovaPilot AI's stealth technology, privacy, and licensing.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="rounded-2xl border border-border/80 bg-card px-6 py-1 data-[state=open]:border-cobalt-500/40 transition-colors"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            Have a custom enterprise or security requirement?{" "}
            <a
              href="mailto:support@novapilot.ai"
              className="text-cobalt-600 dark:text-cobalt-400 font-semibold hover:underline"
            >
              Contact our engineering team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
