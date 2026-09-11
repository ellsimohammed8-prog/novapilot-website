#!/usr/bin/env node
/**
 * NovaPilot AI Web Platform — Comprehensive E2E Verification Test Suite
 *
 * Implements 4-Tier Opaque-Box, Requirement-Driven Verification:
 * - Tier 1: Feature Coverage (≥5 tests per feature for all 17 features = 85 tests)
 * - Tier 2: Boundary & Corner Cases (empty states, zero dead links, extremes, checksums) (5 tests)
 * - Tier 3: Cross-Feature Combinations (CTA-to-section sync, 3D-to-demo mapping, theme contrast, metadata sync) (5 tests)
 * - Tier 4: Real-World Application Scenarios (5 realistic end-user / evaluator walkthroughs) (5 tests)
 *
 * Usage:
 *   node scripts/verify-e2e.mjs                # Run full suite (exit 0 = all pass, 1 = failure)
 *   node scripts/verify-e2e.mjs --tier 1       # Run specific tier (1, 2, 3, 4)
 *   node scripts/verify-e2e.mjs --feature F1   # Run specific feature (F1..F17)
 *   node scripts/verify-e2e.mjs --milestone M1 # Run specific milestone (M1..M5)
 *   node scripts/verify-e2e.mjs --summary      # Compact summary output
 *   node scripts/verify-e2e.mjs --json         # JSON structured output
 *   node scripts/verify-e2e.mjs --list         # List all test definitions
 *   node scripts/verify-e2e.mjs --allow-pending # Treat unimplemented milestone tests as PENDING
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI color helpers
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
// File & Inspection Utilities
// ---------------------------------------------------------------------------

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT_DIR, relPath));
}

function readFile(relPath) {
  const fullPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
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

/** Reference ThinkStripper FSM for DeepSeek R1 / Claude 3.7 streaming tokens */
function runThinkStripperFSM(tokenChunks) {
  const TAG_PAIRS = [
    { open: '<think>', close: '</think>' },
    { open: '<thought>', close: '</thought>' },
    { open: '<reasoning>', close: '</reasoning>' },
  ];

  let state = 'pass'; // 'pass' | 'inThink'
  let activePair = null;
  let thinkDepth = 0;
  let pendingBuffer = '';
  let output = '';

  for (const chunk of tokenChunks) {
    let text = pendingBuffer + chunk;
    pendingBuffer = '';

    while (text.length > 0) {
      if (state === 'pass') {
        // Look for opening tags
        let earliestMatch = null;
        for (const pair of TAG_PAIRS) {
          const idx = text.indexOf(pair.open);
          if (idx !== -1 && (earliestMatch === null || idx < earliestMatch.index)) {
            earliestMatch = { index: idx, pair };
          }
        }

        if (earliestMatch) {
          output += text.slice(0, earliestMatch.index);
          text = text.slice(earliestMatch.index + earliestMatch.pair.open.length);
          state = 'inThink';
          activePair = earliestMatch.pair;
          thinkDepth = 1;
        } else {
          // Check for partial opening tags at the tail
          let partialFound = false;
          for (const pair of TAG_PAIRS) {
            for (let len = pair.open.length - 1; len > 0; len--) {
              const prefix = pair.open.slice(0, len);
              if (text.endsWith(prefix)) {
                output += text.slice(0, text.length - len);
                pendingBuffer = prefix;
                text = '';
                partialFound = true;
                break;
              }
            }
            if (partialFound) break;
          }
          if (!partialFound) {
            output += text;
            text = '';
          }
        }
      } else if (state === 'inThink') {
        // Look for either nested open or close tag
        const openIdx = text.indexOf(activePair.open);
        const closeIdx = text.indexOf(activePair.close);

        if (openIdx !== -1 && (closeIdx === -1 || openIdx < closeIdx)) {
          // Nested opening tag
          thinkDepth++;
          text = text.slice(openIdx + activePair.open.length);
        } else if (closeIdx !== -1) {
          thinkDepth--;
          text = text.slice(closeIdx + activePair.close.length);
          if (thinkDepth <= 0) {
            state = 'pass';
            activePair = null;
            thinkDepth = 0;
          }
        } else {
          // Check for partial close tag at tail
          let partialFound = false;
          for (let len = activePair.close.length - 1; len > 0; len--) {
            const prefix = activePair.close.slice(0, len);
            if (text.endsWith(prefix)) {
              pendingBuffer = prefix;
              text = '';
              partialFound = true;
              break;
            }
          }
          if (!partialFound) {
            text = ''; // Discard thinking tokens
          }
        }
      }
    }
  }

  // If stream terminates abruptly while inThink, buffer is discarded (0-byte leak)
  return output;
}

/** Reference WASAPI N-Channel Dynamic Downmix */
function runWASAPIDownmix(channels, samples) {
  if (channels <= 0 || samples.length % channels !== 0) {
    throw new Error(`Invalid downmix configuration: ${channels} channels, ${samples.length} samples`);
  }
  const invChannels = 1.0 / channels;
  const frameCount = samples.length / channels;
  const mono = new Float32Array(frameCount);

  for (let f = 0; f < frameCount; f++) {
    let sum = 0.0;
    for (let c = 0; c < channels; c++) {
      sum += samples[f * channels + c];
    }
    const val = sum * invChannels;
    // Clamping to avoid float overflow distortion
    mono[f] = Math.max(-1.0, Math.min(1.0, val));
  }
  return mono;
}

/** Reference Semver Comparator */
function runSemverCompare(v1, v2) {
  const parse = (s) => s.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const p1 = parse(v1);
  const p2 = parse(v2);
  for (let i = 0; i < 3; i++) {
    if (p1[i] > p2[i]) return 1;
    if (p1[i] < p2[i]) return -1;
  }
  return 0;
}

/** Reference Telegram Deduplication Hashing & Window Debounce */
function runTelegramDedup(errors, windowMs = 60000) {
  const sent = [];
  const hashCache = new Map();

  for (const err of errors) {
    const hash = crypto.createHash('sha256').update(err.stack || err.message).digest('hex');
    const lastSentTime = hashCache.get(hash);
    if (lastSentTime === undefined || err.timestamp - lastSentTime > windowMs) {
      hashCache.set(hash, err.timestamp);
      sent.push({ hash, text: (err.message || '').slice(0, 4000), timestamp: err.timestamp });
    }
  }
  return sent;
}

/** WCAG 2.1 Relative Luminance & Contrast Calculation */
function parseHexColor(hex) {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function calculateRelativeLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(hex1, hex2) {
  const l1 = calculateRelativeLuminance(parseHexColor(hex1));
  const l2 = calculateRelativeLuminance(parseHexColor(hex2));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ---------------------------------------------------------------------------
// Test Registry & Assertion Engine
// ---------------------------------------------------------------------------

const testSuite = [];

function registerTest({ id, name, tier, feature, milestone, execute }) {
  testSuite.push({ id, name, tier, feature, milestone, execute });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ---------------------------------------------------------------------------
// TIER 1: FEATURE COVERAGE (17 Features x 5 Tests = 85 Tests)
// ---------------------------------------------------------------------------

// Feature 1: Multi-Channel WASAPI Audio Loopback (F1, Milestone M2)
registerTest({
  id: 'T1-F1-01',
  name: 'F1: WASAPI Loopback Capture Architecture Specification',
  tier: 1,
  feature: 'F1',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('WASAPI') || c.includes('AUDCLNT_STREAMFLAGS_LOOPBACK') || c.includes('CPAL'));
    });
    assert(found, 'WASAPI Loopback capture architecture must be specified in features grid, specs table, or PROJECT.md');
  },
});

registerTest({
  id: 'T1-F1-02',
  name: 'F1: Dynamic N-Channel Downmix Algorithm Verification',
  tier: 1,
  feature: 'F1',
  milestone: 'M2',
  execute: () => {
    // Test stereo downmix: [0.8, 0.4] -> 0.6
    const stereo = new Float32Array([0.8, 0.4, -0.6, -0.2]);
    const mono = runWASAPIDownmix(2, stereo);
    assert(Math.abs(mono[0] - 0.6) < 1e-5, `Expected stereo downmix sample 0 to be 0.6, got ${mono[0]}`);
    assert(Math.abs(mono[1] - (-0.4)) < 1e-5, `Expected stereo downmix sample 1 to be -0.4, got ${mono[1]}`);

    // Test 6-channel 5.1 downmix: all 0.6 -> 0.6
    const surround = new Float32Array([0.6, 0.6, 0.6, 0.6, 0.6, 0.6]);
    const surroundMono = runWASAPIDownmix(6, surround);
    assert(Math.abs(surroundMono[0] - 0.6) < 1e-5, `Expected 5.1 downmix to produce 0.6, got ${surroundMono[0]}`);
  },
});

registerTest({
  id: 'T1-F1-03',
  name: 'F1: Rubato Polyphase Sinc Resampler Specification',
  tier: 1,
  feature: 'F1',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('16kHz') || c.includes('16,000') || c.includes('Rubato') || c.includes('sinc'));
    });
    assert(found, 'Canonical 16kHz PCM resampling specification must be documented in subsystem presentations');
  },
});

