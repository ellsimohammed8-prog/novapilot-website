# Project: NovaPilot AI True 3D Spatial Scrollytelling & High-Conversion Polish

## Architecture
- **Framework**: Next.js 15 (React 19, App Router) with static export to `./out`
- **Styling**: Tailwind CSS v4 with `@theme` tokens in `app/css/style.css` and `app/css/additional-styles/theme.css`
- **3D Graphics Engine**: Three.js r173 (`^0.173.0`) full-screen fixed WebGL background canvas (`fixed inset-0 z-0 pointer-events-none`)
- **Particle System**: Procedural 6,500-particle GPU-accelerated system (`THREE.Points` + `THREE.ShaderMaterial`) with 4 morph target coordinate buffers:
  - Phase 1 (Hero): Concentrated glowing Nova core responding to cursor parallax
  - Phase 2 (Features): Radial particle burst framing the 4 key technical badges
  - Phase 3 (Video): Relativistic accretion ring enveloping the holographic 16:9 video showcase frame
  - Phase 4 (Download/CTA): Cinematic upward camera tilt focusing on the Windows Download call-to-action
- **3D Spatial DOM Choreography**:
  - Direct DOM ref GPU-composited CSS 3D transforms (`perspective(1200px) translate3d(0, Y, Z) scale(S)`)
  - Hero headline & subtitle physically recede backward along Z to Z = -450px, scale down to 0.52, and spatially disperse/defocus as 3D camera flies forward through starfield
  - Phase 2: 4 key feature cards glide into 3D viewport from 4 peripheral quadrants, framing the expanding cosmic particle field
  - Phase 3: 16:9 Video Showcase docks into 3D holographic wireframe and accretion ring (`scale(0.93) rotateX(5deg) -> scale(1.0) rotateX(0deg) translateZ(0px)`)
- **Interactive 3D Cursor**: Client component `components/interactive-3d-cursor.tsx` with glowing cyan reticle (`#00F0FF`), inertia damping, 12-particle micro-trail, velocity stretch, magnetic hover snap, and mobile touch guards (`@media (pointer: coarse)`)
- **High-Conversion Marketing Flow**:
  1. Hero Hook & Instant Windows Download CTA
  2. 4 Sleek Floating Glassmorphic Badges (`id="features"`)
  3. Cinematic 16:9 Video Showcase with holographic HUD framing (`id="demo"`)
  4. Concise FAQ / Trust Badges (`id="faq"`)
  5. High-Conversion Windows Download Portal (`id="download"`, specs `id="specs"`)
- **Navigation**: Re-anchored "3D Architecture" link in top navigation bar smoothly scrolling to `#demo`, with all navbar links (`#features`, `#demo`, `#specs`, `#download`) active and zero dead links.

## Code Layout
- `components/supernova-cosmic-canvas.tsx` — Full-screen fixed Three.js 6,500-particle scrollytelling canvas with 4-phase camera waypoints, parallax, and clean WebGL disposal
- `components/hero.tsx` — Hero section with 3D Z-axis text recession, scale reduction, spatial dispersion, and 4 peripheral gliding feature badges
- `components/video-showcase.tsx` — 16:9 video showcase with scroll-driven 3D docking transform into the holographic wireframe
- `components/interactive-3d-cursor.tsx` — Interactive glowing cyan 3D cursor follower with velocity physics and particle trail
- `components/ui/header.tsx` — Navigation bar with re-anchored `#demo` link, preserved logo, `v2.7.1-production` badge, and download action
- `app/(default)/page.tsx` — High-conversion 5-section marketing landing page mounting canvas, cursor, hero, video showcase, FAQ, and download portal
- `scripts/verify-scrollytelling.mjs` — Automated E2E verification test harness validating all 3D spatial and scrollytelling requirements
- `scripts/verify-commercial-suite.mjs` — Commercial compliance test suite (196 tests)
- `components/features-grid.tsx` — Preserved on disk for test suite compatibility, unmounted from main page JSX
- `components/specs-table.tsx` — Preserved on disk for test suite compatibility, unmounted from main page JSX
- `components/interactive-architecture.tsx` — Preserved on disk for test suite compatibility
- `components/media-showcase.tsx` — Preserved on disk for test suite compatibility
- `components/hero-transformation-canvas.tsx` — Preserved on disk for test suite compatibility

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | WebGL Disposal Bugfix | Fix `cornerMat.material.dispose()` in `supernova-cosmic-canvas.tsx:611` | M1 | Survey (Tests & Marketing) |
| 2 | Hero Text Z-Axis Choreography | Direct DOM ref GPU CSS 3D transform (`perspective(1200px) translate3d(0, Y, Z) scale(S)`) receding backward to Z=-450px with spatial dispersion | M1 | User Request R1 |
| 3 | 4 Feature Badges 3D Gliding | 4-quadrant peripheral gliding trajectories into 3D viewport framing Phase 2 particle burst | M1 | User Request R1 |
| 4 | 16:9 Video Showcase 3D Docking | Scroll-driven 3D transform docking video container into holographic wireframe & accretion ring | M1 | User Request R1 |
| 5 | Interactive 3D Cursor Follower | Cyan glowing reticle (`#00F0FF`), inertia damping, 12-particle trail, velocity stretch, hover snap | M1 | User Request R1 |
| 6 | 5-Section Marketing Flow Condensation | Condense `app/(default)/page.tsx` to 5 high-impact marketing sections | M2 | User Request R2 |
| 7 | Technical Clutter & Blueprint Purge | Unmount `FeaturesGrid` and `SpecsTable` from `page.tsx` while retaining files on disk | M2 | User Request R2 |
| 8 | Navbar Re-anchoring to `#demo` | Re-anchor "3D Architecture" to `#demo`, remove duplicate "Live Demo", ensure all links functional | M2 | User Request R2 |
| 9 | Navbar Brand & Badge Preservation | Retain brand logo, version badge `v2.7.1-production`, and download action buttons | M2 | User Request R2 |
| 10 | Automated Scrollytelling Suite Hardening | Add assertions for 3D Z-axis movement, video docking, 3D cursor, badge animation, `#demo` anchoring | M3 | User Request AC |
| 11 | Commercial Suite 100% Pass | Maintain 100% compliance on `scripts/verify-commercial-suite.mjs` (196/196) | M3 | User Request AC |
| 12 | Clean Static Build (`npm run build`) | Achieve 0 TypeScript/ESLint errors and successful static export into `./out` | M4 | User Request AC |
| 13 | Multi-Agent Review, Challenge & Audit Gate | 2 Reviewers, 2 Challengers, and 1 Forensic Auditor gate verification | M4 | Dual Track & Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | 3D Spatial Scrollytelling & Interactive Cursor | `supernova-cosmic-canvas.tsx`, `hero.tsx`, `video-showcase.tsx`, `interactive-3d-cursor.tsx` | none | PLANNED |
| M2 | Marketing Flow Condensation & Navigation Polish | `app/(default)/page.tsx`, `components/ui/header.tsx`, `windows-cta.tsx` | none | PLANNED |
| M3 | Automated E2E Test Suite Hardening | `scripts/verify-scrollytelling.mjs` | M1, M2 | PLANNED |
| M4 | Build Certification, Multi-Agent Review & Gate | `npm run build`, Reviewers, Challengers, Forensic Auditor | M1, M2, M3 | PLANNED |

