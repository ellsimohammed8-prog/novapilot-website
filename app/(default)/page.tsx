import type { Metadata } from "next";

import "../css/novapilot-v3.css";
import NovaPilotV3Home from "@/components/novapilot-v3/home";

export const metadata: Metadata = {
  title: "NovaPilot AI — Every meeting, captured.",
  description:
    "NovaPilot AI records your calls, writes the transcript, and hands you a clear summary the moment you hang up.",
  openGraph: {
    title: "NovaPilot AI — Every meeting, captured.",
    description:
      "NovaPilot AI records your calls, writes the transcript, and hands you a clear summary the moment you hang up.",
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
    title: "NovaPilot AI — Every meeting, captured.",
    description:
      "NovaPilot AI records your calls, writes the transcript, and hands you a clear summary the moment you hang up.",
    images: ["/images/hero-dormant-blueprint.jpg"],
  },
};

export default function Home() {
  return <NovaPilotV3Home />;
}