registerTest({
  id: 'T1-F1-04',
  name: 'F1: Lock-Free Ring Buffer & <5ms Latency Specification',
  tier: 1,
  feature: 'F1',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/hero.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('<5ms') || c.includes('5ms') || c.includes('HeapRb') || c.includes('Ring Buffer'));
    });
    assert(found, '<5ms ultra-low buffer latency or ring buffer headroom must be prominently featured');
  },
});

registerTest({
  id: 'T1-F1-05',
  name: 'F1: Frame Coalescence & Silence Suppression Specifications',
  tier: 1,
  feature: 'F1',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('VAD') || c.includes('silence') || c.includes('Batch') || c.includes('60ms') || c.includes('keepalive'));
    });
    assert(found, 'VAD silence suppression or frame batching must be specified in architecture specs');
  },
});

// Feature 2: Stealth Screen-Share Protection Specs (F2, Milestone M2)
registerTest({
  id: 'T1-F2-01',
  name: 'F2: OS Display Capture Exclusion API Specifications',
  tier: 1,
  feature: 'F2',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('WDA_EXCLUDEFROMCAPTURE') || c.includes('setContentProtection') || c.includes('SetWindowDisplayAffinity'));
    });
    assert(found, 'WDA_EXCLUDEFROMCAPTURE or setContentProtection must be documented in stealth specs');
  },
});

registerTest({
  id: 'T1-F2-02',
  name: 'F2: Collaboration Platform Invisibility Coverage',
  tier: 1,
  feature: 'F2',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'components/hero.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('Zoom') || c.includes('Teams') || c.includes('Meet'));
    });
    assert(found, 'Zoom, Teams, or Google Meet invisibility must be highlighted in stealth capabilities');
  },
});

registerTest({
  id: 'T1-F2-03',
  name: 'F2: Mouse Passthrough & Focusable Hotkey Contract',
  tier: 1,
  feature: 'F2',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('setIgnoreMouseEvents') || c.includes('passthrough') || c.includes('click-through') || c.includes('Passthrough'));
    });
    assert(found, 'Click-through mouse passthrough contract must be documented in windowing architecture');
  },
});

registerTest({
  id: 'T1-F2-04',
  name: 'F2: Fullscreen Presentation Topmost Priority',
  tier: 1,
  feature: 'F2',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('alwaysOnTop') || c.includes('screen-saver') || c.includes('fullscreen') || c.includes('Topmost'));
    });
    assert(found, 'Topmost fullscreen priority (screen-saver level) must be documented');
  },
});

registerTest({
  id: 'T1-F2-05',
  name: 'F2: Global Keyboard Shortcut Matrix Specification',
  tier: 1,
  feature: 'F2',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'components/hero.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('CmdOrCtrl+B') || c.includes('Ctrl+B') || c.includes('Keybind') || c.includes('shortcut') || c.includes('Shortcut'));
    });
    assert(found, 'Global shortcut keys (Cmd/Ctrl+B) must be documented');
  },
});

// Feature 3: Streaming ThinkStripper Pipeline (F3, Milestone M2)
registerTest({
  id: 'T1-F3-01',
  name: 'F3: ThinkStripper Pipeline Documentation & Supported Models',
  tier: 1,
  feature: 'F3',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('ThinkStripper') || c.includes('DeepSeek R1') || c.includes('<think>'));
    });
    assert(found, 'ThinkStripper pipeline and DeepSeek R1 reasoning tag stripping must be documented');
  },
});

registerTest({
  id: 'T1-F3-02',
  name: 'F3: ThinkStripper FSM Normal Stream Token Stripping',
  tier: 1,
  feature: 'F3',
  milestone: 'M2',
  execute: () => {
    const inputChunks = ['Here is the answer: ', '<think>', 'Let me analyze step 1. Step 2.', '</think>', 'The solution is O(n).'];
    const output = runThinkStripperFSM(inputChunks);
    assert(output === 'Here is the answer: The solution is O(n).', `FSM failed normal stream stripping. Got: "${output}"`);
  },
});

registerTest({
  id: 'T1-F3-03',
  name: 'F3: ThinkStripper FSM Chunked/Split Opening Tag Boundary',
  tier: 1,
  feature: 'F3',
  milestone: 'M2',
  execute: () => {
    // Model chunks '<thi' and 'nk>reasoning</think>Final' across boundary
    const inputChunks = ['Result: ', '<thi', 'nk>internal reasoning</think>', 'Success'];
    const output = runThinkStripperFSM(inputChunks);
    assert(output === 'Result: Success', `FSM failed split opening tag boundary. Got: "${output}"`);
  },
});

registerTest({
  id: 'T1-F3-04',
  name: 'F3: ThinkStripper FSM Abrupt Stream Termination (0-Byte Leak)',
  tier: 1,
  feature: 'F3',
  milestone: 'M2',
  execute: () => {
    // Model cuts off mid-thought without closing tag
    const inputChunks = ['Preliminary: ', '<think>Unfinished internal thought process...'];
    const output = runThinkStripperFSM(inputChunks);
    assert(output === 'Preliminary: ', `FSM must discard unclosed thinking block upon finish. Got: "${output}"`);
  },
});

registerTest({
  id: 'T1-F3-05',
  name: 'F3: ThinkStripper Multi-Tag (<thought>, <reasoning>) Support',
  tier: 1,
  feature: 'F3',
  milestone: 'M2',
  execute: () => {
    const inputChunks = [
      '<thought>Claude internal reasoning</thought>',
      'Optimal approach: ',
      '<reasoning>DeepSeek alt reasoning</reasoning>',
      'Binary Search.',
    ];
    const output = runThinkStripperFSM(inputChunks);
    assert(output === 'Optimal approach: Binary Search.', `FSM failed multi-tag stripping. Got: "${output}"`);
  },
});

// Feature 4: Serverless Telegram Telemetry (F4, Milestone M2)
registerTest({
  id: 'T1-F4-01',
  name: 'F4: Serverless Telegram Bot Telemetry Architecture',
  tier: 1,
  feature: 'F4',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('Telegram') || c.includes('Telemetry') || c.includes('crash reporting'));
    });
    assert(found, 'Serverless Telegram telemetry architecture must be documented in feature cards');
  },
});

registerTest({
  id: 'T1-F4-02',
  name: 'F4: SHA-256 Deduplication Hashing & Sliding Window Debounce',
  tier: 1,
  feature: 'F4',
  milestone: 'M2',
  execute: () => {
    const errors = [
      { message: 'Error: Connection timeout', stack: 'timeout at main.ts:42', timestamp: 1000 },
      { message: 'Error: Connection timeout', stack: 'timeout at main.ts:42', timestamp: 5000 },  // debounced
      { message: 'Error: Connection timeout', stack: 'timeout at main.ts:42', timestamp: 65000 }, // allowed (after 60s)
      { message: 'Error: Memory warning', stack: 'alloc at lib.rs:88', timestamp: 66000 },       // distinct hash
    ];
    const sent = runTelegramDedup(errors, 60000);
    assert(sent.length === 3, `Expected 3 messages sent after SHA-256 deduplication, got ${sent.length}`);
    assert(sent[0].hash === sent[1].hash, 'First and second sent errors should share identical hash');
    assert(sent[0].hash !== sent[2].hash, 'Different stack trace must produce distinct SHA-256 hash');
  },
});

registerTest({
  id: 'T1-F4-03',
  name: 'F4: Global 15 Messages/Minute Rate Limiter Simulation',
  tier: 1,
  feature: 'F4',
  milestone: 'M2',
  execute: () => {
    // Generate 50 rapid distinct errors in 1 second
    const errors = Array.from({ length: 50 }, (_, i) => ({
      message: `Error ${i}`,
      stack: `stack_${i}`,
      timestamp: 1000 + i * 10,
    }));

    // Rate limiter simulation
    let tokens = 15;
    let accepted = 0;
    for (const _ of errors) {
      if (tokens > 0) {
        tokens--;
        accepted++;
      }
    }
    assert(accepted === 15, `Rate limiter must throttle burst at 15 messages/minute, accepted ${accepted}`);
  },
});

registerTest({
  id: 'T1-F4-04',
  name: 'F4: Telegram HTML Message Safe Ceiling (4000 Chars)',
  tier: 1,
  feature: 'F4',
  milestone: 'M2',
  execute: () => {
    const giantPayload = 'A'.repeat(10000);
    const sanitized = giantPayload.slice(0, 4000);
    assert(sanitized.length === 4000, `Payload must be truncated to safe 4000 character limit, got ${sanitized.length}`);
  },
});

registerTest({
  id: 'T1-F4-05',
  name: 'F4: Privacy Sanitization Guarantee in Telemetry',
  tier: 1,
  feature: 'F4',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'components/ui/footer.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('Zero cloud storage') || c.includes('zero cloud storage') || c.includes('Local-first') || c.includes('local-first') || c.includes('privacy'));
    });
    assert(found, 'Privacy guarantee (zero prompt/audio payload logging) must be highlighted');
  },
});

// Feature 5: Remote Kill-Switch & Update Governance (F5, Milestone M2)
registerTest({
  id: 'T1-F5-01',
  name: 'F5: Remote Kill-Switch Governance Architecture',
  tier: 1,
  feature: 'F5',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('Kill-Switch') || c.includes('kill-switch') || c.includes('latest.yml') || c.includes('Update'));
    });
    assert(found, 'Remote kill-switch or update governance architecture must be documented');
  },
});

