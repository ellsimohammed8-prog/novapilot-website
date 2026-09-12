# Project: NovaPilot AI SEO & Generative Engine Optimization (GEO)

## Architecture
- **Framework**: Next.js 15 (React 19, App Router) with static export to `./out`
- **Styling**: Tailwind CSS v4 with `@theme` executive design tokens
- **Target Audience / AI Ingestion**: ChatGPT Search, Perplexity AI, Claude Web, Google-Extended, Bing Copilot, and human technical evaluators
- **Canonical Domain**: `https://novapilotai.ellsimohammed8.workers.dev`
- **Structured Knowledge Graph**: Semantic Schema.org JSON-LD microdata (`SoftwareApplication`, `Organization`, `FAQPage`, `TechArticle`)
- **Standardized AI Context Layer**: `/llms.txt` and `/llms-full.txt` conforming to the open /llms.txt specification
- **Crawler Directives & Sitemap**: `public/robots.txt` explicitly permitting AI search bots, and XML Sitemap 0.9 schema (`public/sitemap.xml`)
- **On-Page Citation Anchoring**: High-intent technical FAQ & comparison section in `app/(default)/page.tsx` utilizing semantic `<article>` and `<section>` tags

## Code Layout
- `public/llms.txt` — Standardized condensed AI model context file with verified technical specs and download links
- `public/llms-full.txt` — Comprehensive technical architecture, DSP algorithms, and API documentation for LLMs
- `public/robots.txt` — Production crawler directives welcoming OpenAI, Perplexity, Anthropic, Google, and Bing AI bots
- `public/sitemap.xml` — XML sitemap 0.9 schema with canonical URLs and section anchors
- `components/seo/json-ld.tsx` — Semantic Schema.org JSON-LD microdata component (`SoftwareApplication`, `Organization`, `FAQPage`, `TechArticle`)
- `app/layout.tsx` — Root layout mounting `JsonLd` with canonical tags, OpenGraph, and Twitter Card metadata
- `app/(default)/page.tsx` — Home page mounting high-intent technical FAQ & comparison section (`#faq`)
- `scripts/verify-seo-geo.mjs` — Automated programmatic verification script validating all SEO/GEO assets and schemas
- `release/` — Official Windows release binaries (`NovaPilot-AI-Setup-2.7.1.exe`) and checksums

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Standardized `/llms.txt` | Condensed markdown context for LLMs with architecture specs and download URLs | M1 | User Request §1 |
| 2 | Comprehensive `/llms-full.txt` | Exhaustive technical documentation for AI ingestion (WASAPI, ThinkStripper, DWM) | M1 | User Request §1 |
| 3 | AI Crawler `robots.txt` | Explicitly allows `OAI-SearchBot`, `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, etc. | M2 | User Request §2 |
| 4 | Canonical `sitemap.xml` | XML 0.9 schema for `https://novapilotai.ellsimohammed8.workers.dev` with priority & changefreq | M2 | User Request §2 |
| 5 | Schema.org JSON-LD Component | React component generating valid `SoftwareApplication`, `Organization`, `FAQPage`, `TechArticle` | M3 | User Request §3 |
| 6 | Root Layout Metadata & Mounting | Mount JSON-LD in `app/layout.tsx`, configure canonical URL, OpenGraph, and Twitter Cards | M3 | User Request §3 |
| 7 | On-Page High-Intent Technical FAQ | Section in `app/(default)/page.tsx` answering top search queries with semantic `<article>` tags | M4 | User Request §4 |
| 8 | Semantic Citation Anchoring | Structured anchor targets (`#faq`, `#specs`, `#architecture`) with rich microdata alignment | M4 | User Request §4 |
| 9 | Automated Programmatic SEO Test Script | Script verifying syntax, file presence, XML validity, and JSON-LD schema correctness | M5 | User Request §5 |
| 10 | Static Export Build Verification | `npm run build` static export into `./out` with zero errors | M6 | User Request §5 |
| 11 | Reviewer, Challenger & Forensic Audit Gate | Independent verification of quality, correctness, and authentic implementation | M6 | Dual Track |
| 12 | Git Commit & Push to Main | Git push to `main` branch triggering automatic Cloudflare Workers deployment | M6 | User Request §5 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | LLM Ingestion Layer | `public/llms.txt` & `public/llms-full.txt` with verified specs & SHA-512 | none | PLANNED |
| M2 | Crawler Access & Sitemap | `public/robots.txt` & `public/sitemap.xml` with canonical URLs & AI bots | none | PLANNED |
| M3 | Rich Microdata & Schema.org JSON-LD | `components/seo/json-ld.tsx` & `app/layout.tsx` metadata updates | none | PLANNED |
| M4 | On-Page Authority FAQ & Content | `app/(default)/page.tsx` semantic FAQ section & citation anchors | M3 | PLANNED |
| M5 | Programmatic SEO Verification | `scripts/verify-seo-geo.mjs` test harness for all assets | M1, M2, M3, M4 | PLANNED |
| M6 | Build Certification, Audit & Deployment | Static build export, multi-agent audit gate, git commit & push to `main` | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts
### Schema.org JSON-LD Contract (`components/seo/json-ld.tsx`)
- Exports default React component returning `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />`
- Schema graph items:
  1. `SoftwareApplication`:
     - `@type`: `"SoftwareApplication"`
     - `name`: `"NovaPilot AI"`
     - `operatingSystem`: `"Windows 10, Windows 11"`
     - `applicationCategory`: `"UtilitiesApplication"`
     - `softwareVersion`: `"2.7.1"`
     - `downloadUrl`: `"https://github.com/ellsimohammed8-prog/novapilot-website/releases/download/v2.7.1/NovaPilot-AI-Setup-2.7.1.exe"`
     - `offers`: `{ "@type": "Offer", "price": "0", "priceCurrency": "USD" }`
  2. `Organization`:
     - `@type`: `"Organization"`
     - `name`: `"NovaPilot AI"`
     - `url`: `"https://novapilotai.ellsimohammed8.workers.dev"`
     - `sameAs`: `["https://github.com/ellsimohammed8-prog/novapilot-ai", "https://github.com/ellsimohammed8-prog/novapilot-website"]`
  3. `FAQPage`:
     - `@type`: `"FAQPage"`
     - `mainEntity`: Array of Question/Answer objects matching high-intent queries.
  4. `TechArticle`:
     - `@type`: `"TechArticle"`
     - Headline and technical synopsis of WASAPI loopback, ThinkStripper, and WDA_EXCLUDEFROMCAPTURE.

### SEO Verification Script Contract (`scripts/verify-seo-geo.mjs`)
- Executable via `node scripts/verify-seo-geo.mjs`
- Validates:
  1. Existence and non-empty content of `public/llms.txt`, `public/llms-full.txt`, `public/robots.txt`, `public/sitemap.xml`.
  2. Exact crawler names in `robots.txt`: `OAI-SearchBot`, `ChatGPT-User`, `GPTBot`, `PerplexityBot`, `Perplexity-User`, `ClaudeBot`, `Claude-Web`, `Googlebot`, `Google-Extended`, `Bingbot`.
  3. `sitemap.xml` XML well-formedness and schema compliance.
  4. `components/seo/json-ld.tsx` exports valid JSON-LD graph with required types.
  5. `app/layout.tsx` imports and renders `JsonLd`.
  6. `app/(default)/page.tsx` contains FAQ section with required queries.
- Exits with code 0 on 100% pass, non-zero on failure.
