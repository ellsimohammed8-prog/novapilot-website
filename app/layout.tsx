import "./css/style.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import JsonLd from "@/components/seo/json-ld";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const nacelle = localFont({
  src: [
    {
      path: "../public/fonts/nacelle-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/nacelle-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/nacelle-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/nacelle-semibolditalic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-nacelle",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF8F3",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://novapilotai.ellsimohammed8.workers.dev"),
  alternates: {
    canonical: "https://novapilotai.ellsimohammed8.workers.dev",
  },
  title: "NovaPilot AI — Meeting recorder & transcription for Windows",
  description:
    "NovaPilot AI is a Windows desktop app that records your calls, transcribes both sides live, and files a summary with decisions and action items. Local-first: your audio never leaves your machine. Free download, v2.7.1.",
  keywords: [
    "NovaPilot",
    "NovaPilot AI",
    "meeting recorder",
    "meeting transcription",
    "call summaries",
    "action items",
    "WASAPI loopback audio",
    "ThinkStripper",
    "local-first",
    "Windows desktop AI",
    "Generative Engine Optimization",
  ],
  authors: [{ name: "NovaPilot AI Core Team" }],
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: "googlefa1396fe74947b67",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <JsonLd />
      </head>
      <body className={`${inter.variable} ${nacelle.variable}`}>
        {children}
      </body>
    </html>
  );
}