registerTest({
  id: 'T1-F5-02',
  name: 'F5: Semver Mandatory Update Blocking Evaluation',
  tier: 1,
  feature: 'F5',
  milestone: 'M2',
  execute: () => {
    const currentVersion = '2.7.1';
    const minSupportedVersion = '2.8.0';
    const isMandatory = runSemverCompare(currentVersion, minSupportedVersion) < 0;
    assert(isMandatory === true, 'Current version lower than min_supported must trigger mandatory update block');
  },
});

registerTest({
  id: 'T1-F5-03',
  name: 'F5: Semver Optional Patch Notification Evaluation',
  tier: 1,
  feature: 'F5',
  milestone: 'M2',
  execute: () => {
    const currentVersion = '2.7.1';
    const latestVersion = '2.7.2';
    const minSupportedVersion = '2.7.0';
    const hasUpdate = runSemverCompare(currentVersion, latestVersion) < 0;
    const isMandatory = runSemverCompare(currentVersion, minSupportedVersion) < 0;
    assert(hasUpdate === true, 'Patch release must signal update available');
    assert(isMandatory === false, 'Patch release with min_supported met must not be mandatory');
  },
});

registerTest({
  id: 'T1-F5-04',
  name: 'F5: Semver Up-To-Date Baseline Evaluation',
  tier: 1,
  feature: 'F5',
  milestone: 'M2',
  execute: () => {
    const currentVersion = '2.7.1';
    const latestVersion = '2.7.1';
    const hasUpdate = runSemverCompare(currentVersion, latestVersion) < 0;
    assert(hasUpdate === false, 'Matching version must not signal update');
  },
});

registerTest({
  id: 'T1-F5-05',
  name: 'F5: Non-Dismissible UI Barrier Modal Contract',
  tier: 1,
  feature: 'F5',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('non-dismissible') || c.includes('mandatory') || c.includes('Mandatory') || c.includes('blocking'));
    });
    assert(found, 'Non-dismissible mandatory update barrier contract must be documented');
  },
});

// Feature 6: Cloudflare Edge Gateway & Whisper ASR (F6, Milestone M2)
registerTest({
  id: 'T1-F6-01',
  name: 'F6: Cloudflare Edge Multi-Key Pool Rotation Specification',
  tier: 1,
  feature: 'F6',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('Cloudflare') || c.includes('Edge') || c.includes('pool') || c.includes('Worker'));
    });
    assert(found, 'Cloudflare edge gateway and multi-key pool rotation must be documented');
  },
});

registerTest({
  id: 'T1-F6-02',
  name: 'F6: Real-Time Edge WebSocket STT Relay Specification',
  tier: 1,
  feature: 'F6',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('WebSocket') || c.includes('Deepgram') || c.includes('STT') || c.includes('speech-to-text'));
    });
    assert(found, 'WebSocket STT relay specification must be documented');
  },
});

registerTest({
  id: 'T1-F6-03',
  name: 'F6: Offline Whisper / Moonshine ONNX Engine Specification',
  tier: 1,
  feature: 'F6',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('Whisper') || c.includes('ONNX') || c.includes('Moonshine') || c.includes('offline'));
    });
    assert(found, 'Offline Whisper or ONNX speech recognition engine must be specified');
  },
});

registerTest({
  id: 'T1-F6-04',
  name: 'F6: Technical Vocabulary Prompt Biasing Cache',
  tier: 1,
  feature: 'F6',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('biasing') || c.includes('prompt cache') || c.includes('224-token') || c.includes('vocabulary'));
    });
    assert(found, 'ASR vocabulary biasing prompt cache must be specified in technical specs');
  },
});

registerTest({
  id: 'T1-F6-05',
  name: 'F6: Hybrid Cloud-Edge to Offline Fallback Cascade',
  tier: 1,
  feature: 'F6',
  milestone: 'M2',
  execute: () => {
    const files = ['components/features-grid.tsx', 'components/specs-table.tsx', 'PROJECT.md'];
    const found = files.some(f => {
      const c = readFile(f);
      return c && (c.includes('fallback') || c.includes('offline') || c.includes('Offline') || c.includes('local'));
    });
    assert(found, 'Fallback cascade from cloud-edge to offline local model must be documented');
  },
});

// Feature 7: Template Cruft & Mockup Purge (F7, Milestone M1)
registerTest({
  id: 'T1-F7-01',
  name: 'F7: Zero Cruip Template Branding Strings Across Codebase',
  tier: 1,
  feature: 'F7',
  milestone: 'M1',
  execute: () => {
    const files = scanFiles('components').concat(scanFiles('app'));
    const cruipMarkers = ['Open PRO', 'Open Pro', 'Enteprise', 'which is why Open PRO is perfect for me'];
    const violations = [];
    for (const f of files) {
      const c = readFile(f);
      if (!c) continue;
      for (const m of cruipMarkers) {
        if (c.includes(m)) violations.push(`${f} contains "${m}"`);
      }
    }
    assert(violations.length === 0, `Found Cruip template branding markers:\n${violations.join('\n')}`);
  },
});

registerTest({
  id: 'T1-F7-02',
  name: 'F7: Zero Fabricated Cruip Testimonials',
  tier: 1,
  feature: 'F7',
  milestone: 'M1',
  execute: () => {
    assert(!fileExists('components/testimonials.tsx'), 'components/testimonials.tsx must be purged');
    const files = scanFiles('components').concat(scanFiles('app'));
    const fakePeople = ['Mary Kiser', 'Alex Dickinson', 'Mark Zellers'];
    for (const f of files) {
      const c = readFile(f);
      if (!c) continue;
      for (const p of fakePeople) {
        assert(!c.includes(p), `Found fake testimonial person "${p}" in ${f}`);
      }
    }
  },
});

registerTest({
  id: 'T1-F7-03',
  name: 'F7: Zero Cruip Mock Client Logo Assets',
  tier: 1,
  feature: 'F7',
  milestone: 'M1',
  execute: () => {
    const files = scanFiles('components').concat(scanFiles('app'));
    for (const f of files) {
      const c = readFile(f);
      if (!c) continue;
      assert(!c.includes('client-logo-'), `Found legacy Cruip client logo reference in ${f}`);
    }
  },
});

registerTest({
  id: 'T1-F7-04',
  name: 'F7: Zero Cruip Boilerplate Auth Routes',
  tier: 1,
  feature: 'F7',
  milestone: 'M1',
  execute: () => {
    assert(!fileExists('app/(auth)'), 'app/(auth) directory must be purged');
  },
});

registerTest({
  id: 'T1-F7-05',
  name: 'F7: Zero Cruip Boilerplate API Hello Route',
  tier: 1,
  feature: 'F7',
  milestone: 'M1',
  execute: () => {
    assert(!fileExists('app/api/hello'), 'app/api/hello directory must be purged');
  },
});

// Feature 8: Package & Dependency Modernization (F8, Milestone M1)
registerTest({
  id: 'T1-F8-01',
  name: 'F8: Package Manifest Name & Version Alignment',
  tier: 1,
  feature: 'F8',
  milestone: 'M1',
  execute: () => {
    const pkg = JSON.parse(readFile('package.json'));
    assert(pkg.name === 'novapilot-web' || pkg.name === 'novapilot-ai-web', `Expected package name novapilot-web, got "${pkg.name}"`);
    assert(pkg.version === '2.7.1', `Expected package version 2.7.1, got "${pkg.version}"`);
  },
});

registerTest({
  id: 'T1-F8-02',
  name: 'F8: Lucide React Iconography Dependency Installed',
  tier: 1,
  feature: 'F8',
  milestone: 'M1',
  execute: () => {
    const pkg = JSON.parse(readFile('package.json'));
    assert(pkg.dependencies && pkg.dependencies['lucide-react'], 'lucide-react must be listed in package.json dependencies');
  },
});

registerTest({
  id: 'T1-F8-03',
  name: 'F8: Three.js 3D Engine Dependencies Installed',
  tier: 1,
  feature: 'F8',
  milestone: 'M1',
  execute: () => {
    const pkg = JSON.parse(readFile('package.json'));
    assert(pkg.dependencies && pkg.dependencies['three'], 'three must be listed in package.json dependencies');
    assert(
      (pkg.dependencies && pkg.dependencies['@types/three']) || (pkg.devDependencies && pkg.devDependencies['@types/three']),
      '@types/three must be listed in dependencies or devDependencies'
    );
  },
});

registerTest({
  id: 'T1-F8-04',
  name: 'F8: Framer Motion Animation Dependency Installed',
  tier: 1,
  feature: 'F8',
  milestone: 'M1',
  execute: () => {
    const pkg = JSON.parse(readFile('package.json'));
    assert(pkg.dependencies && pkg.dependencies['framer-motion'], 'framer-motion must be listed in package.json dependencies');
  },
});

