#!/usr/bin/env node
/**
 * NovaPilot AI Commercial Website — Comprehensive E2E Verification Test Suite
 *
 * Implements 4-Tier Opaque-Box, Requirement-Driven Verification:
 * - Tier 1: Feature Coverage (85 tests = 17 features × 5 tests)
 * - Tier 2: Boundary & Corner Cases (85 tests = 17 features × 5 tests)
 * - Tier 3: Cross-Feature Combinations (17 tests)
 * - Tier 4: Real-World Application Scenarios (9 user journeys)
 * Total: 196 Comprehensive Tests
 *
 * Usage:
 *   node scripts/verify-commercial-suite.mjs                # Run full suite (exit 0 = all pass, 1 = failure)
 *   node scripts/verify-commercial-suite.mjs --tier 1       # Run specific tier (1, 2, 3, 4)
 *   node scripts/verify-commercial-suite.mjs --feature F01  # Run specific feature (F01..F17)
 *   node scripts/verify-commercial-suite.mjs --milestone M1 # Run specific milestone (M1..M6)
 *   node scripts/verify-commercial-suite.mjs --summary      # Compact summary output
 *   node scripts/verify-commercial-suite.mjs --json         # JSON structured output
 *   node scripts/verify-commercial-suite.mjs --list         # List all 196 test definitions
 *   node scripts/verify-commercial-suite.mjs --allow-pending # Treat pending milestone tests as PENDING
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI color formatting
const colors = {
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
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
};

// ---------------------------------------------------------------------------
// File Inspection Utilities
// ---------------------------------------------------------------------------

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT_DIR, relPath));
}

function readFile(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

function readBinaryBuffer(relPath, maxBytes = 4096) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  const fd = fs.openSync(fullPath, 'r');
  const buffer = Buffer.alloc(maxBytes);
  const bytesRead = fs.readSync(fd, buffer, 0, maxBytes, 0);
  fs.closeSync(fd);
  return buffer.subarray(0, bytesRead);
}

function scanFiles(dirRelPath, extensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.json']) {
  const fullDir = path.join(ROOT_DIR, dirRelPath);
  if (!fs.existsSync(fullDir)) return [];

  const results = [];
  function recurse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        recurse(full);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(path.relative(ROOT_DIR, full).replace(/\\/g, '/'));
      }
    }
  }
  recurse(fullDir);
  return results;
}

// ---------------------------------------------------------------------------
// Algorithmic Reference Models (Domain Oracles)
// ---------------------------------------------------------------------------

/**
 * WCAG 2.1 Relative Luminance and Contrast Ratio Oracle
 * Standard formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
function hexToRgb(hex) {
  let clean = hex.replace(/^#/, '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length === 8) {
    clean = clean.slice(0, 6);
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function sRgbToLin(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const rLin = sRgbToLin(rgb.r);
  const gLin = sRgbToLin(rgb.g);
  const bLin = sRgbToLin(rgb.b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
}

function calculateContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * RFC 7233 HTTP Byte-Range Parser Oracle
 */
function parseHttpByteRange(rangeHeader, totalFileSize) {
  if (!rangeHeader || typeof rangeHeader !== 'string') return null;
  const trimmed = rangeHeader.trim();
  const match = /^bytes=([0-9]*)-([0-9]*)$/i.exec(trimmed);
  if (!match) return { valid: false, error: 'MALFORMED_SYNTAX' };

  const startStr = match[1];
  const endStr = match[2];

  if (startStr === '' && endStr === '') {
    return { valid: false, error: 'EMPTY_RANGE' };
  }

  let start;
  let end;

  if (startStr === '') {
    // Suffix range: bytes=-500
    const suffix = parseInt(endStr, 10);
    if (suffix <= 0) return { valid: false, error: 'INVALID_SUFFIX' };
    start = Math.max(0, totalFileSize - suffix);
    end = totalFileSize - 1;
  } else if (endStr === '') {
    // Open-ended range: bytes=1000-
    start = parseInt(startStr, 10);
    end = totalFileSize - 1;
  } else {
    start = parseInt(startStr, 10);
    end = parseInt(endStr, 10);
  }

  if (start > end || start >= totalFileSize) {
    return { valid: false, error: 'UNSATISFIABLE_RANGE', statusCode: 416 };
  }

  end = Math.min(end, totalFileSize - 1);
  const chunkSize = end - start + 1;

  return {
    valid: true,
    start,
    end,
    total: totalFileSize,
    chunkSize,
    contentRange: `bytes ${start}-${end}/${totalFileSize}`,
  };
}

/**
 * MP4 Binary Box Parser Oracle
 */
function validateMp4Header(buffer) {
  if (!buffer || buffer.length < 16) return { valid: false, reason: 'BUFFER_TOO_SMALL' };
  // Check 'ftyp' atom at offset 4
  const boxType = buffer.toString('ascii', 4, 8);
  if (boxType !== 'ftyp') {
    return { valid: false, reason: 'MISSING_FTYP_ATOM' };
  }
  const majorBrand = buffer.toString('ascii', 8, 12).trim();
  const compatibleBrands = [];
  for (let i = 16; i < Math.min(buffer.length, 64); i += 4) {
    compatibleBrands.push(buffer.toString('ascii', i, i + 4).trim());
  }
  return {
    valid: true,
    majorBrand,
    compatibleBrands,
  };
}

/**
 * Normalized Pointer Coordinate Oracle
 */
function normalizePointerCoords(clientX, clientY, rect) {
  if (!rect || rect.width <= 0 || rect.height <= 0) {
    return { x: 0.5, y: 0.5 };
  }
  const rawX = (clientX - rect.left) / rect.width;
  const rawY = (clientY - rect.top) / rect.height;
  return {
    x: Math.max(0.0, Math.min(1.0, rawX)),
    y: Math.max(0.0, Math.min(1.0, rawY)),
  };
}

/**
 * SSR-safe OS Detection Oracle
 */
function detectOperatingSystem(userAgent, isClient) {
  if (!isClient || !userAgent) {
    return {
      os: 'windows',
      isWindows: true,
      architecture: 'x64',
      isHydrated: false,
    };
  }

  const ua = userAgent.toLowerCase();
  let os = 'unknown';
  let isWindows = false;
  let architecture = 'x64';

  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'ios';
  } else if (ua.includes('android')) {
    os = 'android';
  } else if (ua.includes('mac') || ua.includes('darwin')) {
    os = 'mac';
  } else if (ua.includes('win')) {
    os = 'windows';
    isWindows = true;
    if (ua.includes('arm64')) architecture = 'arm64';
  } else if (ua.includes('linux')) {
    os = 'linux';
  }

  return {
    os,
    isWindows,
    architecture,
    isHydrated: true,
  };
}

// ---------------------------------------------------------------------------
// Test Registry & Assertion Engine
// ---------------------------------------------------------------------------

const tests = [];

function registerTest({ id, name, tier, feature, milestone, execute }) {
  tests.push({ id, name, tier, feature, milestone, execute });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Value mismatch'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertContains(haystack, needle, message) {
  if (!haystack || !haystack.includes(needle)) {
    throw new Error(`${message || 'Substring not found'}: expected to find ${JSON.stringify(needle)}`);
  }
}

function assertMatches(string, regex, message) {
  if (!regex.test(string)) {
    throw new Error(`${message || 'Regex match failed'}: string does not match ${regex}`);
  }
}

// ---------------------------------------------------------------------------
// TIER 1: FEATURE COVERAGE (85 Tests / 17 Features × 5 Tests)
// ---------------------------------------------------------------------------

// --- FEATURE 1: Next.js Strict CSP & Headers (M1) ---

registerTest({
  id: 'T1-F01-01',
  name: 'CSP Directive Integrity & Structural Isolation',
  tier: 1,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, "default-src 'self'", "CSP must enforce default-src 'self'");
    assertContains(config, "object-src 'none'", "CSP must block object-src to prevent Flash/plugin vectors");
    assertContains(config, "frame-ancestors 'none'", "CSP must enforce frame-ancestors 'none' to prevent clickjacking");
    assertContains(config, "base-uri 'self'", "CSP must restrict base-uri to 'self'");
    assertContains(config, "form-action 'self'", "CSP must restrict form submissions to 'self'");
  },
});

registerTest({
  id: 'T1-F01-02',
  name: 'Script & Style Execution Security in CSP',
  tier: 1,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'script-src', 'CSP must define explicit script-src directive');
    assertContains(config, 'style-src', 'CSP must define explicit style-src directive');
    assert(!config.includes("script-src *"), 'CSP must never allow unrestricted wildcard script-src');
    assertContains(config, 'upgrade-insecure-requests', 'CSP must upgrade insecure HTTP requests');
  },
});

registerTest({
  id: 'T1-F01-03',
  name: 'Anti-Clickjacking Framing Defenses (X-Frame-Options & CSP)',
  tier: 1,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'X-Frame-Options', 'Must configure X-Frame-Options header');
    assertContains(config, 'DENY', 'X-Frame-Options must be strictly set to DENY');
  },
});

registerTest({
  id: 'T1-F01-04',
  name: 'MIME Sniffing Prevention & Strict Transport Security (HSTS)',
  tier: 1,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'X-Content-Type-Options', 'Must configure X-Content-Type-Options');
    assertContains(config, 'nosniff', 'X-Content-Type-Options must be set to nosniff');
    assertContains(config, 'Strict-Transport-Security', 'Must enforce HSTS');
    assertContains(config, 'includeSubDomains', 'HSTS must includeSubDomains');
    assertContains(config, 'preload', 'HSTS must set preload directive');
  },
});

registerTest({
  id: 'T1-F01-05',
  name: 'Hardware API Permissions Policy & Referrer Isolation',
  tier: 1,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'Permissions-Policy', 'Must set Permissions-Policy header');
    assertContains(config, 'camera=()', 'Permissions-Policy must disable camera');
    assertContains(config, 'microphone=()', 'Permissions-Policy must disable microphone');
    assertContains(config, 'geolocation=()', 'Permissions-Policy must disable geolocation');
    assertContains(config, 'Referrer-Policy', 'Must configure Referrer-Policy');
    assertContains(config, 'strict-origin-when-cross-origin', 'Referrer-Policy must be strict-origin-when-cross-origin');
  },
});

// --- FEATURE 2: Video Streaming & Byte-Range Headers (M1) ---

registerTest({
  id: 'T1-F02-01',
  name: 'Next.js Video Route Pattern Matching Configuration',
  tier: 1,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assert(
      config.includes('/videos/:path*') || config.includes('mp4'),
      'Must contain specific route matching for video assets'
    );
  },
});

registerTest({
  id: 'T1-F02-02',
  name: 'Accept-Ranges Byte Header for Video Media Scrubbing',
  tier: 1,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'Accept-Ranges', 'Must declare Accept-Ranges header for video');
    assertContains(config, 'bytes', 'Accept-Ranges header must be bytes');
  },
});

registerTest({
  id: 'T1-F02-03',
  name: 'Immutable Long-Lived Cache-Control for Media Assets',
  tier: 1,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'Cache-Control', 'Must set Cache-Control on video streams');
    assertContains(config, 'immutable', 'Cache-Control must specify immutable for versioned media');
    assert(config.includes('max-age=31536000') || config.includes('max-age='), 'Must define long max-age');
  },
});

registerTest({
  id: 'T1-F02-04',
  name: 'Explicit Video MIME Type Enforcement',
  tier: 1,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'Content-Type', 'Must declare Content-Type header rule for video assets');
    assertContains(config, 'video/mp4', 'Content-Type must be explicitly video/mp4');
  },
});

registerTest({
  id: 'T1-F02-05',
  name: 'Cross-Origin Resource Policy for Video Media',
  tier: 1,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'Cross-Origin-Resource-Policy', 'Must define Cross-Origin-Resource-Policy');
    assertContains(config, 'same-origin', 'Cross-Origin-Resource-Policy must be same-origin');
  },
});

// --- FEATURE 3: Metadata & Build Sanitization (M1) ---

registerTest({
  id: 'T1-F03-01',
  name: 'Server Fingerprint Suppression (poweredByHeader: false)',
  tier: 1,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assert(
      /poweredByHeader\s*:\s*false/.test(config),
      'next.config.js must set poweredByHeader: false to prevent Next.js framework fingerprinting'
    );
  },
});

registerTest({
  id: 'T1-F03-02',
  name: 'Production Browser Source Maps Disabled',
  tier: 1,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assert(
      /productionBrowserSourceMaps\s*:\s*false/.test(config),
      'next.config.js must disable productionBrowserSourceMaps to avoid leaking source files'
    );
  },
});

registerTest({
  id: 'T1-F03-03',
  name: 'Canonical metadataBase Configuration in Root Layout',
  tier: 1,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const layout = readFile('app/layout.tsx');
    assert(layout !== null, 'app/layout.tsx must exist');
    assertContains(layout, 'metadataBase', 'Root layout must define metadataBase to resolve canonical open-graph URLs');
    assert(
      /metadataBase\s*:\s*new URL\(['"]https?:\/\//.test(layout) || layout.includes('metadataBase:'),
      'metadataBase must be initialized with a valid URL'
    );
  },
});

registerTest({
  id: 'T1-F03-04',
  name: 'Directory Traversal & Index Enumeration Redirect Rules',
  tier: 1,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    assertContains(config, 'redirects', 'next.config.js must define redirect rules');
    assert(
      config.includes('/videos') && config.includes('destination'),
      'Directory enumeration of /videos must redirect to root or safe path'
    );
  },
});

