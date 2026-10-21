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
          "NovaPilot AI is a Windows desktop app that records your calls, transcribes both sides live, and files a summary with decisions and action items. Local-first: capture, buffering and transcripts stay on your own machine, with no NovaPilot server in the path.",
        url: "https://novapilotai.ellsimohammed8.workers.dev",
        featureList: [
          "Hardware WASAPI loopback audio capture without virtual drivers",
          "Live transcription of both sides of a call, downmixed to 16 kHz mono",
          "AI summaries with decisions, key points and action items",
          "ThinkStripper reasoning filter — streaming FSM with a 0-byte leak guarantee",
          "Local-first storage: transcripts in a local SQLite database, zero cloud audio",
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
          "Meeting Transcription",
          "Windows WASAPI Loopback Audio Capture",
          "Low Latency LLM Reasoning Pipelines",
          "Speech Recognition",
          "Local-First Desktop Software",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": "https://novapilotai.ellsimohammed8.workers.dev/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does NovaPilot capture meeting audio without virtual audio cables?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "It taps the Windows render endpoint directly, using WASAPI loopback (AUDCLNT_STREAMFLAGS_LOOPBACK) — the same stream your speakers play. Surround and stereo are downmixed to a 16,000 Hz mono PCM feed at under 5 ms of latency, via polyphase sinc resampling. There is no VB-Cable-style driver to install, so there is nothing to conflict with your headset, your VPN, or the meeting app itself.",
            },
          },
          {
            "@type": "Question",
            name: "Where do my recordings and transcripts live?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "On your machine. NovaPilot is local-first: zero raw audio is stored or uploaded to intermediate company servers, and transcripts are kept in a local SQLite database. When a language model is used, inference goes straight from your desktop to the provider over HTTPS.",
            },
          },
          {
            "@type": "Question",
            name: "What does the ThinkStripper actually do?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Reasoning models like DeepSeek-R1 and Claude 3.7 produce thousands of internal chain-of-thought tokens inside <think>...</think> tags before they answer. ThinkStripper is a streaming finite-state machine that filters those blocks in real time (under 0.2 ms), so only the answer reaches your screen — with a 0-byte leak guarantee, even when a tag is split across two network chunks or never closed.",
            },
          },
          {
            "@type": "Question",
            name: "Is NovaPilot AI free, and how do I verify the download is genuine?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Production release v2.7.1 is a free download, as an Inno Setup installer and as a standalone portable executable. Every release binary is verifiable against its published SHA-512 checksum: run Get-FileHash NovaPilot-AI-Setup-2.7.1.exe -Algorithm SHA512 in Windows PowerShell and compare the result with the checksum printed in the download section of the homepage.",
            },
          },
          {
            "@type": "Question",
            name: "Does NovaPilot require administrative privileges or kernel drivers?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. NovaPilot operates entirely in user space (Ring 3), using standard Win32 and WASAPI user-mode APIs — no kernel-level drivers, no DLL injections, no administrator privileges. That keeps it compatible with corporate laptops, enterprise VPNs, and endpoint detection and response (EDR) agents.",
            },
          },
        ],
      },
      {
        "@type": "TechArticle",
        "@id": "https://novapilotai.ellsimohammed8.workers.dev/#techarticle",
        headline:
          "NovaPilot AI Architecture: WASAPI Loopback Capture, the ThinkStripper Reasoning Filter, and Local-First Transcription",
        description:
          "A technical architecture guide detailing hardware WASAPI loopback audio capture, the ThinkStripper reasoning extraction finite-state machine, and local-first transcript storage on Windows 10 and 11.",
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
          { "@type": "Thing", name: "Meeting Transcription" },
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