## Interface Contracts

### 3D Spatial Scrollytelling Contract (`components/hero.tsx` & `components/supernova-cosmic-canvas.tsx`)
- Hero Typography:
  - Binds normalized scroll progress $p \in [0.0, 1.0]$ via `requestAnimationFrame` loop on direct DOM `ref`.
  - Transform: `perspective(1200px) translate3d(0, ${y}px, ${z}px) scale(${s})`
  - $z$ range: $0\text{px} \to -450\text{px}$
  - $s$ range: $1.0 \to 0.52$
  - Defocus / dispersion: `filter: blur(${blur}px)`, opacity: $1.0 \to 0.0$
- 4 Key Feature Badges:
  - Quadrant gliding: cards glide from peripheral offsets $(\pm 100\text{px}, \pm 25\text{px}, -120\text{px})$ into $(0, 0, 0)$ locking at $p \approx 0.8 - 1.0$.
  - Dark glassmorphism classes:
    `relative p-3.5 sm:p-4 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[#0A0F1C]/50 backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/30 hover:bg-[#0E1626]/70 shadow-lg shadow-black/30`
  - Container element includes `id="features"`.

### 16:9 Video Showcase Docking Contract (`components/video-showcase.tsx`)
- Scroll progress $p \in [1.2, 2.4]$:
  - Transitions from `scale(0.93) rotateX(5deg) translateZ(-60px)` to `scale(1.0) rotateX(0deg) translateZ(0px)` at $p = 2.0$, docking into the Three.js holographic wireframe.
  - Retains custom styled controls, `novapilot:video-play` event, and download CTA.

### Interactive 3D Cursor Contract (`components/interactive-3d-cursor.tsx`)
- Exports default client component (`"use client"`)
- Renders cyan glowing reticle (`box-shadow: 0 0 15px #00F0FF`) and trailing micro-particles.
- Dynamic velocity stretch based on mouse delta.
- Magnetic hover scaling on interactive targets (`a`, `button`, `[role="button"]`, `.glass-card`).
- Hidden on touch devices via `@media (pointer: coarse)`.
- `pointer-events-none fixed inset-0 z-50`.

### Navigation & Marketing Flow Contract (`components/ui/header.tsx` & `app/(default)/page.tsx`)
- `header.tsx`:
  - `navLinks`:
    - `{ href: "#features", label: "Features" }`
    - `{ href: "#demo", label: "3D Architecture" }`
    - `{ href: "#specs", label: "Specifications" }`
    - `{ href: "#download", label: "Download" }`
  - Zero dead links; all anchor to active sections.
- `page.tsx`:
  - Exactly 5 marketing sections mounted:
    1. `<SupernovaCosmicCanvas />`
    2. `<Interactive3dCursor />`
    3. `<Hero />` (with `id="features"` on badges)
    4. `<div id="demo"><ErrorBoundary><VideoShowcase /></ErrorBoundary></div>`
    5. `<GeoFaqSection />` (with `id="faq"`)
  - `FeaturesGrid` and `SpecsTable` unmounted from JSX, preserved on disk.

### Edge Gateway & Speech-to-Text Pipeline (F6 Architecture)
- **Cloudflare Edge Gateway & Multi-Key Pool Rotation**: Distributed Cloudflare Edge worker gateway with multi-key pool rotation for high-throughput LLM failover and load balancing across providers.
- **Real-Time Edge WebSocket STT Relay**: Low-latency WebSocket STT (speech-to-text) streaming relay interfacing Deepgram and local audio buffers for instantaneous transcript generation.
- **Offline Whisper & Moonshine ONNX Engine**: Local speech-to-text fallback executing quantized Whisper / Moonshine models on-device via DirectML and ONNX Runtime when offline.