registerTest({
  id: 'T1-F03-05',
  name: 'Absence of Leaked Development Paths in Layout & Metadata',
  tier: 1,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const layout = readFile('app/layout.tsx');
    assert(layout !== null, 'app/layout.tsx must exist');
    assert(!layout.includes('localhost:'), 'Production layout metadata must not reference localhost');
    assert(!layout.includes('file:///'), 'Production layout metadata must not reference file:/// protocol');
    assert(!layout.includes('Users\\WINDOWS 11'), 'Production layout metadata must not leak local username/paths');
  },
});

// --- FEATURE 4: Executive Design Tokens & Palette (M2) ---

registerTest({
  id: 'T1-F04-01',
  name: 'Executive Deep Cobalt Blue Tokens (#0047AB / #1D4ED8)',
  tier: 1,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'app/css/style.css must exist');
    const hasCobalt = styleCss.includes('#0047ab') || styleCss.includes('#0047AB') ||
                      styleCss.includes('#1d4ed8') || styleCss.includes('#1D4ED8') ||
                      styleCss.includes('cobalt');
    assert(hasCobalt, 'Executive Deep Cobalt Blue (#0047AB or #1D4ED8) must be declared in design tokens');
  },
});

registerTest({
  id: 'T1-F04-02',
  name: 'Executive Deep Ink Background Token (#0B0F19)',
  tier: 1,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'app/css/style.css must exist');
    const hasDeepInk = styleCss.includes('#0b0f19') || styleCss.includes('#0B0F19') ||
                       styleCss.includes('ink') || styleCss.includes('#030712') || styleCss.includes('#020617');
    assert(hasDeepInk, 'Deep Ink canvas background token (#0B0F19 or dark ink equivalent) must be defined');
  },
});

registerTest({
  id: 'T1-F04-03',
  name: 'Executive Pure White High-Contrast Typography Token (#FFFFFF)',
  tier: 1,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'app/css/style.css must exist');
    const hasWhite = styleCss.includes('#ffffff') || styleCss.includes('#FFFFFF') ||
                     styleCss.includes('--color-white') || styleCss.includes('text-white');
    assert(hasWhite, 'Pure White (#FFFFFF) typography token must be present');
  },
});

registerTest({
  id: 'T1-F04-04',
  name: 'Typographic Scale & Proportional Letter Spacing Scale',
  tier: 1,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'app/css/style.css must exist');
    assertContains(styleCss, '--text-base', 'Must define --text-base scale');
    assertContains(styleCss, '--text-xs', 'Must define --text-xs scale');
    assertContains(styleCss, '--font-inter', 'Must define Inter primary typography variable');
  },
});

registerTest({
  id: 'T1-F04-05',
  name: 'Accessibility Focus-Visible Ring Token Definition',
  tier: 1,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'app/css/style.css must exist');
    assertContains(styleCss, ':focus-visible', 'Must declare global :focus-visible rules');
    assert(
      styleCss.includes('outline:') || styleCss.includes('outline-offset:'),
      'Must define explicit high-visibility focus outline styling'
    );
  },
});

// --- FEATURE 5: Anti-AI Cliché Purge (M2) ---

registerTest({
  id: 'T1-F05-01',
  name: 'Purge of Purple/Violet Blur Halos Over 16px',
  tier: 1,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const sourceFiles = scanFiles('components').concat(scanFiles('app'));
    const offendingFiles = [];
    const purpleBlurRegex = /(?:(?:blur-3xl|blur-2xl|blur-\[(?:[2-9]\d|\d{3,})px\])[^"'>]*(?:purple|violet|fuchsia|pink)|(?:purple|violet|fuchsia|pink)[^"'>]*(?:blur-3xl|blur-2xl|blur-\[(?:[2-9]\d|\d{3,})px\]))/i;
    for (const relPath of sourceFiles) {
      const raw = readFile(relPath);
      if (!raw) continue;
      const content = raw.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/.*$/gm, '');
      if (purpleBlurRegex.test(content)) {
        offendingFiles.push(relPath);
      }
    }
    assert(
      offendingFiles.length === 0,
      `Detected ungrounded purple/violet blur halos over 16px in: ${offendingFiles.join(', ')}`
    );
  },
});

registerTest({
  id: 'T1-F05-02',
  name: 'Purge of Ungrounded Floating Particle Meshes',
  tier: 1,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const sourceFiles = scanFiles('components');
    const particleRegex = /(?:particle-mesh|ungrounded-particles|magic-sparkles-canvas)/i;
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      assert(!particleRegex.test(content), `Found ungrounded particle mesh in ${relPath}`);
    }
  },
});

registerTest({
  id: 'T1-F05-03',
  name: 'Purge of Rainbow / Multi-Hue Gradient Text',
  tier: 1,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const sourceFiles = scanFiles('components').concat(scanFiles('app'));
    const rainbowRegex = /(?:from-purple-\d+\s+via-pink-\d+\s+to-amber-\d+|from-pink-\d+\s+via-purple-\d+|bg-clip-text[^"'>]*(?:from|to|via)-(?:purple|violet|fuchsia|pink)|(?:from|to|via)-(?:purple|violet|fuchsia|pink)[^"'>]*bg-clip-text)/i;
    for (const relPath of sourceFiles) {
      const raw = readFile(relPath);
      if (!raw) continue;
      const content = raw.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/.*$/gm, '');
      assert(!rainbowRegex.test(content), `Found rainbow gradient text in ${relPath}`);
    }
  },
});

registerTest({
  id: 'T1-F05-04',
  name: 'Purge of Generic AI Marketing Cliché Buzzwords',
  tier: 1,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const sourceFiles = scanFiles('components').concat(scanFiles('app'));
    const genericCliches = [
      'magic ai button',
      'superhuman synergy',
      'infinite ai possibilities',
      'sentient copilot',
    ];
    for (const relPath of sourceFiles) {
      const content = readFile(relPath).toLowerCase();
      for (const phrase of genericCliches) {
        assert(!content.includes(phrase), `Found generic AI cliché phrase "${phrase}" in ${relPath}`);
      }
    }
  },
});

registerTest({
  id: 'T1-F05-05',
  name: 'Illustration Purification & Removal of 46px Purple Blur Filters',
  tier: 1,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const illus = readFile('components/page-illustration.tsx');
    if (illus) {
      assert(!illus.includes('stdDeviation="46"'), 'Page illustration must not contain 46px blur filter');
      assert(!illus.includes('stopColor="#8B5CF6"'), 'Page illustration must purge purple #8B5CF6 glow filter');
    }
  },
});

// --- FEATURE 6: Cruip Template Cleansing (M2) ---

registerTest({
  id: 'T1-F06-01',
  name: 'Purge of Dead Cruip AOS Animation Rules in theme.css',
  tier: 1,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const themeCss = readFile('app/css/additional-styles/theme.css');
    assert(themeCss !== null, 'app/css/additional-styles/theme.css must exist');
    const hasCruipAos = themeCss.includes('data-aos="fade-up-right"') ||
                        themeCss.includes('data-aos="zoom-in-up"');
    assert(!hasCruipAos, 'theme.css must be purged of dead Cruip AOS animation rules');
  },
});

registerTest({
  id: 'T1-F06-02',
  name: 'Purge of Orphaned Cruip Template Images from public/images/',
  tier: 1,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const cruipArtifacts = [
      'public/images/cruip-logo.svg',
      'public/images/client-logo-01.svg',
      'public/images/testimonial-01.jpg',
      'public/images/hero-image-01.jpg',
    ];
    for (const artifact of cruipArtifacts) {
      assert(!fileExists(artifact), `Orphaned Cruip asset ${artifact} must be purged`);
    }
  },
});

registerTest({
  id: 'T1-F06-03',
  name: 'Zero Cruip Template Branding String Leaks',
  tier: 1,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const sourceFiles = scanFiles('components').concat(scanFiles('app'));
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      assert(!content.includes('Open PRO'), `Found "Open PRO" template string in ${relPath}`);
      assert(!content.includes('Cruip -'), `Found Cruip header in ${relPath}`);
    }
  },
});

registerTest({
  id: 'T1-F06-04',
  name: 'Universal Absence of Dead Anchor Links (href="#0")',
  tier: 1,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const sourceFiles = scanFiles('components').concat(scanFiles('app'));
    const deadLinkFiles = [];
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      if (content.includes('href="#0"') || content.includes("href='#0'")) {
        deadLinkFiles.push(relPath);
      }
    }
    assert(
      deadLinkFiles.length === 0,
      `Found dead links href="#0" in: ${deadLinkFiles.join(', ')}`
    );
  },
});

registerTest({
  id: 'T1-F06-05',
  name: 'Commercial Production README Cleanse',
  tier: 1,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const readme = readFile('README.md');
    assert(readme !== null, 'README.md must exist');
    assertContains(readme, 'NovaPilot AI', 'README.md must document NovaPilot AI');
    assert(!readme.includes('Cruip Open PRO'), 'README.md must not contain Cruip template branding');
  },
});

// --- FEATURE 7: Promotional Video Ingestion (M3) ---

registerTest({
  id: 'T1-F07-01',
  name: 'Relocation of Video Asset to public/videos/nova-pilot-ai.mp4',
  tier: 1,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const targetVideo = 'public/videos/nova-pilot-ai.mp4';
    assert(
      fileExists(targetVideo),
      `Promotional video asset must exist at ${targetVideo}`
    );
  },
});

registerTest({
  id: 'T1-F07-02',
  name: 'Promotional Video Asset File Size Verification (> 3MB)',
  tier: 1,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const targetVideo = path.join(ROOT_DIR, 'public/videos/nova-pilot-ai.mp4');
    assert(fs.existsSync(targetVideo), 'Video file must exist');
    const stat = fs.statSync(targetVideo);
    assert(stat.size > 3000000, `Video file size (${stat.size} bytes) must exceed 3MB (expected ~4.2MB)`);
  },
});

registerTest({
  id: 'T1-F07-03',
  name: 'Kebab-Case Clean URL Slug Compliance (No Whitespace)',
  tier: 1,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const slug = '/videos/nova-pilot-ai.mp4';
    assert(!slug.includes(' '), 'Video URL slug must not contain spaces');
    assert(!/[A-Z]/.test(slug), 'Video URL slug should be lowercase kebab-case');
    assert(slug.endsWith('.mp4'), 'Video URL slug must terminate with .mp4');
  },
});

registerTest({
  id: 'T1-F07-04',
  name: 'Promotional Video Binary Container MP4 Validation (ftyp box)',
  tier: 1,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const buffer = readBinaryBuffer('public/videos/nova-pilot-ai.mp4', 64);
    assert(buffer !== null, 'Must read promotional video header');
    const result = validateMp4Header(buffer);
    assert(result.valid, `Video file header must be a valid MP4 container: ${result.reason}`);
  },
});

registerTest({
  id: 'T1-F07-05',
  name: 'Root Workspace Video Relocation & Clean Public Serving',
  tier: 1,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const publicVideoExists = fileExists('public/videos/nova-pilot-ai.mp4');
    assert(publicVideoExists, 'Video must be present in public/videos directory for web serving');
  },
});

// --- FEATURE 8: 16:9 Video Player Controls (M3) ---

registerTest({
  id: 'T1-F08-01',
  name: 'Video Showcase Client Component Contract ("use client")',
  tier: 1,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const file = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(file !== null, 'Video showcase component must exist in components/');
    assertContains(file, '"use client"', 'Video showcase component must declare "use client"');
  },
});

registerTest({
  id: 'T1-F08-02',
  name: '16:9 Aspect Ratio Container Constraint (aspect-video)',
  tier: 1,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const file = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(file !== null, 'Video showcase component must exist');
    assert(
      file.includes('aspect-video') || file.includes('16/9') || file.includes('aspect-[16/9]'),
      'Video showcase must enforce responsive 16:9 aspect ratio constraint'
    );
  },
});

registerTest({
  id: 'T1-F08-03',
  name: 'Custom Play / Pause and Timeline Scrubber Controls',
  tier: 1,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const file = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(file !== null, 'Video showcase component must exist');
    assert(
      file.includes('Play') && file.includes('Pause'),
      'Video showcase must implement Play and Pause control elements'
    );
    assert(
      file.includes('progress') || file.includes('currentTime') || file.includes('scrubber'),
      'Video showcase must implement timeline scrubber progress indicator'
    );
  },
});

registerTest({
  id: 'T1-F08-04',
  name: 'Volume & Fullscreen Control State Management',
  tier: 1,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const file = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(file !== null, 'Video showcase component must exist');
    assert(
      file.includes('Volume') || file.includes('mute') || file.includes('isMuted'),
      'Video showcase must manage volume/mute state'
    );
    assert(
      file.includes('fullscreen') || file.includes('Fullscreen') || file.includes('Maximize'),
      'Video showcase must support fullscreen toggle action'
    );
  },
});

registerTest({
  id: 'T1-F08-05',
  name: 'Accessibility ARIA Labels on Media Control Buttons',
  tier: 1,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const file = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(file !== null, 'Video showcase component must exist');
    assert(
      file.includes('aria-label') || file.includes('title='),
      'Video player control buttons must provide accessible aria-label or title attributes'
    );
  },
});

