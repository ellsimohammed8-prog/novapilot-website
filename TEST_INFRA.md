# E2E Test Infra: NovaPilot AI Commercial Website

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.
- Verification mechanism is completely decoupled from implementation internals.

## Feature Inventory & Test Coverage Goals
| # | Feature | Requirement Source | Tier 1 (Coverage) | Tier 2 (Boundary) | Tier 3 (Cross) |
|---|---------|-------------------|:-----------------:|:-----------------:|:--------------:|
| 1 | Next.js Strict CSP & Headers | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 2 | Video Streaming & Byte-Range Headers | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 3 | Metadata & Build Sanitization | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 4 | Executive Design Tokens & Palette | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 5 | Anti-AI Cliché Purge | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 6 | Cruip Template Cleansing | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 7 | Promotional Video Ingestion | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 8 | 16:9 Video Player Controls | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 9 | Adjacent Executive Download CTA | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 10 | Zero Layout Shift (CLS = 0) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 11 | Calm vs Active Visual Assets | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 12 | 16:9 Hover Transformation Canvas | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 13 | Touch/Mobile Canvas Fallback | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 14 | Dynamic OS Detection Hook | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |
| 15 | Multi-Touchpoint Download Funnel | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |
| 16 | WCAG AA Contrast Compliance | ORIGINAL_REQUEST §R5 | 5 | 5 | ✓ |
| 17 | Production Build & Static Export | ORIGINAL_REQUEST §Acceptance | 5 | 5 | ✓ |

## Test Architecture
- Test runner: `node scripts/verify-commercial-suite.mjs`
- Directory layout: `scripts/` and tests in `scripts/tests/`
- Output format: Structured JSON + ANSI CLI summaries with exit code 0 on all pass

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Prospective Customer Discovery Journey | Header OS CTA, Hero 16:9 Canvas, Video Showcase Playback, Installer Download | High |
| 2 | Executive Media Verification | Video playback with custom controls, byte-range seeking, aspect ratio preservation, CTA link | High |
| 3 | Security & Compliance Audit | CSP evaluation, header presence, no-sniff, clickjacking prevention, no sensitive path leaks | High |
| 4 | Mobile & Low-Power User Journey | Responsive 16:9 layout scaling, touch-drag hover fallback, high contrast legibility | Medium |
| 5 | Accessibility & Color Vision Journey | WCAG AA >= 4.5:1 contrast, keyboard focus indicators, screen-reader aria labels | Medium |

## Coverage Thresholds
- Identified Features: 17
- Tier 1: >= 5 × 17 = 85 tests
- Tier 2: >= 5 × 17 = 85 tests
- Tier 3: >= 17 tests (cross-feature interactions)
- Tier 4: >= 9 scenarios (max(5, 17/2))
- Tier 5: Adversarial white-box tests
- Total planned test cases: >= 196
