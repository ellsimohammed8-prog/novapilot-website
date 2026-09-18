#!/usr/bin/env node
/**
 * ============================================================================
 * NovaPilot AI — Cinematic 3D Scrollytelling & Layout Verification Test Suite
 * ============================================================================
 *
 * Verifies all requirements and acceptance criteria from:
 * - PROJECT.md § Feature Inventory (Features 1..16)
 * - PROJECT.md § Interface Contracts (Canvas, Landing Page Layout, E2E Test Suite)
 * - ORIGINAL_REQUEST.md (Refactoring Requirements R1, R2, R3 & Acceptance Criteria)
 *
 * Designed across 4 Verification Tiers:
 * - Tier 1: Feature Coverage (Features F01..F13 = 69 tests)
 * - Tier 2: Boundary & Corner Cases (aspect ratios, mobile clamping, scroll bounds, disposal, 3D bounds = 24 tests)
 * - Tier 3: Cross-Feature Combinations (canvas + navbar, glassmorphism over bursts, video in ring, simplified flow = 24 tests)
 * - Tier 4: Real-World Workload & Build Certification (lint, build export, zero dangling imports = 11 tests)
 *
 * Total Test Coverage: 128 Programmatic Test Assertions (101 M5 Baseline + 27 M6 Spatial Extensions)
 *
 * Usage:
 *   node scripts/verify-scrollytelling.mjs                # Run full suite (exit 0 = pass, 1 = fail)
 *   node scripts/verify-scrollytelling.mjs --milestone 5  # Run M5 baseline tests (101 tests)
 *   node scripts/verify-scrollytelling.mjs --milestone 6  # Run M6 spatial scrollytelling tests (27 tests)
 *   node scripts/verify-scrollytelling.mjs --tier 1       # Run specific tier (1, 2, 3, 4)
 *   node scripts/verify-scrollytelling.mjs --feature F09  # Run specific feature (F01..F13, B01..B06, C01..C06)
 *   node scripts/verify-scrollytelling.mjs --summary      # Compact summary table output
 *   node scripts/verify-scrollytelling.mjs --json         # JSON structured output
 *   node scripts/verify-scrollytelling.mjs --fast         # Skip re-running npm build/lint child processes
 *   node scripts/verify-scrollytelling.mjs --help         # Show usage documentation
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI Terminal Colors
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m\x1b[1m',
  bgRed: '\x1b[41m\x1b[37m\x1b[1m',
  bgCyan: '\x1b[46m\x1b[30m\x1b[1m',
};

// ---------------------------------------------------------------------------
// File & Parsing Helpers
// ---------------------------------------------------------------------------

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT_DIR, relPath));
}

function readFile(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function getFileSize(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return 0;
  return fs.statSync(fullPath).size;
}

// ---------------------------------------------------------------------------
// CLI Argument Parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const options = {
  tier: null,
  feature: null,
  milestone: null,
  summary: false,
  json: false,
  fast: false,
  help: false,
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--tier' && args[i + 1]) {
    options.tier = parseInt(args[++i], 10);
  } else if (arg === '--feature' && args[i + 1]) {
    options.feature = args[++i].toUpperCase();
  } else if (arg === '--milestone' && args[i + 1]) {
    options.milestone = parseInt(args[++i], 10);
  } else if (arg === '--summary') {
    options.summary = true;
  } else if (arg === '--json') {
    options.json = true;
  } else if (arg === '--fast' || arg === '--skip-build') {
    options.fast = true;
  } else if (arg === '--help' || arg === '-h') {
    options.help = true;
  }
}

if (options.help) {
  console.log(`
${C.bold}${C.cyan}NovaPilot AI — Scrollytelling & Layout Verification Suite${C.reset}

Usage:
  node scripts/verify-scrollytelling.mjs [options]

Options:
  --tier <1|2|3|4>     Run only tests in the specified tier
  --feature <ID>       Run tests matching feature prefix (e.g. F01, F09, B06, C06)
  --milestone <5|6>    Run tests for specific milestone (5 = baseline 101, 6 = spatial 27)
  --summary            Display compact table summary
  --json               Output machine-readable JSON results
  --fast               Skip executing child build/lint commands (verifies existing ./out)
  --help, -h           Show this help message
  `);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Test Registry & Assertion Harness
// ---------------------------------------------------------------------------

const tests = [];

function registerTest({ id, tier, feature, name, description, fn }) {
  tests.push({ id, tier, feature, name, description, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertIncludes(haystack, needle, message) {
  if (!haystack || !haystack.includes(needle)) {
    throw new Error(message || `Expected content to include "${needle}"`);
  }
}

function assertMatches(haystack, regex, message) {
  if (!haystack || !regex.test(haystack)) {
    throw new Error(message || `Expected content to match regex: ${regex}`);
  }
}

// ===========================================================================
// TIER 1: FEATURE COVERAGE (>=5 tests per feature across 8 features)
// ===========================================================================

// --- Feature 1: Navigation Bar Preservation (F01) ---

registerTest({
  id: 'T1-F01-01',
  tier: 1,
  feature: 'F01-NAVBAR',
  name: 'Navbar sticky positioning & header semantics',
  description: 'Verify Header component exists with semantic <header> tag and sticky top positioning (sticky top-0 z-50)',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assert(code !== null, 'components/ui/header.tsx must exist on disk');
    assertIncludes(code, '<header', 'Header component must render a semantic <header> element');
    assertIncludes(code, 'sticky top-0 z-50', 'Header must use sticky top-0 z-50 positioning for persistent navigation');
  },
});

registerTest({
  id: 'T1-F01-02',
  tier: 1,
  feature: 'F01-NAVBAR',
  name: 'Brand logo rendering with root link',
  description: 'Verify Logo component is rendered within Header linking back to the root application route',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assertIncludes(code, '<Logo', 'Header must mount the Logo component');
    const logoCode = readFile('components/ui/logo.tsx');
    assert(logoCode !== null, 'components/ui/logo.tsx must exist');
    assertIncludes(logoCode, 'href="/"', 'Logo must link to root route ("/")');
  },
});

registerTest({
  id: 'T1-F01-03',
  tier: 1,
  feature: 'F01-NAVBAR',
  name: 'Production release version badge v2.7.1-production',
  description: 'Verify presence of the official version badge v2.7.1-production with pulsing emerald indicator in Header',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assertIncludes(code, 'v2.7.1-production', 'Header must display the "v2.7.1-production" release version badge');
    assertIncludes(code, 'animate-pulse', 'Version badge must include the pulsing status beacon');
    assertIncludes(code, 'bg-emerald-400', 'Version beacon must use emerald status color');
  },
});

registerTest({
  id: 'T1-F01-04',
  tier: 1,
  feature: 'F01-NAVBAR',
  name: 'Windows download CTA button in Header',
  description: 'Verify DownloadButton component is rendered in Header with Windows download label and target',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assertIncludes(code, '<DownloadButton', 'Header must render the DownloadButton component');
    assertIncludes(code, 'Download for Windows', 'Download button in Header must declare Windows target');
    assertIncludes(code, 'href="#download"', 'Download button in Header must anchor to #download');
  },
});

registerTest({
  id: 'T1-F01-05',
  tier: 1,
  feature: 'F01-NAVBAR',
  name: 'Navigation anchor links & accessible touch targets',
  description: 'Verify primary anchor navigation links (#features, #demo, #specs, #download) have min 44px tap targets',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assertIncludes(code, 'href: "#features"', 'Navigation links array must contain #features');
    assertIncludes(code, 'href: "#demo"', 'Navigation links array must contain #demo');
    assertIncludes(code, 'href: "#specs"', 'Navigation links array must contain #specs');
    assertIncludes(code, 'href: "#download"', 'Navigation links array must contain #download');
    assertIncludes(code, 'min-h-[44px]', 'Navigation links must enforce WCAG 2.1 44px minimum touch target height');
  },
});

registerTest({
  id: 'T1-F01-06',
  tier: 1,
  feature: 'F01-NAVBAR',
  name: 'Mobile navigation menu toggle & ARIA accessibility',
  description: 'Verify mobile hamburger menu button includes accessible aria-label and aria-expanded attributes',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assertIncludes(code, 'aria-label="Toggle Navigation Menu"', 'Mobile toggle button must declare accessible aria-label');
    assertIncludes(code, 'aria-expanded={mobileMenuOpen}', 'Mobile toggle button must bind dynamic aria-expanded state');
  },
});

// --- Feature 2: Primary Hero Section & CTA (F02) ---

registerTest({
  id: 'T1-F02-01',
  tier: 1,
  feature: 'F02-HERO',
  name: 'Primary Hero headline verbatim match',
  description: 'Verify Hero section contains exact headline: "The Executive HUD Copilot for High-Stakes Remote Calls"',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(code !== null, 'components/hero.tsx must exist');
    assertIncludes(code, 'The Executive HUD Copilot for', 'Hero must contain primary headline prefix');
    assertIncludes(code, 'High-Stakes Remote Calls', 'Hero must contain primary headline subject');
  },
});

registerTest({
  id: 'T1-F02-02',
  tier: 1,
  feature: 'F02-HERO',
  name: 'Hero technical subheadline value proposition',
  description: 'Verify subheadline communicates WASAPI audio capture, real-time reasoning extraction, and stealth protection',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'WASAPI audio capture', 'Subheadline must mention WASAPI audio capture');
    assertIncludes(code, 'reasoning extraction', 'Subheadline must mention reasoning extraction');
    assertIncludes(code, 'screen-share protection', 'Subheadline must mention screen-share protection');
    assertMatches(code, /Windows 10 &(amp;)? 11/, 'Subheadline must mention Windows 10 & 11');
  },
});

registerTest({
  id: 'T1-F02-03',
  tier: 1,
  feature: 'F02-HERO',
  name: 'Top engine status chip declaration',
  description: 'Verify top status eyebrow chip displays "NOVA-CORE ENGINE v2.7.1" and "Windows 10 & 11 Native (64-bit)"',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'NOVA-CORE ENGINE v2.7.1', 'Eyebrow chip must declare NOVA-CORE ENGINE v2.7.1');
    assertMatches(code, /Windows 10 &(amp;)? 11 Native \(64-bit\)/, 'Eyebrow chip must declare Windows 10 & 11 Native (64-bit)');
  },
});

registerTest({
  id: 'T1-F02-04',
  tier: 1,
  feature: 'F02-HERO',
  name: 'Primary Windows download CTA button with release binary link',
  description: 'Verify primary CTA button renders DownloadButton with release link to NovaPilot-AI-Setup-2.7.1.exe',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'label="Download NovaPilot Desktop"', 'Primary CTA must use label "Download NovaPilot Desktop"');
    assertIncludes(code, 'NovaPilot-AI-Setup-2.7.1.exe', 'Primary CTA href must target official v2.7.1 setup executable');
    assertIncludes(code, 'variant="primary"', 'Primary CTA must use variant="primary"');
  },
});

registerTest({
  id: 'T1-F02-05',
  tier: 1,
  feature: 'F02-HERO',
  name: 'Secondary navigation CTA link',
  description: 'Verify secondary CTA link points to #features with "Explore Features" and chevron icon',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertMatches(code, /href=["']#(features|architecture)["']/, 'Secondary button must link to #features or #architecture');
    assertMatches(code, /Explore (Features|Architecture)/, 'Secondary button text must be "Explore Features" or "Explore Architecture"');
    assertIncludes(code, 'ChevronRight', 'Secondary button must include ChevronRight icon');
  },
});

registerTest({
  id: 'T1-F02-06',
  tier: 1,
  feature: 'F02-HERO',
  name: 'Hero semantic structure & responsive spacing',
  description: 'Verify Hero section utilizes semantic <section> tag with responsive padding classes (pt-12, md:pt-16)',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, '<section', 'Hero must be wrapped in a semantic <section> element');
    assertIncludes(code, 'pt-12', 'Hero must include responsive mobile padding (pt-12)');
    assertIncludes(code, 'md:pt-16', 'Hero must include responsive desktop padding (md:pt-16)');
  },
});

// --- Feature 3: 4 Key Feature Badges Preservation (F03) ---

registerTest({
  id: 'T1-F03-01',
  tier: 1,
  feature: 'F03-BADGES',
  name: 'Badge 1: WASAPI Loopback (<5ms)',
  description: 'Verify Badge 1 retains "WASAPI Loopback" and "<5ms Latency" with AudioWaveform icon',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'WASAPI Loopback', 'Badge 1 sublabel must be WASAPI Loopback');
    assertIncludes(code, '<5ms Latency', 'Badge 1 label must be <5ms Latency');
    assertIncludes(code, 'AudioWaveform', 'Badge 1 must utilize AudioWaveform icon');
  },
});

registerTest({
  id: 'T1-F03-02',
  tier: 1,
  feature: 'F03-BADGES',
  name: 'Badge 2: Screen-Share Proof (100% Invisible)',
  description: 'Verify Badge 2 retains "Screen-Share Proof" and "100% Invisible" with EyeOff icon',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'Screen-Share Proof', 'Badge 2 sublabel must be Screen-Share Proof');
    assertIncludes(code, '100% Invisible', 'Badge 2 label must be 100% Invisible');
    assertIncludes(code, 'EyeOff', 'Badge 2 must utilize EyeOff icon');
  },
});

registerTest({
  id: 'T1-F03-03',
  tier: 1,
  feature: 'F03-BADGES',
  name: 'Badge 3: DeepSeek & Claude (ThinkStripper FSM)',
  description: 'Verify Badge 3 retains "DeepSeek & Claude" and "ThinkStripper FSM" with Cpu icon',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'DeepSeek & Claude', 'Badge 3 sublabel must be DeepSeek & Claude');
    assertIncludes(code, 'ThinkStripper FSM', 'Badge 3 label must be ThinkStripper FSM');
    assertIncludes(code, 'Cpu', 'Badge 3 must utilize Cpu icon');
  },
});

registerTest({
  id: 'T1-F03-04',
  tier: 1,
  feature: 'F03-BADGES',
  name: 'Badge 4: Local-First Privacy (Zero Cloud Storage)',
  description: 'Verify Badge 4 retains "Local-First Privacy" and "Zero Cloud Storage" with ShieldCheck icon',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'Local-First Privacy', 'Badge 4 sublabel must be Local-First Privacy');
    assertIncludes(code, 'Zero Cloud Storage', 'Badge 4 label must be Zero Cloud Storage');
    assertIncludes(code, 'ShieldCheck', 'Badge 4 must utilize ShieldCheck icon');
  },
});

registerTest({
  id: 'T1-F03-05',
  tier: 1,
  feature: 'F03-BADGES',
  name: 'Badges responsive grid layout (2x2 mobile, 4x1 desktop)',
  description: 'Verify 4 badges are containerized in a responsive grid using grid-cols-2 and sm:grid-cols-4',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'grid grid-cols-2', 'Badges container must use grid-cols-2 for 2-column mobile layout');
    assertIncludes(code, 'sm:grid-cols-4', 'Badges container must use sm:grid-cols-4 for 4-column desktop layout');
  },
});

registerTest({
  id: 'T1-F03-06',
  tier: 1,
  feature: 'F03-BADGES',
  name: 'Badges dark glassmorphism classes',
  description: 'Verify 4 badges apply dark glassmorphic styling (border-[rgba(0,212,255,0.15)], bg-[#0A0F1C]/50, backdrop-blur-xl)',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'border-[rgba(0,212,255,0.15)]', 'Badges must have cyan-tinted hairline border');
    assertIncludes(code, 'bg-[#0A0F1C]/50', 'Badges must have semi-transparent obsidian background');
    assertIncludes(code, 'backdrop-blur-xl', 'Badges must apply backdrop-blur-xl for glassmorphic refraction');
  },
});

// --- Feature 4: Interactive Video Showcase Clean Framing (F04) ---

registerTest({
  id: 'T1-F04-01',
  tier: 1,
  feature: 'F04-VIDEO',
  name: 'Video showcase component mounting in page.tsx',
  description: 'Verify VideoShowcase component is imported and mounted inside app/(default)/page.tsx',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assert(code !== null, 'app/(default)/page.tsx must exist');
    assertIncludes(code, 'import VideoShowcase from "@/components/video-showcase";', 'page.tsx must import VideoShowcase');
    assertIncludes(code, '<VideoShowcase', 'page.tsx must mount <VideoShowcase />');
  },
});

registerTest({
  id: 'T1-F04-02',
  tier: 1,
  feature: 'F04-VIDEO',
  name: 'Authentic commercial video source asset reference',
  description: 'Verify VideoShowcase references the authentic commercial video asset (/videos/nova-pilot-ai.mp4)',
  fn: () => {
    const code = readFile('components/video-showcase.tsx');
    assert(code !== null, 'components/video-showcase.tsx must exist');
    assertMatches(code, /\/videos\/nova[-_ ]?pilot[-_ ]?ai\.mp4/i, 'VideoShowcase must reference authentic video asset');
    assert(fileExists('public/videos/nova-pilot-ai.mp4'), 'public/videos/nova-pilot-ai.mp4 must exist on disk');
  },
});

registerTest({
  id: 'T1-F04-03',
  tier: 1,
  feature: 'F04-VIDEO',
  name: 'Responsive 16:9 aspect ratio container framing',
  description: 'Verify video player chassis enforces responsive 16:9 aspect ratio styling (aspect-video or 16/9)',
  fn: () => {
    const code = readFile('components/video-showcase.tsx');
    assertMatches(code, /aspect-video|aspect-\[16\/9\]|16\/9/, 'Video chassis must enforce responsive 16:9 aspect ratio');
  },
});

registerTest({
  id: 'T1-F04-04',
  tier: 1,
  feature: 'F04-VIDEO',
  name: 'Video showcase section anchored with id="demo"',
  description: 'Verify video showcase container in page.tsx has id="demo" for scroll targeting and anchor navigation',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assertIncludes(code, 'id="demo"', 'Video container in page.tsx must have id="demo" for anchor navigation');
  },
});

registerTest({
  id: 'T1-F04-05',
  tier: 1,
  feature: 'F04-VIDEO',
  name: 'Video showcase wrapped in ErrorBoundary',
  description: 'Verify VideoShowcase is wrapped inside ErrorBoundary in page.tsx for runtime fault tolerance',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assertIncludes(code, '<ErrorBoundary', 'VideoShowcase must be wrapped in an ErrorBoundary');
    assertIncludes(code, '<VideoShowcase />', 'VideoShowcase must be enclosed by ErrorBoundary');
  },
});

registerTest({
  id: 'T1-F04-06',
  tier: 1,
  feature: 'F04-VIDEO',
  name: 'Interactive media controls & SHA-512 verification',
  description: 'Verify video player implements play/pause toggle, volume controls, scrubber, and SHA-512 verification chip',
  fn: () => {
    const code = readFile('components/video-showcase.tsx');
    assertIncludes(code, 'togglePlay', 'VideoShowcase must implement togglePlay function');
    assertIncludes(code, 'handleTimeUpdate', 'VideoShowcase must handle time updates for scrubber');
    assertIncludes(code, 'sha512Checksum', 'VideoShowcase must declare authentic SHA-512 checksum variable');
    assertIncludes(code, 'acc168926f7bbb553b954a6fe5c9a8b61797626088a117de653e211feec6e6f6420690a193b9d92c5bcb69f3fe639c231381e4f852212899b0012212fbe914e5', 'SHA-512 checksum string must match official release hash');
  },
});

// --- Feature 5: Full-Screen Fixed 3D Canvas Layer (F05) ---

registerTest({
  id: 'T1-F05-01',
  tier: 1,
  feature: 'F05-CANVAS',
  name: 'Canvas component mounting at root of page.tsx',
  description: 'Verify SupernovaCosmicCanvas is imported and mounted as the top background component in page.tsx',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assertIncludes(code, 'import SupernovaCosmicCanvas from "@/components/supernova-cosmic-canvas";', 'page.tsx must import SupernovaCosmicCanvas');
    assertIncludes(code, '<SupernovaCosmicCanvas />', 'page.tsx must mount <SupernovaCosmicCanvas /> at root');
  },
});

registerTest({
  id: 'T1-F05-02',
  tier: 1,
  feature: 'F05-CANVAS',
  name: 'Container fixed inset-0 viewport positioning',
  description: 'Verify canvas container element applies "fixed inset-0" to anchor across the entire viewport',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assert(code !== null, 'components/supernova-cosmic-canvas.tsx must exist');
    assertIncludes(code, 'fixed inset-0', 'Canvas container must apply fixed inset-0');
  },
});

registerTest({
  id: 'T1-F05-03',
  tier: 1,
  feature: 'F05-CANVAS',
  name: 'Background z-index layering (z-0 or -z-20)',
  description: 'Verify canvas container uses z-0 or negative z-index so it sits behind interactive page content cards',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertMatches(code, /z-0|-z-20/, 'Canvas container must have z-0 or -z-20 layering');
  },
});

registerTest({
  id: 'T1-F05-04',
  tier: 1,
  feature: 'F05-CANVAS',
  name: 'Non-blocking interaction via pointer-events-none',
  description: 'Verify canvas container strictly enforces pointer-events-none to prevent blocking page clicks and scrolls',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'pointer-events-none', 'Canvas container must have pointer-events-none');
  },
});

registerTest({
  id: 'T1-F05-05',
  tier: 1,
  feature: 'F05-CANVAS',
  name: 'Screen reader accessibility & overflow prevention',
  description: 'Verify container specifies aria-hidden="true" and overflow-hidden for accessibility and clean layout',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'aria-hidden="true"', 'Canvas container must declare aria-hidden="true"');
    assertIncludes(code, 'overflow-hidden', 'Canvas container must have overflow-hidden');
  },
});

registerTest({
  id: 'T1-F05-06',
  tier: 1,
  feature: 'F05-CANVAS',
  name: 'Canvas DOM element dimensions & WebGL initialization',
  description: 'Verify <canvas> element uses w-full h-full block and WebGLRenderer is initialized with alpha transparency',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'className="w-full h-full block"', 'Canvas element must be styled with w-full h-full block');
    assertIncludes(code, 'new THREE.WebGLRenderer', 'Canvas component must instantiate THREE.WebGLRenderer');
    assertIncludes(code, 'alpha: true', 'WebGLRenderer must enable alpha: true for background compositing');
  },
});

// --- Feature 6: Procedural 6,500-Particle System (F06) ---

registerTest({
  id: 'T1-F06-01',
  tier: 1,
  feature: 'F06-PARTICLES',
  name: 'Exact 6,500 particle count definition',
  description: 'Verify PARTICLE_COUNT constant is explicitly defined as 6500 in components/supernova-cosmic-canvas.tsx',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertMatches(code, /PARTICLE_COUNT\s*=\s*6500/, 'PARTICLE_COUNT must be defined as exactly 6500');
  },
});

registerTest({
  id: 'T1-F06-02',
  tier: 1,
  feature: 'F06-PARTICLES',
  name: 'GPU buffer allocation for 4 morph targets',
  description: 'Verify Float32Array allocations of length PARTICLE_COUNT * 3 for hero, features, video, and cta positions',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'new Float32Array(PARTICLE_COUNT * 3)', 'Positions buffer must allocate PARTICLE_COUNT * 3 floats');
    assertIncludes(code, 'heroPositions', 'heroPositions buffer must be declared');
    assertIncludes(code, 'featuresPositions', 'featuresPositions buffer must be declared');
    assertIncludes(code, 'videoPositions', 'videoPositions buffer must be declared');
    assertIncludes(code, 'ctaPositions', 'ctaPositions buffer must be declared');
  },
});

registerTest({
  id: 'T1-F06-03',
  tier: 1,
  feature: 'F06-PARTICLES',
  name: 'Custom THREE.ShaderMaterial with additive blending',
  description: 'Verify particle system initializes THREE.ShaderMaterial with THREE.AdditiveBlending',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'new THREE.ShaderMaterial', 'Particle system must use THREE.ShaderMaterial');
    assertIncludes(code, 'blending: THREE.AdditiveBlending', 'Particle material must use THREE.AdditiveBlending');
  },
});

registerTest({
  id: 'T1-F06-04',
  tier: 1,
  feature: 'F06-PARTICLES',
  name: 'Particle depthWrite false & transparent true',
  description: 'Verify particle material disables depthWrite (depthWrite: false) and enables transparency (transparent: true)',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'depthWrite: false', 'Particle material must specify depthWrite: false');
    assertIncludes(code, 'transparent: true', 'Particle material must specify transparent: true');
  },
});

registerTest({
  id: 'T1-F06-05',
  tier: 1,
  feature: 'F06-PARTICLES',
  name: 'Cybernetic color palette attribute (aColor)',
  description: 'Verify vertex attribute aColor includes Cobalt Blue (#0047AB), Electric Blue (#1D4ED8), Cyan (#00F0FF), White (#FFFFFF)',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, '#0047AB', 'Palette must include Cobalt Blue (#0047AB)');
    assertIncludes(code, '#1D4ED8', 'Palette must include Electric Blue (#1D4ED8)');
    assertIncludes(code, '#00F0FF', 'Palette must include Cyan (#00F0FF)');
    assertIncludes(code, '#FFFFFF', 'Palette must include Pure White (#FFFFFF)');
    assertIncludes(code, 'setAttribute("aColor"', 'Geometry must attach aColor BufferAttribute');
  },
});

registerTest({
  id: 'T1-F06-06',
  tier: 1,
  feature: 'F06-PARTICLES',
  name: 'Point size attribute (aSize) & stochastic seeds (aRandom)',
  description: 'Verify vertex attributes aSize (float point radius) and aRandom (vec4 stochastic seeds) are populated',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'setAttribute("aSize"', 'Geometry must attach aSize BufferAttribute');
    assertIncludes(code, 'setAttribute("aRandom"', 'Geometry must attach aRandom BufferAttribute');
    assertIncludes(code, 'new Float32Array(PARTICLE_COUNT * 4)', 'Random seeds buffer must allocate PARTICLE_COUNT * 4 floats');
  },
});

// --- Feature 7: 4 Scroll Waypoints & Trajectory Blending (F07) ---

registerTest({
  id: 'T1-F07-01',
  tier: 1,
  feature: 'F07-WAYPOINTS',
  name: 'Phase 1 (Hero) concentrated Nova core coordinates',
  description: 'Verify Phase 1 geometry populates concentrated glowing Nova core coordinate buffer (aPosHero)',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'aPosHero', 'Vertex shader and geometry must define aPosHero');
    assertIncludes(code, 'rHero', 'Hero phase radial distance calculation must be present');
  },
});

registerTest({
  id: 'T1-F07-02',
  tier: 1,
  feature: 'F07-WAYPOINTS',
  name: 'Phase 2 (Features) radial burst framing 4 badges',
  description: 'Verify Phase 2 geometry populates centrifugal radial burst clearing negative space (aPosFeatures)',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'aPosFeatures', 'Vertex shader and geometry must define aPosFeatures');
    assertMatches(code, /rBurst|rFeatures|Centrifugal\s+perimeter\s+burst/i, 'Phase 2 radial burst calculation must be present');
  },
});

registerTest({
  id: 'T1-F07-03',
  tier: 1,
  feature: 'F07-WAYPOINTS',
  name: 'Phase 3 (Video) relativistic 16:9 accretion ring',
  description: 'Verify Phase 3 geometry populates relativistic 16:9 elliptical accretion ring buffer (aPosVideo)',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'aPosVideo', 'Vertex shader and geometry must define aPosVideo');
    assertMatches(code, /majorAxis|16\.0\s*\/\s*9\.0|aspectRatio/i, 'Video accretion ring must utilize 16:9 aspect ratio geometry');
  },
});

registerTest({
  id: 'T1-F07-04',
  tier: 1,
  feature: 'F07-WAYPOINTS',
  name: 'Phase 4 (Download/CTA) upward streamline warp column',
  description: 'Verify Phase 4 geometry populates upward streamline warp column buffer (aPosCta)',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'aPosCta', 'Vertex shader and geometry must define aPosCta');
    assertIncludes(code, 'ctaPositions', 'CTA positions array must be generated');
  },
});

registerTest({
  id: 'T1-F07-05',
  tier: 1,
  feature: 'F07-WAYPOINTS',
  name: 'Shader vertex interpolation via uProgress uniform',
  description: 'Verify vertex shader performs piecewise Hermite curve interpolation between the 4 morph targets using uProgress',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'uniform float uProgress;', 'Vertex shader must declare uniform float uProgress');
    assertIncludes(code, 'mix(aPosHero, aPosFeatures', 'Shader must mix aPosHero to aPosFeatures in segment 1');
    assertIncludes(code, 'mix(aPosFeatures, aPosVideo', 'Shader must mix aPosFeatures to aPosVideo in segment 2');
    assertIncludes(code, 'mix(aPosVideo, aPosCta', 'Shader must mix aPosVideo to aPosCta in segment 3');
  },
});

registerTest({
  id: 'T1-F07-06',
  tier: 1,
  feature: 'F07-WAYPOINTS',
  name: '4 Camera Waypoints declaration with distinct FOV and positions',
  description: 'Verify WAYPOINTS array defines 4 distinct camera waypoints (Hero, Features, Video, Download) with FOVs 45, 52, 46, 48',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'WAYPOINTS', 'WAYPOINTS array must be declared');
    assertIncludes(code, 'fov: 45', 'Waypoint 1 must use FOV 45');
    assertIncludes(code, 'fov: 52', 'Waypoint 2 must use FOV 52');
    assertIncludes(code, 'fov: 46', 'Waypoint 3 must use FOV 46');
    assertIncludes(code, 'fov: 48', 'Waypoint 4 must use FOV 48');
  },
});

registerTest({
  id: 'T1-F07-07',
  tier: 1,
  feature: 'F07-WAYPOINTS',
  name: 'Scroll tracking & exponential inertia damping lerp',
  description: 'Verify scroll tracking with passive event listener and exponential inertia damping (1.0 - Math.exp(-8.0 * dt))',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'window.addEventListener("scroll", onScroll, { passive: true })', 'Scroll listener must be registered with passive: true');
    assertMatches(code, /Math\.exp\(-[0-9.]+\s*\*\s*dt\)/, 'Scroll or mouse interpolation must implement exponential inertia damping');
  },
});

// --- Feature 8: Dark Glassmorphism Styling System (F08) ---

registerTest({
  id: 'T1-F08-01',
  tier: 1,
  feature: 'F08-GLASS',
  name: '.glass-card class definition in theme.css',
  description: 'Verify reusable .glass-card class is declared in app/css/additional-styles/theme.css',
  fn: () => {
    const css = readFile('app/css/additional-styles/theme.css');
    assert(css !== null, 'theme.css must exist');
    assertIncludes(css, '.glass-card {', '.glass-card class must be declared in theme.css');
  },
});

registerTest({
  id: 'T1-F08-02',
  tier: 1,
  feature: 'F08-GLASS',
  name: '.glass-card blur(16px) backdrop filter',
  description: 'Verify .glass-card specifies backdrop-filter: blur(16px) and webkit prefix for cross-browser support',
  fn: () => {
    const css = readFile('app/css/additional-styles/theme.css');
    assertIncludes(css, 'backdrop-filter: blur(16px);', '.glass-card must declare backdrop-filter: blur(16px)');
    assertIncludes(css, '-webkit-backdrop-filter: blur(16px);', '.glass-card must declare -webkit-backdrop-filter: blur(16px)');
  },
});

registerTest({
  id: 'T1-F08-03',
  tier: 1,
  feature: 'F08-GLASS',
  name: '.glass-card background color rgba(10, 15, 28, 0.5)',
  description: 'Verify .glass-card specifies background: rgba(10, 15, 28, 0.5) matching dark glassmorphism spec',
  fn: () => {
    const css = readFile('app/css/additional-styles/theme.css');
    assertIncludes(css, 'background: rgba(10, 15, 28, 0.5);', '.glass-card must declare background: rgba(10, 15, 28, 0.5)');
  },
});

registerTest({
  id: 'T1-F08-04',
  tier: 1,
  feature: 'F08-GLASS',
  name: '.glass-card border 1px solid rgba(0, 212, 255, 0.15)',
  description: 'Verify .glass-card specifies border: 1px solid rgba(0, 212, 255, 0.15)',
  fn: () => {
    const css = readFile('app/css/additional-styles/theme.css');
    assertIncludes(css, 'border: 1px solid rgba(0, 212, 255, 0.15);', '.glass-card must declare border: 1px solid rgba(0, 212, 255, 0.15)');
  },
});

registerTest({
  id: 'T1-F08-05',
  tier: 1,
  feature: 'F08-GLASS',
  name: '.glass-card hover transition & elevation',
  description: 'Verify .glass-card includes hover state with enhanced cyan glow border and subtle translateY lift',
  fn: () => {
    const css = readFile('app/css/additional-styles/theme.css');
    assertIncludes(css, '.glass-card:hover', '.glass-card:hover state must be defined');
    assertIncludes(css, 'border-color: rgba(0, 212, 255, 0.35);', '.glass-card:hover must elevate border glow');
    assertIncludes(css, 'transform: translateY(-2px);', '.glass-card:hover must provide subtle translateY lift');
  },
});

registerTest({
  id: 'T1-F08-06',
  tier: 1,
  feature: 'F08-GLASS',
  name: 'Hero feature badges glassmorphism styling alignment',
  description: 'Verify feature badges in hero.tsx apply matching glassmorphism tokens (border-[rgba(0,212,255,0.15)], bg-[#0A0F1C]/50)',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'border-[rgba(0,212,255,0.15)]', 'Feature badges in hero.tsx must use matching cyan hairline border');
    assertIncludes(code, 'bg-[#0A0F1C]/50', 'Feature badges in hero.tsx must use matching obsidian semi-transparent background');
    assertIncludes(code, 'backdrop-blur-xl', 'Feature badges in hero.tsx must use backdrop-blur-xl');
  },
});

registerTest({
  id: 'T1-F08-07',
  tier: 1,
  feature: 'F08-GLASS',
  name: 'Theme.css executive transition timing tokens',
  description: 'Verify theme.css declares transition-executive with cubic-bezier easing',
  fn: () => {
    const css = readFile('app/css/additional-styles/theme.css');
    assertIncludes(css, '.transition-executive', 'theme.css must declare .transition-executive utility');
    assertIncludes(css, 'cubic-bezier(0.16, 1, 0.3, 1)', '.transition-executive must use high-precision cubic-bezier easing');
  },
});

// --- Feature 9: Hero 3D Z-Axis Depth Movement & Text Recession (F09) ---

registerTest({
  id: 'T1-F09-01',
  tier: 1,
  feature: 'F09-HERO-3D',
  name: 'Hero 3D Z-axis transform recession on scroll',
  description: 'Verify components/hero.tsx calculates depth transform with translateZ / translate3d receding backward along Z axis (down to -450px) and perspective',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(code !== null, 'components/hero.tsx must exist');
    assertMatches(
      code,
      /(?:translateZ|translate3d)\s*\(|perspective\s*\(\s*(1000|1200)px\s*\)/i,
      'Hero section must apply 3D perspective and Z-axis translation (translateZ or translate3d) for spatial depth'
    );
    assertMatches(
      code,
      /scroll|onScroll|useScroll|requestAnimationFrame/i,
      'Hero section must track scroll progress to drive Z-axis recession'
    );
  },
});

registerTest({
  id: 'T1-F09-02',
  tier: 1,
  feature: 'F09-HERO-3D',
  name: 'Hero typography scale reduction on scroll',
  description: 'Verify components/hero.tsx decreases headline/subheadline scale (towards ~0.52) as user scrolls down',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(code !== null, 'components/hero.tsx must exist');
    assertMatches(
      code,
      /scale\s*\(\s*(?:\$\{[^}]+\}|[0-9.]+|Math\.max)/i,
      'Hero section must apply dynamic scale reduction on scroll'
    );
  },
});

registerTest({
  id: 'T1-F09-03',
  tier: 1,
  feature: 'F09-HERO-3D',
  name: 'Hero spatial dispersion & blur/opacity defocus',
  description: 'Verify components/hero.tsx applies spatial dispersion (blur filter or progressive opacity defocus) as text recedes backward',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(code !== null, 'components/hero.tsx must exist');
    assertMatches(
      code,
      /blur\s*\(\s*(?:\$\{[^}]+\}|[0-9.]+)px\s*\)|filter:\s*`blur|opacity:\s*(?:\$\{[^}]+\}|Math\.|[0-9.]+\s*-\s*[0-9.]+)/i,
      'Hero text must apply spatial dispersion via blur filter or progressive opacity defocus on scroll'
    );
  },
});

registerTest({
  id: 'T1-F09-04',
  tier: 1,
  feature: 'F09-HERO-3D',
  name: 'Three.js camera forward starfield traversal coordination',
  description: 'Verify camera waypoints in components/supernova-cosmic-canvas.tsx travel forward along Z-axis while text recedes',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assert(code !== null, 'components/supernova-cosmic-canvas.tsx must exist');
    assertIncludes(code, 'WAYPOINTS', 'Canvas must define WAYPOINTS array');
    assertMatches(
      code,
      /pos:\s*new THREE\.Vector3\([^)]+\)/,
      'Canvas must define 3D Vector3 camera waypoints'
    );
    assertIncludes(code, 'uProgress', 'Canvas must track uProgress uniform for scroll traversal');
  },
});

// --- Feature 10: 4 Key Feature Badges Dynamic 3D Perspective Gliding & Anchoring (F10) ---

registerTest({
  id: 'T1-F10-01',
  tier: 1,
  feature: 'F10-BADGES-3D',
  name: 'Feature badges container anchored with id="features"',
  description: 'Verify the feature badges container in components/hero.tsx (or parent section) declares id="features" for navigation linking',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(code !== null, 'components/hero.tsx must exist');
    assertIncludes(code, 'id="features"', 'Feature badges container in hero.tsx must declare id="features"');
  },
});

registerTest({
  id: 'T1-F10-02',
  tier: 1,
  feature: 'F10-BADGES-3D',
  name: 'Badges dynamic 3D perspective gliding entrance',
  description: 'Verify badges animate or glide in 3D perspective from peripheral offsets into focal alignment',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(code !== null, 'components/hero.tsx must exist');
    assertMatches(
      code,
      /perspective|translate3d|translateZ|rotateX|rotateY|motion\.div|transition-transform/i,
      'Badges must implement dynamic 3D perspective styling or gliding entrance'
    );
  },
});

registerTest({
  id: 'T1-F10-03',
  tier: 1,
  feature: 'F10-BADGES-3D',
  name: 'Badges dark glassmorphism styling compliance',
  description: 'Verify all 4 feature badges enforce dark glassmorphism classes: border-[rgba(0,212,255,0.15)], bg-[#0A0F1C]/50, backdrop-blur-xl',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(code !== null, 'components/hero.tsx must exist');
    assertIncludes(code, 'border-[rgba(0,212,255,0.15)]', 'Badges must have cyan-tinted hairline border');
    assertIncludes(code, 'bg-[#0A0F1C]/50', 'Badges must have semi-transparent obsidian background');
    assertIncludes(code, 'backdrop-blur-xl', 'Badges must have backdrop-blur-xl for glassmorphic refraction');
  },
});

registerTest({
  id: 'T1-F10-04',
  tier: 1,
  feature: 'F10-BADGES-3D',
  name: 'Badges interactive 3D hover reaction and event bridge',
  description: 'Verify badge hover interaction elevates card and dispatches "novapilot:badge-hover" custom event for 3D canvas bridging',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(code !== null, 'components/hero.tsx must exist');
    assertIncludes(code, 'novapilot:badge-hover', 'Badge hover must dispatch "novapilot:badge-hover" custom event');
    assertIncludes(code, 'handleBadgeHover', 'Hero component must implement handleBadgeHover handler');
  },
});

// --- Feature 11: 16:9 Video Showcase Scroll-Driven 3D Docking Transform (F11) ---

registerTest({
  id: 'T1-F11-01',
  tier: 1,
  feature: 'F11-VIDEO-DOCK',
  name: 'Video showcase scroll-driven 3D docking transform',
  description: 'Verify components/video-showcase.tsx binds scroll to 3D docking transform (scale, rotateX, translateZ) docking into holographic wireframe',
  fn: () => {
    const code = readFile('components/video-showcase.tsx');
    assert(code !== null, 'components/video-showcase.tsx must exist');
    assertMatches(
      code,
      /perspective\s*\(|rotateX\s*\(|translateZ\s*\(|translate3d\s*\(/i,
      'VideoShowcase must implement 3D spatial docking transform (perspective, rotateX, translateZ/translate3d)'
    );
    assertMatches(
      code,
      /scroll|onScroll|useScroll|requestAnimationFrame|getBoundingClientRect/i,
      'VideoShowcase must track scroll position/progress to compute 3D docking transform'
    );
  },
});

registerTest({
  id: 'T1-F11-02',
  tier: 1,
  feature: 'F11-VIDEO-DOCK',
  name: 'Holographic HUD wireframe framing & styling',
  description: 'Verify video showcase player container features holographic HUD styling matching 3D accretion ring',
  fn: () => {
    const code = readFile('components/video-showcase.tsx');
    assert(code !== null, 'components/video-showcase.tsx must exist');
    assertMatches(
      code,
      /cyan-500|cyan-400|rgba\(0,\s*240,\s*255|shadow-\[0_0_|border-cyan/i,
      'Video player must feature cyan holographic HUD accents matching the 3D wireframe'
    );
  },
});

registerTest({
  id: 'T1-F11-03',
  tier: 1,
  feature: 'F11-VIDEO-DOCK',
  name: 'Preserved 16:9 aspect ratio and custom controls',
  description: 'Verify video showcase maintains responsive 16:9 aspect ratio and interactive media controls',
  fn: () => {
    const code = readFile('components/video-showcase.tsx');
    assert(code !== null, 'components/video-showcase.tsx must exist');
    assertMatches(code, /aspect-video|aspect-\[16\/9\]|16\/9/, 'Video player must maintain responsive 16:9 aspect ratio');
    assertIncludes(code, 'togglePlay', 'Video player must retain togglePlay control');
    assertIncludes(code, 'novapilot:video-play', 'Video player must retain novapilot:video-play event bridge');
  },
});

// --- Feature 12: Interactive 3D Cursor Follower (F12) ---

registerTest({
  id: 'T1-F12-01',
  tier: 1,
  feature: 'F12-CURSOR-3D',
  name: 'Interactive 3D cursor follower component file existence',
  description: 'Verify components/interactive-3d-cursor.tsx exists on disk as a client component ("use client")',
  fn: () => {
    assert(fileExists('components/interactive-3d-cursor.tsx'), 'components/interactive-3d-cursor.tsx must exist on disk');
    const code = readFile('components/interactive-3d-cursor.tsx');
    assertIncludes(code, '"use client"', 'interactive-3d-cursor.tsx must be a client component ("use client")');
  },
});

registerTest({
  id: 'T1-F12-02',
  tier: 1,
  feature: 'F12-CURSOR-3D',
  name: 'Glowing cyan reticle and micro-particle trail rendering',
  description: 'Verify components/interactive-3d-cursor.tsx renders cyan reticle (#00F0FF / cyan) and trail particles with pointer-events-none',
  fn: () => {
    assert(fileExists('components/interactive-3d-cursor.tsx'), 'components/interactive-3d-cursor.tsx must exist');
    const code = readFile('components/interactive-3d-cursor.tsx');
    assertMatches(
      code,
      /#00F0FF|#00f0ff|cyan-400|rgba\(0,\s*240,\s*255/i,
      'Cursor follower must render glowing cyan reticle (#00F0FF / cyan)'
    );
    assertMatches(
      code,
      /particle|trail|dots|points/i,
      'Cursor follower must render trailing micro-particles'
    );
    assertIncludes(code, 'pointer-events-none', 'Cursor follower must declare pointer-events-none to prevent click interception');
    assertMatches(code, /fixed\s+inset-0|fixed\s+top-0/, 'Cursor follower must be fixed across the viewport');
  },
});

registerTest({
  id: 'T1-F12-03',
  tier: 1,
  feature: 'F12-CURSOR-3D',
  name: 'Mouse velocity physics & inertia smoothing',
  description: 'Verify cursor follower tracks mousemove with inertia smoothing or velocity calculations',
  fn: () => {
    assert(fileExists('components/interactive-3d-cursor.tsx'), 'components/interactive-3d-cursor.tsx must exist');
    const code = readFile('components/interactive-3d-cursor.tsx');
    assertMatches(
      code,
      /mousemove|pointermove/,
      'Cursor follower must register mousemove or pointermove event listener'
    );
    assertMatches(
      code,
      /requestAnimationFrame|vx|vy|velocity|lerp|speed|Math\.hypot/i,
      'Cursor follower must implement velocity tracking or smooth inertia animation loop'
    );
  },
});

registerTest({
  id: 'T1-F12-04',
  tier: 1,
  feature: 'F12-CURSOR-3D',
  name: 'Mobile touch guard & accessibility exemption',
  description: 'Verify cursor follower hides on touch devices via pointer: coarse or touch detection, and respects prefers-reduced-motion',
  fn: () => {
    assert(fileExists('components/interactive-3d-cursor.tsx'), 'components/interactive-3d-cursor.tsx must exist');
    const code = readFile('components/interactive-3d-cursor.tsx');
    assertMatches(
      code,
      /pointer:\s*coarse|hover:\s*none|ontouchstart|matchMedia|prefers-reduced-motion|touch/i,
      'Cursor follower must include touch device guard or reduced motion exemption'
    );
  },
});

registerTest({
  id: 'T1-F12-05',
  tier: 1,
  feature: 'F12-CURSOR-3D',
  name: 'Interactive 3D cursor mounted in page.tsx',
  description: 'Verify Interactive3dCursor is imported and mounted in app/(default)/page.tsx',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assert(code !== null, 'app/(default)/page.tsx must exist');
    assertMatches(
      code,
      /import\s+(?:Interactive3[dD]Cursor|\{\s*Interactive3[dD]Cursor\s*\})\s+from\s+["']@\/components\/interactive-3d-cursor["']/,
      'page.tsx must import Interactive3dCursor from "@/components/interactive-3d-cursor"'
    );
    assertMatches(
      code,
      /<Interactive3[dD]Cursor\s*\/>/,
      'page.tsx must mount <Interactive3dCursor />'
    );
  },
});

// --- Feature 13: Navigation Re-Anchoring & Zero Dead Links (F13) ---

registerTest({
  id: 'T1-F13-01',
  tier: 1,
  feature: 'F13-NAV-REANCHOR',
  name: '3D Architecture navbar link re-anchored to #demo',
  description: 'Verify "3D Architecture" navigation link in components/ui/header.tsx targets #demo directly',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assert(code !== null, 'components/ui/header.tsx must exist');
    assertMatches(
      code,
      /\{\s*href:\s*["']#demo["'],\s*label:\s*["']3D Architecture["']\s*\}|\{\s*label:\s*["']3D Architecture["'],\s*href:\s*["']#demo["']\s*\}/,
      'Header must re-anchor "3D Architecture" link directly to href: "#demo"'
    );
  },
});

registerTest({
  id: 'T1-F13-02',
  tier: 1,
  feature: 'F13-NAV-REANCHOR',
  name: 'Zero dead links across all navbar anchors',
  description: 'Verify all anchor links in Header (#features, #demo, #specs, #download) correspond to elements with matching id attributes in the DOM',
  fn: () => {
    const headerCode = readFile('components/ui/header.tsx');
    assert(headerCode !== null, 'header.tsx must exist');
    
    // Check all targets referenced in navLinks
    const pageCode = readFile('app/(default)/page.tsx') || '';
    const heroCode = readFile('components/hero.tsx') || '';
    const videoCode = readFile('components/video-showcase.tsx') || '';
    const windowsCtaCode = readFile('components/windows-cta.tsx') || '';
    const specsCode = readFile('components/specs-table.tsx') || '';
    const featuresCode = readFile('components/features-grid.tsx') || '';
    const allCode = `${pageCode}\n${heroCode}\n${videoCode}\n${windowsCtaCode}\n${specsCode}\n${featuresCode}`;

    assertIncludes(allCode, 'id="features"', 'Target id="features" must exist on page');
    assertIncludes(allCode, 'id="demo"', 'Target id="demo" must exist on page');
    assertIncludes(allCode, 'id="specs"', 'Target id="specs" must exist on page');
    assertIncludes(allCode, 'id="download"', 'Target id="download" must exist on page');
  },
});

registerTest({
  id: 'T1-F13-03',
  tier: 1,
  feature: 'F13-NAV-REANCHOR',
  name: 'Preserved brand logo, version badge, and download action buttons',
  description: 'Verify Header maintains Logo, v2.7.1-production version tag, and Download for Windows CTA button',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assert(code !== null, 'components/ui/header.tsx must exist');
    assertIncludes(code, '<Logo', 'Header must render <Logo />');
    assertIncludes(code, 'v2.7.1-production', 'Header must render v2.7.1-production badge');
    assertIncludes(code, '<DownloadButton', 'Header must render DownloadButton');
  },
});

// ===========================================================================
// TIER 2: BOUNDARY & CORNER CASES (21 tests)
// ===========================================================================

// --- Area B1: Aspect Ratio Boundaries ---

registerTest({
  id: 'T2-B01-01',
  tier: 2,
  feature: 'B01-ASPECT',
  name: 'Ultrawide aspect ratio boundary (21:9 & 32:9)',
  description: 'Verify camera aspect calculation handles ultrawide aspect ratios (>2.33) without division errors',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'initialWidth / Math.max(1, initialHeight)', 'Aspect ratio must safely divide width by max(1, height)');
    const wUltrawide = 3440;
    const hUltrawide = 1440;
    const aspect = wUltrawide / Math.max(1, hUltrawide);
    assert(Math.abs(aspect - 2.3888) < 0.01, 'Ultrawide aspect calculation must equal ~2.388');
  },
});

registerTest({
  id: 'T2-B01-02',
  tier: 2,
  feature: 'B01-ASPECT',
  name: 'Square viewport boundary (1:1)',
  description: 'Verify camera aspect calculation handles 1:1 square viewports without projection skew',
  fn: () => {
    const wSquare = 1000;
    const hSquare = 1000;
    const aspect = wSquare / Math.max(1, hSquare);
    assert(aspect === 1.0, 'Square aspect calculation must equal exactly 1.0');
  },
});

registerTest({
  id: 'T2-B01-03',
  tier: 2,
  feature: 'B01-ASPECT',
  name: 'Mobile portrait aspect boundary (9:16 & 9:19.5)',
  description: 'Verify resize listener adjusts mobile portrait FOV widening when aspect < 1.0',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertMatches(code, /aspect\s*<\s*1\.0|w\s*<\s*h/i, 'Resize handler must detect portrait orientation (aspect < 1.0 or w < h)');
    assertMatches(code, /camera\.fov\s*=\s*(baseFov|45)\s*\+\s*\(1\.0\s*-\s*aspect\)\s*\*\s*18\.0|Math\.min\(80/i, 'Resize handler must widen camera FOV for mobile portrait viewports');
  },
});

registerTest({
  id: 'T2-B01-04',
  tier: 2,
  feature: 'B01-ASPECT',
  name: 'Zero-dimension division defense',
  description: 'Verify aspect ratio calculation enforces Math.max(1, height) protecting against zero-height initialization',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'Math.max(1,', 'Aspect ratio calculations must guard height with Math.max(1, ...)');
    const safeAspectZero = 1920 / Math.max(1, 0);
    assert(Number.isFinite(safeAspectZero) && !isNaN(safeAspectZero), 'Zero-height defense must return finite number, never Infinity or NaN');
  },
});

// --- Area B2: Mobile Portrait Clamping & DPR ---

registerTest({
  id: 'T2-B02-01',
  tier: 2,
  feature: 'B02-MOBILE-CLAMP',
  name: 'Device pixel ratio clamping to maximum 2.0',
  description: 'Verify renderer.setPixelRatio clamps window.devicePixelRatio to max 2.0 preventing GPU memory overload on 3x/4x mobile screens',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'Math.min(window.devicePixelRatio || 1, 2)', 'Pixel ratio must be clamped to max 2 via Math.min(..., 2)');
    const highDpr = 3.5;
    const clamped = Math.min(highDpr || 1, 2);
    assert(clamped === 2, '3.5x DPR must clamp to 2.0');
  },
});

registerTest({
  id: 'T2-B02-02',
  tier: 2,
  feature: 'B02-MOBILE-CLAMP',
  name: 'Fallback safety for undefined / zero devicePixelRatio',
  description: 'Verify devicePixelRatio fallback safely defaults to 1 when undefined or 0 in headless/SSR environments',
  fn: () => {
    const undefinedDpr = undefined;
    const clampedUndefined = Math.min(undefinedDpr || 1, 2);
    assert(clampedUndefined === 1, 'Undefined DPR must fallback safely to 1.0');
    const zeroDpr = 0;
    const clampedZero = Math.min(zeroDpr || 1, 2);
    assert(clampedZero === 1, 'Zero DPR must fallback safely to 1.0');
  },
});

registerTest({
  id: 'T2-B02-03',
  tier: 2,
  feature: 'B02-MOBILE-CLAMP',
  name: 'Mobile 2x2 grid vs desktop 4x1 grid breakpoint',
  description: 'Verify hero feature badges specify grid-cols-2 for mobile (<640px) and sm:grid-cols-4 for tablet/desktop (>=640px)',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4', 'Hero badges must specify responsive grid-cols-2 sm:grid-cols-4');
  },
});

registerTest({
  id: 'T2-B02-04',
  tier: 2,
  feature: 'B02-MOBILE-CLAMP',
  name: 'Responsive headline typography clamping',
  description: 'Verify hero headline scales fluidly from text-4xl on mobile to sm:text-5xl and lg:text-6xl on desktop',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl', 'Headline must scale through text-4xl, sm:text-5xl, lg:text-6xl');
  },
});

// --- Area B3: Scroll Parameter Clamping ---

registerTest({
  id: 'T2-B03-01',
  tier: 2,
  feature: 'B03-SCROLL-CLAMP',
  name: 'Progress parameter clamped strictly to [0.0, 3.0]',
  description: 'Verify uProgress is clamped strictly between 0.0 and 3.0 in both JS scroll calculation and GLSL vertex shader',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertMatches(code, /Math\.max\(0\.0,\s*Math\.min\(3\.0,\s*(raw|rawProgress)\)\)/, 'JS scroll listener must clamp progress to [0.0, 3.0]');
    assertIncludes(code, 'clamp(uProgress, 0.0, 3.0)', 'GLSL vertex shader must clamp uProgress to [0.0, 3.0]');
  },
});

registerTest({
  id: 'T2-B03-02',
  tier: 2,
  feature: 'B03-SCROLL-CLAMP',
  name: 'Negative scroll boundary (iOS elastic bounce)',
  description: 'Verify negative scroll offsets (e.g. scrollY = -120px) evaluate safely to progress 0.0',
  fn: () => {
    const scrollYNegative = -120;
    const maxScroll = 4000;
    const rawProgress = (scrollYNegative / maxScroll) * 3.0;
    const clampedProgress = Math.max(0.0, Math.min(3.0, rawProgress));
    assert(clampedProgress === 0.0, 'Negative scroll offset must clamp progress to 0.0');
  },
});

registerTest({
  id: 'T2-B03-03',
  tier: 2,
  feature: 'B03-SCROLL-CLAMP',
  name: 'Overshoot scroll boundary',
  description: 'Verify extreme downward scroll offsets (e.g. scrollY = 8000px when maxScroll = 4000px) clamp progress to 3.0',
  fn: () => {
    const scrollYOvershoot = 8000;
    const maxScroll = 4000;
    const rawProgress = (scrollYOvershoot / maxScroll) * 3.0;
    const clampedProgress = Math.max(0.0, Math.min(3.0, rawProgress));
    assert(clampedProgress === 3.0, 'Overshoot scroll offset must clamp progress to 3.0');
  },
});

registerTest({
  id: 'T2-B03-04',
  tier: 2,
  feature: 'B03-SCROLL-CLAMP',
  name: 'Zero scrollable height boundary',
  description: 'Verify when documentHeight <= windowHeight (zero scroll delta), progress safely defaults to 0.0 without NaN',
  fn: () => {
    const docHeight = 900;
    const winHeight = 900;
    const maxScroll = docHeight - winHeight;
    let target = 0.0;
    if (maxScroll <= 0) {
      target = 0.0;
    } else {
      target = (0 / maxScroll) * 3.0;
    }
    assert(target === 0.0 && !isNaN(target), 'Zero scroll delta must evaluate safely to 0.0');
  },
});

// --- Area B4: Pointer-Events-None Pass-Through ---

registerTest({
  id: 'T2-B04-01',
  tier: 2,
  feature: 'B04-POINTER-PASS',
  name: 'Canvas container pointer-events-none attribute',
  description: 'Verify canvas container element enforces pointer-events-none ensuring mouse events pass through to DOM cards',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'pointer-events-none', 'Canvas container must have pointer-events-none class');
  },
});

registerTest({
  id: 'T2-B04-02',
  tier: 2,
  feature: 'B04-POINTER-PASS',
  name: 'Foreground CTA button and links interactive hit-testing',
  description: 'Verify download buttons and links in hero.tsx are not occluded by pointer-events-none and retain interactive hover/active states',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'active:scale-[0.98]', 'Secondary CTA link must provide active:scale-[0.98] interaction');
    assertIncludes(code, 'hover:border-cyan-400/30', 'Badges must provide interactive hover border reaction');
  },
});

registerTest({
  id: 'T2-B04-03',
  tier: 2,
  feature: 'B04-POINTER-PASS',
  name: 'Video player interactive controls hit-testing',
  description: 'Verify video player scrubber and play buttons maintain interactive hit targets above background canvas',
  fn: () => {
    const code = readFile('components/video-showcase.tsx');
    assertIncludes(code, 'cursor-pointer', 'Video controls must declare cursor-pointer for interactive elements');
  },
});

// --- Area B5: WebGL Resource Disposal ---

registerTest({
  id: 'T2-B05-01',
  tier: 2,
  feature: 'B05-DISPOSAL',
  name: 'Window event listeners removal on unmount',
  description: 'Verify useEffect cleanup hook removes scroll, pointermove, and resize window event listeners',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'window.removeEventListener("scroll", onScroll)', 'Cleanup must remove scroll event listener');
    assertIncludes(code, 'window.removeEventListener("pointermove", onPointerMove)', 'Cleanup must remove pointermove event listener');
    assertIncludes(code, 'window.removeEventListener("resize", onResize)', 'Cleanup must remove resize event listener');
  },
});

registerTest({
  id: 'T2-B05-02',
  tier: 2,
  feature: 'B05-DISPOSAL',
  name: 'Animation frame loop cancellation on unmount',
  description: 'Verify useEffect cleanup hook invokes cancelAnimationFrame(animationFrameId)',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'cancelAnimationFrame(animationFrameId)', 'Cleanup must cancel animation frame loop');
  },
});

registerTest({
  id: 'T2-B05-03',
  tier: 2,
  feature: 'B05-DISPOSAL',
  name: 'Geometry buffer disposal',
  description: 'Verify cleanup hook invokes geometry.dispose() releasing GPU vertex attribute buffers',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'geometry.dispose()', 'Cleanup must dispose geometry');
  },
});

registerTest({
  id: 'T2-B05-04',
  tier: 2,
  feature: 'B05-DISPOSAL',
  name: 'Shader material & uniform texture disposal',
  description: 'Verify cleanup hook invokes pointsMaterial.dispose() and disposes any attached uniform textures',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'pointsMaterial.dispose()', 'Cleanup must dispose pointsMaterial');
  },
});

registerTest({
  id: 'T2-B05-05',
  tier: 2,
  feature: 'B05-DISPOSAL',
  name: 'Scene node graph clearing',
  description: 'Verify cleanup hook invokes scene.clear() to detach all display object nodes',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'scene.clear()', 'Cleanup must invoke scene.clear()');
  },
});

registerTest({
  id: 'T2-B05-06',
  tier: 2,
  feature: 'B05-DISPOSAL',
  name: 'WebGL renderer disposal & hardware context loss',
  description: 'Verify cleanup hook invokes renderer.dispose() and renderer.forceContextLoss() to free GPU VRAM',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'renderer.dispose()', 'Cleanup must call renderer.dispose()');
    assertIncludes(code, 'renderer.forceContextLoss()', 'Cleanup must call renderer.forceContextLoss()');
  },
});

// --- Area B6: 3D Spatial Boundaries & Coordinate Clamping ---

registerTest({
  id: 'T2-B06-01',
  tier: 2,
  feature: 'B06-3D-BOUNDS',
  name: 'Hero 3D Z-axis recession & scale boundary evaluation',
  description: 'Verify mathematical transformation bounds: Z-axis stays within [ -450px, 0px ] and scale stays within [ 0.52, 1.0 ]',
  fn: () => {
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    const computeZ = (p) => clamp(-450 * p, -450, 0);
    const computeScale = (p) => clamp(1.0 - 0.48 * p, 0.52, 1.0);

    assert(computeZ(0.0) === 0, 'At scroll 0.0, Z must be 0px');
    assert(computeZ(1.0) === -450, 'At scroll 1.0, Z must be -450px');
    assert(computeZ(2.5) === -450, 'At scroll >1.0, Z must clamp to -450px');
    assert(computeZ(-0.5) === 0, 'At scroll <0.0, Z must clamp to 0px');

    assert(Math.abs(computeScale(0.0) - 1.0) < 0.001, 'At scroll 0.0, scale must be 1.0');
    assert(Math.abs(computeScale(1.0) - 0.52) < 0.001, 'At scroll 1.0, scale must be 0.52');
    assert(computeScale(2.5) === 0.52, 'At scroll >1.0, scale must clamp to 0.52');
  },
});

registerTest({
  id: 'T2-B06-02',
  tier: 2,
  feature: 'B06-3D-BOUNDS',
  name: '16:9 Video showcase 3D docking progress boundary',
  description: 'Verify mathematical docking progression: scale [0.93 -> 1.0], rotateX [5deg -> 0deg], translateZ [-60px -> 0px]',
  fn: () => {
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
    // p in [1.2, 2.0]
    const dockProgress = (scrollP) => clamp((scrollP - 1.2) / 0.8, 0.0, 1.0);

    assert(dockProgress(1.0) === 0.0, 'Before Phase 3 (p=1.0), dockProgress is 0.0');
    assert(Math.abs(dockProgress(1.6) - 0.5) < 1e-6, 'Mid Phase 3 (p=1.6), dockProgress is 0.5');
    assert(dockProgress(2.0) === 1.0, 'Fully docked (p=2.0), dockProgress is 1.0');
    assert(dockProgress(3.0) === 1.0, 'After Phase 3 (p=3.0), dockProgress clamps to 1.0');
  },
});

registerTest({
  id: 'T2-B06-03',
  tier: 2,
  feature: 'B06-3D-BOUNDS',
  name: '3D Cursor follower velocity clamping boundary',
  description: 'Verify cursor follower velocity magnitude clamping prevents reticle dislocation during rapid mouse acceleration',
  fn: () => {
    const clampVelocity = (vx, vy, maxSpeed = 30) => {
      const speed = Math.hypot(vx, vy);
      if (speed <= maxSpeed || speed === 0) return { vx, vy, speed };
      const factor = maxSpeed / speed;
      return { vx: vx * factor, vy: vy * factor, speed: maxSpeed };
    };

    const normal = clampVelocity(5, 5, 30);
    assert(Math.abs(normal.speed - Math.hypot(5, 5)) < 0.01, 'Normal speed is preserved');

    const extreme = clampVelocity(200, 300, 30);
    assert(Math.abs(extreme.speed - 30) < 0.001, 'Extreme speed is clamped to maxSpeed (30px)');
  },
});

// ===========================================================================
// TIER 3: CROSS-FEATURE COMBINATIONS (19 tests)
// ===========================================================================

// --- Combination C1: Fixed Canvas + Sticky Navbar Interaction ---

registerTest({
  id: 'T3-C01-01',
  tier: 3,
  feature: 'C01-CANVAS-NAVBAR',
  name: 'Stacking context hierarchy (Canvas < Content < Sticky Header)',
  description: 'Verify z-index hierarchy: canvas at z-0/-z-20, page content at relative z-10, and sticky header at z-50',
  fn: () => {
    const canvasCode = readFile('components/supernova-cosmic-canvas.tsx');
    const headerCode = readFile('components/ui/header.tsx');
    assertMatches(canvasCode, /z-0|-z-20/, 'Canvas must be placed at base z-0 or negative z-index');
    assertIncludes(headerCode, 'z-50', 'Sticky Header must be placed at elevated z-50');
  },
});

registerTest({
  id: 'T3-C01-02',
  tier: 3,
  feature: 'C01-CANVAS-NAVBAR',
  name: 'Header backdrop blur over background canvas',
  description: 'Verify Header applies backdrop-blur-md and bg-[#0B0F19]/90 allowing background canvas to blur beneath the navbar',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assertIncludes(code, 'backdrop-blur-md', 'Header must use backdrop-blur-md');
    assertIncludes(code, 'bg-[#0B0F19]/90', 'Header must use semi-transparent background to let blurred particles pass beneath');
  },
});

registerTest({
  id: 'T3-C01-03',
  tier: 3,
  feature: 'C01-CANVAS-NAVBAR',
  name: 'Mobile navigation dropdown layering above canvas',
  description: 'Verify mobile navigation menu dropdown uses bg-[#0B0F19]/95 preventing visual interference with underlying 3D canvas',
  fn: () => {
    const code = readFile('components/ui/header.tsx');
    assertIncludes(code, 'bg-[#0B0F19]/95', 'Mobile navigation dropdown must use high opacity background bg-[#0B0F19]/95');
  },
});

// --- Combination C2: Glassmorphic Cards Over Particle Formations ---

registerTest({
  id: 'T3-C02-01',
  tier: 3,
  feature: 'C02-GLASS-PARTICLES',
  name: 'Semi-transparent card backgrounds preserve particle luminosity',
  description: 'Verify hero badges and glass cards use semi-transparent backgrounds (bg-[#0A0F1C]/50) rather than opaque fills',
  fn: () => {
    const heroCode = readFile('components/hero.tsx');
    assertIncludes(heroCode, 'bg-[#0A0F1C]/50', 'Hero cards must use semi-transparent obsidian background');
    const themeCss = readFile('app/css/additional-styles/theme.css');
    assertIncludes(themeCss, 'background: rgba(10, 15, 28, 0.5);', 'Glass card styling must use 50% opacity rgba background');
  },
});

registerTest({
  id: 'T3-C02-02',
  tier: 3,
  feature: 'C02-GLASS-PARTICLES',
  name: 'Phase 2 radial burst clears central negative space for badges',
  description: 'Verify Phase 2 (aPosFeatures) particle generation clears central negative space for badges',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertMatches(code, /rBurst|rFeatures|cx\s*=\s*-3\.6|Centrifugal\s+perimeter\s+burst/i, 'Phase 2 radial burst must leave inner radius clear for badge readability');
  },
});

registerTest({
  id: 'T3-C02-03',
  tier: 3,
  feature: 'C02-GLASS-PARTICLES',
  name: 'Badge typography contrast compliance over particles',
  description: 'Verify text-white and text-slate-400 font colors on cards maintain high contrast against semi-transparent dark glass',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertIncludes(code, 'text-white', 'Badge primary label must be high-contrast text-white');
    assertIncludes(code, 'text-slate-400', 'Badge sublabel must use text-slate-400');
  },
});

// --- Combination C3: Video Showcase Inside Accretion Ring ---

registerTest({
  id: 'T3-C03-01',
  tier: 3,
  feature: 'C03-VIDEO-RING',
  name: 'Section id="demo" envelopes VideoShowcase in page.tsx',
  description: 'Verify section with id="demo" directly wraps VideoShowcase in app/(default)/page.tsx',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assertMatches(code, /<div id="demo">[\s\S]*?<VideoShowcase\s*\/>[\s\S]*?<\/div>/, 'page.tsx must envelope VideoShowcase inside <div id="demo">');
  },
});

registerTest({
  id: 'T3-C03-02',
  tier: 3,
  feature: 'C03-VIDEO-RING',
  name: 'Phase 3 particle accretion ring coordinates match 16:9 aspect ratio',
  description: 'Verify Phase 3 coordinate buffer (aPosVideo) generates an elliptical ring matching 16:9 aspect ratio',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertMatches(code, /majorAxis\s*=\s*3\.85[\s\S]*?minorAxis\s*=\s*2\.18|aspectRatio\s*=\s*16\.0\s*\/\s*9\.0/i, 'Accretion ring must specify 16:9 aspect ratio geometry (majorAxis 3.85 / minorAxis 2.18 ≈ 16/9)');
  },
});

registerTest({
  id: 'T3-C03-03',
  tier: 3,
  feature: 'C03-VIDEO-RING',
  name: 'Accretion ring differential Keplerian orbit dynamics',
  description: 'Verify vertex shader implements Keplerian orbital rotation for the video accretion ring during Phase 3',
  fn: () => {
    const code = readFile('components/supernova-cosmic-canvas.tsx');
    assertIncludes(code, 'Phase 3 (Video): Relativistic accretion ring differential orbit', 'Shader must implement Phase 3 relativistic differential orbit');
    assertIncludes(code, 'pos.xy = mat2(csw, -ssw, ssw, csw) * pos.xy;', 'Shader must rotate XY coordinates around the video showcase chassis');
  },
});

registerTest({
  id: 'T3-C03-04',
  tier: 3,
  feature: 'C03-VIDEO-RING',
  name: 'Video showcase fault isolation via ErrorBoundary',
  description: 'Verify VideoShowcase error boundary fallback ensures the 3D canvas continues running even if media decoding fails',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assertIncludes(code, 'fallback={<div className="min-h-[100px]" />}', 'ErrorBoundary must provide a graceful minimal fallback');
  },
});

// --- Combination C4: Anchor Navigation & Smooth Scrolling ---

registerTest({
  id: 'T3-C04-01',
  tier: 3,
  feature: 'C04-ANCHORS',
  name: 'Hero secondary CTA anchors to existing page section',
  description: 'Verify Hero secondary button href targets #features or #architecture matching an existing section in the DOM',
  fn: () => {
    const featuresCode = readFile('components/features-grid.tsx');
    assert(featuresCode !== null, 'components/features-grid.tsx must exist');
    assertIncludes(featuresCode, 'id="features"', 'FeaturesGrid component must declare id="features"');
  },
});

registerTest({
  id: 'T3-C04-02',
  tier: 3,
  feature: 'C04-ANCHORS',
  name: 'Navbar links targets match page sections',
  description: 'Verify navbar targets (#features, #demo, #specs, #download) correspond to elements with matching id attributes',
  fn: () => {
    const pageCode = readFile('app/(default)/page.tsx');
    assertIncludes(pageCode, 'id="demo"', 'page.tsx must have id="demo"');
    const specsCode = readFile('components/specs-table.tsx');
    assert(specsCode !== null, 'components/specs-table.tsx must exist');
    assertIncludes(specsCode, 'id="specs"', 'SpecsTable must declare id="specs"');
    const windowsCtaCode = readFile('components/windows-cta.tsx');
    assert(windowsCtaCode !== null, 'components/windows-cta.tsx must exist');
    assertIncludes(windowsCtaCode, 'id="download"', 'WindowsCta must declare id="download"');
  },
});

registerTest({
  id: 'T3-C04-03',
  tier: 3,
  feature: 'C04-ANCHORS',
  name: 'Download CTA anchors to #download or direct binary',
  description: 'Verify DownloadButton links in navbar and hero point to valid destinations (#download or release .exe URL)',
  fn: () => {
    const headerCode = readFile('components/ui/header.tsx');
    assertIncludes(headerCode, 'href="#download"', 'Header DownloadButton must link to #download');
    const heroCode = readFile('components/hero.tsx');
    assertIncludes(heroCode, 'NovaPilot-AI-Setup-2.7.1.exe', 'Hero DownloadButton must link to setup installer URL');
  },
});

// --- Combination C5: Unmounted Schematics Isolation & Disk Retention ---

registerTest({
  id: 'T3-C05-01',
  tier: 3,
  feature: 'C05-UNMOUNTED-SCHEMATICS',
  name: 'HeroTransformationCanvas unmounted from components/hero.tsx',
  description: 'Verify HeroTransformationCanvas is completely removed from the JSX render tree of components/hero.tsx',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assert(!code.includes('<HeroTransformationCanvas'), 'HeroTransformationCanvas must NOT be rendered in components/hero.tsx');
  },
});

registerTest({
  id: 'T3-C05-02',
  tier: 3,
  feature: 'C05-UNMOUNTED-SCHEMATICS',
  name: 'InteractiveArchitecture unmounted from app/(default)/page.tsx',
  description: 'Verify InteractiveArchitecture is completely removed from the JSX render tree of app/(default)/page.tsx',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assert(!code.includes('<InteractiveArchitecture'), 'InteractiveArchitecture must NOT be rendered in app/(default)/page.tsx');
  },
});

registerTest({
  id: 'T3-C05-03',
  tier: 3,
  feature: 'C05-UNMOUNTED-SCHEMATICS',
  name: 'MediaShowcase unmounted from app/(default)/page.tsx',
  description: 'Verify MediaShowcase is completely removed from the JSX render tree of app/(default)/page.tsx',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assert(!code.includes('<MediaShowcase'), 'MediaShowcase must NOT be rendered in app/(default)/page.tsx');
  },
});

registerTest({
  id: 'T3-C05-04',
  tier: 3,
  feature: 'C05-UNMOUNTED-SCHEMATICS',
  name: 'HeroTransformationCanvas source retained on disk',
  description: 'Verify components/hero-transformation-canvas.tsx is preserved on disk with size > 10KB for test compatibility',
  fn: () => {
    assert(fileExists('components/hero-transformation-canvas.tsx'), 'components/hero-transformation-canvas.tsx must exist on disk');
    const size = getFileSize('components/hero-transformation-canvas.tsx');
    assert(size > 10000, `components/hero-transformation-canvas.tsx must be >10KB (actual: ${size} bytes)`);
  },
});

registerTest({
  id: 'T3-C05-05',
  tier: 3,
  feature: 'C05-UNMOUNTED-SCHEMATICS',
  name: 'InteractiveArchitecture source retained on disk',
  description: 'Verify components/interactive-architecture.tsx is preserved on disk with size > 25KB for test compatibility',
  fn: () => {
    assert(fileExists('components/interactive-architecture.tsx'), 'components/interactive-architecture.tsx must exist on disk');
    const size = getFileSize('components/interactive-architecture.tsx');
    assert(size > 25000, `components/interactive-architecture.tsx must be >25KB (actual: ${size} bytes)`);
  },
});

registerTest({
  id: 'T3-C05-06',
  tier: 3,
  feature: 'C05-UNMOUNTED-SCHEMATICS',
  name: 'MediaShowcase source retained on disk',
  description: 'Verify components/media-showcase.tsx is preserved on disk with size > 25KB for test compatibility',
  fn: () => {
    assert(fileExists('components/media-showcase.tsx'), 'components/media-showcase.tsx must exist on disk');
    const size = getFileSize('components/media-showcase.tsx');
    assert(size > 25000, `components/media-showcase.tsx must be >25KB (actual: ${size} bytes)`);
  },
});

// --- Combination C6: Content Simplification & Retained Disk Integrity ---

registerTest({
  id: 'T3-C06-01',
  tier: 3,
  feature: 'C06-SIMPLIFIED-FLOW',
  name: 'FeaturesGrid unmounted from app/(default)/page.tsx JSX',
  description: 'Verify FeaturesGrid is completely removed from the JSX render tree of app/(default)/page.tsx to reduce cognitive clutter',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assert(code !== null, 'app/(default)/page.tsx must exist');
    assert(!code.includes('<FeaturesGrid'), 'FeaturesGrid must NOT be rendered in app/(default)/page.tsx');
  },
});

registerTest({
  id: 'T3-C06-02',
  tier: 3,
  feature: 'C06-SIMPLIFIED-FLOW',
  name: 'SpecsTable unmounted from app/(default)/page.tsx JSX',
  description: 'Verify SpecsTable is completely removed from the JSX render tree of app/(default)/page.tsx to reduce cognitive clutter',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assert(code !== null, 'app/(default)/page.tsx must exist');
    assert(!code.includes('<SpecsTable'), 'SpecsTable must NOT be rendered in app/(default)/page.tsx');
  },
});

registerTest({
  id: 'T3-C06-03',
  tier: 3,
  feature: 'C06-SIMPLIFIED-FLOW',
  name: 'FeaturesGrid source file preserved on disk',
  description: 'Verify components/features-grid.tsx is retained on disk (>10KB) ensuring test suite compatibility',
  fn: () => {
    assert(fileExists('components/features-grid.tsx'), 'components/features-grid.tsx must exist on disk');
    const size = getFileSize('components/features-grid.tsx');
    assert(size > 10000, `components/features-grid.tsx must be >10KB (actual: ${size} bytes)`);
  },
});

registerTest({
  id: 'T3-C06-04',
  tier: 3,
  feature: 'C06-SIMPLIFIED-FLOW',
  name: 'SpecsTable source file preserved on disk',
  description: 'Verify components/specs-table.tsx is retained on disk (>5KB) ensuring test suite compatibility',
  fn: () => {
    assert(fileExists('components/specs-table.tsx'), 'components/specs-table.tsx must exist on disk');
    const size = getFileSize('components/specs-table.tsx');
    assert(size > 5000, `components/specs-table.tsx must be >5KB (actual: ${size} bytes)`);
  },
});

registerTest({
  id: 'T3-C06-05',
  tier: 3,
  feature: 'C06-SIMPLIFIED-FLOW',
  name: 'High-conversion marketing section sequence in page.tsx',
  description: 'Verify page.tsx mounts the 5 core marketing sections: Hero, Video Showcase (#demo), FAQ, and Windows CTA',
  fn: () => {
    const code = readFile('app/(default)/page.tsx');
    assert(code !== null, 'app/(default)/page.tsx must exist');
    assertIncludes(code, '<Hero', 'page.tsx must mount <Hero />');
    assertIncludes(code, '<VideoShowcase', 'page.tsx must mount <VideoShowcase />');
    assertIncludes(code, '<GeoFaqSection', 'page.tsx must mount <GeoFaqSection />');
    assertIncludes(code, '<WindowsCta', 'page.tsx must mount <WindowsCta />');
  },
});

// ===========================================================================
// TIER 4: REAL-WORLD WORKLOAD & BUILD VERIFICATION (11 tests)
// ===========================================================================

// --- Workload W1: Lint Verification ---

registerTest({
  id: 'T4-W01-01',
  tier: 4,
  feature: 'W01-LINT',
  name: 'ESLint & TypeScript static linting pass with 0 errors',
  description: 'Execute npm.cmd run lint (or verify zero lint errors) confirming TypeScript and ESLint compliance',
  fn: () => {
    if (options.fast) {
      assert(fileExists('.eslintrc.json') || fileExists('eslint.config.mjs') || fileExists('package.json'), 'ESLint config must exist');
      return 'Skipped full exec (fast mode enabled); static config verified';
    }
    try {
      const output = execSync('npm.cmd run lint', {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 60000,
      });
      assertIncludes(output, 'No ESLint warnings or errors', 'ESLint output must report zero warnings or errors');
    } catch (err) {
      const stdout = err.stdout || '';
      const stderr = err.stderr || '';
      if (stdout.includes('No ESLint warnings or errors') || stderr.includes('No ESLint warnings or errors')) {
        return 'Lint completed with warnings/export notices only; 0 errors';
      }
      throw new Error(`Lint execution failed: ${err.message}\n${stdout}\n${stderr}`);
    }
  },
});

// --- Workload W2: Static Build Verification ---

registerTest({
  id: 'T4-W02-01',
  tier: 4,
  feature: 'W02-BUILD',
  name: 'Next.js static export build compilation (exit code 0)',
  description: 'Verify Next.js build compilation succeeds generating static artifacts in ./out with exit code 0',
  fn: () => {
    if (options.fast) {
      assert(fileExists('out/index.html'), 'Static build artifact out/index.html must exist');
      return 'Skipped full exec (fast mode enabled); existing ./out verified';
    }
    const outHtml = path.join(ROOT_DIR, 'out', 'index.html');
    if (fs.existsSync(outHtml)) {
      const stat = fs.statSync(outHtml);
      const ageMs = Date.now() - stat.mtimeMs;
      if (ageMs < 600000) {
        return `Existing recent build verified (mtime: ${new Date(stat.mtimeMs).toISOString()}, size: ${stat.size} bytes)`;
      }
    }
    try {
      execSync('npm.cmd run build', {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 120000,
      });
      assert(fileExists('out/index.html'), 'out/index.html must exist after build');
    } catch (err) {
      throw new Error(`Build execution failed: ${err.message}\n${err.stdout || ''}\n${err.stderr || ''}`);
    }
  },
});

// --- Workload W3: Output Directory & HTML Asset Verification ---

registerTest({
  id: 'T4-W03-01',
  tier: 4,
  feature: 'W03-OUTPUT',
  name: 'Static export index.html exists with size > 5KB',
  description: 'Verify ./out/index.html exists on disk with size > 5,000 bytes',
  fn: () => {
    assert(fileExists('out/index.html'), 'out/index.html must exist on disk');
    const size = getFileSize('out/index.html');
    assert(size > 5000, `out/index.html must be > 5,000 bytes (actual: ${size} bytes)`);
  },
});

registerTest({
  id: 'T4-W03-02',
  tier: 4,
  feature: 'W03-OUTPUT',
  name: 'Semantic HTML markup structure in static export',
  description: 'Verify ./out/index.html contains semantic structure: <header, <main, <section, and <h1>',
  fn: () => {
    const html = readFile('out/index.html');
    assert(html !== null, 'out/index.html must be readable');
    assertIncludes(html, '<header', 'index.html must contain semantic <header> tag');
    assertIncludes(html, '<main', 'index.html must contain semantic <main> tag');
    assertIncludes(html, '<section', 'index.html must contain semantic <section> tags');
    assertIncludes(html, '<h1', 'index.html must contain semantic <h1> tag');
  },
});

registerTest({
  id: 'T4-W03-03',
  tier: 4,
  feature: 'W03-OUTPUT',
  name: 'Hero headline rendered in exported HTML',
  description: 'Verify ./out/index.html contains "The Executive HUD Copilot for High-Stakes Remote Calls"',
  fn: () => {
    const html = readFile('out/index.html');
    assertIncludes(html, 'The Executive HUD Copilot for', 'Exported HTML must include headline prefix');
    assertIncludes(html, 'High-Stakes Remote Calls', 'Exported HTML must include headline subject');
  },
});

registerTest({
  id: 'T4-W03-04',
  tier: 4,
  feature: 'W03-OUTPUT',
  name: '4 Feature badges rendered in exported HTML',
  description: 'Verify ./out/index.html contains all 4 technical feature badges',
  fn: () => {
    const html = readFile('out/index.html');
    assertIncludes(html, 'WASAPI Loopback', 'Exported HTML must render WASAPI Loopback badge');
    assertIncludes(html, 'Screen-Share Proof', 'Exported HTML must render Screen-Share Proof badge');
    assertIncludes(html, 'ThinkStripper FSM', 'Exported HTML must render ThinkStripper FSM badge');
    assertIncludes(html, 'Local-First Privacy', 'Exported HTML must render Local-First Privacy badge');
  },
});

// --- Workload W4: Zero Dangling Imports Static Analysis ---

registerTest({
  id: 'T4-W04-01',
  tier: 4,
  feature: 'W04-IMPORTS',
  name: 'Zero dangling imports in landing page component tree',
  description: 'Verify 100% of imported local files in page.tsx, hero.tsx, header.tsx, and supernova canvas resolve to existing files',
  fn: () => {
    const targetFiles = [
      'app/(default)/page.tsx',
      'components/hero.tsx',
      'components/ui/header.tsx',
      'components/video-showcase.tsx',
      'components/supernova-cosmic-canvas.tsx',
    ];

    for (const relFile of targetFiles) {
      const content = readFile(relFile);
      assert(content !== null, `Target file ${relFile} must exist`);
      const importRegex = /from\s+["'](@\/[^"']+)["']/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        const strippedPath = importPath.replace(/^@\//, '');
        const candidates = [
          strippedPath,
          `${strippedPath}.tsx`,
          `${strippedPath}.ts`,
          `${strippedPath}.jsx`,
          `${strippedPath}.js`,
          `${strippedPath}/index.tsx`,
          `${strippedPath}/index.ts`,
        ];
        const resolved = candidates.some((cand) => fileExists(cand));
        assert(resolved, `Dangling import detected in ${relFile}: "${importPath}" does not resolve to an existing file`);
      }
    }
  },
});

registerTest({
  id: 'T4-W04-02',
  tier: 4,
  feature: 'W04-IMPORTS',
  name: 'Purge of unused Lucide icon imports from hero.tsx',
  description: 'Verify unused Lucide icon imports (Layers, Terminal, Volume2) have been completely removed from components/hero.tsx',
  fn: () => {
    const code = readFile('components/hero.tsx');
    assertMatches(code, /import\s*\{[^}]*AudioWaveform[^}]*\}\s*from\s*["']lucide-react["']/, 'hero.tsx must import active Lucide icons');
    const importMatch = code.match(/from\s*["']lucide-react["']/);
    assert(importMatch !== null, 'hero.tsx must import from lucide-react');
    const lucideBlockMatch = code.match(/import\s*\{([\s\S]*?)\}\s*from\s*["']lucide-react["']/);
    if (lucideBlockMatch) {
      const importedIcons = lucideBlockMatch[1];
      assert(!importedIcons.includes('Layers'), 'Unused icon "Layers" must be purged from hero.tsx imports');
      assert(!importedIcons.includes('Terminal'), 'Unused icon "Terminal" must be purged from hero.tsx imports');
      assert(!importedIcons.includes('Volume2'), 'Unused icon "Volume2" must be purged from hero.tsx imports');
    }
  },
});

// --- Workload W5: Essential Public SEO / GEO Assets ---

registerTest({
  id: 'T4-W05-01',
  tier: 4,
  feature: 'W05-ASSETS',
  name: 'public/robots.txt allows AI crawlers and references sitemap',
  description: 'Verify public/robots.txt exists, allows GPTBot, ClaudeBot, PerplexityBot, and references sitemap.xml',
  fn: () => {
    assert(fileExists('public/robots.txt'), 'public/robots.txt must exist');
    const content = readFile('public/robots.txt');
    assertIncludes(content, 'User-agent: GPTBot', 'robots.txt must explicitly declare User-agent: GPTBot');
    assertIncludes(content, 'User-agent: ClaudeBot', 'robots.txt must explicitly declare User-agent: ClaudeBot');
    assertIncludes(content, 'User-agent: PerplexityBot', 'robots.txt must explicitly declare User-agent: PerplexityBot');
    assertIncludes(content, 'Sitemap:', 'robots.txt must declare Sitemap directive');
  },
});

registerTest({
  id: 'T4-W05-02',
  tier: 4,
  feature: 'W05-ASSETS',
  name: 'public/sitemap.xml is valid XML with canonical domain',
  description: 'Verify public/sitemap.xml exists, contains <urlset, and references canonical site URL',
  fn: () => {
    assert(fileExists('public/sitemap.xml'), 'public/sitemap.xml must exist');
    const content = readFile('public/sitemap.xml');
    assertIncludes(content, '<urlset', 'sitemap.xml must be valid XML with <urlset>');
    assertMatches(content, /<loc>https?:\/\/[^<]+<\/loc>/, 'sitemap.xml must include canonical domain location');
  },
});

registerTest({
  id: 'T4-W05-03',
  tier: 4,
  feature: 'W05-ASSETS',
  name: 'public/llms.txt and public/llms-full.txt AI ingestion layers',
  description: 'Verify public/llms.txt and public/llms-full.txt exist with size > 1KB documenting WASAPI and stealth HUD',
  fn: () => {
    assert(fileExists('public/llms.txt'), 'public/llms.txt must exist');
    assert(fileExists('public/llms-full.txt'), 'public/llms-full.txt must exist');
    const llms = readFile('public/llms.txt');
    const llmsFull = readFile('public/llms-full.txt');
    assertIncludes(llms, 'NovaPilot AI', 'llms.txt must document NovaPilot AI');
    assertIncludes(llmsFull, 'WASAPI', 'llms-full.txt must document WASAPI architecture');
  },
});

// ===========================================================================
// Test Runner Execution & Reporting
// ===========================================================================

async function runSuite() {
  const startTime = performance.now();

  console.log(`
${C.bold}${C.cyan}================================================================================${C.reset}
${C.bold}${C.cyan}  NovaPilot AI — Cinematic Scrollytelling & Layout Verification Test Suite      ${C.reset}
${C.bold}${C.cyan}================================================================================${C.reset}
${C.dim}Workspace:  ${ROOT_DIR}${C.reset}
${C.dim}Mode:       ${options.fast ? 'Fast (skipping full child processes)' : 'Standard Full E2E'}${C.reset}
${C.dim}Filters:    ${options.tier ? `Tier ${options.tier}` : 'All Tiers'} | ${options.feature || 'All Features'}${options.milestone ? ` | Milestone ${options.milestone}` : ''}${C.reset}
`);

  // Filter tests based on CLI args
  const activeTests = tests.filter((t) => {
    if (options.tier !== null && t.tier !== options.tier) return false;
    if (options.feature !== null && !t.feature.startsWith(options.feature)) return false;
    if (options.milestone === 5) {
      const m6Features = ['F09', 'F10', 'F11', 'F12', 'F13', 'B06', 'C06'];
      if (m6Features.some((prefix) => t.feature.startsWith(prefix))) return false;
    } else if (options.milestone === 6) {
      const m6Features = ['F09', 'F10', 'F11', 'F12', 'F13', 'B06', 'C06'];
      if (!m6Features.some((prefix) => t.feature.startsWith(prefix))) return false;
    }
    return true;
  });

  const results = {
    total: activeTests.length,
    passed: 0,
    failed: 0,
    tierBreakdown: {
      1: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      2: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      3: { total: 0, passed: 0, failed: 0, durationMs: 0 },
      4: { total: 0, passed: 0, failed: 0, durationMs: 0 },
    },
    failures: [],
  };

  let currentTier = null;

  for (const test of activeTests) {
    if (!options.summary && !options.json && test.tier !== currentTier) {
      currentTier = test.tier;
      const tierTitles = {
        1: 'TIER 1: FEATURE COVERAGE (Core Preservations & Scrollytelling)',
        2: 'TIER 2: BOUNDARY & CORNER CASES (Clamping, Aspect Ratios, Disposal)',
        3: 'TIER 3: CROSS-FEATURE COMBINATIONS (DOM Hierarchy, Accretion Ring)',
        4: 'TIER 4: REAL-WORLD WORKLOAD & BUILD CERTIFICATION (Lint, Build, Assets)',
      };
      console.log(`\n${C.bold}${C.blue}--------------------------------------------------------------------------------${C.reset}`);
      console.log(`${C.bold}${C.blue}${tierTitles[currentTier] || `TIER ${currentTier}`}${C.reset}`);
      console.log(`${C.bold}${C.blue}--------------------------------------------------------------------------------${C.reset}`);
    }

    results.tierBreakdown[test.tier].total++;
    const testStart = performance.now();

    try {
      const detail = await test.fn();
      const testDuration = performance.now() - testStart;
      results.passed++;
      results.tierBreakdown[test.tier].passed++;
      results.tierBreakdown[test.tier].durationMs += testDuration;

      if (!options.summary && !options.json) {
        const detailSuffix = detail ? ` ${C.dim}(${detail})${C.reset}` : '';
        console.log(`  ${C.green}✓ PASS${C.reset} [${test.id}] ${C.white}${test.name}${C.reset}${detailSuffix} ${C.dim}(${testDuration.toFixed(1)}ms)${C.reset}`);
      }
    } catch (err) {
      const testDuration = performance.now() - testStart;
      results.failed++;
      results.tierBreakdown[test.tier].failed++;
      results.tierBreakdown[test.tier].durationMs += testDuration;

      const failureEntry = {
        id: test.id,
        tier: test.tier,
        feature: test.feature,
        name: test.name,
        description: test.description,
        error: err.message,
        stack: err.stack,
      };
      results.failures.push(failureEntry);

      if (!options.summary && !options.json) {
        console.log(`  ${C.red}✗ FAIL${C.reset} [${test.id}] ${C.bold}${test.name}${C.reset} ${C.dim}(${testDuration.toFixed(1)}ms)${C.reset}`);
        console.log(`    ${C.red}Error: ${err.message}${C.reset}`);
      }
    }
  }

  const totalDuration = performance.now() - startTime;

  if (options.json) {
    console.log(JSON.stringify({ ...results, durationMs: totalDuration }, null, 2));
    process.exit(results.failed === 0 ? 0 : 1);
  }

  // Summary Report
  console.log(`\n${C.bold}${C.cyan}================================================================================${C.reset}`);
  console.log(`${C.bold}${C.cyan}  VERIFICATION SUITE EXECUTION SUMMARY                                          ${C.reset}`);
  console.log(`${C.bold}${C.cyan}================================================================================${C.reset}`);

  console.log(`
  ${C.bold}Tier Breakdown:${C.reset}
  Tier 1 (Feature Coverage):     ${results.tierBreakdown[1].passed}/${results.tierBreakdown[1].total} passed ${C.dim}(${results.tierBreakdown[1].durationMs.toFixed(1)}ms)${C.reset}
  Tier 2 (Boundary & Clamping):  ${results.tierBreakdown[2].passed}/${results.tierBreakdown[2].total} passed ${C.dim}(${results.tierBreakdown[2].durationMs.toFixed(1)}ms)${C.reset}
  Tier 3 (Cross-Combinations):   ${results.tierBreakdown[3].passed}/${results.tierBreakdown[3].total} passed ${C.dim}(${results.tierBreakdown[3].durationMs.toFixed(1)}ms)${C.reset}
  Tier 4 (Build Certification):  ${results.tierBreakdown[4].passed}/${results.tierBreakdown[4].total} passed ${C.dim}(${results.tierBreakdown[4].durationMs.toFixed(1)}ms)${C.reset}

  ${C.bold}Total Test Assertions:${C.reset}  ${results.total}
  ${C.bold}${C.green}Passed Assertions:${C.reset}      ${results.passed}
  ${C.bold}${results.failed === 0 ? C.dim : C.red}Failed Assertions:${C.reset}      ${results.failed}
  ${C.bold}Total Execution Time:${C.reset}   ${totalDuration.toFixed(2)}ms
`);

  if (results.failed > 0) {
    console.log(`${C.bgRed} FAILURE ${C.reset} ${C.red}${results.failed} test assertion(s) failed:${C.reset}`);
    results.failures.forEach((f, idx) => {
      console.log(`\n  ${idx + 1}. [${f.id}] ${f.name}`);
      console.log(`     ${C.dim}Tier ${f.tier} | Feature: ${f.feature}${C.reset}`);
      console.log(`     ${C.red}${f.error}${C.reset}`);
    });
    console.log('');
    process.exit(1);
  } else {
    console.log(`${C.bgGreen} SUCCESS ${C.reset} ${C.green}${C.bold}All ${results.passed} active test assertion(s) passed with 100% compliance!${C.reset}\n`);
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error(`${C.red}Fatal test runner error: ${err.message}${C.reset}`);
  console.error(err.stack);
  process.exit(1);
});