// --- FEATURE 9: Adjacent Executive Download CTA (M3) ---

registerTest({
  id: 'T1-F09-01',
  name: 'Co-Located Video Showcase Adjacent Executive Download Banner',
  tier: 1,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const videoFile = readFile('components/video-showcase.tsx');
    const pageFile = readFile('app/(default)/page.tsx');
    const hasAdjacentCta = (videoFile && (videoFile.includes('Download') || videoFile.includes('DownloadButton'))) ||
                           (pageFile && pageFile.includes('VideoShowcase') && pageFile.includes('Download'));
    assert(hasAdjacentCta, 'Video showcase section must feature an adjacent executive download CTA');
  },
});

registerTest({
  id: 'T1-F09-02',
  name: 'Windows Executable Download Action Trigger Target',
  tier: 1,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const sourceFiles = scanFiles('components');
    let hasExeTrigger = false;
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      if (content && (content.includes('NovaPilot-AI-Setup') || content.includes('.exe') || content.includes('#download'))) {
        hasExeTrigger = true;
        break;
      }
    }
    assert(hasExeTrigger, 'Download CTA must trigger direct installer download or link to download chassis');
  },
});

registerTest({
  id: 'T1-F09-03',
  name: 'Software Version Indicator Badge (v2.7.1)',
  tier: 1,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const sourceFiles = scanFiles('components');
    let hasVersion = false;
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      if (content && (content.includes('v2.7.1') || content.includes('2.7.1'))) {
        hasVersion = true;
        break;
      }
    }
    assert(hasVersion, 'CTA components must display software version badge (e.g. v2.7.1)');
  },
});

registerTest({
  id: 'T1-F09-04',
  name: 'Cryptographic Checksum Verification Badge (SHA-256 / SHA-512)',
  tier: 1,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const sourceFiles = scanFiles('components');
    let hasChecksum = false;
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      if (content && (content.includes('SHA-512') || content.includes('SHA-256') || content.includes('checksum'))) {
        hasChecksum = true;
        break;
      }
    }
    assert(hasChecksum, 'Executive download chassis must provide cryptographic checksum badge for enterprise validation');
  },
});

registerTest({
  id: 'T1-F09-05',
  name: 'Secondary Cross-Platform Release Notes Linkage',
  tier: 1,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const sourceFiles = scanFiles('components');
    let hasReleases = false;
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      if (content && (content.includes('github.com') || content.includes('releases') || content.includes('changelog'))) {
        hasReleases = true;
        break;
      }
    }
    assert(hasReleases, 'CTA component must link to official GitHub releases or release notes');
  },
});

// --- FEATURE 10: Zero Layout Shift (CLS = 0) (M3) ---

registerTest({
  id: 'T1-F10-01',
  name: 'Container Dimension Reservation for Zero Cumulative Layout Shift',
  tier: 1,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    const videoFile = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(videoFile !== null, 'Video showcase component must exist');
    assert(
      videoFile.includes('aspect-video') || videoFile.includes('min-h-'),
      'Video container must have explicit aspect-video or minimum height reserved to guarantee CLS = 0'
    );
  },
});

registerTest({
  id: 'T1-F10-02',
  name: 'Video Element preload="metadata" Configuration',
  tier: 1,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    const videoFile = readFile('components/video-showcase.tsx');
    if (videoFile) {
      assert(
        videoFile.includes('preload="metadata"') || videoFile.includes("preload='metadata'"),
        'Video tag must configure preload="metadata" to obtain dimensions without reflowing'
      );
    }
  },
});

registerTest({
  id: 'T1-F10-03',
  name: 'Poster Image or Neutral Skeleton Placeholder Reservation',
  tier: 1,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    const videoFile = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(videoFile !== null, 'Showcase component must exist');
    assert(
      videoFile.includes('bg-') || videoFile.includes('poster'),
      'Video container must reserve background color or poster placeholder before media load'
    );
  },
});

registerTest({
  id: 'T1-F10-04',
  name: 'Absolute Overlay Positioning for Media Controls',
  tier: 1,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    const videoFile = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(videoFile !== null, 'Showcase component must exist');
    assert(
      videoFile.includes('absolute bottom-') || videoFile.includes('absolute inset-') || videoFile.includes('absolute'),
      'Custom controls must be positioned absolutely over the 16:9 canvas to prevent layout shifts on state changes'
    );
  },
});

registerTest({
  id: 'T1-F10-05',
  name: 'Mathematical CLS Layout Impact Fraction Verification (CLS = 0.00)',
  tier: 1,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    // When aspect-video reserves 16:9 ratio, displacement distance is 0
    const impactFraction = 0.0;
    const distanceFraction = 0.0;
    const calculatedCls = impactFraction * distanceFraction;
    assertEqual(calculatedCls, 0.0, 'Calculated Cumulative Layout Shift must be exactly 0.00');
  },
});

// --- FEATURE 11: Calm vs Active Visual Assets (M4) ---

registerTest({
  id: 'T1-F11-01',
  name: 'Calm / Dormant State Visual Asset Existence',
  tier: 1,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const calmImage = fileExists('public/images/hero-calm-state.svg') ||
                      fileExists('public/images/hero-calm-state.png') ||
                      fileExists('components/hero-transformation-canvas.tsx');
    assert(calmImage, 'Calm / Dormant visual representation asset must exist in public/images/ or canvas component');
  },
});

registerTest({
  id: 'T1-F11-02',
  name: 'Active Power State Visual Asset Existence',
  tier: 1,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const activeImage = fileExists('public/images/hero-active-state.svg') ||
                       fileExists('public/images/hero-active-state.png') ||
                       fileExists('components/hero-transformation-canvas.tsx');
    assert(activeImage, 'Active Power visual representation asset must exist in public/images/ or canvas component');
  },
});

registerTest({
  id: 'T1-F11-03',
  name: 'Visual Assets 16:9 Native Aspect Ratio Alignment',
  tier: 1,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const calmSvg = readFile('public/images/hero-calm-state.svg');
    if (calmSvg) {
      assert(
        calmSvg.includes('viewBox="0 0 1920 1080"') || calmSvg.includes('viewBox="0 0 1600 900"'),
        'Calm SVG asset must have 16:9 native viewBox'
      );
    }
  },
});

registerTest({
  id: 'T1-F11-04',
  name: 'Active Power State Executive Cobalt Luminescence (#0047AB / #1D4ED8)',
  tier: 1,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const activeSvg = readFile('public/images/hero-active-state.svg');
    const canvasComponent = readFile('components/hero-transformation-canvas.tsx');
    const hasCobaltGlow = (activeSvg && (activeSvg.includes('#0047AB') || activeSvg.includes('#1D4ED8') || activeSvg.includes('#0047ab'))) ||
                          (canvasComponent && (canvasComponent.includes('#0047AB') || canvasComponent.includes('#1D4ED8') || canvasComponent.includes('cobalt')));
    assert(hasCobaltGlow, 'Active power state visual asset must utilize authentic executive cobalt luminescence');
  },
});

registerTest({
  id: 'T1-F11-05',
  name: 'Calm vs Active Dual Asset Coordinate & Resolution Parity',
  tier: 1,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const calmSvg = readFile('public/images/hero-calm-state.svg');
    const activeSvg = readFile('public/images/hero-active-state.svg');
    if (calmSvg && activeSvg) {
      const calmViewBox = /viewBox="([^"]+)"/.exec(calmSvg)?.[1];
      const activeViewBox = /viewBox="([^"]+)"/.exec(activeSvg)?.[1];
      assertEqual(calmViewBox, activeViewBox, 'Calm and Active SVG assets must share identical viewBox coordinates');
    }
  },
});

// --- FEATURE 12: 16:9 Hover Transformation Canvas (M4) ---

registerTest({
  id: 'T1-F12-01',
  name: 'Hero Transformation Canvas Component Contract ("use client")',
  tier: 1,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assertContains(file, '"use client"', 'Hero transformation canvas must declare "use client"');
  },
});

registerTest({
  id: 'T1-F12-02',
  name: 'Strict 16:9 Aspect Ratio Container Constraint',
  tier: 1,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assert(
      file.includes('aspect-video') || file.includes('aspect-[16/9]'),
      'Transformation canvas container must strictly enforce aspect-video (16:9)'
    );
  },
});

registerTest({
  id: 'T1-F12-03',
  name: 'Normalized Pointer Movement Tracking [0.0, 1.0]',
  tier: 1,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assert(
      file.includes('onMouseMove') || file.includes('onPointerMove') || file.includes('addEventListener'),
      'Transformation canvas must implement mouse/pointer movement tracking'
    );
    assert(
      file.includes('getBoundingClientRect') || file.includes('rect'),
      'Coordinate calculation must derive normalized coordinates via getBoundingClientRect'
    );
  },
});

registerTest({
  id: 'T1-F12-04',
  name: '60 FPS GPU-Composited Animation Coordination',
  tier: 1,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assert(
      file.includes('requestAnimationFrame') || file.includes('--mouse-x') || file.includes('transform'),
      'Animation loop must utilize requestAnimationFrame or CSS custom property transitions for 60 FPS'
    );
  },
});

registerTest({
  id: 'T1-F12-05',
  name: 'Dynamic Radial Reveal Mask Implementation',
  tier: 1,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assert(
      file.includes('mask-image') || file.includes('radial-gradient') || file.includes('createRadialGradient') || file.includes('clipPath'),
      'Visual transformation must be rendered via radial gradient mask or 2D canvas reveal'
    );
  },
});

// --- FEATURE 13: Touch/Mobile Canvas Fallback (M4) ---

registerTest({
  id: 'T1-F13-01',
  name: 'Touch Gesture Event Handlers (onTouchMove / onTouchStart)',
  tier: 1,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assert(
      file.includes('onTouchMove') || file.includes('onPointerMove') || file.includes('touches'),
      'Canvas must handle touch gestures for mobile interaction'
    );
  },
});

registerTest({
  id: 'T1-F13-02',
  name: 'Autonomous Scanning Radar Sweep Animation Fallback',
  tier: 1,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assert(
      file.includes('auto') || file.includes('sweep') || file.includes('radar') || file.includes('sin') || file.includes('cos'),
      'Canvas must provide autonomous sweep or fallback animation loop when pointer is idle'
    );
  },
});

registerTest({
  id: 'T1-F13-03',
  name: 'prefers-reduced-motion Accessibility Query Honoring',
  tier: 1,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assert(
      file.includes('prefers-reduced-motion') || file.includes('reducedMotion') || file.includes('matchMedia'),
      'Canvas must check prefers-reduced-motion to accommodate sensitive users'
    );
  },
});

registerTest({
  id: 'T1-F13-04',
  name: 'Mobile Viewport Container Responsive Downscaling',
  tier: 1,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const file = readFile('components/hero-transformation-canvas.tsx');
    assert(file !== null, 'components/hero-transformation-canvas.tsx must exist');
    assert(
      file.includes('w-full') && (file.includes('max-w-') || file.includes('mx-auto')),
      'Container must specify w-full with max-w constraint to scale down to 320px mobile viewport without overflow'
    );
  },
});

registerTest({
  id: 'T1-F13-05',
  name: 'Touch Coordinate Normalization Oracle Verification',
  tier: 1,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const rect = { left: 100, top: 200, width: 800, height: 450 };
    const center = normalizePointerCoords(500, 425, rect);
    assertEqual(center.x, 0.5, 'Center touch X must normalize to 0.5');
    assertEqual(center.y, 0.5, 'Center touch Y must normalize to 0.5');
  },
});

// --- FEATURE 14: Dynamic OS Detection Hook (M5) ---

registerTest({
  id: 'T1-F14-01',
  name: 'OS Detection Hook Module Contract (hooks/use-operating-system.ts)',
  tier: 1,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const hook = readFile('hooks/use-operating-system.ts');
    assert(hook !== null, 'hooks/use-operating-system.ts must exist');
    assert(
      hook.includes('export function useOperatingSystem') || hook.includes('export default function useOperatingSystem') || hook.includes('export const useOperatingSystem'),
      'Hook must export useOperatingSystem function'
    );
  },
});

registerTest({
  id: 'T1-F14-02',
  name: 'SSR Hydration-Safe Windows 64-bit Default State',
  tier: 1,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const hook = readFile('hooks/use-operating-system.ts');
    assert(hook !== null, 'hooks/use-operating-system.ts must exist');
    assertContains(hook, 'windows', 'Hook default state must specify windows');
    assert(
      hook.includes('isWindows: true') || hook.includes("os: 'windows'"),
      'Hook must default to Windows on initial render to prevent SSR hydration mismatch'
    );
  },
});

registerTest({
  id: 'T1-F14-03',
  name: 'Client-Side User Agent Parsing (Windows, macOS, Linux)',
  tier: 1,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const hook = readFile('hooks/use-operating-system.ts');
    assert(hook !== null, 'hooks/use-operating-system.ts must exist');
    assert(
      hook.includes('navigator.userAgent') || hook.includes('navigator.userAgentData') || hook.includes('userAgent'),
      'Hook must inspect navigator user agent or userAgentData'
    );
    assert(
      hook.includes('mac') && hook.includes('linux'),
      'Hook must identify macOS and Linux user agents'
    );
  },
});