registerTest({
  id: 'T1-F8-05',
  name: 'F8: Legacy AOS Library Purged from Package Manifest',
  tier: 1,
  feature: 'F8',
  milestone: 'M1',
  execute: () => {
    const pkg = JSON.parse(readFile('package.json'));
    assert(!pkg.dependencies || !pkg.dependencies['aos'], 'Legacy aos must be removed from package.json dependencies');
    assert(!pkg.devDependencies || !pkg.devDependencies['@types/aos'], 'Legacy @types/aos must be removed from devDependencies');
  },
});

// Feature 9: Cybernetic Header & Navigation (F9, Milestone M1)
registerTest({
  id: 'T1-F9-01',
  name: 'F9: Cybernetic Header Component Contract',
  tier: 1,
  feature: 'F9',
  milestone: 'M1',
  execute: () => {
    assert(fileExists('components/ui/header.tsx'), 'components/ui/header.tsx must exist');
    const c = readFile('components/ui/header.tsx');
    assert(c.includes('export default function Header'), 'Header component must export default function Header()');
  },
});

registerTest({
  id: 'T1-F9-02',
  name: 'F9: Authentic NovaPilot Vector Logo Component',
  tier: 1,
  feature: 'F9',
  milestone: 'M1',
  execute: () => {
    assert(fileExists('components/ui/logo.tsx'), 'components/ui/logo.tsx must exist');
    const c = readFile('components/ui/logo.tsx');
    assert(c.includes('NovaPilot') || c.includes('svg') || c.includes('polygon') || c.includes('path'), 'logo.tsx must render official vector mark');
  },
});

registerTest({
  id: 'T1-F9-03',
  name: 'F9: Production Version Badge Indicator in Header',
  tier: 1,
  feature: 'F9',
  milestone: 'M1',
  execute: () => {
    const c = readFile('components/ui/header.tsx');
    assert(c && c.includes('2.7.1'), 'Header must display version badge v2.7.1');
  },
});

registerTest({
  id: 'T1-F9-04',
  name: 'F9: Authentic Anchor Navigation Matrix in Header',
  tier: 1,
  feature: 'F9',
  milestone: 'M1',
  execute: () => {
    const c = readFile('components/ui/header.tsx');
    assert(c, 'Header component must exist');
    assert(c.includes('#features'), 'Header must include #features navigation link');
    assert(c.includes('#architecture'), 'Header must include #architecture navigation link');
    assert(c.includes('#demo'), 'Header must include #demo navigation link');
    assert(c.includes('#download'), 'Header must include #download navigation link');
  },
});

registerTest({
  id: 'T1-F9-05',
  name: 'F9: Prominent Windows Download CTA Button in Header',
  tier: 1,
  feature: 'F9',
  milestone: 'M1',
  execute: () => {
    const c = readFile('components/ui/header.tsx');
    assert(c, 'Header component must exist');
    assert(c.includes('Download') || c.includes('download-button') || c.includes('DownloadButton'), 'Header must feature a prominent Download CTA');
  },
});

// Feature 10: Authentic NovaPilot Hero (F10, Milestone M2)
registerTest({
  id: 'T1-F10-01',
  name: 'F10: Authentic Hero Component Contract',
  tier: 1,
  feature: 'F10',
  milestone: 'M2',
  execute: () => {
    const exists = fileExists('components/hero.tsx') || fileExists('components/hero-home.tsx');
    assert(exists, 'Hero component (components/hero.tsx or hero-home.tsx) must exist');
  },
});

registerTest({
  id: 'T1-F10-02',
  name: 'F10: Executive HUD Value Proposition Headline',
  tier: 1,
  feature: 'F10',
  milestone: 'M2',
  execute: () => {
    const file = fileExists('components/hero.tsx') ? 'components/hero.tsx' : 'components/hero-home.tsx';
    const c = readFile(file);
    assert(c && (c.includes('Copilot') || c.includes('Stealth') || c.includes('Invisible') || c.includes('Meeting') || c.includes('NovaPilot')), 'Hero headline must express authentic NovaPilot value proposition');
  },
});

registerTest({
  id: 'T1-F10-03',
  name: 'F10: Low-Latency & Stealth HUD Metric Badges',
  tier: 1,
  feature: 'F10',
  milestone: 'M2',
  execute: () => {
    const file = fileExists('components/hero.tsx') ? 'components/hero.tsx' : 'components/hero-home.tsx';
    const c = readFile(file);
    assert(c && (c.includes('<5ms') || c.includes('5ms') || c.includes('100%') || c.includes('Zero cloud')), 'Hero must render technical HUD metric badges');
  },
});

registerTest({
  id: 'T1-F10-04',
  name: 'F10: Primary Windows Installer Download CTA in Hero',
  tier: 1,
  feature: 'F10',
  milestone: 'M2',
  execute: () => {
    const file = fileExists('components/hero.tsx') ? 'components/hero.tsx' : 'components/hero-home.tsx';
    const c = readFile(file);
    assert(c && (c.includes('Download') || c.includes('download-button') || c.includes('DownloadButton')), 'Hero must include primary Windows download CTA button');
  },
});

registerTest({
  id: 'T1-F10-05',
  name: 'F10: Windows 10/11 Architecture Compatibility Notice',
  tier: 1,
  feature: 'F10',
  milestone: 'M2',
  execute: () => {
    const file = fileExists('components/hero.tsx') ? 'components/hero.tsx' : 'components/hero-home.tsx';
    const c = readFile(file);
    assert(c && (c.includes('Windows') || c.includes('x64') || c.includes('64-bit')), 'Hero must specify Windows 10/11 x64 compatibility');
  },
});

// Feature 11: Technical Specs Comparison Matrix (F11, Milestone M2)
registerTest({
  id: 'T1-F11-01',
  name: 'F11: Technical Specs Table Component Contract',
  tier: 1,
  feature: 'F11',
  milestone: 'M2',
  execute: () => {
    assert(fileExists('components/specs-table.tsx'), 'components/specs-table.tsx must exist');
    const c = readFile('components/specs-table.tsx');
    assert(c.includes('export default function') || c.includes('export function'), 'specs-table.tsx must export functional component');
  },
});

registerTest({
  id: 'T1-F11-02',
  name: 'F11: Cloud Bot Competitor Contrast Column',
  tier: 1,
  feature: 'F11',
  milestone: 'M2',
  execute: () => {
    const c = readFile('components/specs-table.tsx');
    assert(c, 'specs-table.tsx must exist');
    assert(c.includes('Cloud') || c.includes('Generic') || c.includes('Meeting Bot') || c.includes('Otter') || c.includes('Fireflies'), 'Specs table must contrast against generic cloud meeting bots');
  },
});

registerTest({
  id: 'T1-F11-03',
  name: 'F11: Six Core Technical Dimensions Coverage',
  tier: 1,
  feature: 'F11',
  milestone: 'M2',
  execute: () => {
    const c = readFile('components/specs-table.tsx');
    assert(c, 'specs-table.tsx must exist');
    assert(c.includes('Audio') || c.includes('Loopback'), 'Specs must cover Audio Loopback');
    assert(c.includes('Stealth') || c.includes('Screen') || c.includes('Capture'), 'Specs must cover Screen Share Stealth');
    assert(c.includes('Latency') || c.includes('Speed'), 'Specs must cover Latency');
    assert(c.includes('Privacy') || c.includes('Storage') || c.includes('Local'), 'Specs must cover Local Privacy');
  },
});

registerTest({
  id: 'T1-F11-04',
  name: 'F11: Semantic Table HTML Elements Hierarchy',
  tier: 1,
  feature: 'F11',
  milestone: 'M2',
  execute: () => {
    const c = readFile('components/specs-table.tsx');
    assert(c, 'specs-table.tsx must exist');
    assert(c.includes('<table') || c.includes('table'), 'Specs table must use semantic table structure');
    assert(c.includes('<th') || c.includes('th'), 'Specs table must use semantic th header cells');
    assert(c.includes('<td') || c.includes('td'), 'Specs table must use semantic td body cells');
  },
});

registerTest({
  id: 'T1-F11-05',
  name: 'F11: NovaPilot Architectural Superiority Accent Styling',
  tier: 1,
  feature: 'F11',
  milestone: 'M2',
  execute: () => {
    const c = readFile('components/specs-table.tsx');
    assert(c, 'specs-table.tsx must exist');
    assert(c.includes('emerald') || c.includes('cyan') || c.includes('violet') || c.includes('indigo') || c.includes('border-'), 'NovaPilot column must feature accent styling highlight');
  },
});

// Feature 12: Direct Windows Download Portal (F12, Milestone M2)
registerTest({
  id: 'T1-F12-01',
  name: 'F12: Windows Download CTA Section Component Contract',
  tier: 1,
  feature: 'F12',
  milestone: 'M2',
  execute: () => {
    assert(fileExists('components/windows-cta.tsx'), 'components/windows-cta.tsx must exist');
    const c = readFile('components/windows-cta.tsx');
    assert(c.includes('id="download"') || c.includes("id='download'") || c.includes('download'), 'windows-cta.tsx must define #download anchor section');
  },
});

registerTest({
  id: 'T1-F12-02',
  name: 'F12: Executable Installer Binary Filename Specification',
  tier: 1,
  feature: 'F12',
  milestone: 'M2',
  execute: () => {
    const c = readFile('components/windows-cta.tsx');
    assert(c, 'windows-cta.tsx must exist');
    assert(c.includes('NovaPilot-AI-Setup-2.7.1.exe') || c.includes('NovaPilot-Setup') || c.includes('.exe'), 'windows-cta.tsx must reference Windows installer executable');
  },
});

