import "./css/style.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import Header from "@/components/ui/header";
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
  themeColor: "#030712",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://novapilotai.ellsimohammed8.workers.dev"),
  alternates: {
    canonical: "https://novapilotai.ellsimohammed8.workers.dev",
  },
  title: "NovaPilot AI — Executive Stealth HUD Copilot for Windows",
  description:
    "Zero-latency dual-stream WASAPI loopback audio capture, ThinkStripper LLM reasoning pipeline, and 100% stealth screen-share protection for Windows 10 & 11.",
  keywords: [
    "NovaPilot",
    "NovaPilot AI",
    "stealth HUD copilot",
    "WASAPI loopback audio",
    "ThinkStripper",
    "screen-share protection",
    "DeepSeek R1",
    "Claude 3.7",
    "executive copilot",
    "Windows desktop AI",
    "Generative Engine Optimization",
  ],
  authors: [{ name: "NovaPilot AI Core Team" }],
  openGraph: {
    title: "NovaPilot AI — Executive Stealth HUD Copilot for Windows",
    description:
      "Zero-latency dual-stream WASAPI loopback audio capture, ThinkStripper LLM reasoning pipeline, and 100% stealth screen-share protection for Windows 10 & 11.",
    url: "https://novapilotai.ellsimohammed8.workers.dev",
    siteName: "NovaPilot AI",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NovaPilot AI — Executive Stealth HUD Copilot for Windows",
    description:
      "Zero-latency dual-stream WASAPI loopback audio capture, ThinkStripper LLM reasoning pipeline, and 100% stealth screen-share protection for Windows 10 & 11.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${inter.variable} ${nacelle.variable} bg-gray-950 font-inter text-base text-gray-200 antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