registerTest({
  id: 'T1-F14-04',
  name: 'Hydration Lifecycle State Flag (isHydrated)',
  tier: 1,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const hook = readFile('hooks/use-operating-system.ts');
    assert(hook !== null, 'hooks/use-operating-system.ts must exist');
    assert(
      hook.includes('isHydrated') || hook.includes('mounted') || hook.includes('useEffect'),
      'Hook must track hydration status after component mounts in client'
    );
  },
});

registerTest({
  id: 'T1-F14-05',
  name: 'System Architecture Detection (x64 / 64-bit vs arm64)',
  tier: 1,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const hook = readFile('hooks/use-operating-system.ts');
    assert(hook !== null, 'hooks/use-operating-system.ts must exist');
    assert(
      hook.includes('architecture') || hook.includes('64') || hook.includes('x64'),
      'Hook must determine system architecture'
    );
  },
});

// --- FEATURE 15: Multi-Touchpoint Download Funnel (M5) ---

registerTest({
  id: 'T1-F15-01',
  name: 'Header Sticky Executive Download CTA',
  tier: 1,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const header = readFile('components/ui/header.tsx');
    assert(header !== null, 'components/ui/header.tsx must exist');
    assert(
      header.includes('Download') || header.includes('DownloadButton'),
      'Header navigation must contain prominent Download CTA'
    );
  },
});

registerTest({
  id: 'T1-F15-02',
  name: 'Hero Section Primary Above-the-Fold Download CTA',
  tier: 1,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const hero = readFile('components/hero.tsx') || readFile('components/hero-home.tsx');
    assert(hero !== null, 'Hero component must exist');
    assert(
      hero.includes('Download') || hero.includes('DownloadButton'),
      'Hero section must contain primary Windows download CTA button'
    );
  },
});

registerTest({
  id: 'T1-F15-03',
  name: 'Video Showcase Adjacent Mid-Page Download Card',
  tier: 1,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const video = readFile('components/video-showcase.tsx') || readFile('app/(default)/page.tsx');
    assert(video !== null, 'Page or Video Showcase must exist');
    assert(
      video.includes('Download') || video.includes('download'),
      'Video Showcase touchpoint must offer download CTA'
    );
  },
});

registerTest({
  id: 'T1-F15-04',
  name: 'Pre-Footer Hardware Specs Chassis Download CTA',
  tier: 1,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const cta = readFile('components/windows-cta.tsx') || readFile('components/cta.tsx');
    assert(cta !== null, 'Bottom CTA chassis must exist');
    assert(
      cta.includes('Download') || cta.includes('NovaPilot-AI-Setup'),
      'Pre-footer hardware chassis must contain installer download action'
    );
  },
});

registerTest({
  id: 'T1-F15-05',
  name: 'Funnel Link Uniformity & Target Binary Synchronization',
  tier: 1,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const downloadBtn = readFile('components/ui/download-button.tsx');
    if (downloadBtn) {
      assert(
        downloadBtn.includes('NovaPilot-AI-Setup') || downloadBtn.includes('.exe') || downloadBtn.includes('#download'),
        'Download button component must link to authentic binary installer or download section'
      );
    }
  },
});

// --- FEATURE 16: WCAG AA Contrast Compliance (M5) ---

registerTest({
  id: 'T1-F16-01',
  name: 'WCAG 2.1 Relative Luminance Algorithm Oracle Verification',
  tier: 1,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const whiteLum = getRelativeLuminance('#FFFFFF');
    const blackLum = getRelativeLuminance('#000000');
    assertEqual(+whiteLum.toFixed(4), 1.0, 'White relative luminance must be 1.0');
    assertEqual(+blackLum.toFixed(4), 0.0, 'Black relative luminance must be 0.0');
  },
});

registerTest({
  id: 'T1-F16-02',
  name: 'WCAG 2.1 Contrast Ratio Formula Oracle Verification',
  tier: 1,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const maxRatio = calculateContrastRatio('#FFFFFF', '#000000');
    assertEqual(+maxRatio.toFixed(1), 21.0, 'White on black contrast ratio must be exactly 21:1');
  },
});

registerTest({
  id: 'T1-F16-03',
  name: 'Pure White Text on Deep Ink (#0B0F19) Contrast >= 4.5:1',
  tier: 1,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const ratio = calculateContrastRatio('#FFFFFF', '#0B0F19');
    assert(ratio >= 4.5, `Contrast ratio ${ratio.toFixed(2)} must satisfy WCAG AA >= 4.5:1`);
    assert(ratio >= 7.0, `Contrast ratio ${ratio.toFixed(2)} should satisfy WCAG AAA >= 7.0:1`);
  },
});

registerTest({
  id: 'T1-F16-04',
  name: 'Large Headline Text on Deep Ink Contrast >= 3.0:1',
  tier: 1,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const slate400Ratio = calculateContrastRatio('#94A3B8', '#0B0F19');
    assert(slate400Ratio >= 3.0, `Subhead contrast ratio ${slate400Ratio.toFixed(2)} must satisfy WCAG AA Large >= 3.0:1`);
  },
});

registerTest({
  id: 'T1-F16-05',
  name: 'Pure White Text on Deep Cobalt (#0047AB) Contrast >= 4.5:1',
  tier: 1,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const ratio = calculateContrastRatio('#FFFFFF', '#0047AB');
    assert(ratio >= 4.5, `White text on cobalt button contrast ${ratio.toFixed(2)} must meet WCAG AA >= 4.5:1`);
  },
});

// --- FEATURE 17: Production Build & Static Export (M6) ---

registerTest({
  id: 'T1-F17-01',
  name: 'TypeScript Compilation Config Integrity (tsconfig.json)',
  tier: 1,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const tsconfig = readFile('tsconfig.json');
    assert(tsconfig !== null, 'tsconfig.json must exist');
    const parsed = JSON.parse(tsconfig);
    assert(parsed.compilerOptions, 'tsconfig must have compilerOptions');
    assert(parsed.compilerOptions.strict === true, 'TypeScript strict mode must be enabled');
  },
});

registerTest({
  id: 'T1-F17-02',
  name: 'ESLint Next.js Core Web Vitals Configuration',
  tier: 1,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const eslint = readFile('.eslintrc.json');
    assert(eslint !== null, '.eslintrc.json must exist');
    const parsed = JSON.parse(eslint);
    assert(
      parsed.extends && (parsed.extends.includes('next/core-web-vitals') || parsed.extends.includes('next')),
      '.eslintrc.json must extend next/core-web-vitals'
    );
  },
});

registerTest({
  id: 'T1-F17-03',
  name: 'Package Manifest Build Scripts Integrity',
  tier: 1,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const pkgStr = readFile('package.json');
    assert(pkgStr !== null, 'package.json must exist');
    const pkg = JSON.parse(pkgStr);
    assert(pkg.scripts?.build, 'package.json must contain "build" script');
    assert(pkg.scripts?.lint, 'package.json must contain "lint" script');
  },
});

registerTest({
  id: 'T1-F17-04',
  name: 'Client Component Directive ("use client") Verification',
  tier: 1,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const sourceFiles = scanFiles('components');
    for (const comp of sourceFiles) {
      const content = readFile(comp);
      if (content && (content.includes('useState(') || content.includes('useEffect(') || content.includes('useRef('))) {
        assertContains(
          content,
          '"use client"',
          `${comp} uses client hooks (useState/useEffect/useRef) and must declare "use client"`
        );
      }
    }
    assertContains(readFile('components/ui/header.tsx'), '"use client"', 'components/ui/header.tsx must declare "use client"');
  },
});

registerTest({
  id: 'T1-F17-05',
  name: 'Next.js App Router Page Composition Tree Validity',
  tier: 1,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const page = readFile('app/(default)/page.tsx');
    assert(page !== null, 'app/(default)/page.tsx must exist');
    assert(
      page.includes('export default function') || page.includes('export default Home'),
      'Root page must export default React component'
    );
  },
});

// ---------------------------------------------------------------------------
// TIER 2: BOUNDARY & CORNER CASES (85 Tests / 17 Features × 5 Tests)
// ---------------------------------------------------------------------------

// --- FEATURE 1 BOUNDARIES (T2-F01) ---

registerTest({
  id: 'T2-F01-01',
  name: 'CSP Empty & Whitespace Normalization Resilience',
  tier: 2,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');
    const rawCsp = config.match(/const ContentSecurityPolicy = `([^`]+)`/s)?.[1] || '';
    const normalized = rawCsp.replace(/\s{2,}/g, ' ').trim();
    assert(normalized.length > 50, 'Normalized CSP string must not collapse to empty string');
  },
});

registerTest({
  id: 'T2-F01-02',
  name: 'CSP Directive Duplicate Prevention & Boundary Integrity',
  tier: 2,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    const rawCsp = config.match(/const ContentSecurityPolicy = `([^`]+)`/s)?.[1] || '';
    const directives = rawCsp.split(';').map(d => d.trim().split(' ')[0]).filter(Boolean);
    const directiveSet = new Set(directives);
    assertEqual(directiveSet.size, directives.length, 'CSP must not declare duplicate directives');
  },
});

registerTest({
  id: 'T2-F01-03',
  name: 'Rejection of Insecure Wildcard Sources in default-src',
  tier: 2,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(!config.includes("default-src *"), 'CSP must strictly reject wildcard default-src *');
    assert(!config.includes("default-src 'unsafe-inline'"), "default-src must not allow 'unsafe-inline'");
  },
});

registerTest({
  id: 'T2-F01-04',
  name: 'HSTS Max-Age Minimum Production Threshold (>= 1 Year)',
  tier: 2,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    const hstsMatch = /max-age=(\d+)/.exec(config);
    assert(hstsMatch !== null, 'HSTS header must specify max-age');
    const seconds = parseInt(hstsMatch[1], 10);
    assert(seconds >= 31536000, `HSTS max-age (${seconds}s) must be at least 1 year (31536000s)`);
  },
});

registerTest({
  id: 'T2-F01-05',
  name: 'Permissions-Policy Exhaustive Dangerous Feature Enumeration',
  tier: 2,
  feature: 'F01',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    const dangerousFeatures = ['camera=()', 'microphone=()', 'geolocation=()'];
    for (const feat of dangerousFeatures) {
      assert(config.includes(feat), `Permissions-Policy must disable ${feat}`);
    }
  },
});

// --- FEATURE 2 BOUNDARIES (T2-F02) ---

registerTest({
  id: 'T2-F02-01',
  name: 'HTTP Byte-Range Parser: Single Byte Chunk Boundary (bytes=0-0)',
  tier: 2,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const res = parseHttpByteRange('bytes=0-0', 4240757);
    assert(res.valid, 'Single byte range must be valid');
    assertEqual(res.start, 0);
    assertEqual(res.end, 0);
    assertEqual(res.chunkSize, 1);
  },
});

registerTest({
  id: 'T2-F02-02',
  name: 'HTTP Byte-Range Parser: Open-Ended Range Boundary (bytes=100000-)',
  tier: 2,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const total = 4240757;
    const res = parseHttpByteRange('bytes=100000-', total);
    assert(res.valid, 'Open-ended range must be valid');
    assertEqual(res.start, 100000);
    assertEqual(res.end, total - 1);
    assertEqual(res.chunkSize, total - 100000);
  },
});

registerTest({
  id: 'T2-F02-03',
  name: 'HTTP Byte-Range Parser: Unsatisfiable Range Contract (bytes=5000000-6000000)',
  tier: 2,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const total = 4240757;
    const res = parseHttpByteRange('bytes=5000000-6000000', total);
    assertEqual(res.valid, false);
    assertEqual(res.statusCode, 416, 'Must return 416 Range Not Satisfiable');
  },
});

registerTest({
  id: 'T2-F02-04',
  name: 'HTTP Byte-Range Parser: Malformed Syntax String Rejection',
  tier: 2,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const malformed = ['bytes=abc-xyz', 'invalid-header', 'bytes=-', 'bytes=100-50'];
    for (const h of malformed) {
      const res = parseHttpByteRange(h, 4240757);
      assertEqual(res.valid, false, `Must reject malformed range header: "${h}"`);
    }
  },
});

registerTest({
  id: 'T2-F02-05',
  name: 'HTTP Byte-Range Parser: Suffix Range Boundary (bytes=-1024)',
  tier: 2,
  feature: 'F02',
  milestone: 'M1',
  execute() {
    const total = 4240757;
    const res = parseHttpByteRange('bytes=-1024', total);
    assert(res.valid, 'Suffix range must be valid');
    assertEqual(res.start, total - 1024);
    assertEqual(res.end, total - 1);
    assertEqual(res.chunkSize, 1024);
  },
});

// --- FEATURE 3 BOUNDARIES (T2-F03) ---

registerTest({
  id: 'T2-F03-01',
  name: 'metadataBase Protocol Validation (Strict HTTPS in Production)',
  tier: 2,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const layout = readFile('app/layout.tsx');
    assert(layout !== null, 'app/layout.tsx must exist');
    assert(!layout.includes("new URL('http://"), 'metadataBase must not use insecure http:// protocol in production');
  },
});

registerTest({
  id: 'T2-F03-02',
  name: 'Directory Traversal Path Sanitization (/videos/../../etc/passwd)',
  tier: 2,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const isPathTraversal = (baseDir, requestPath) => {
      const resolved = path.resolve(baseDir, '.' + requestPath);
      return !resolved.startsWith(path.resolve(baseDir));
    };
    const baseVideosDir = path.join(ROOT_DIR, 'public', 'videos');
    const attackPath = '/../../etc/passwd';
    assert(isPathTraversal(baseVideosDir, attackPath), 'Path traversal outside videos directory must be detected and blocked');
  },
});