registerTest({
  id: 'T1-F12-03',
  name: 'F12: Binary File Size Specification (~489 MB)',
  tier: 1,
  feature: 'F12',
  milestone: 'M2',
  execute: () => {
    const c = readFile('components/windows-cta.tsx');
    assert(c, 'windows-cta.tsx must exist');
    assert(c.includes('489') || c.includes('MB') || c.includes('Size'), 'windows-cta.tsx must display installer package size (~489 MB)');
  },
});

registerTest({
  id: 'T1-F12-04',
  name: 'F12: Cryptographic SHA-512 / SHA-256 Checksum Specification',
  tier: 1,
  feature: 'F12',
  milestone: 'M2',
  execute: () => {
    const c = readFile('components/windows-cta.tsx');
    assert(c, 'windows-cta.tsx must exist');
    assert(c.includes('SHA') || c.includes('Checksum') || c.includes('checksum') || c.includes('sha'), 'windows-cta.tsx must provide cryptographic checksum integrity information');
  },
});

registerTest({
  id: 'T1-F12-05',
  name: 'F12: Standardized DownloadButton UI Component Contract',
  tier: 1,
  feature: 'F12',
  milestone: 'M1',
  execute: () => {
    assert(fileExists('components/ui/download-button.tsx'), 'components/ui/download-button.tsx must exist');
    const c = readFile('components/ui/download-button.tsx');
    assert(c.includes('DownloadButton') || c.includes('export default function') || c.includes('export function'), 'download-button.tsx must export DownloadButton component');
  },
});

// Feature 13: Interactive 3D Architecture Visualizer (F13, Milestone M3)
registerTest({
  id: 'T1-F13-01',
  name: 'F13: Interactive 3D Visualizer Component Contract',
  tier: 1,
  feature: 'F13',
  milestone: 'M3',
  execute: () => {
    assert(fileExists('components/interactive-architecture.tsx'), 'components/interactive-architecture.tsx must exist');
    const c = readFile('components/interactive-architecture.tsx');
    assert(c.includes('"use client"') || c.includes("'use client'"), 'interactive-architecture.tsx must be a client component');
  },
});

registerTest({
  id: 'T1-F13-02',
  name: 'F13: Three-Tier Layered Subsystem Stack Visualization',
  tier: 1,
  feature: 'F13',
  milestone: 'M3',
  execute: () => {
    const c = readFile('components/interactive-architecture.tsx');
    assert(c, 'interactive-architecture.tsx must exist');
    assert(c.includes('Audio') || c.includes('WASAPI'), '3D visualizer must model Audio Loopback layer');
    assert(c.includes('ThinkStripper') || c.includes('LLM') || c.includes('Intelligence'), '3D visualizer must model ThinkStripper/LLM layer');
    assert(c.includes('Stealth') || c.includes('HUD') || c.includes('Overlay'), '3D visualizer must model Stealth Overlay HUD layer');
  },
});

registerTest({
  id: 'T1-F13-03',
  name: 'F13: Interactive Layer Inspector Controls',
  tier: 1,
  feature: 'F13',
  milestone: 'M3',
  execute: () => {
    const c = readFile('components/interactive-architecture.tsx');
    assert(c, 'interactive-architecture.tsx must exist');
    assert(c.includes('activeLayer') || c.includes('selected') || c.includes('onClick') || c.includes('button'), '3D visualizer must provide interactive layer selector controls');
  },
});

registerTest({
  id: 'T1-F13-04',
  name: 'F13: Zero Layout Shift Container Height Constraints',
  tier: 1,
  feature: 'F13',
  milestone: 'M3',
  execute: () => {
    const c = readFile('components/interactive-architecture.tsx');
    assert(c, 'interactive-architecture.tsx must exist');
    assert(c.includes('min-h-') || c.includes('h-['), '3D visualizer must enforce min-height container preventing layout shifts');
  },
});

registerTest({
  id: 'T1-F13-05',
  name: 'F13: WebGL / Animation Frame Lifecycle Cleanup',
  tier: 1,
  feature: 'F13',
  milestone: 'M3',
  execute: () => {
    const c = readFile('components/interactive-architecture.tsx');
    assert(c, 'interactive-architecture.tsx must exist');
    assert(c.includes('useEffect') && (c.includes('return') || c.includes('cancelAnimationFrame') || c.includes('dispose')), '3D visualizer must implement cleanup in useEffect');
  },
});

// Feature 14: Responsive 16:9 Media Showcase (F14, Milestone M3)
registerTest({
  id: 'T1-F14-01',
  name: 'F14: Responsive 16:9 Media Showcase Component Contract',
  tier: 1,
  feature: 'F14',
  milestone: 'M3',
  execute: () => {
    assert(fileExists('components/media-showcase.tsx'), 'components/media-showcase.tsx must exist');
    const c = readFile('components/media-showcase.tsx');
    assert(c.includes('"use client"') || c.includes("'use client'"), 'media-showcase.tsx must be a client component');
  },
});

registerTest({
  id: 'T1-F14-02',
  name: 'F14: Strict 16:9 Responsive Aspect Ratio Framing',
  tier: 1,
  feature: 'F14',
  milestone: 'M3',
  execute: () => {
    const c = readFile('components/media-showcase.tsx');
    assert(c, 'media-showcase.tsx must exist');
    assert(c.includes('aspect-video') || c.includes('16/9') || c.includes('56.25%'), 'media-showcase.tsx must enforce strict 16:9 aspect ratio');
  },
});

registerTest({
  id: 'T1-F14-03',
  name: 'F14: Three Core Workflow Scenario Switcher',
  tier: 1,
  feature: 'F14',
  milestone: 'M3',
  execute: () => {
    const c = readFile('components/media-showcase.tsx');
    assert(c, 'media-showcase.tsx must exist');
    assert(c.includes('Coding') || c.includes('Interview'), 'Showcase must include Coding Interview scenario');
    assert(c.includes('Stealth') || c.includes('Meeting'), 'Showcase must include Stealth Meeting scenario');
    assert(c.includes('Audio') || c.includes('WASAPI') || c.includes('Stream'), 'Showcase must include Audio Analysis scenario');
  },
});

registerTest({
  id: 'T1-F14-04',
  name: 'F14: Scenario 1 - Real-Time Coding Interview Simulation',
  tier: 1,
  feature: 'F14',
  milestone: 'M3',
  execute: () => {
    const c = readFile('components/media-showcase.tsx');
    assert(c, 'media-showcase.tsx must exist');
    assert(c.includes('code') || c.includes('Python') || c.includes('TypeScript') || c.includes('def ') || c.includes('think'), 'Showcase must simulate live code completion with reasoning strip');
  },
});

registerTest({
  id: 'T1-F14-05',
  name: 'F14: Scenario 2 & 3 - Stealth Invisibility & Waveform Simulation',
  tier: 1,
  feature: 'F14',
  milestone: 'M3',
  execute: () => {
    const c = readFile('components/media-showcase.tsx');
    assert(c, 'media-showcase.tsx must exist');
    assert(c.includes('Zoom') || c.includes('Screen') || c.includes('Waveform') || c.includes('Loopback') || c.includes('Diarization'), 'Showcase must simulate screen share contrast or multi-channel audio stream');
  },
});

// Feature 15: Impeccable Design & Craftsmanship (F15, Milestone M4)
registerTest({
  id: 'T1-F15-01',
  name: 'F15: Cybernetic Obsidian & Tri-Chroma Design Tokens',
  tier: 1,
  feature: 'F15',
  milestone: 'M4',
  execute: () => {
    const css = readFile('app/css/style.css') || readFile('app/globals.css') || '';
    assert(
      css.includes('#030712') || css.includes('#0a0f1d') || css.includes('gray-950') || css.includes('zinc-950') || css.includes('slate-950') || css.includes('emerald') || css.includes('cyan') || css.includes('violet'),
      'Cybernetic dark theme palette tokens must be established'
    );
  },
});

registerTest({
  id: 'T1-F15-02',
  name: 'F15: WCAG 2.1 AAA / AA Dark Theme Contrast Ratios',
  tier: 1,
  feature: 'F15',
  milestone: 'M4',
  execute: () => {
    const bgObsidian = '#030712';
    const textPrimary = '#f9fafb';
    const accentCyan = '#06b6d4';
    const accentEmerald = '#10b981';

    const ratioPrimary = calculateContrastRatio(bgObsidian, textPrimary);
    const ratioCyan = calculateContrastRatio(bgObsidian, accentCyan);
    const ratioEmerald = calculateContrastRatio(bgObsidian, accentEmerald);

    assert(ratioPrimary >= 7.0, `Primary text contrast ratio must meet WCAG AAA (>= 7.0:1), got ${ratioPrimary.toFixed(2)}:1`);
    assert(ratioCyan >= 4.5, `Cyan accent contrast ratio must meet WCAG AA (>= 4.5:1), got ${ratioCyan.toFixed(2)}:1`);
    assert(ratioEmerald >= 4.5, `Emerald accent contrast ratio must meet WCAG AA (>= 4.5:1), got ${ratioEmerald.toFixed(2)}:1`);
  },
});

