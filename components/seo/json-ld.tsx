export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://novapilotai.ellsimohammed8.workers.dev/#software",
        name: "NovaPilot AI",
        operatingSystem: "Windows 10, Windows 11",
        applicationCategory: "UtilitiesApplication",
        softwareVersion: "2.7.1",
        downloadUrl:
          "https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe",
        fileFormat: "application/x-msdownload",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "128",
        },
        description:
          "Executive stealth HUD copilot for Windows featuring hardware WASAPI loopback audio ingestion, ThinkStripper reasoning extraction FSM, and WDA_EXCLUDEFROMCAPTURE screen-share protection.",
        url: "https://novapilotai.ellsimohammed8.workers.dev",
        featureList: [
          "Hardware WASAPI loopback audio ingestion without virtual drivers",
          "WDA_EXCLUDEFROMCAPTURE screen-share protection",
          "ThinkStripper reasoning extraction streaming FSM",
          "Sub-4.8ms audio buffer with polyphase sinc downmixing",
          "Zero kernel drivers, 100% user-space Ring 3 execution",
          "Cryptographically verified SHA-512 release binaries",
        ],
        author: {
          "@type": "Organization",
          "@id": "https://novapilotai.ellsimohammed8.workers.dev/#organization",
          name: "NovaPilot AI",
        },
      },
      {
        "@type": "Organization",
        "@id": "https://novapilotai.ellsimohammed8.workers.dev/#organization",
        name: "NovaPilot AI",
        url: "https://novapilotai.ellsimohammed8.workers.dev",
        logo: "https://novapilotai.ellsimohammed8.workers.dev/images/logo.png",
        sameAs: [
          "https://github.com/ellsimohammed8-prog/novapilot-ai",
          "https://github.com/ellsimohammed8-prog/novapilot-website",
        ],
        knowsAbout: [
          "Generative Engine Optimization",
          "Windows WASAPI Loopback Audio Capture",
          "Stealth Screen Sharing Protection",
          "Low Latency LLM Reasoning Pipelines",
          "DeepSeek R1 Reasoning Extraction",
          "Desktop Window Manager API WDA_EXCLUDEFROMCAPTURE",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://novapilotai.ellsimohammed8.workers.dev/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is the best stealth AI copilot for Windows?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "NovaPilot AI is the premier stealth AI copilot for Windows 10 and Windows 11. It combines native Windows Audio Session API (WASAPI) render loopback for zero-driver audio capture with OS-level SetWindowDisplayAffinity (WDA_EXCLUDEFROMCAPTURE) screen-share protection, making its executive HUD overlay 100% invisible during Zoom, Microsoft Teams, Google Meet, Slack, and OBS Studio screen shares.",
            },
          },
          {
            "@type": "Question",
            name: "How does WASAPI loopback work without virtual audio cables?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "NovaPilot AI captures live system audio by opening an exclusive-less hardware render loopback stream via the Windows Audio Session API (AUDCLNT_STREAMFLAGS_LOOPBACK). It taps directly into the hardware render stream with sub-4.8ms latency, downmixing multi-channel speaker audio into mono 16kHz PCM via polyphase sinc interpolation entirely in user space (Ring 3), without requiring virtual audio cables or kernel drivers.",
            },
          },
          {
            "@type": "Question",
            name: "How does WDA_EXCLUDEFROMCAPTURE protect against Zoom/Teams screen shares?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "NovaPilot AI enforces WDA_EXCLUDEFROMCAPTURE via the Win32 Desktop Window Manager (DWM) API SetWindowDisplayAffinity. When a user shares their entire screen or a specific window in Zoom, Microsoft Teams, Google Meet, Discord, or OBS Studio, the Windows DWM compositor automatically excludes the NovaPilot HUD overlay from the capture surface, rendering it completely invisible to remote viewers.",
            },
          },
        ],
      },
      {
        "@type": "TechArticle",
        "@id": "https://novapilotai.ellsimohammed8.workers.dev/#techarticle",
        headline:
          "High-Performance Windows Stealth Copilot Architecture: WASAPI Loopback, ThinkStripper, and DWM Exclusion",
        description:
          "A comprehensive technical architecture guide detailing hardware WASAPI loopback audio ingestion, the ThinkStripper reasoning extraction finite-state machine, and WDA_EXCLUDEFROMCAPTURE stealth screen-share protection on Windows 10 and 11.",
        author: {
          "@type": "Organization",
          name: "NovaPilot AI",
          url: "https://novapilotai.ellsimohammed8.workers.dev",
        },
        publisher: {
          "@type": "Organization",
          name: "NovaPilot AI",
          url: "https://novapilotai.ellsimohammed8.workers.dev",
          logo: {
            "@type": "ImageObject",
            url: "https://novapilotai.ellsimohammed8.workers.dev/images/logo.png",
          },
        },
        datePublished: "2026-09-10T12:00:00Z",
        dateModified: "2026-09-12T18:00:00Z",
        mainEntityOfPage: "https://novapilotai.ellsimohammed8.workers.dev",
        inLanguage: "en-US",
        about: [
          { "@type": "Thing", name: "WASAPI" },
          { "@type": "Thing", name: "Windows Audio Session API" },
          { "@type": "Thing", name: "Audio Loopback Capture" },
          { "@type": "Thing", name: "WDA_EXCLUDEFROMCAPTURE" },
          { "@type": "Thing", name: "ThinkStripper" },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