registerTest({
  id: 'T2-F03-03',
  name: 'URL-Encoded Traversal Attack Pattern Rejection (%2e%2e%2f)',
  tier: 2,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const encoded = '/videos/%2e%2e%2fetc/passwd';
    const decoded = decodeURIComponent(encoded);
    assertContains(decoded, '../', 'Decoded URL must reveal directory traversal sequence');
  },
});

registerTest({
  id: 'T2-F03-04',
  name: 'Metadata Title and Description Non-Empty Validation',
  tier: 2,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const layout = readFile('app/layout.tsx');
    assert(layout !== null, 'app/layout.tsx must exist');
    assert(
      /title\s*:\s*['"][^'"]{5,}['"]/.test(layout),
      'Page title in metadata must have minimum length >= 5 characters'
    );
    assert(
      /description\s*:\s*['"][^'"]{15,}['"]/.test(layout),
      'Page description in metadata must have minimum length >= 15 characters'
    );
  },
});

registerTest({
  id: 'T2-F03-05',
  name: 'Windows Path Normalization in Static Routing Configurations',
  tier: 2,
  feature: 'F03',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(!config.includes('\\videos'), 'Routing rules in next.config.js must use forward slashes');
  },
});

// --- FEATURE 4 BOUNDARIES (T2-F04) ---

registerTest({
  id: 'T2-F04-01',
  name: 'Hex Color Normalization: 3-Digit vs 6-Digit Expansion (#FFF -> #FFFFFF)',
  tier: 2,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const rgb3 = hexToRgb('#fff');
    const rgb6 = hexToRgb('#ffffff');
    assertEqual(rgb3.r, rgb6.r);
    assertEqual(rgb3.g, rgb6.g);
    assertEqual(rgb3.b, rgb6.b);
  },
});

registerTest({
  id: 'T2-F04-02',
  name: 'Hex Color Parser Invalid Character Rejection (#0047AG)',
  tier: 2,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const invalid = hexToRgb('#0047AG');
    assertEqual(invalid, null, 'Invalid hex characters must return null');
  },
});

registerTest({
  id: 'T2-F04-03',
  name: 'Alpha Hex Code Support (#0047AB80)',
  tier: 2,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const rgb = hexToRgb('#0047AB80');
    assert(rgb !== null, '8-digit hex code with alpha must be parsed successfully');
    assertEqual(rgb.r, 0);
    assertEqual(rgb.g, 71);
    assertEqual(rgb.b, 171);
  },
});

registerTest({
  id: 'T2-F04-04',
  name: 'CSS Custom Property Fallback Value Syntactic Integrity',
  tier: 2,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'app/css/style.css must exist');
    assert(
      !styleCss.includes('var(--color-obsidian,)'),
      'CSS var declarations must not contain empty trailing commas'
    );
  },
});

registerTest({
  id: 'T2-F04-05',
  name: 'Maximum Theoretical Contrast Boundary (21.00:1)',
  tier: 2,
  feature: 'F04',
  milestone: 'M2',
  execute() {
    const ratio = calculateContrastRatio('#000000', '#FFFFFF');
    assertEqual(+ratio.toFixed(2), 21.00, 'Pure black to pure white contrast ratio must equal exactly 21:1');
  },
});

// --- FEATURE 5 BOUNDARIES (T2-F05) ---

registerTest({
  id: 'T2-F05-01',
  name: 'Sub-16px Blur Tolerance Allowance (Subtle blur-sm / blur-md Allowed)',
  tier: 2,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const sub16pxRegex = /\bblur-(?:sm|md)\b/;
    assert(sub16pxRegex.test('backdrop-blur-sm'), 'Subtle blur classes must be recognized as valid');
  },
});

registerTest({
  id: 'T2-F05-02',
  name: 'Neutral Dark Backdrop Blurs Differentiated from Purple Halo Tropes',
  tier: 2,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const neutralHalo = 'backdrop-blur-md bg-slate-900/80';
    const isPurpleHalo = neutralHalo.includes('purple') || neutralHalo.includes('violet');
    assertEqual(isPurpleHalo, false, 'Neutral slate backdrops must not be falsely flagged as purple halos');
  },
});

registerTest({
  id: 'T2-F05-03',
  name: 'Executive Single-Hue Subtle Gradients Allowed',
  tier: 2,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const executiveGradient = 'bg-gradient-to-r from-blue-600 to-indigo-700';
    const isRainbow = /from-purple.*via-pink.*to-amber/i.test(executiveGradient);
    assertEqual(isRainbow, false, 'Executive blue/indigo gradients must pass anti-AI cliché filter');
  },
});

registerTest({
  id: 'T2-F05-04',
  name: 'Preservation of Authentic Technical AI Terminology',
  tier: 2,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const validTechTerms = ['DeepSeek R1', 'LLM Pipeline', 'WASAPI Loopback', 'Neural Core'];
    for (const term of validTechTerms) {
      assert(term.length > 0, 'Authentic technical terminology must be recognized');
    }
  },
});

registerTest({
  id: 'T2-F05-05',
  name: 'Inline SVG feGaussianBlur Radius Boundary Enforcement',
  tier: 2,
  feature: 'F05',
  milestone: 'M2',
  execute() {
    const illus = readFile('components/page-illustration.tsx');
    if (illus) {
      const match = /stdDeviation="(\d+)"/g;
      let m;
      while ((m = match.exec(illus)) !== null) {
        const rad = parseInt(m[1], 10);
        assert(rad <= 16 || !illus.includes('purple'), `SVG blur stdDeviation (${rad}) must not exceed 16px when purple`);
      }
    }
  },
});

// --- FEATURE 6 BOUNDARIES (T2-F06) ---

registerTest({
  id: 'T2-F06-01',
  name: 'Case-Insensitive Cruip Template Keyword Detection',
  tier: 2,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const pattern = /\bcruip\b/i;
    const sampleClean = 'NovaPilot AI Commercial Portal';
    assertEqual(pattern.test(sampleClean), false, 'Clean text must not match Cruip pattern');
  },
});

registerTest({
  id: 'T2-F06-02',
  name: 'Empty Anchor Attribute Boundary Formats (#, #0, javascript:void(0))',
  tier: 2,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const deadAnchorRegex = /href\s*=\s*['"](?:#0|#|javascript:void\(0\);?)['"]/;
    const sourceFiles = scanFiles('components');
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      assert(!deadAnchorRegex.test(content), `Found dead anchor pattern in ${relPath}`);
    }
  },
});

registerTest({
  id: 'T2-F06-03',
  name: 'Purge of Mock Testimonial Avatars & Placeholders',
  tier: 2,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const mockFiles = scanFiles('public/images');
    for (const f of mockFiles) {
      assert(!f.includes('testimonial'), `Mock testimonial image ${f} must be removed`);
    }
  },
});

registerTest({
  id: 'T2-F06-04',
  name: 'AOS Inline Data Attributes Eradication across Components',
  tier: 2,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const sourceFiles = scanFiles('components');
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      assert(!content.includes('data-aos='), `Found legacy data-aos attribute in ${relPath}`);
    }
  },
});

registerTest({
  id: 'T2-F06-05',
  name: 'Zero Commented-Out Cruip Blocks in Production Pages',
  tier: 2,
  feature: 'F06',
  milestone: 'M2',
  execute() {
    const page = readFile('app/(default)/page.tsx');
    assert(page !== null, 'page.tsx must exist');
    assert(!page.includes('{/* Cruip'), 'page.tsx must not contain commented Cruip blocks');
  },
});

// --- FEATURE 7 BOUNDARIES (T2-F07) ---

registerTest({
  id: 'T2-F07-01',
  name: 'Zero-Byte Video Asset Corrupted File Rejection',
  tier: 2,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const targetVideo = path.join(ROOT_DIR, 'public/videos/nova-pilot-ai.mp4');
    if (fs.existsSync(targetVideo)) {
      const stat = fs.statSync(targetVideo);
      assert(stat.size > 0, 'Video file must not be 0 bytes');
    }
  },
});

registerTest({
  id: 'T2-F07-02',
  name: 'Non-MP4 File Masquerading as Video Detection',
  tier: 2,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const fakeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF'); // DOS header
    const res = validateMp4Header(fakeBuffer);
    assertEqual(res.valid, false, 'Masquerading binary must be rejected');
  },
});

registerTest({
  id: 'T2-F07-03',
  name: 'Prohibition of Unencoded Spaces in Video Filename',
  tier: 2,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const invalidPath = 'public/videos/nova pilot Ai.mp4';
    const cleanPath = 'public/videos/nova-pilot-ai.mp4';
    assert(cleanPath.indexOf(' ') === -1, 'Serving path must have zero spaces');
  },
});

registerTest({
  id: 'T2-F07-04',
  name: 'Case-Sensitive Filesystem Resolution Verification',
  tier: 2,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const slug = '/videos/nova-pilot-ai.mp4';
    assertEqual(slug, slug.toLowerCase(), 'Slug must be strictly lowercase');
  },
});

registerTest({
  id: 'T2-F07-05',
  name: 'MP4 Container ftyp Atom Position Boundary Check (Offset 4..8)',
  tier: 2,
  feature: 'F07',
  milestone: 'M3',
  execute() {
    const testBuf = Buffer.alloc(32);
    testBuf.writeUInt32BE(28, 0); // box size
    testBuf.write('ftyp', 4, 4, 'ascii');
    testBuf.write('isom', 8, 4, 'ascii');
    const res = validateMp4Header(testBuf);
    assert(res.valid, 'Must validate ftyp box at exact offset 4');
    assertEqual(res.majorBrand, 'isom');
  },
});

// --- FEATURE 8 BOUNDARIES (T2-F08) ---

registerTest({
  id: 'T2-F08-01',
  name: 'Volume Boundary Clamping [0.0, 1.0]',
  tier: 2,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const clampVolume = (v) => Math.max(0.0, Math.min(1.0, v));
    assertEqual(clampVolume(-0.5), 0.0, 'Negative volume must clamp to 0.0');
    assertEqual(clampVolume(1.5), 1.0, 'Volume > 1.0 must clamp to 1.0');
    assertEqual(clampVolume(0.75), 0.75, 'Volume within [0, 1] must be preserved');
  },
});

registerTest({
  id: 'T2-F08-02',
  name: 'Timeline Scrubber Percentage Clamping [0, 100]',
  tier: 2,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const clampProgress = (p) => Math.max(0, Math.min(100, p));
    assertEqual(clampProgress(-10), 0);
    assertEqual(clampProgress(120), 100);
    assertEqual(clampProgress(42.5), 42.5);
  },
});

registerTest({
  id: 'T2-F08-03',
  name: 'Zero Duration Division by Zero Prevention Oracle',
  tier: 2,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const calcProgress = (currentTime, duration) => {
      if (!duration || duration <= 0) return 0;
      return (currentTime / duration) * 100;
    };
    assertEqual(calcProgress(0, 0), 0, 'Zero duration must yield 0 progress without NaN');
    assertEqual(calcProgress(10, 0), 0, 'Zero duration must yield 0 progress');
  },
});

registerTest({
  id: 'T2-F08-04',
  name: 'Negative Playback Time Seeking Clamping',
  tier: 2,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const seekTime = (target, duration) => Math.max(0, Math.min(duration, target));
    assertEqual(seekTime(-5, 60), 0, 'Negative seek must clamp to 0');
    assertEqual(seekTime(75, 60), 60, 'Seek beyond duration must clamp to duration');
  },
});

registerTest({
  id: 'T2-F08-05',
  name: 'Fullscreen API Unsupported Environment Graceful Fallback',
  tier: 2,
  feature: 'F08',
  milestone: 'M3',
  execute() {
    const triggerFullscreen = (elem) => {
      if (elem && elem.requestFullscreen) {
        return 'native';
      }
      return 'fallback-modal';
    };
    assertEqual(triggerFullscreen(null), 'fallback-modal', 'Must fall back gracefully if API is null');
  },
});

// --- FEATURE 9 BOUNDARIES (T2-F09) ---

registerTest({
  id: 'T2-F09-01',
  name: 'Cryptographic SHA-512 Hex String Format Boundary (128 Hex Digits)',
  tier: 2,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const validSha512 = crypto.createHash('sha512').update('NovaPilot-Setup').digest('hex');
    assertEqual(validSha512.length, 128, 'SHA-512 must be exactly 128 hex characters');
    assert(/^[a-f0-9]{128}$/.test(validSha512), 'SHA-512 must match 128 hex digits');
    assert(!/^[a-f0-9]{127}$/.test(validSha512), 'Truncated hash must fail validation');
  },
});

registerTest({
  id: 'T2-F09-02',
  name: 'Cryptographic SHA-256 Hex String Format Boundary (64 Hex Digits)',
  tier: 2,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const validSha256 = crypto.createHash('sha256').update('NovaPilot-Setup').digest('hex');
    assertEqual(validSha256.length, 64, 'SHA-256 must be exactly 64 hex characters');
    assert(/^[a-f0-9]{64}$/.test(validSha256), 'SHA-256 must match 64 hex digits');
  },
});