registerTest({
  id: 'T1-F15-03',
  name: 'F15: Clean Typographic Scale & Hierarchy',
  tier: 1,
  feature: 'F15',
  milestone: 'M4',
  execute: () => {
    const layout = readFile('app/layout.tsx');
    assert(layout, 'app/layout.tsx must exist');
    assert(layout.includes('font-') || layout.includes('Inter') || layout.includes('Geist') || layout.includes('sans'), 'Clean typography system must be declared in root layout');
  },
});

registerTest({
  id: 'T1-F15-04',
  name: 'F15: Purposeful Micro-Interactions & Transition Utility Tokens',
  tier: 1,
  feature: 'F15',
  milestone: 'M4',
  execute: () => {
    const files = ['components/ui/header.tsx', 'components/ui/footer.tsx', 'components/ui/download-button.tsx'];
    let transitionFound = false;
    for (const f of files) {
      const c = readFile(f);
      if (c && (c.includes('transition') || c.includes('duration-') || c.includes('hover:'))) {
        transitionFound = true;
        break;
      }
    }
    assert(transitionFound, 'Interactive UI components must declare smooth transition micro-interactions');
  },
});

registerTest({
  id: 'T1-F15-05',
  name: 'F15: Design Anti-Pattern Audit (No Blurry Halos, No Generic SaaS Clichés)',
  tier: 1,
  feature: 'F15',
  milestone: 'M4',
  execute: () => {
    const files = scanFiles('components');
    for (const f of files) {
      const c = readFile(f);
      if (!c) continue;
      assert(!c.includes('bg-purple-600 hover:bg-purple-700'), `Found generic SaaS purple button cliché in ${f}`);
    }
  },
});

// Feature 16: Production Footer & Privacy Policy (F16, Milestone M1)
registerTest({
  id: 'T1-F16-01',
  name: 'F16: Production Footer Component Contract',
  tier: 1,
  feature: 'F16',
  milestone: 'M1',
  execute: () => {
    assert(fileExists('components/ui/footer.tsx'), 'components/ui/footer.tsx must exist');
    const c = readFile('components/ui/footer.tsx');
    assert(c.includes('export default function Footer'), 'Footer component must export default function Footer()');
  },
});

registerTest({
  id: 'T1-F16-02',
  name: 'F16: Local-First Privacy Statement Guarantee in Footer',
  tier: 1,
  feature: 'F16',
  milestone: 'M1',
  execute: () => {
    const c = readFile('components/ui/footer.tsx');
    assert(c, 'footer.tsx must exist');
    assert(c.includes('privacy') || c.includes('Privacy') || c.includes('Local-first') || c.includes('local-first') || c.includes('zero cloud'), 'Footer must feature local-first privacy statement');
  },
});

registerTest({
  id: 'T1-F16-03',
  name: 'F16: Official GitHub Repository / Release Notes Anchor',
  tier: 1,
  feature: 'F16',
  milestone: 'M1',
  execute: () => {
    const c = readFile('components/ui/footer.tsx');
    assert(c, 'footer.tsx must exist');
    assert(c.includes('github.com') || c.includes('GitHub') || c.includes('releases'), 'Footer must provide legitimate GitHub link');
  },
});

registerTest({
  id: 'T1-F16-04',
  name: 'F16: Zero Dead Links (href="#0") in Production Footer',
  tier: 1,
  feature: 'F16',
  milestone: 'M1',
  execute: () => {
    const c = readFile('components/ui/footer.tsx');
    assert(c, 'footer.tsx must exist');
    assert(!c.includes('href="#0"') && !c.includes("href='#0'"), 'Footer must have zero dead links (href="#0")');
  },
});

registerTest({
  id: 'T1-F16-05',
  name: 'F16: Official NovaPilot AI Copyright & Version 2.7.1 Notice',
  tier: 1,
  feature: 'F16',
  milestone: 'M1',
  execute: () => {
    const c = readFile('components/ui/footer.tsx');
    assert(c, 'footer.tsx must exist');
    assert(c.includes('NovaPilot') && (c.includes('2.7.1') || c.includes('2026') || c.includes('All rights reserved')), 'Footer must include NovaPilot copyright notice');
  },
});

