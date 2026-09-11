# Project: NovaPilot AI Commercial Website Overhaul

## Architecture
- **Framework**: Next.js 15 (React 19, App Router)
- **Styling**: Tailwind CSS v4 with `@theme` executive design tokens
- **Visuals & Media**: HTML5 16:9 Video Player with custom dark slate controls (`nova-pilot-ai.mp4`), 60 FPS GPU-composited CSS `mask-image` / Canvas 16:9 Hover Transformation Visualizer in Hero, Three.js 3D isometric architecture visualizer
- **Security & Headers**: Strict CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP, Byte-Range streaming headers in `next.config.js`
- **Conversion Engine**: SSR-safe OS detection (`useOperatingSystem`), 4-stage download conversion funnel, WCAG AA (>= 4.5:1) high contrast typography

## Code Layout
- `public/videos/nova-pilot-ai.mp4` — Ingested promotional video asset (1920x1080 16:9)
- `next.config.js` — Security headers, CSP, media streaming headers, redirect rules
- `app/css/style.css` — Executive design tokens (`#0047AB` / `#1D4ED8`, `#0B0F19`, `#FFFFFF`), custom theme variables
- `app/css/additional-styles/theme.css` — Sanitized theme styles (purged of dead Cruip AOS cruft)
- `components/video-showcase.tsx` — 16:9 responsive video showcase player with custom controls and adjacent executive CTA
- `components/hero-transformation-canvas.tsx` — Interactive 16:9 calm vs active power state hover canvas (60 FPS)
- `components/hero.tsx` — Hero section integrating the 16:9 transformation canvas, executive copy, and primary CTA
- `components/page-illustration.tsx` — Cleaned background geometric accents (purged of purple 46px blur SVGs)
- `components/ui/header.tsx` — Sticky executive header with dynamic OS download button
- `components/ui/download-button.tsx` — OS-aware high-conversion download button with executive styling
- `components/windows-cta.tsx` — Bottom hardware specs & installer download chassis
- `hooks/use-operating-system.ts` — SSR-safe client OS detection hook (Windows 64-bit vs macOS/Linux)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Next.js Strict CSP & Headers | Production-grade CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | M1 | Survey / Security |
| 2 | Video Streaming & Range Headers | `Accept-Ranges: bytes`, immutable caching, and MIME type headers | M1 | Survey / Security |
| 3 | Metadata & Build Sanitization | `poweredByHeader: false`, `productionBrowserSourceMaps: false`, `metadataBase` | M1 | Survey / Security |
| 4 | Executive Design Tokens | Deep Cobalt (`#0047AB`/`#1D4ED8`), Deep Ink (`#0B0F19`), Pure White (`#FFFFFF`) in Tailwind v4 `@theme` | M2 | Survey / Design |
| 5 | Anti-AI Cliché Purge | Purge purple/violet blur-3xl blobs, ungrounded particle meshes, rainbow text gradients | M2 | Survey / Design |
| 6 | Cruip Cruft Purge | Purge dead AOS CSS in `theme.css`, delete orphaned images in `public/images/`, rewrite `README.md` | M2 | Survey / Codebase |
| 7 | Video Asset Ingestion | Relocate `nova pilot Ai.mp4` to `public/videos/nova-pilot-ai.mp4` with clean slug | M3 | Survey / Codebase |
| 8 | 16:9 Video Player Showcase | Responsive 16:9 player with play/pause, timeline scrubber, volume/mute, fullscreen controls | M3 | User Request / Codebase |
| 9 | Adjacent Executive Download CTA | High-conversion download card alongside video player with version badge & SHA-512 | M3 | User Request / Design |
| 10 | Zero Layout Shift (CLS = 0) | Exact `aspect-video` container reservations and preload metadata | M3 | User Request / Codebase |
| 11 | Calm vs Active Visual Assets | Visual assets representing dormant HUD blueprint vs luminescent cobalt power surge | M4 | User Request / Design |
| 12 | 16:9 Hover Transformation Canvas | 60 FPS GPU-composited canvas in Hero tracking cursor coordinates with localized depth reveal | M4 | User Request / Design |
| 13 | Touch/Mobile Canvas Fallback | Autonomous scanning radar / touch-drag scrubber fallback on mobile | M4 | Survey / Design |
| 14 | Dynamic OS Detection Hook | SSR-safe `useOperatingSystem` hook detecting Windows 64-bit vs macOS/Linux | M5 | User Request / Design |
| 15 | Multi-Touchpoint Download Funnel | Prominent CTAs across Header, Hero, Video Showcase, and Pre-Footer chassis | M5 | User Request / Conversion |
| 16 | WCAG AA Contrast Compliance | Enforce >= 4.5:1 text contrast and >= 3:1 large text across all components | M5 | User Request / Impeccable |
| 17 | Production Build & Zero Lint Errors | `npm run build` succeeds with 0 TS errors and 0 linting errors | M6 | Acceptance Criteria |
| 18 | Opaque-box E2E Test Suite | 4-tier requirement-driven test suite validating all features independently | M6 | Dual Track |
| 19 | Adversarial Coverage Hardening | White-box stress testing and edge-case validation (Tier 5) | M6 | Dual Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Security Hardening & Next.js Config | `next.config.js` headers, CSP, media streaming, metadataBase, sanitization | none | DONE |
| M2 | Anti-AI Purge & Executive Design System | Tailwind `@theme` tokens, purge blur halos & purple blobs, clean AOS & Cruip cruft | none | DONE |
| M3 | Promotional Video Showcase & CTA | Relocate video to `public/videos/nova-pilot-ai.mp4`, build 16:9 custom player & adjacent CTA | M1, M2 | DONE |
| M4 | 16:9 Hover Transformation Canvas | Build 60 FPS Calm vs Active power state hover-reveal canvas in Hero | M2 | DONE |
| M5 | Executive UX/UI Conversion & Accessibility | `useOperatingSystem` hook, multi-stage CTAs, WCAG AA contrast compliance polish | M2, M3, M4 | DONE |
| M6 | Verification, E2E Test Pass & Audit | 100% E2E test suite pass (Tiers 1-4), adversarial hardening (Tier 5), forensic audit | M1, M2, M3, M4, M5 | IN_PROGRESS |

