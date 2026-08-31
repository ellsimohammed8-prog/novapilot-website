# DESIGN.md — NovaPilot AI Design System & Token Specification

<!-- impeccable:design-tokens 1 -->

## Product Identity & Core Purpose
- **Product Name:** NovaPilot AI
- **Tagline:** Undetectable Real-Time Meeting Copilot & Audio Intelligence
- **Target Audience:** Software engineers, system architects, senior leaders, and executives attending high-stakes interviews, technical presentations, and executive calls.
- **Design Philosophy:** Restraint over decoration. High contrast, executive sophistication, zero-latency streaming feedback, and absolute discretion (Liquid Glass HUD).

---

## 1. Color Palette (Strict Contrast & WCAG AA)

### Dark Mode (Primary Visual Environment)
- **Canvas / Background:** `#0B0F19` (Deep Ink, Neutral-Cool)
- **Surface / Card:** `#111827` (Rich Obsidian Glass)
- **Elevated Surfaces:** `#1E293B` (Elevated Panel)
- **Primary Accent:** `#0047AB` (Master Deep Cobalt Blue)
- **Active / Hover Accent:** `#1D4ED8` / `#3B82F6` (Electric Cobalt)
- **Typography Primary:** `#F8FAFC` (Cool True White, Contrast ≥ 14:1)
- **Typography Secondary:** `#94A3B8` (Slate Silver, Contrast ≥ 5.2:1)
- **Typography Muted:** `#64748B` (Neutral Slate)
- **Hairline Borders:** `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.14)`

### Light Mode (High-Contrast Clean Mode)
- **Canvas / Background:** `#FFFFFF` (Cool Pure White)
- **Surface / Card:** `#F8FAFC` (Crisp Off-White Surface)
- **Elevated Surfaces:** `#FFFFFF` (Pure Card)
- **Primary Accent:** `#0047AB` (Master Cobalt)
- **Typography Primary:** `#0B0F19` (Deep Ink, Contrast ≥ 15:1)
- **Typography Secondary:** `#475569` (Dark Slate)
- **Hairline Borders:** `rgba(0, 0, 0, 0.08)` to `rgba(0, 0, 0, 0.12)`

### Status Indicators
- **Stealth / Active:** `#10B981` (Emerald Green, `rgba(16, 185, 129, 0.15)` bg)
- **Warning / Attention:** `#F59E0B` (Amber Orange, `rgba(245, 158, 11, 0.15)` bg)
- **Danger / Alert:** `#EF4444` (Ruby Red, `rgba(239, 68, 68, 0.15)` bg)

---

## 2. Typography Hierarchy

- **Primary Display Font:** `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`
- **Monospace & Telemetry Font:** `JetBrains Mono`, `SF Mono`, `monospace`
- **Scale:**
  - `Hero Display`: 56px – 72px (Font Weight: 800, Letter Spacing: `-0.03em`)
  - `Section Header H2`: 36px – 48px (Font Weight: 750, Letter Spacing: `-0.025em`)
  - `Feature Title H3`: 20px – 24px (Font Weight: 700, Letter Spacing: `-0.015em`)
  - `Card / Body Text`: 14px – 16px (Font Weight: 450, Line Height: 1.6)
  - `Meta / Badges`: 11px – 13px (Font Weight: 600, Font Family: Mono)

---

## 3. Motion & Interaction Curves (Emil-Design-Eng Standards)

- **Standard Easing:** `cubic-bezier(0.23, 1, 0.32, 1)`
- **Hover Transitions:** 200ms `cubic-bezier(0.23, 1, 0.32, 1)`
- **Active Press Scale:** `scale(0.98)` on cards, `scale(0.97)` on buttons
- **Card 3D Spring Tilt:** Stiffness: 150, Damping: 22, Perspective: 1000px
- **Mouse Spotlight:** Radial gradient circle 180px with soft falloff `rgba(59, 130, 246, 0.12)`

---

## 4. Anti-Patterns & Absolute Bans
- ❌ No generic rainbow gradients (pink/purple mush).
- ❌ No overused unstyled Inter defaults.
- ❌ No nested cards inside cards (Lazy Containers).
- ❌ No gray text on colored backgrounds.
- ❌ No wide blurry halos (blur ≥ 16px without container boundaries).
- ❌ No generic chat bubbles for executive telemetry.