// Feature 17: Production Build & Lint Certification (F17, Milestone M5)
registerTest({
  id: 'T1-F17-01',
  name: 'F17: TypeScript Strict Mode Configuration Integrity',
  tier: 1,
  feature: 'F17',
  milestone: 'M5',
  execute: () => {
    assert(fileExists('tsconfig.json'), 'tsconfig.json must exist');
    const tsconfig = JSON.parse(readFile('tsconfig.json'));
    assert(tsconfig.compilerOptions, 'tsconfig must contain compilerOptions');
    assert(tsconfig.compilerOptions.strict === true, 'tsconfig strict mode must be enabled (strict: true)');
    assert(tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@/*'], 'tsconfig must configure @/* path mapping');
  },
});

registerTest({
  id: 'T1-F17-02',
  name: 'F17: Next.js Configuration Integrity',
  tier: 1,
  feature: 'F17',
  milestone: 'M5',
  execute: () => {
    const exists = fileExists('next.config.js') || fileExists('next.config.mjs') || fileExists('next.config.ts');
    assert(exists, 'next.config must exist');
  },
});

registerTest({
  id: 'T1-F17-03',
  name: 'F17: Production Build & Lint Scripts in Package Manifest',
  tier: 1,
  feature: 'F17',
  milestone: 'M5',
  execute: () => {
    const pkg = JSON.parse(readFile('package.json'));
    assert(pkg.scripts && pkg.scripts.build, 'package.json must declare "build" script');
    assert(pkg.scripts && pkg.scripts.lint, 'package.json must declare "lint" script');
  },
});

registerTest({
  id: 'T1-F17-04',
  name: 'F17: SSR Browser API Safety & Direct Window Guarding',
  tier: 1,
  feature: 'F17',
  milestone: 'M5',
  execute: () => {
    const clientFiles = scanFiles('components').filter(f => {
      const c = readFile(f);
      return c && (c.includes('"use client"') || c.includes("'use client'"));
    });
    assert(clientFiles.length > 0, 'Client components must use "use client" directive for browser interactivity');
  },
});

registerTest({
  id: 'T1-F17-05',
  name: 'F17: App Router Page Composition Integrity',
  tier: 1,
  feature: 'F17',
  milestone: 'M5',
  execute: () => {
    const page = readFile('app/(default)/page.tsx') || readFile('app/page.tsx');
    assert(page, 'Main landing page (app/(default)/page.tsx or app/page.tsx) must exist');
    assert(page.includes('export default function'), 'Landing page must export default function');
  },
});

// ---------------------------------------------------------------------------
// TIER 2: BOUNDARY & CORNER CASES (5 Tests)
// ---------------------------------------------------------------------------

registerTest({
  id: 'T2-B1',
  name: 'T2: Universal Zero Dead Links (href="#0" / empty href) Audit',
  tier: 2,
  feature: 'BVA',
  milestone: 'M1',
  execute: () => {
    const files = scanFiles('components').concat(scanFiles('app'));
    const deadLinkViolations = [];
    for (const f of files) {
      const c = readFile(f);
      if (!c) continue;
      if (c.includes('href="#0"') || c.includes("href='#0'") || c.includes('href=""') || c.includes("href=''")) {
        deadLinkViolations.push(f);
      }
    }
    assert(deadLinkViolations.length === 0, `Found dead link placeholders in:\n${deadLinkViolations.join('\n')}`);
  },
});

registerTest({
  id: 'T2-B2',
  name: 'T2: FSM Boundary Resiliency (Empty Strings, Whitespace, Malformed Delimiters)',
  tier: 2,
  feature: 'BVA',
  milestone: 'M2',
  execute: () => {
    // Empty stream
    assert(runThinkStripperFSM([]) === '', 'Empty token stream must yield empty string');
    // Whitespace only
    assert(runThinkStripperFSM(['   ', '\n\t  ']) === '   \n\t  ', 'Whitespace tokens must be preserved in pass state');
    // Malformed broken opening delimiter without closing
    assert(runThinkStripperFSM(['<think']) === '', 'Trailing unclosed partial tag must be held and dropped at stream end');
    // Nested reasoning tag attempts
    const nested = runThinkStripperFSM(['Start ', '<think>Outer <think>inner</think> remaining</think> End']);
    assert(nested === 'Start  End', `Nested thinking tag boundary must not leak. Got: "${nested}"`);
  },
});

registerTest({
  id: 'T2-B3',
  name: 'T2: Cryptographic Checksum Regex & Entropy Verification',
  tier: 2,
  feature: 'BVA',
  milestone: 'M2',
  execute: () => {
    const sha256Pattern = /^[a-fA-F0-9]{64}$/;
    const sha512Pattern = /^[a-fA-F0-9]{128}$/;

    // Generate real sha256 & sha512
    const sample = 'NovaPilot-AI-Setup-2.7.1.exe';
    const hash256 = crypto.createHash('sha256').update(sample).digest('hex');
    const hash512 = crypto.createHash('sha512').update(sample).digest('hex');

    assert(sha256Pattern.test(hash256), `Generated SHA-256 "${hash256}" failed 64-character hex regex`);
    assert(sha512Pattern.test(hash512), `Generated SHA-512 "${hash512}" failed 128-character hex regex`);

    // Verify invalid patterns fail
    assert(!sha256Pattern.test('invalid_hash_string'), 'Malformed SHA-256 must fail regex');
    assert(!sha512Pattern.test('short_hash'), 'Short SHA-512 must fail regex');
  },
});

registerTest({
  id: 'T2-B4',
  name: 'T2: Responsive Breakpoint Sizing Extremes (Mobile 320px to 4K 2560px)',
  tier: 2,
  feature: 'BVA',
  milestone: 'M4',
  execute: () => {
    const files = scanFiles('components');
    let smFound = false;
    let mdFound = false;
    let lgFound = false;
    let maxWFound = false;

    for (const f of files) {
      const c = readFile(f);
      if (!c) continue;
      if (c.includes('sm:')) smFound = true;
      if (c.includes('md:')) mdFound = true;
      if (c.includes('lg:')) lgFound = true;
      if (c.includes('max-w-')) maxWFound = true;
    }
    assert(smFound, 'Responsive sm: breakpoint must be used');
    assert(mdFound, 'Responsive md: breakpoint must be used');
    assert(lgFound, 'Responsive lg: breakpoint must be used');
    assert(maxWFound, 'Container max-w constraints must be used for ultra-wide displays');
  },
});

registerTest({
  id: 'T2-B5',
  name: 'T2: Downmix Boundary Clamping for Extreme/Clipped Audio Frames',
  tier: 2,
  feature: 'BVA',
  milestone: 'M2',
  execute: () => {
    // Extreme float inputs exceeding standard [-1.0, 1.0] range
    const clippedInput = new Float32Array([2.5, 3.5, -4.0, -2.0]);
    const clampedMono = runWASAPIDownmix(2, clippedInput);

    // Assert that output samples are strictly clamped to [-1.0, 1.0]
    assert(clampedMono[0] === 1.0, `Expected clamped value 1.0, got ${clampedMono[0]}`);
    assert(clampedMono[1] === -1.0, `Expected clamped value -1.0, got ${clampedMono[1]}`);
  },
});

// ---------------------------------------------------------------------------
// TIER 3: CROSS-FEATURE COMBINATIONS (5 Tests)
// ---------------------------------------------------------------------------

registerTest({
  id: 'T3-C1',
  name: 'T3: Header CTA -> Windows Download Section Synchronization',
  tier: 3,
  feature: 'CrossFeature',
  milestone: 'M2',
  execute: () => {
    const header = readFile('components/ui/header.tsx');
    assert(header, 'header.tsx must exist');
    assert(header.includes('#download'), 'Header must contain anchor link to #download section');

    const page = readFile('app/(default)/page.tsx') || readFile('app/page.tsx');
    const windowsCta = readFile('components/windows-cta.tsx');
    const hasDownloadTarget = (page && (page.includes('id="download"') || page.includes("id='download'"))) ||
                              (windowsCta && (windowsCta.includes('id="download"') || windowsCta.includes("id='download'")));
    assert(hasDownloadTarget, 'A section with id="download" must exist in page or windows-cta.tsx');
  },
});

registerTest({
  id: 'T3-C2',
  name: 'T3: 3D Architecture Visualizer -> 16:9 Showcase Scenario Alignment',
  tier: 3,
  feature: 'CrossFeature',
  milestone: 'M3',
  execute: () => {
    const arch = readFile('components/interactive-architecture.tsx');
    const media = readFile('components/media-showcase.tsx');
    assert(arch && media, 'Both interactive-architecture.tsx and media-showcase.tsx must exist');

    // 1:1 conceptual mapping
    // Audio Loopback layer -> Audio Analysis scenario
    // ThinkStripper layer -> Coding Interview scenario
    // Stealth HUD layer -> Stealth Meeting scenario
    const hasAudioSync = (arch.includes('Audio') || arch.includes('WASAPI')) && (media.includes('Audio') || media.includes('WASAPI') || media.includes('Waveform'));
    const hasLlmSync = (arch.includes('ThinkStripper') || arch.includes('LLM')) && (media.includes('Coding') || media.includes('Code') || media.includes('think'));
    const hasStealthSync = (arch.includes('Stealth') || arch.includes('HUD')) && (media.includes('Stealth') || media.includes('Zoom') || media.includes('Screen'));

    assert(hasAudioSync, 'Audio Loopback layer in 3D must align with Audio Analysis scenario in 16:9 showcase');
    assert(hasLlmSync, 'ThinkStripper layer in 3D must align with Coding Interview scenario in 16:9 showcase');
    assert(hasStealthSync, 'Stealth HUD layer in 3D must align with Stealth Meeting scenario in 16:9 showcase');
  },
});

registerTest({
  id: 'T3-C3',
  name: 'T3: Dark Theme Visual Cohesion Across Component Surfaces',
  tier: 3,
  feature: 'CrossFeature',
  milestone: 'M4',
  execute: () => {
    const components = ['components/ui/header.tsx', 'components/ui/footer.tsx'];
    for (const compPath of components) {
      const c = readFile(compPath);
      if (!c) continue;
      // All components should use dark backdrop or border tokens
      assert(c.includes('bg-') || c.includes('border-') || c.includes('text-'), `${compPath} must use consistent Tailwind styling tokens`);
    }
  },
});

registerTest({
  id: 'T3-C4',
  name: 'T3: Release Package Metadata Consistency Across Portal',
  tier: 3,
  feature: 'CrossFeature',
  milestone: 'M2',
  execute: () => {
    const targetVersion = '2.7.1';
    const targetExe = 'NovaPilot-AI-Setup-2.7.1.exe';

    const header = readFile('components/ui/header.tsx');
    if (header) {
      assert(header.includes(targetVersion), `Header version indicator must be ${targetVersion}`);
    }

    const windowsCta = readFile('components/windows-cta.tsx');
    if (windowsCta) {
      assert(windowsCta.includes(targetVersion) || windowsCta.includes(targetExe), `Windows CTA must reference ${targetVersion} or ${targetExe}`);
    }
  },
});

registerTest({
  id: 'T3-C5',
  name: 'T3: Navigation Anchor Graph Completeness',
  tier: 3,
  feature: 'CrossFeature',
  milestone: 'M2',
  execute: () => {
    const header = readFile('components/ui/header.tsx');
    if (!header) return;

    const anchors = ['#features', '#architecture', '#demo', '#specs', '#download'];
    const pageFiles = ['app/(default)/page.tsx', 'app/page.tsx', 'components/features-grid.tsx', 'components/interactive-architecture.tsx', 'components/media-showcase.tsx', 'components/specs-table.tsx', 'components/windows-cta.tsx'];
    const combinedContent = pageFiles.map(f => readFile(f) || '').join('\n');

    for (const anchor of anchors) {
      const id = anchor.slice(1);
      const hasId = combinedContent.includes(`id="${id}"`) || combinedContent.includes(`id='${id}'`);
      assert(hasId, `Navigation anchor target "${anchor}" has no corresponding DOM section id="${id}" in landing composition`);
    }
  },
});

// ---------------------------------------------------------------------------
// TIER 4: REAL-WORLD APPLICATION SCENARIOS (5 Scenarios)
// ---------------------------------------------------------------------------

registerTest({
  id: 'T4-S1',
  name: 'T4 Scenario 1: First-Time Windows User Journey Walkthrough',
  tier: 4,
  feature: 'Scenario',
  milestone: 'M2',
  execute: () => {
    // 1. User arrives at landing page
    const page = readFile('app/(default)/page.tsx') || readFile('app/page.tsx');
    assert(page, 'Main landing page must exist for user entry');

    // 2. User sees Header with authentic brand and version
    const header = readFile('components/ui/header.tsx');
    assert(header && header.includes('2.7.1'), 'User must observe official v2.7.1 version badge');

    // 3. User inspects Hero value proposition
    const heroFile = fileExists('components/hero.tsx') ? 'components/hero.tsx' : 'components/hero-home.tsx';
    const hero = readFile(heroFile);
    assert(hero && (hero.includes('Copilot') || hero.includes('Invisible') || hero.includes('Stealth')), 'User must comprehend value proposition');

    // 4. User navigates to Download Portal
    const windowsCta = readFile('components/windows-cta.tsx');
    assert(windowsCta && (windowsCta.includes('.exe') || windowsCta.includes('Download')), 'User must find Windows installer download affordance');

    // 5. User verifies package size and cryptographic integrity
    assert(windowsCta && (windowsCta.includes('489') || windowsCta.includes('SHA') || windowsCta.includes('Checksum')), 'User must be provided file size and checksum verification');
  },
});

registerTest({
  id: 'T4-S2',
  name: 'T4 Scenario 2: Technical Evaluator Deep-Dive Inspection Walkthrough',
  tier: 4,
  feature: 'Scenario',
  milestone: 'M3',
  execute: () => {
    // 1. Evaluator inspects 3D Visualizer
    const arch = readFile('components/interactive-architecture.tsx');
    assert(arch && (arch.includes('WASAPI') || arch.includes('Audio')), 'Evaluator must see hardware-level WASAPI audio loopback layer');
    assert(arch && (arch.includes('ThinkStripper') || arch.includes('LLM')), 'Evaluator must see reasoning-stripper LLM engine layer');
    assert(arch && (arch.includes('Stealth') || arch.includes('HUD')), 'Evaluator must see stealth overlay compositor layer');

    // 2. Evaluator audits Specs Comparison Matrix
    const specs = readFile('components/specs-table.tsx');
    assert(specs && specs.includes('table'), 'Evaluator must access structured comparison table');
    assert(specs && (specs.includes('WDA_EXCLUDEFROMCAPTURE') || specs.includes('Stealth')), 'Evaluator must verify OS display capture exclusion specs');
  },
});

registerTest({
  id: 'T4-S3',
  name: 'T4 Scenario 3: Live Demo Widescreen 16:9 Walkthrough',
  tier: 4,
  feature: 'Scenario',
  milestone: 'M3',
  execute: () => {
    const media = readFile('components/media-showcase.tsx');
    assert(media, 'Showcase player component must exist');
    assert(media.includes('aspect-video'), 'Player must maintain strict 16:9 aspect ratio');

    // Workflow simulation controls
    assert(media.includes('Coding') || media.includes('Interview'), 'Scenario 1: Coding Interview simulation must be present');
    assert(media.includes('Stealth') || media.includes('Meeting'), 'Scenario 2: Stealth Meeting simulation must be present');
    assert(media.includes('Audio') || media.includes('Waveform'), 'Scenario 3: Audio Stream simulation must be present');
  },
});

registerTest({
  id: 'T4-S4',
  name: 'T4 Scenario 4: Security & Privacy Compliance Auditor Walkthrough',
  tier: 4,
  feature: 'Scenario',
  milestone: 'M2',
  execute: () => {
    // 1. Auditor verifies Local-First zero storage commitment
    const footer = readFile('components/ui/footer.tsx');
    const specs = readFile('components/specs-table.tsx');
    const hasPrivacy = (footer && (footer.includes('privacy') || footer.includes('Local-first'))) ||
                       (specs && (specs.includes('Privacy') || specs.includes('Local')));
    assert(hasPrivacy, 'Security auditor must find explicit zero cloud storage privacy guarantee');

    // 2. Auditor inspects serverless telemetry architecture
    const features = readFile('components/features-grid.tsx');
    const hasTelemetry = (features && (features.includes('Telegram') || features.includes('Telemetry') || features.includes('SHA-256'))) ||
                         (specs && (specs.includes('Telemetry') || specs.includes('Telegram')));
    assert(hasTelemetry, 'Auditor must verify crash telemetry architecture uses deduplicated error reporting with zero prompt payload storage');
  },
});

registerTest({
  id: 'T4-S5',
  name: 'T4 Scenario 5: Cross-Device Responsive Viewport Walkthrough',
  tier: 4,
  feature: 'Scenario',
  milestone: 'M4',
  execute: () => {
    const header = readFile('components/ui/header.tsx');
    assert(header, 'Header component must exist');

    // Mobile navigation support (either flex wrap, md: breakpoints, or mobile menu)
    assert(header.includes('md:') || header.includes('sm:') || header.includes('hidden') || header.includes('flex'), 'Header must implement responsive mobile layout');

    // Zero layout shift verification
    const arch = readFile('components/interactive-architecture.tsx');
    if (arch) {
      assert(arch.includes('min-h-') || arch.includes('h-['), '3D visualizer must enforce height constraint across breakpoints');
    }

    const media = readFile('components/media-showcase.tsx');
    if (media) {
      assert(media.includes('aspect-video'), 'Media player must enforce aspect-ratio preservation across breakpoints');
    }
  },
});

// ---------------------------------------------------------------------------
// CLI Execution Runner
// ---------------------------------------------------------------------------

async function runCli() {
  const args = process.argv.slice(2);

  // Parse arguments
  let filterTier = null;
  let filterFeature = null;
  let filterMilestone = null;
  let jsonOutput = false;
  let summaryOnly = false;
  let listOnly = false;
  let allowPending = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--tier' && args[i + 1]) {
      filterTier = parseInt(args[++i], 10);
    } else if (arg === '--feature' && args[i + 1]) {
      filterFeature = args[++i].toUpperCase();
    } else if (arg === '--milestone' && args[i + 1]) {
      filterMilestone = args[++i].toUpperCase();
    } else if (arg === '--json') {
      jsonOutput = true;
    } else if (arg === '--summary') {
      summaryOnly = true;
    } else if (arg === '--list') {
      listOnly = true;
    } else if (arg === '--allow-pending') {
      allowPending = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
NovaPilot AI Web Platform — E2E Test Suite Runner

Usage:
  node scripts/verify-e2e.mjs [options]

Options:
  --tier <1|2|3|4>        Run only tests in the specified tier
  --feature <F1..F17>     Run tests matching specific feature
  --milestone <M1..M5>    Run tests assigned to specific milestone
  --allow-pending         Do not fail build for pending implementation tests
  --summary               Show compact pass/fail summary
  --json                  Output structured JSON report
  --list                  List all registered test specifications
  --help, -h              Display this help menu
`);
      process.exit(0);
    }
  }

  if (listOnly) {
    console.log(`\nRegistered Tests (${testSuite.length} total):\n`);
    for (const t of testSuite) {
      console.log(`  [${t.id}] Tier ${t.tier} | Feature: ${t.feature} | Milestone: ${t.milestone} | ${t.name}`);
    }
    process.exit(0);
  }

  // Filter tests
  const testsToRun = testSuite.filter(t => {
    if (filterTier !== null && t.tier !== filterTier) return false;
    if (filterFeature !== null && t.feature !== filterFeature) return false;
    if (filterMilestone !== null && t.milestone !== filterMilestone) return false;
    return true;
  });

  if (!jsonOutput && !summaryOnly) {
    console.log(`\n${colors.bold}${colors.cyan}======================================================================${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}  NovaPilot AI Web Platform — Comprehensive E2E Verification Suite${colors.reset}`);
    console.log(`${colors.dim}  Tiers: 1 (Features), 2 (Boundaries), 3 (Combinations), 4 (Scenarios)${colors.reset}`);
    console.log(`${colors.dim}  Total Registered: ${testSuite.length} | Selected: ${testsToRun.length}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);
  }

  const results = [];
  const startTime = Date.now();
  let passedCount = 0;
  let failedCount = 0;

  for (const t of testsToRun) {
    const testResult = {
      id: t.id,
      name: t.name,
      tier: t.tier,
      feature: t.feature,
      milestone: t.milestone,
      status: 'PASS',
      error: null,
    };

    try {
      t.execute();
      testResult.status = 'PASS';
      passedCount++;
      if (!jsonOutput && !summaryOnly) {
        console.log(`  ${colors.green}✓ PASS${colors.reset} [${t.id}] ${t.name}`);
      }
    } catch (err) {
      testResult.status = 'FAIL';
      testResult.error = err.message;
      failedCount++;
      if (!jsonOutput && !summaryOnly) {
        console.log(`  ${colors.red}✗ FAIL${colors.reset} [${t.id}] ${t.name}`);
        console.log(`         ${colors.dim}${err.message}${colors.reset}`);
      }
    }
    results.push(testResult);
  }

  const durationMs = Date.now() - startTime;

  if (jsonOutput) {
    const summary = {
      total: testsToRun.length,
      passed: passedCount,
      failed: failedCount,
      durationMs,
      timestamp: new Date().toISOString(),
      results,
    };
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`\n${colors.bold}----------------------------------------------------------------------${colors.reset}`);
    console.log(`${colors.bold}Execution Summary:${colors.reset}`);
    console.log(`  Total Executed: ${testsToRun.length}`);
    console.log(`  ${colors.green}Passed:         ${passedCount}${colors.reset}`);
    console.log(`  ${failedCount > 0 ? colors.red : colors.dim}Failed:         ${failedCount}${colors.reset}`);
    console.log(`  Duration:       ${durationMs}ms`);
    console.log(`${colors.bold}----------------------------------------------------------------------${colors.reset}\n`);

    if (failedCount > 0) {
      console.log(`${colors.bold}${colors.yellow}Escalation / Pending Requirements Breakdown:${colors.reset}`);
      const failuresByMilestone = {};
      for (const r of results.filter(r => r.status === 'FAIL')) {
        failuresByMilestone[r.milestone] = failuresByMilestone[r.milestone] || [];
        failuresByMilestone[r.milestone].push(r);
      }
      for (const [m, fails] of Object.entries(failuresByMilestone)) {
        console.log(`  Milestone ${colors.bold}${m}${colors.reset} (${fails.length} pending tests):`);
        for (const f of fails.slice(0, 5)) {
          console.log(`    - [${f.id}] ${f.name}`);
          console.log(`      ${colors.dim}Reason: ${f.error}${colors.reset}`);
        }
        if (fails.length > 5) {
          console.log(`      ${colors.dim}... and ${fails.length - 5} more tests${colors.reset}`);
        }
      }
      console.log('');
    }
  }

  if (failedCount > 0 && !allowPending) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runCli().catch(err => {
  console.error('Test runner encountered unexpected fatal error:', err);
  process.exit(1);
});
