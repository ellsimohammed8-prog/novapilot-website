import type { Metadata } from "next";

import "../css/novapilot-v2.css";
import NovaPilotV2Home from "@/components/novapilot-v2/home";

export const metadata: Metadata = {
  title: "NovaPilot AI — Meeting recorder & transcription for Windows",
  description:
    "NovaPilot AI is a Windows desktop app that records your calls, transcribes both sides live, and files a summary with decisions and action items. Local-first: your audio never leaves your machine. Free download, v2.7.1.",
  openGraph: {
    title: "NovaPilot AI — Meeting recorder & transcription for Windows",
    description:
      "A Windows desktop app that records your calls, transcribes both sides live, and files a summary with decisions and action items. Local-first: your audio never leaves your machine.",
    url: "https://novapilotai.ellsimohammed8.workers.dev",
    siteName: "NovaPilot AI",
    images: [
      {
        url: "/images/hero-dormant-blueprint.jpg",
        width: 1200,
        height: 630,
        alt: "NovaPilot AI — Meeting recorder & transcription for Windows",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaPilot AI — Meeting recorder & transcription for Windows",
    description:
      "A Windows desktop app that records your calls, transcribes both sides live, and files a summary with decisions and action items. Local-first: your audio never leaves your machine.",
    images: ["/images/hero-dormant-blueprint.jpg"],
  },
};

export default function Home() {
  return <NovaPilotV2Home />;
}
