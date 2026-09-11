# NovaPilot AI — Commercial Web Platform & Showcase Portal

[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![WCAG 2.1 AAA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AAA-10B981?style=flat-square)](https://www.w3.org/WAI/WCAG21/quickref/)

Production-grade commercial web platform and interactive technical showcase for **NovaPilot AI Desktop**—the local-first executive desktop copilot for Windows 10 & 11. Engineered for elite software engineers, corporate architects, and executives requiring real-time conversational intelligence, multi-channel audio loopback, and stealth overlay execution during high-stakes remote calls.

---

## Executive Overview

NovaPilot AI bridges local hardware execution with real-time reasoning models. Unlike cloud-tethered chatbots or generic prompt wrappers, NovaPilot AI runs locally on Windows, directly capturing system loopback and microphone audio via native WASAPI drivers, while rendering an invisible stealth HUD excluded from all screen-sharing pipelines.

This web platform serves as the primary commercial portal and distribution channel for the desktop binary (`NovaPilot-AI-Setup-2.7.1.exe`), delivering an executive-grade user experience with zero AI clichés.

---

## Core Capabilities Documented

### 1. Stealth Overlay Architecture
- **Window Display Affinity**: Native Windows `WDA_EXCLUDEFROMCAPTURE` flag enforcement ensuring the overlay window is 100% invisible on Zoom, Microsoft Teams, Google Meet, Slack, Discord, and OBS recordings.
- **Hardware Acceleration**: Transparent, click-through Electron/DirectX canvas with sub-frame presentation latency.

### 2. WASAPI Multi-Channel Audio Loopback
- **Rust CPAL Subsystem**: High-performance dual-channel loopback capture streaming both microphone input and incoming caller voice simultaneously.
- **Lock-Free SPSC Ring Buffers**: Audio chunk processing with bounded `<5ms` latency and zero audio buffer overruns.

### 3. ThinkStripper LLM Pipeline
- **Real-Time Token Filtering**: Finite-state machine that parses and extracts `<think>` tokens from streaming reasoning models (DeepSeek-R1, Qwen 2.5) with zero token leakage.
- **Context Synthesis**: Sub-second contextual assistance during technical architecture reviews and live coding interviews.

### 4. Serverless Telemetry & Governance
- **Encrypted Telegram Bridge**: End-to-end encrypted telemetry reporting crashes and performance metrics without harvesting sensitive user conversations.
- **Emergency Release Kill-Switch**: Cryptographically signed remote kill-switch preventing compromised binary execution.

### 5. 16:9 Promotional Video Showcase
- **Native Video Player**: Hardware-accelerated 16:9 HTML5 video player mounting `nova-pilot-ai.mp4` with custom dark slate/cobalt controls (play/pause, timeline scrubber, volume slider, fullscreen).
- **Zero Layout Shift (CLS = 0)**: Precise aspect ratio containers with preload optimization.

### 6. Interactive 16:9 Hover Transformation Canvas
- **60 FPS GPU-Composited Mask**: Hero showcase tracking cursor coordinates to reveal the transformation from the dormant architectural blueprint (Calm State) into luminescent cobalt power surges (Active Power State).
- **Zero Re-Render Overhead**: Decoupled from React virtual DOM diffing via `requestAnimationFrame` and CSS custom properties.
- **Touch Viewport Fallback**: Autonomous sinusoidal radar sweep on mobile devices and touch screens.

### 7. Multi-Stage Conversion Funnel
- **Dynamic OS Detection**: SSR-safe `useOperatingSystem` hook detecting Windows 64-bit architecture with instant Windows installer downloads and graceful fallback for other platforms.
- **Cryptographic Trust Signatures**: Direct SHA-512 hash copy interactions for enterprise security and IT compliance sign-off.

---

## Design System: Executive Palette & Anti-AI Standard

The web application adheres to the **`impeccable` (pbakaus/impeccable)** design methodology, completely eradicating generic AI clichés:

- **Strictly Banned Anti-Patterns**:
  - NO indiscriminate purple or violet blur-3xl glow clouds.
  - NO ungrounded particle meshes or spiderweb dust.
  - NO rainbow gradient text clips (`bg-clip-text text-transparent`).
  - NO empty kicker / eyebrow pill stamps above headlines.
  - NO generic marketing buzzwords ("magic button", "supercharge your workflow").

- **Authoritative Executive Palette**:
  - **Deep Cobalt Blue**: `--color-cobalt-600: #0047AB`, `--color-cobalt-500: #1D4ED8`, `--color-cobalt-400: #2563EB`
  - **Deep Ink Surfaces**: `--color-ink-base: #0B0F19`, `--color-ink-chassis: #111827`, `--color-ink-surface: #1E293B`
  - **Pure White**: `--color-pure-white: #FFFFFF` (Headings, primary CTA labels)
  - **Hairline Borders**: `1px solid rgba(255, 255, 255, 0.08)`
  - **Contrast Verification**: Primary reading text achieves **19.01:1** contrast on ink canvas, exceeding WCAG 2.1 AAA (7.0:1) standards.

---

## Project Structure

```
├── app/
│   ├── (default)/           # Default layout route
│   │   └── page.tsx         # Commercial landing page
│   ├── css/
│   │   ├── additional-styles/
│   │   │   ├── theme.css    # Executive surface and hairline utilities
│   │   │   └── utility-patterns.css
│   │   └── style.css        # Tailwind v4 @theme Executive Palette tokens
│   ├── layout.tsx           # Root layout with Inter & Geist fonts
│   └── globals.css
├── components/
│   ├── hero.tsx             # Hero section with primary CTA and canvas
│   ├── hero-transformation-canvas.tsx # 16:9 60 FPS interactive hover visualizer
│   ├── video-showcase.tsx   # 16:9 commercial video player & adjacent CTA
│   ├── page-illustration.tsx# Bespoke cobalt hairline vector background grid
│   ├── windows-cta.tsx      # System hardware specs & SHA-512 installer chassis
│   └── ui/
│       ├── header.tsx       # Sticky executive navigation with dynamic OS CTA
│       ├── footer.tsx       # Production footer with compliance and release tags
│       └── download-button.tsx # OS-aware executive download trigger
├── hooks/
│   └── use-operating-system.ts # SSR-safe client OS detection
├── public/
│   ├── videos/              # Video assets (nova-pilot-ai.mp4)
│   └── images/              # Optimized static brand visual assets
├── next.config.js           # Production security headers, CSP, media range streaming
└── scripts/
    ├── verify-commercial-suite.mjs # 5-Tier commercial verification suite
    └── verify-e2e.mjs       # End-to-end acceptance test harness
```

---

## Getting Started

### Prerequisites
- Node.js 20+ or Node.js 24 (LTS recommended)
- npm 10+ or npm 11

### Installation
```bash
npm install
```

### Local Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

### Code Quality & Linting
```bash
npm run lint
```

### Verification & E2E Testing
Run the automated test harnesses to independently certify all features:
```bash
node scripts/verify-commercial-suite.mjs
node scripts/verify-e2e.mjs
```

---

## Security Hardening

- **Content Security Policy (CSP)**: Nonce-based or strict script, frame, media, and object source restrictions.
- **Transport Security**: HSTS preload with 2-year duration (`max-age=63072000; includeSubDomains; preload`).
- **Streaming Audio/Video**: Byte-Range streaming headers (`Accept-Ranges: bytes`) with immutable media caching.
- **Privacy & Isolation**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Cross-Origin-Opener-Policy: same-origin`.
- **Sanitized Footprint**: `poweredByHeader: false`, production source maps suppressed from client bundles.

---

## License & Commercial Copyright

Copyright &copy; 2026 NovaPilot AI Inc. All rights reserved.  
Unauthorized distribution, reverse engineering, or scraping of proprietary WASAPI audio binaries and telemetry endpoints is strictly prohibited.