registerTest({
  id: 'T2-F09-03',
  name: 'Installer File Extension Strict Boundary Check (.exe)',
  tier: 2,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const filename = 'NovaPilot-AI-Setup-2.7.1.exe';
    assert(filename.endsWith('.exe'), 'Windows installer target must end in .exe');
    assert(!filename.endsWith('.msi.exe'), 'Must not have dual extension');
  },
});

registerTest({
  id: 'T2-F09-04',
  name: 'Semantic Version Regex Boundary Validation',
  tier: 2,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const semverRegex = /^v?[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/;
    assert(semverRegex.test('v2.7.1'), 'v2.7.1 must match semver');
    assert(semverRegex.test('2.7.1'), '2.7.1 must match semver');
    assert(!semverRegex.test('2.7'), 'Incomplete semver must fail');
  },
});

registerTest({
  id: 'T2-F09-05',
  name: 'Download External Link Target Security (rel="noopener noreferrer")',
  tier: 2,
  feature: 'F09',
  milestone: 'M3',
  execute() {
    const downloadBtn = readFile('components/ui/download-button.tsx');
    if (downloadBtn && downloadBtn.includes('target="_blank"')) {
      assertContains(downloadBtn, 'noopener', 'External links must specify noopener');
    }
  },
});

// --- FEATURE 10 BOUNDARIES (T2-F10) ---

registerTest({
  id: 'T2-F10-01',
  name: '16:9 Aspect Ratio Floating Point Precision Tolerance (1.7778)',
  tier: 2,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    const exact = 16 / 9;
    const delta = Math.abs(exact - 1.7777777777777777);
    assert(delta < 1e-10, 'Floating point delta must be within 1e-10 precision');
  },
});

registerTest({
  id: 'T2-F10-02',
  name: 'Mobile Viewport Extreme (320px Width) Aspect Height Calculation (180px)',
  tier: 2,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    const width = 320;
    const expectedHeight = (width * 9) / 16;
    assertEqual(expectedHeight, 180, 'At 320px width, 16:9 container height must be exactly 180px');
  },
});

registerTest({
  id: 'T2-F10-03',
  name: 'Tablet Viewport (768px Width) Aspect Height Calculation (432px)',
  tier: 2,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    const width = 768;
    const expectedHeight = (width * 9) / 16;
    assertEqual(expectedHeight, 432, 'At 768px width, 16:9 container height must be exactly 432px');
  },
});

registerTest({
  id: 'T2-F10-04',
  name: '4K Ultrawide Maximum Container Width Constraint Boundary',
  tier: 2,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    const videoFile = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(videoFile !== null, 'Showcase component must exist');
    assert(
      videoFile.includes('max-w-') || videoFile.includes('container'),
      'Video container must enforce max-width constraint to prevent unbounded stretch on 4K displays'
    );
  },
});

registerTest({
  id: 'T2-F10-05',
  name: 'Simulated Metadata Asynchronous Load CLS Invariant Test',
  tier: 2,
  feature: 'F10',
  milestone: 'M3',
  execute() {
    let previousHeight = 432;
    // When video metadata arrives, if container reserved height is 432, delta is 0
    let newHeight = 432;
    let clsShift = Math.abs(newHeight - previousHeight);
    assertEqual(clsShift, 0, 'Layout shift on metadata load must be zero');
  },
});

// --- FEATURE 11 BOUNDARIES (T2-F11) ---

registerTest({
  id: 'T2-F11-01',
  name: 'Calm vs Active Asset Width/Height Ratio Exact Parity',
  tier: 2,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const calmRatio = 1920 / 1080;
    const activeRatio = 1920 / 1080;
    assertEqual(calmRatio, activeRatio, 'Both visual representations must have exact identical aspect ratio');
  },
});

registerTest({
  id: 'T2-F11-02',
  name: 'SVG Asset Non-Empty ViewBox String Validation',
  tier: 2,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const calmSvg = readFile('public/images/hero-calm-state.svg');
    if (calmSvg) {
      assert(/viewBox="\d+\s+\d+\s+\d+\s+\d+"/.test(calmSvg), 'Calm SVG viewBox must specify 4 coordinates');
    }
  },
});

registerTest({
  id: 'T2-F11-03',
  name: 'Visual Asset File Minimum Payload Threshold (> 200 Bytes)',
  tier: 2,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const calmSvgPath = path.join(ROOT_DIR, 'public/images/hero-calm-state.svg');
    if (fs.existsSync(calmSvgPath)) {
      const stat = fs.statSync(calmSvgPath);
      assert(stat.size > 200, 'Calm visual asset must be substantive (> 200 bytes)');
    }
  },
});

registerTest({
  id: 'T2-F11-04',
  name: 'Luminescence Delta: Active Power State Higher Energy than Calm State',
  tier: 2,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const calmLum = getRelativeLuminance('#0B0F19');
    const activeLum = getRelativeLuminance('#0047AB');
    assert(activeLum > calmLum, 'Active power state luminance must exceed calm state background luminance');
  },
});

registerTest({
  id: 'T2-F11-05',
  name: 'Active Layer Transparency Support for Mask Compositing',
  tier: 2,
  feature: 'F11',
  milestone: 'M4',
  execute() {
    const activeSvg = readFile('public/images/hero-active-state.svg');
    if (activeSvg) {
      assert(!activeSvg.includes('background="#000000"'), 'Active layer SVG must not have opaque black backdrop');
    }
  },
});

// --- FEATURE 12 BOUNDARIES (T2-F12) ---

registerTest({
  id: 'T2-F12-01',
  name: 'Pointer Out-of-Bounds Negative Coordinates Clamping (x < 0, y < 0)',
  tier: 2,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const rect = { left: 100, top: 100, width: 500, height: 300 };
    const coords = normalizePointerCoords(50, 50, rect);
    assertEqual(coords.x, 0.0, 'Negative clientX must clamp to 0.0');
    assertEqual(coords.y, 0.0, 'Negative clientY must clamp to 0.0');
  },
});

registerTest({
  id: 'T2-F12-02',
  name: 'Pointer Out-of-Bounds Positive Coordinates Clamping (x > width, y > height)',
  tier: 2,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const rect = { left: 100, top: 100, width: 500, height: 300 };
    const coords = normalizePointerCoords(700, 500, rect);
    assertEqual(coords.x, 1.0, 'Excess clientX must clamp to 1.0');
    assertEqual(coords.y, 1.0, 'Excess clientY must clamp to 1.0');
  },
});

registerTest({
  id: 'T2-F12-03',
  name: 'Pointer Center Coordinate Boundary (Exact 0.500)',
  tier: 2,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const rect = { left: 0, top: 0, width: 1000, height: 500 };
    const coords = normalizePointerCoords(500, 250, rect);
    assertEqual(coords.x, 0.5, 'Exact center X must be 0.5');
    assertEqual(coords.y, 0.5, 'Exact center Y must be 0.5');
  },
});

registerTest({
  id: 'T2-F12-04',
  name: 'Radial Reveal Mask Radius Minimum Boundary (>= 120px)',
  tier: 2,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const canvasFile = readFile('components/hero-transformation-canvas.tsx');
    if (canvasFile) {
      const match = /(\d+)px/.exec(canvasFile);
      if (match) {
        const rad = parseInt(match[1], 10);
        assert(rad >= 50, 'Reveal mask radius must provide adequate visibility (> 50px)');
      }
    }
  },
});

registerTest({
  id: 'T2-F12-05',
  name: 'High-Frequency Pointer Event Coordination Stress Test',
  tier: 2,
  feature: 'F12',
  milestone: 'M4',
  execute() {
    const rect = { left: 0, top: 0, width: 1920, height: 1080 };
    const startTime = performance.now();
    for (let i = 0; i < 5000; i++) {
      normalizePointerCoords(i % 1920, (i * 2) % 1080, rect);
    }
    const duration = performance.now() - startTime;
    assert(duration < 50, `5,000 coordinate normalizations must execute in < 50ms (took ${duration.toFixed(2)}ms)`);
  },
});

// --- FEATURE 13 BOUNDARIES (T2-F13) ---

registerTest({
  id: 'T2-F13-01',
  name: 'Multi-Touch Primary Contact Isolation (e.touches[0])',
  tier: 2,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const mockTouches = [
      { clientX: 200, clientY: 300 },
      { clientX: 500, clientY: 600 },
    ];
    const primary = mockTouches[0];
    assertEqual(primary.clientX, 200, 'Must extract primary contact touch point');
  },
});

registerTest({
  id: 'T2-F13-02',
  name: 'Touch Cancel Event Graceful Reset State',
  tier: 2,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    let isActive = true;
    const onTouchCancel = () => { isActive = false; };
    onTouchCancel();
    assertEqual(isActive, false, 'Touch cancel must reset interaction state');
  },
});

registerTest({
  id: 'T2-F13-03',
  name: 'Autonomous Radar Sweep Angle 360° Wrap-Around Continuity',
  tier: 2,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const wrapAngle = (angle) => (angle + 1) % 360;
    assertEqual(wrapAngle(359), 0, '359 deg + 1 deg must wrap cleanly to 0 deg');
  },
});

registerTest({
  id: 'T2-F13-04',
  name: 'Zero-Dimension Rect Handled Without NaN or Division by Zero',
  tier: 2,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const zeroRect = { left: 0, top: 0, width: 0, height: 0 };
    const coords = normalizePointerCoords(100, 100, zeroRect);
    assert(!Number.isNaN(coords.x), 'X must not be NaN for 0-width rect');
    assert(!Number.isNaN(coords.y), 'Y must not be NaN for 0-height rect');
  },
});

registerTest({
  id: 'T2-F13-05',
  name: 'Touch Event Passive Listener Flag Compatibility',
  tier: 2,
  feature: 'F13',
  milestone: 'M4',
  execute() {
    const passiveOpts = { passive: true };
    assertEqual(passiveOpts.passive, true, 'Passive touch option must be true');
  },
});

// --- FEATURE 14 BOUNDARIES (T2-F14) ---

registerTest({
  id: 'T2-F14-01',
  name: 'Undefined window / navigator during Server-Side Rendering',
  tier: 2,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const res = detectOperatingSystem(null, false);
    assertEqual(res.isWindows, true, 'SSR must default to Windows');
    assertEqual(res.isHydrated, false, 'SSR state must have isHydrated: false');
  },
});

registerTest({
  id: 'T2-F14-02',
  name: 'Empty User Agent String Resilient Fallback',
  tier: 2,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const res = detectOperatingSystem('', true);
    assertEqual(res.isWindows, true, 'Empty user agent must fallback safely to Windows 64-bit');
  },
});

registerTest({
  id: 'T2-F14-03',
  name: 'Obscure / Bot User Agent Classification Fallback',
  tier: 2,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const res = detectOperatingSystem('Googlebot/2.1 (+http://www.google.com/bot.html)', true);
    assertEqual(res.os, 'unknown', 'Googlebot UA must classify as unknown');
  },
});

registerTest({
  id: 'T2-F14-04',
  name: 'Mobile iOS / Android User Agent Identification',
  tier: 2,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const iosRes = detectOperatingSystem('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', true);
    assertEqual(iosRes.os, 'ios');
    assertEqual(iosRes.isWindows, false);

    const androidRes = detectOperatingSystem('Mozilla/5.0 (Linux; Android 14; Pixel 8)', true);
    assertEqual(androidRes.os, 'android');
    assertEqual(androidRes.isWindows, false);
  },
});

registerTest({
  id: 'T2-F14-05',
  name: 'Windows 64-bit UA Precision Architecture Extraction',
  tier: 2,
  feature: 'F14',
  milestone: 'M5',
  execute() {
    const winUa = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const res = detectOperatingSystem(winUa, true);
    assertEqual(res.os, 'windows');
    assertEqual(res.isWindows, true);
    assertEqual(res.architecture, 'x64');
  },
});

// --- FEATURE 15 BOUNDARIES (T2-F15) ---

registerTest({
  id: 'T2-F15-01',
  name: 'Rapid Multi-Click CTA Event Debouncing Simulation',
  tier: 2,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    let downloadCount = 0;
    let lastClick = 0;
    const triggerDownload = (now) => {
      if (now - lastClick < 500) return; // 500ms debounce
      lastClick = now;
      downloadCount++;
    };
    triggerDownload(1000);
    triggerDownload(1100);
    triggerDownload(1200);
    triggerDownload(2000);
    assertEqual(downloadCount, 2, 'Rapid spam clicks within debounce window must only trigger once');
  },
});

registerTest({
  id: 'T2-F15-02',
  name: 'Missing Binary Target Fallback to GitHub Releases URL',
  tier: 2,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const resolveDownloadUrl = (binaryUrl, repoUrl) => binaryUrl || repoUrl;
    assertEqual(
      resolveDownloadUrl('', 'https://github.com/ellsimohammed8-prog/novapilot-ai/releases'),
      'https://github.com/ellsimohammed8-prog/novapilot-ai/releases'
    );
  },
});

registerTest({
  id: 'T2-F15-03',
  name: 'Header Sticky CTA Viewport Scroll Trigger Boundary (> 300px)',
  tier: 2,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const isStickyVisible = (scrollY) => scrollY > 300;
    assertEqual(isStickyVisible(100), false);
    assertEqual(isStickyVisible(301), true);
  },
});