## Interface Contracts
### Video Showcase Component Contract (`components/video-showcase.tsx`)
- **Props**: `{ src?: string, poster?: string, autoPlay?: boolean }`
- **Default Source**: `"/videos/nova-pilot-ai.mp4"`
- **Default Aspect Ratio**: `16:9` (`aspect-video`)
- **State Interface**:
  - `isPlaying: boolean`
  - `currentTime: number`, `duration: number`
  - `volume: number`, `isMuted: boolean`
  - `isFullscreen: boolean`
- **Output Elements**: Custom control bar, video element, adjacent executive download callout banner with `NovaPilot-AI-Setup-2.7.1.exe` trigger.

### Hover Transformation Canvas Contract (`components/hero-transformation-canvas.tsx`)
- **Props**: `{ className?: string }`
- **Aspect Ratio**: `16:9` (`aspect-video`, `w-full max-w-5xl mx-auto`)
- **Interaction Interface**:
  - Pointer movement tracks normalized coordinates `(x, y)` in `[0, 1]`
  - Frame coordination via `requestAnimationFrame` and CSS custom properties `--mouse-x`, `--mouse-y`
  - Reveal mask: radial gradient circle `radial-gradient(circle 280px at var(--mouse-x) var(--mouse-y), ...)`
  - Dual layers: Base Dormant Blueprint (Calm) + Top Luminescent Cobalt Surges (Active Power)
  - Mobile fallback: Automatic sweep animation or touch-drag scrubber.

### OS Detection Hook Contract (`hooks/use-operating-system.ts`)
- **Return Type**: `{ os: 'windows' | 'mac' | 'linux' | 'unknown', isWindows: boolean, architecture: string, isHydrated: boolean }`
- **SSR Fallback**: Default to `windows` (`64-bit`) to avoid hydration mismatch while optimizing for 95%+ Windows target audience.
