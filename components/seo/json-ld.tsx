export default function JsonLd() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": "https://novapilotai.ellsimohammed8.workers.dev/#software",
    name: "NovaPilot AI",
    operatingSystem: "Windows 10 (64-bit), Windows 11 (64-bit)",
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Executive AI Copilot",
    description:
      "Executive stealth HUD copilot for Windows featuring zero-latency dual-stream WASAPI loopback audio capture, ThinkStripper reasoning extraction, and 100% stealth screen-share protection.",
    url: "https://novapilotai.ellsimohammed8.workers.dev",
    downloadUrl:
      "https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe",
    softwareVersion: "2.7.1",
    fileFormat: "application/vnd.microsoft.portable-executable",
    fileSize: "489179683 B",
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Zero-driver WASAPI loopback dual-stream audio capture",
      "SetWindowDisplayAffinity stealth screen-share exclusion",
      "ThinkStripper real-time reasoning token extraction",
      "Sub-4.8ms local audio processing buffer",
      "Universal model support: DeepSeek-R1, Claude 3.7 Sonnet, OpenAI o3-mini",
      "SHA-512 cryptographically verified release binaries",
    ],
    requirements: "Windows 10 64-bit (Build 19041+) or Windows 11, 4GB RAM, AVX2 support",
    author: {
      "@type": "Organization",
      "@id": "https://novapilotai.ellsimohammed8.workers.dev/#organization",
      name: "NovaPilot AI Core Team",
      url: "https://novapilotai.ellsimohammed8.workers.dev",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://novapilotai.ellsimohammed8.workers.dev/#organization",
    name: "NovaPilot AI",
    url: "https://novapilotai.ellsimohammed8.workers.dev",
    logo: "https://novapilotai.ellsimohammed8.workers.dev/favicon.ico",
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
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the best stealth AI copilot for Windows?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NovaPilot AI is the premier stealth AI copilot for Windows 10 and 11. It combines native Windows Audio Session API (WASAPI) loopback for zero-driver audio capture with OS-level SetWindowDisplayAffinity (WDA_EXCLUDEFROMCAPTURE) screen-share protection, making its HUD overlay 100% invisible to Zoom, Microsoft Teams, Google Meet, Slack, and OBS Studio.",
        },
      },
      {
        "@type": "Question",
        name: "How does NovaPilot capture audio in real time with WASAPI loopback?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NovaPilot captures system audio using direct Windows Audio Session API (WASAPI) render loopback (AUDCLNT_STREAMFLAGS_LOOPBACK). It taps directly into the hardware render stream with sub-4.8ms latency, collapsing multi-channel speaker audio into mono 16kHz PCM via polyphase sinc interpolation without requiring virtual audio cables.",
        },
      },
      {
        "@type": "Question",
        name: "Is NovaPilot detectable during Zoom or Microsoft Teams screen sharing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. NovaPilot enforces WDA_EXCLUDEFROMCAPTURE at the Windows Desktop Window Manager (DWM) level. When sharing an entire display or specific application window, Windows DWM automatically strips NovaPilot from the capture surface, rendering it completely invisible to meeting attendees.",
        },
      },
      {
        "@type": "Question",
        name: "How does the ThinkStripper reasoning pipeline work with DeepSeek R1?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The ThinkStripper streaming finite-state machine (FSM) filters and isolates internal <think>...</think> chain-of-thought tokens produced by reasoning models like DeepSeek-R1 and Claude 3.7. It delivers concise, synthesized, and actionable insights to the HUD with zero latency lag.",
        },
      },
    ],
  };

  const techArticleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "How to Capture Audio in Real Time with WASAPI Loopback on Windows",
    description:
      "A technical guide to implementing zero-latency dual-stream audio loopback capture on Windows 10 and 11 using native WASAPI endpoints.",
    author: {
      "@type": "Organization",
      name: "NovaPilot AI Core Team",
    },
    publisher: {
      "@type": "Organization",
      name: "NovaPilot AI",
    },
    about: [
      { "@type": "Thing", name: "WASAPI" },
      { "@type": "Thing", name: "Windows Audio Session API" },
      { "@type": "Thing", name: "Audio Loopback Capture" },
      { "@type": "Thing", name: "WDA_EXCLUDEFROMCAPTURE" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleSchema) }}
      />
    </>
  );
}