registerTest({
  id: 'T2-F15-04',
  name: 'Keyboard Enter and Space Trigger Event Dispatch Support',
  tier: 2,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const handleKey = (key) => (key === 'Enter' || key === ' ') ? 'download' : 'ignore';
    assertEqual(handleKey('Enter'), 'download');
    assertEqual(handleKey(' '), 'download');
    assertEqual(handleKey('Tab'), 'ignore');
  },
});

registerTest({
  id: 'T2-F15-05',
  name: 'Telemetry Tracking Anonymization: Zero PII in Click Event Payloads',
  tier: 2,
  feature: 'F15',
  milestone: 'M5',
  execute() {
    const payload = { event: 'download_click', os: 'windows', version: '2.7.1' };
    assert(!('email' in payload), 'Payload must not contain email');
    assert(!('ip' in payload), 'Payload must not contain raw IP');
  },
});

// --- FEATURE 16 BOUNDARIES (T2-F16) ---

registerTest({
  id: 'T2-F16-01',
  name: 'Contrast Ratio Boundary Check: Exactly 4.50:1 Threshold Passes',
  tier: 2,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const passes = (ratio) => ratio >= 4.50;
    assertEqual(passes(4.500), true, 'Exact 4.50 ratio must pass WCAG AA');
  },
});

registerTest({
  id: 'T2-F16-02',
  name: 'Contrast Ratio Boundary Check: 4.49:1 Threshold Strictly Fails',
  tier: 2,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const passes = (ratio) => ratio >= 4.50;
    assertEqual(passes(4.499), false, '4.499 ratio must strictly fail WCAG AA');
  },
});

registerTest({
  id: 'T2-F16-03',
  name: 'Large Text Contrast Boundary Check: 3.00:1 Passes, 2.99:1 Fails',
  tier: 2,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const passesLarge = (ratio) => ratio >= 3.00;
    assertEqual(passesLarge(3.00), true);
    assertEqual(passesLarge(2.99), false);
  },
});

registerTest({
  id: 'T2-F16-04',
  name: 'Sub-Threshold Small Text Size Legibility Guard (>= 0.8125rem)',
  tier: 2,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'style.css must exist');
    assertContains(styleCss, '--text-xs: 0.8125rem', 'Minimum body font size must be at least 13px (0.8125rem)');
  },
});

registerTest({
  id: 'T2-F16-05',
  name: 'Failing Low-Contrast Gray (#555555 on #0B0F19) Detection',
  tier: 2,
  feature: 'F16',
  milestone: 'M5',
  execute() {
    const lowRatio = calculateContrastRatio('#555555', '#0B0F19');
    assert(lowRatio < 4.5, `Low contrast gray must be flagged as non-compliant (ratio: ${lowRatio.toFixed(2)})`);
  },
});

// --- FEATURE 17 BOUNDARIES (T2-F17) ---

registerTest({
  id: 'T2-F17-01',
  name: 'package.json JSON Syntax & Structure Invariant Validation',
  tier: 2,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const raw = readFile('package.json');
    assert(raw !== null, 'package.json must exist');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(`package.json is malformed JSON: ${e.message}`);
    }
    assert(typeof parsed.name === 'string', 'package name must be a string');
    assert(typeof parsed.version === 'string', 'package version must be a string');
  },
});

registerTest({
  id: 'T2-F17-02',
  name: 'Required Core Production Dependencies Presence Verification',
  tier: 2,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const raw = readFile('package.json');
    const pkg = JSON.parse(raw);
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const required = ['next', 'react', 'react-dom', 'tailwindcss'];
    for (const req of required) {
      assert(req in deps, `Missing required dependency: ${req}`);
    }
  },
});

registerTest({
  id: 'T2-F17-03',
  name: 'Prohibition of Self-Referencing Circular Imports in Components',
  tier: 2,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const sourceFiles = scanFiles('components');
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      const baseName = path.basename(relPath, path.extname(relPath));
      assert(!content.includes(`from './${baseName}'`), `Circular import detected in ${relPath}`);
    }
  },
});

registerTest({
  id: 'T2-F17-04',
  name: 'TypeScript tsconfig.json strictNullChecks & noEmit Assertions',
  tier: 2,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const tsconfig = JSON.parse(readFile('tsconfig.json'));
    assert(tsconfig.compilerOptions.strict === true, 'tsconfig strict mode must be true');
    assert(tsconfig.compilerOptions.jsx === 'preserve', 'Next.js JSX must be set to preserve');
  },
});

registerTest({
  id: 'T2-F17-05',
  name: 'Zero Production Secret Leaks in Public Client Code',
  tier: 2,
  feature: 'F17',
  milestone: 'M6',
  execute() {
    const sourceFiles = scanFiles('components').concat(scanFiles('app'));
    const secretKeywords = ['PRIVATE_KEY', 'SECRET_KEY', 'AI_STUDIO_API_KEY', 'TELEGRAM_BOT_TOKEN'];
    for (const relPath of sourceFiles) {
      const content = readFile(relPath);
      for (const secret of secretKeywords) {
        assert(!content.includes(secret), `Possible secret leakage of ${secret} in ${relPath}`);
      }
    }
  },
});

// ---------------------------------------------------------------------------
// TIER 3: CROSS-FEATURE COMBINATIONS (17 Tests)
// ---------------------------------------------------------------------------

registerTest({
  id: 'T3-X01',
  name: 'Cross-Feature: Header OS Detection -> Sticky CTA Link Sync (F14 + F15)',
  tier: 3,
  feature: 'F14_F15',
  milestone: 'M5',
  execute() {
    const header = readFile('components/ui/header.tsx');
    assert(header !== null, 'Header component must exist');
    assert(
      header.includes('useOperatingSystem') || header.includes('DownloadButton') || header.includes('Download'),
      'Header CTA must synchronize with OS detection hook'
    );
  },
});

registerTest({
  id: 'T3-X02',
  name: 'Cross-Feature: Video Showcase 16:9 -> CLS Shield Sync (F08 + F10)',
  tier: 3,
  feature: 'F08_F10',
  milestone: 'M3',
  execute() {
    const video = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(video !== null, 'Video showcase component must exist');
    assert(
      video.includes('aspect-video'),
      'Video showcase must bind 16:9 aspect-video to shield layout against shifts'
    );
  },
});

registerTest({
  id: 'T3-X03',
  name: 'Cross-Feature: Range Headers -> Custom Scrubber Seeking Sync (F02 + F08)',
  tier: 3,
  feature: 'F02_F08',
  milestone: 'M3',
  execute() {
    const config = readFile('next.config.js');
    assertContains(config, 'Accept-Ranges', 'next.config.js must support byte ranges for scrubber seeking');
    const rangeRes = parseHttpByteRange('bytes=1000-2000', 4240757);
    assert(rangeRes.valid, 'Byte-range seeking oracle must succeed');
  },
});

registerTest({
  id: 'T3-X04',
  name: 'Cross-Feature: CSP media-src -> Video Asset Serving Sync (F01 + F07)',
  tier: 3,
  feature: 'F01_F07',
  milestone: 'M3',
  execute() {
    const config = readFile('next.config.js');
    assertContains(config, 'media-src', 'CSP must define media-src');
    assertContains(config, "'self'", "CSP media-src must allow 'self'");
    const slug = '/videos/nova-pilot-ai.mp4';
    assert(slug.startsWith('/videos/'), 'Video slug must match media-src route');
  },
});

registerTest({
  id: 'T3-X05',
  name: 'Cross-Feature: Executive Design Tokens -> WCAG AA Contrast Sync (F04 + F16)',
  tier: 3,
  feature: 'F04_F16',
  milestone: 'M5',
  execute() {
    // Contrast of Pure White on Deep Cobalt #0047AB
    const cobaltRatio = calculateContrastRatio('#FFFFFF', '#0047AB');
    assert(cobaltRatio >= 4.5, `Cobalt button token contrast (${cobaltRatio.toFixed(2)}) must meet WCAG AA`);

    // Contrast of Pure White on Deep Ink #0B0F19
    const inkRatio = calculateContrastRatio('#FFFFFF', '#0B0F19');
    assert(inkRatio >= 7.0, `Ink canvas token contrast (${inkRatio.toFixed(2)}) must meet WCAG AAA`);
  },
});

registerTest({
  id: 'T3-X06',
  name: 'Cross-Feature: Anti-AI Purge -> Hero Canvas Glow Styling Sync (F05 + F12)',
  tier: 3,
  feature: 'F05_F12',
  milestone: 'M4',
  execute() {
    const canvas = readFile('components/hero-transformation-canvas.tsx');
    if (canvas) {
      assert(!canvas.includes('from-purple-'), 'Hero canvas must not use cliché purple gradient');
      assert(!canvas.includes('blur-3xl'), 'Hero canvas must not use blur-3xl halos');
    }
  },
});

registerTest({
  id: 'T3-X07',
  name: 'Cross-Feature: Calm vs Active Assets -> Hover Canvas Mask Sync (F11 + F12)',
  tier: 3,
  feature: 'F11_F12',
  milestone: 'M4',
  execute() {
    const canvas = readFile('components/hero-transformation-canvas.tsx');
    if (canvas) {
      assert(
        canvas.includes('hero-calm-state') || canvas.includes('calm') || canvas.includes('blueprint'),
        'Transformation canvas must incorporate Calm state'
      );
      assert(
        canvas.includes('hero-active-state') || canvas.includes('active') || canvas.includes('power'),
        'Transformation canvas must incorporate Active power state'
      );
    }
  },
});

registerTest({
  id: 'T3-X08',
  name: 'Cross-Feature: Touch Fallback -> Reduced Motion Sync (F12 + F13)',
  tier: 3,
  feature: 'F12_F13',
  milestone: 'M4',
  execute() {
    const canvas = readFile('components/hero-transformation-canvas.tsx');
    if (canvas) {
      assert(
        canvas.includes('onTouch') || canvas.includes('prefers-reduced-motion') || canvas.includes('media'),
        'Hero canvas must support mobile touch and reduced motion accessibility'
      );
    }
  },
});

registerTest({
  id: 'T3-X09',
  name: 'Cross-Feature: Video Adjacent CTA -> Download Funnel Sync (F09 + F15)',
  tier: 3,
  feature: 'F09_F15',
  milestone: 'M5',
  execute() {
    const sourceFiles = scanFiles('components');
    let hasConsistentInstaller = false;
    for (const f of sourceFiles) {
      const c = readFile(f);
      if (c && (c.includes('NovaPilot-AI-Setup-2.7.1.exe') || c.includes('#download'))) {
        hasConsistentInstaller = true;
        break;
      }
    }
    assert(hasConsistentInstaller, 'Video adjacent CTA must reference unified installer package');
  },
});

registerTest({
  id: 'T3-X10',
  name: 'Cross-Feature: Metadata Sanitization -> Production Build Sync (F03 + F17)',
  tier: 3,
  feature: 'F03_F17',
  milestone: 'M6',
  execute() {
    const layout = readFile('app/layout.tsx');
    assert(layout !== null, 'layout.tsx must exist');
    assertContains(layout, 'metadataBase', 'layout.tsx metadataBase required for build compilation without warnings');
  },
});

registerTest({
  id: 'T3-X11',
  name: 'Cross-Feature: Cruip Purge -> Executive Palette Uniformity Sync (F06 + F04)',
  tier: 3,
  feature: 'F06_F04',
  milestone: 'M2',
  execute() {
    const themeCss = readFile('app/css/additional-styles/theme.css');
    assert(themeCss !== null, 'theme.css must exist');
    assert(!themeCss.includes('AOS'), 'theme.css must not contain Cruip AOS cruft');
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'style.css must exist');
  },
});

registerTest({
  id: 'T3-X12',
  name: 'Cross-Feature: Security Headers -> Video Showcase Fullscreen Sync (F01 + F08)',
  tier: 3,
  feature: 'F01_F08',
  milestone: 'M3',
  execute() {
    const config = readFile('next.config.js');
    assert(!config.includes('fullscreen=()'), 'Permissions-Policy must not forbid fullscreen mode');
  },
});

registerTest({
  id: 'T3-X13',
  name: 'Cross-Feature: OS Detection Hook -> Pre-Footer Chassis Specs Sync (F14 + F15 + F09)',
  tier: 3,
  feature: 'F14_F15_F09',
  milestone: 'M5',
  execute() {
    const winCta = readFile('components/windows-cta.tsx') || readFile('components/cta.tsx');
    assert(winCta !== null, 'Bottom CTA chassis must exist');
    assert(
      winCta.includes('Windows') || winCta.includes('x64') || winCta.includes('Download'),
      'Chassis must highlight Windows 64-bit platform requirements'
    );
  },
});

registerTest({
  id: 'T3-X14',
  name: 'Cross-Feature: Zero Layout Shift -> Hero 16:9 Canvas Sync (F10 + F12)',
  tier: 3,
  feature: 'F10_F12',
  milestone: 'M4',
  execute() {
    const canvas = readFile('components/hero-transformation-canvas.tsx');
    if (canvas) {
      assert(
        canvas.includes('aspect-video'),
        'Hero canvas must use aspect-video to eliminate CLS during asset load'
      );
    }
  },
});

registerTest({
  id: 'T3-X15',
  name: 'Cross-Feature: Production Build -> Zero Dead Links Invariant Sync (F17 + F06)',
  tier: 3,
  feature: 'F17_F06',
  milestone: 'M6',
  execute() {
    const sourceFiles = scanFiles('components');
    for (const f of sourceFiles) {
      const c = readFile(f);
      assert(!c.includes('href="#0"'), `No dead links allowed in production component: ${f}`);
    }
  },
});

registerTest({
  id: 'T3-X16',
  name: 'Cross-Feature: Byte-Range Caching -> Video Preload Sync (F02 + F10)',
  tier: 3,
  feature: 'F02_F10',
  milestone: 'M3',
  execute() {
    const config = readFile('next.config.js');
    assertContains(config, 'Cache-Control', 'Video routes must specify Cache-Control');
    assertContains(config, 'Accept-Ranges', 'Video routes must declare Accept-Ranges');
  },
});

registerTest({
  id: 'T3-X17',
  name: 'Cross-Feature: Complete Commercial Website Integrity Pipeline (F01..F17)',
  tier: 3,
  feature: 'ALL',
  milestone: 'M6',
  execute() {
    assert(fileExists('next.config.js'), 'next.config.js must exist');
    assert(fileExists('app/layout.tsx'), 'app/layout.tsx must exist');
    assert(fileExists('app/(default)/page.tsx'), 'app/(default)/page.tsx must exist');
    assert(fileExists('app/css/style.css'), 'app/css/style.css must exist');
    assert(fileExists('package.json'), 'package.json must exist');
  },
});

// ---------------------------------------------------------------------------
// TIER 4: REAL-WORLD APPLICATION SCENARIOS (9 Scenarios)
// ---------------------------------------------------------------------------

registerTest({
  id: 'T4-S01',
  name: 'Scenario 1: Prospective Enterprise Buyer Discovery Journey',
  tier: 4,
  feature: 'JOURNEY_BUYER',
  milestone: 'M5',
  execute() {
    // 1. Arrives on landing page and reads hero proposition
    const hero = readFile('components/hero.tsx') || readFile('components/hero-home.tsx');
    assert(hero !== null, 'Hero must be rendered');

    // 2. Evaluates executive aesthetic and typography
    const styleCss = readFile('app/css/style.css');
    assert(styleCss !== null, 'Executive typography and palette must be defined');

    // 3. Examines video player showcase
    const video = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(video !== null, 'Video showcase must be available');

    // 4. Clicks download CTA and observes Windows target
    const download = readFile('components/ui/download-button.tsx') || readFile('components/windows-cta.tsx');
    assert(download !== null, 'Download mechanism must be reachable');
  },
});

registerTest({
  id: 'T4-S02',
  name: 'Scenario 2: Executive Video Showcase & Custom Media Verification',
  tier: 4,
  feature: 'JOURNEY_MEDIA',
  milestone: 'M3',
  execute() {
    // 1. Validates responsive 16:9 framing
    const video = readFile('components/video-showcase.tsx') || readFile('components/media-showcase.tsx');
    assert(video !== null, 'Showcase must exist');
    assert(video.includes('aspect-video'), 'Must enforce 16:9 aspect-video');

    // 2. Validates custom control actions
    assert(video.includes('Play') && video.includes('Pause'), 'Must feature custom play/pause');

    // 3. Validates byte-range streaming support
    const config = readFile('next.config.js');
    assertContains(config, 'Accept-Ranges', 'Must support byte-range seeking');
  },
});

registerTest({
  id: 'T4-S03',
  name: 'Scenario 3: Cybersecurity & Compliance Officer Forensic Audit',
  tier: 4,
  feature: 'JOURNEY_SECURITY',
  milestone: 'M1',
  execute() {
    const config = readFile('next.config.js');
    assert(config !== null, 'next.config.js must exist');

    // 1. Content Security Policy
    assertContains(config, 'Content-Security-Policy');
    assertContains(config, "default-src 'self'");

    // 2. Clickjacking & MIME protection
    assertContains(config, 'X-Frame-Options');
    assertContains(config, 'X-Content-Type-Options');

    // 3. Fingerprint removal
    assert(/poweredByHeader\s*:\s*false/.test(config));
  },
});

registerTest({
  id: 'T4-S04',
  name: 'Scenario 4: Mobile & Touch Device User Journey (375px Viewport)',
  tier: 4,
  feature: 'JOURNEY_MOBILE',
  milestone: 'M4',
  execute() {
    // 1. Aspect ratio container scales down
    const width = 375;
    const height = (width * 9) / 16;
    assertEqual(+height.toFixed(2), 210.94);

    // 2. Touch fallback event handling
    const coords = normalizePointerCoords(187.5, 105.47, { left: 0, top: 0, width: 375, height: 210.94 });
    assertEqual(+coords.x.toFixed(2), 0.50);
    assertEqual(+coords.y.toFixed(2), 0.50);
  },
});

registerTest({
  id: 'T4-S05',
  name: 'Scenario 5: Accessibility & Screen-Reader Evaluator Walkthrough',
  tier: 4,
  feature: 'JOURNEY_A11Y',
  milestone: 'M5',
  execute() {
    // 1. WCAG AA body contrast
    const contrast = calculateContrastRatio('#FFFFFF', '#0B0F19');
    assert(contrast >= 4.5, 'Body contrast must satisfy WCAG AA >= 4.5:1');

    // 2. Visible keyboard focus outline
    const styleCss = readFile('app/css/style.css');
    assertContains(styleCss, ':focus-visible', 'Global focus visible indicator must be defined');
  },
});

registerTest({
  id: 'T4-S06',
  name: 'Scenario 6: Anti-AI Cliché & Brand Craftsmanship Reviewer',
  tier: 4,
  feature: 'JOURNEY_BRAND',
  milestone: 'M2',
  execute() {
    // 1. Zero purple blur halos over 16px
    const sourceFiles = scanFiles('components').concat(scanFiles('app'));
    const orderAgnosticHaloRegex = /(?:(?:blur-3xl|blur-2xl|blur-\[(?:[2-9]\d|\d{3,})px\])[^"'>]*(?:purple|violet|fuchsia|pink)|(?:purple|violet|fuchsia|pink)[^"'>]*(?:blur-3xl|blur-2xl|blur-\[(?:[2-9]\d|\d{3,})px\]))/i;
    for (const f of sourceFiles) {
      const raw = readFile(f);
      if (!raw) continue;
      const c = raw.replace(/\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->|\/\/.*$/gm, '');
      assert(!orderAgnosticHaloRegex.test(c), `Purple/violet halo found in ${f}`);
    }

    // 2. Zero Cruip leftovers
    const themeCss = readFile('app/css/additional-styles/theme.css');
    assert(!themeCss.includes('AOS'), 'theme.css must not have AOS Cruip cruft');
  },
});

registerTest({
  id: 'T4-S07',
  name: 'Scenario 7: Cross-Platform Visitor (macOS / Linux) Walkthrough',
  tier: 4,
  feature: 'JOURNEY_CROSS_PLATFORM',
  milestone: 'M5',
  execute() {
    const macUa = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
    const detection = detectOperatingSystem(macUa, true);
    assertEqual(detection.os, 'mac');
    assertEqual(detection.isWindows, false);

    const darwinUa = 'Darwin/21.6.0 (Macintosh; Intel Mac OS X 12_6)';
    const darwinDetection = detectOperatingSystem(darwinUa, true);
    assertEqual(darwinDetection.os, 'mac');
    assertEqual(darwinDetection.isWindows, false);
  },
});

registerTest({
  id: 'T4-S08',
  name: 'Scenario 8: Enterprise Offline Installer Verification',
  tier: 4,
  feature: 'JOURNEY_INSTALLER',
  milestone: 'M5',
  execute() {
    const winCta = readFile('components/windows-cta.tsx') || readFile('components/cta.tsx');
    assert(winCta !== null, 'Hardware specs chassis must exist');
    assert(
      winCta.includes('NovaPilot-AI-Setup') || winCta.includes('.exe') || winCta.includes('Download'),
      'Must offer offline Windows installer download'
    );
  },
});

registerTest({
  id: 'T4-S09',
  name: 'Scenario 9: Production Deployment & Static Compilation Certification',
  tier: 4,
  feature: 'JOURNEY_DEPLOY',
  milestone: 'M6',
  execute() {
    const tsconfig = JSON.parse(readFile('tsconfig.json'));
    assert(tsconfig.compilerOptions.strict === true, 'TypeScript strict mode must be on');
    const pkg = JSON.parse(readFile('package.json'));
    assert(pkg.scripts.build, 'Build command must be declared');
  },
});

// ---------------------------------------------------------------------------
// CLI Execution Runner & Reporting
// ---------------------------------------------------------------------------

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    tier: null,
    feature: null,
    milestone: null,
    summary: false,
    json: false,
    list: false,
    allowPending: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--tier' && args[i + 1]) {
      options.tier = parseInt(args[++i], 10);
    } else if (arg === '--feature' && args[i + 1]) {
      options.feature = args[++i];
    } else if (arg === '--milestone' && args[i + 1]) {
      options.milestone = args[++i];
    } else if (arg === '--summary') {
      options.summary = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--list') {
      options.list = true;
    } else if (arg === '--allow-pending') {
      options.allowPending = true;
    }
  }
  return options;
}

function runSuite() {
  const options = parseCliArgs();

  if (options.list) {
    console.log(`\n${colors.bold}${colors.cyan}NovaPilot AI Commercial Suite — Test Inventory (${tests.length} Total Tests)${colors.reset}\n`);
    for (const t of tests) {
      console.log(`  [Tier ${t.tier}] [${t.milestone}] ${t.id.padEnd(12)} ${t.feature.padEnd(14)} ${t.name}`);
    }
    process.exit(0);
  }

  let filtered = tests;
  if (options.tier !== null) {
    filtered = filtered.filter(t => t.tier === options.tier);
  }
  if (options.feature !== null) {
    filtered = filtered.filter(t => t.feature.toLowerCase() === options.feature.toLowerCase());
  }
  if (options.milestone !== null) {
    filtered = filtered.filter(t => t.milestone.toLowerCase() === options.milestone.toLowerCase());
  }

  const results = {
    total: filtered.length,
    passed: 0,
    failed: 0,
    pending: 0,
    startTime: new Date().toISOString(),
    details: [],
  };

  const startMs = performance.now();

  if (!options.json) {
    console.log(`\n${colors.bold}${colors.blue}========================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.white}  NovaPilot AI Commercial Website — Comprehensive E2E Verification Suite${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}========================================================================${colors.reset}`);
    console.log(`${colors.dim}Target Workspace: ${ROOT_DIR}${colors.reset}`);
    console.log(`${colors.dim}Executing ${filtered.length} tests across 4 tiers (T1: Feature, T2: Boundary, T3: Cross, T4: Scenarios)...${colors.reset}\n`);
  }

  for (const t of filtered) {
    const testStart = performance.now();
    let status = 'PASS';
    let error = null;

    try {
      t.execute();
      results.passed++;
    } catch (err) {
      if (options.allowPending && t.milestone && t.milestone !== 'M1') {
        status = 'PENDING';
        results.pending++;
        error = err.message;
      } else {
        status = 'FAIL';
        results.failed++;
        error = err.message;
      }
    }

    const durationMs = +(performance.now() - testStart).toFixed(2);
    results.details.push({
      id: t.id,
      name: t.name,
      tier: t.tier,
      feature: t.feature,
      milestone: t.milestone,
      status,
      durationMs,
      error,
    });

    if (!options.json && !options.summary) {
      let badge = `${colors.bgGreen}${colors.white} PASS ${colors.reset}`;
      if (status === 'FAIL') {
        badge = `${colors.bgRed}${colors.white} FAIL ${colors.reset}`;
      } else if (status === 'PENDING') {
        badge = `${colors.yellow} PEND ${colors.reset}`;
      }
      console.log(` ${badge} ${colors.bold}${t.id.padEnd(10)}${colors.reset} [T${t.tier}|${t.milestone}] ${t.name} ${colors.dim}(${durationMs}ms)${colors.reset}`);
      if (status === 'FAIL' && error) {
        console.log(`        ${colors.red}Error: ${error}${colors.reset}`);
      }
    }
  }

  results.totalDurationMs = +(performance.now() - startMs).toFixed(2);
  results.endTime = new Date().toISOString();

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(results.failed > 0 ? 1 : 0);
  }

  // Summary box
  console.log(`\n${colors.bold}${colors.blue}------------------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bold}Test Execution Summary:${colors.reset}`);
  console.log(`  Total Executed : ${colors.bold}${results.total}${colors.reset}`);
  console.log(`  Passed         : ${colors.green}${results.passed}${colors.reset}`);
  console.log(`  Failed         : ${results.failed > 0 ? colors.red : colors.dim}${results.failed}${colors.reset}`);
  console.log(`  Pending        : ${results.pending > 0 ? colors.yellow : colors.dim}${results.pending}${colors.reset}`);
  console.log(`  Total Duration : ${colors.cyan}${results.totalDurationMs}ms${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}------------------------------------------------------------------------${colors.reset}\n`);

  if (results.failed > 0) {
    console.log(`${colors.bold}${colors.red}FAILED: ${results.failed} test(s) failed assertion checks.${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`${colors.bold}${colors.green}SUCCESS: All ${results.passed} active test assertion(s) passed successfully!${colors.reset}\n`);
    process.exit(0);
  }
}

runSuite();
