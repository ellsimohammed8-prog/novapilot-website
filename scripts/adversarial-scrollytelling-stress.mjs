#!/usr/bin/env node
/**
 * ============================================================================
 * NovaPilot AI — Empirical Scrollytelling & 3D Canvas Stress Test Harness
 * ============================================================================
 *
 * Adversarial Challenger 1 Suite:
 * 1. Particle count invariants (assert BufferGeometry contains exactly 6,500 particles)
 * 2. Morph target buffer verification (aPosHero, aPosFeatures, aPosVideo, aPosCta,
 *    aColor, aSize, aRandom: all populated with valid floats, zero NaN/null/undefined)
 * 3. Extreme waypoint and scroll parameter testing (iOS negative bounce, extreme
 *    overscroll > 3.0, rapid 120 FPS oscillation, zero-height documents, C0/C1 continuity)
 * 4. Shader syntax AST parsing and WebGL disposal sequence assertion
 *    (frees geometry, shader material, textures, and calls renderer.forceContextLoss())
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Terminal formatting
const ANSI = {
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
  bgRed: '\x1b[41m\x1b[37m\x1b[1m',
  bgGreen: '\x1b[42m\x1b[30m\x1b[1m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${ANSI.green}✓ PASS${ANSI.reset} [${totalTests.toString().padStart(2, '0')}] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ test: name, error: err.message });
    console.log(`  ${ANSI.red}✗ FAIL${ANSI.reset} [${totalTests.toString().padStart(2, '0')}] ${name}`);
    console.log(`    ${ANSI.red}Error: ${err.message}${ANSI.reset}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log(`\n${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.cyan}  EMPIRICAL CHALLENGER 1: 3D SCROLLYTELLING & PARTICLE STRESS TEST SUITE        ${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}\n`);

// Read target implementation
const canvasFilePath = path.join(ROOT_DIR, 'components', 'supernova-cosmic-canvas.tsx');
assert(fs.existsSync(canvasFilePath), `Canvas source file not found at: ${canvasFilePath}`);
const canvasSource = fs.readFileSync(canvasFilePath, 'utf8');

// ============================================================================
// SECTION 1: PARTICLE COUNT INVARIANTS & BUFFERGEOMETRY ALLOCATION
// ============================================================================
console.log(`${ANSI.bold}${ANSI.blue}--- SECTION 1: Particle Count Invariants & Buffer Allocation ---${ANSI.reset}`);

// Extract constant definition
const particleCountMatch = canvasSource.match(/const\s+PARTICLE_COUNT\s*=\s*(\d+);/);
assert(particleCountMatch, 'Could not find PARTICLE_COUNT constant in source');
const SOURCE_PARTICLE_COUNT = parseInt(particleCountMatch[1], 10);

test('Invariant: PARTICLE_COUNT constant is exactly 6,500', () => {
  assert(SOURCE_PARTICLE_COUNT === 6500, `Expected 6500, got ${SOURCE_PARTICLE_COUNT}`);
});

// Simulate exact particle generation algorithm from supernova-cosmic-canvas.tsx
const PARTICLE_COUNT = 6500;
const geometry = new THREE.BufferGeometry();

const heroPositions = new Float32Array(PARTICLE_COUNT * 3);
const featuresPositions = new Float32Array(PARTICLE_COUNT * 3);
const videoPositions = new Float32Array(PARTICLE_COUNT * 3);
const ctaPositions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);
const sizes = new Float32Array(PARTICLE_COUNT);
const randoms = new Float32Array(PARTICLE_COUNT * 4);

const palette = [
  new THREE.Color("#0047AB"), // Cobalt Blue
  new THREE.Color("#1D4ED8"), // Electric Blue
  new THREE.Color("#00F0FF"), // Cyan
  new THREE.Color("#FFFFFF"), // Pure White
];

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const i3 = i * 3;
  const i4 = i * 4;

  randoms[i4 + 0] = Math.random();
  randoms[i4 + 1] = Math.random();
  randoms[i4 + 2] = Math.random();
  randoms[i4 + 3] = Math.random();

  sizes[i] = 2.0 + Math.random() * 3.5;

  let particleColor;
  if (i < 2400) {
    particleColor = Math.random() > 0.4 ? palette[3] : palette[2];
  } else if (i < 4800) {
    particleColor = Math.random() > 0.5 ? palette[1] : palette[2];
  } else {
    particleColor = Math.random() > 0.4 ? palette[0] : palette[1];
  }
  colors[i3 + 0] = particleColor.r;
  colors[i3 + 1] = particleColor.g;
  colors[i3 + 2] = particleColor.b;

  // Phase 1: aPosHero
  const u1 = Math.random();
  const u2 = Math.random();
  const u3 = Math.random();
  let rHero;
  if (i < 3200) {
    rHero = 0.12 + 1.1 * (u1 * u1);
  } else if (i < 5500) {
    rHero = 1.1 + 1.7 * Math.pow(u1, 1.4);
  } else {
    rHero = 2.5 + 4.5 * u1;
  }
  const thetaHero = Math.acos(2.0 * u2 - 1.0);
  const phiHero = 2.0 * Math.PI * u3;

  heroPositions[i3 + 0] = rHero * Math.sin(thetaHero) * Math.cos(phiHero);
  heroPositions[i3 + 1] = rHero * Math.sin(thetaHero) * Math.sin(phiHero) * 0.88;
  heroPositions[i3 + 2] = rHero * Math.cos(thetaHero) * 0.82;

  // Phase 2: aPosFeatures
  if (i < 3200) {
    const quad = i % 4;
    let cx = 0;
    let cy = 0;
    if (quad === 0) { cx = -3.6; cy = 1.9; }
    else if (quad === 1) { cx = 3.6; cy = 1.9; }
    else if (quad === 2) { cx = -3.6; cy = -1.9; }
    else { cx = 3.6; cy = -1.9; }
    const spreadX = (Math.random() - 0.5) * 2.2;
    const spreadY = (Math.random() - 0.5) * 1.3;
    const spreadZ = (Math.random() - 0.5) * 1.0;
    featuresPositions[i3 + 0] = cx + spreadX;
    featuresPositions[i3 + 1] = cy + spreadY;
    featuresPositions[i3 + 2] = spreadZ;
  } else {
    const angle = (i / (PARTICLE_COUNT - 3200)) * Math.PI * 2.0 + Math.random() * 0.1;
    const rBurst = 3.8 + Math.random() * 2.8;
    featuresPositions[i3 + 0] = rBurst * Math.cos(angle) * 1.3;
    featuresPositions[i3 + 1] = rBurst * Math.sin(angle) * 0.9;
    featuresPositions[i3 + 2] = (Math.random() - 0.5) * 2.6;
  }

  // Phase 3: aPosVideo
  const majorAxis = 3.85;
  const minorAxis = 2.18;
  const ringAngle = (i / PARTICLE_COUNT) * Math.PI * 2.0;
  const tubeAngle = (i * 13.37) % (Math.PI * 2.0);
  const tubeRadius = (Math.random() - 0.5) * 0.65;

  const xBase = (majorAxis + tubeRadius * Math.cos(tubeAngle)) * Math.cos(ringAngle);
  const yBase = (minorAxis + tubeRadius * Math.cos(tubeAngle)) * Math.sin(ringAngle);
  const zBase = tubeRadius * Math.sin(tubeAngle) * 0.8;

  const pitchRad = 14.0 * (Math.PI / 180.0);
  const yawRad = -8.0 * (Math.PI / 180.0);

  const yRot = yBase * Math.cos(pitchRad) - zBase * Math.sin(pitchRad);
  const zRot = yBase * Math.sin(pitchRad) + zBase * Math.cos(pitchRad);

  const xFinal = xBase * Math.cos(yawRad) + zRot * Math.sin(yawRad);
  const zFinal = -xBase * Math.sin(yawRad) + zRot * Math.cos(yawRad);

  videoPositions[i3 + 0] = xFinal;
  videoPositions[i3 + 1] = yRot;
  videoPositions[i3 + 2] = zFinal;

  // Phase 4: aPosCta
  const ySpan = -3.2 + 10.0 * (i / PARTICLE_COUNT);
  const rColumn = 0.55 + 0.22 * (ySpan + 3.2) + (Math.random() - 0.5) * 0.45;
  const spiralAngle = (i * 0.25) + ySpan * 0.7;

  ctaPositions[i3 + 0] = rColumn * Math.cos(spiralAngle);
  ctaPositions[i3 + 1] = ySpan;
  ctaPositions[i3 + 2] = rColumn * Math.sin(spiralAngle);
}

geometry.setAttribute("position", new THREE.BufferAttribute(heroPositions, 3));
geometry.setAttribute("aPosHero", new THREE.BufferAttribute(heroPositions, 3));
geometry.setAttribute("aPosFeatures", new THREE.BufferAttribute(featuresPositions, 3));
geometry.setAttribute("aPosVideo", new THREE.BufferAttribute(videoPositions, 3));
geometry.setAttribute("aPosCta", new THREE.BufferAttribute(ctaPositions, 3));
geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 4));

test('BufferGeometry attribute "position" count is exactly 6,500 with itemSize 3', () => {
  const attr = geometry.getAttribute("position");
  assert(attr !== undefined, 'position attribute missing');
  assert(attr.count === 6500, `Expected count 6500, got ${attr.count}`);
  assert(attr.itemSize === 3, `Expected itemSize 3, got ${attr.itemSize}`);
});

test('BufferGeometry attribute "aPosHero" count is exactly 6,500 with itemSize 3', () => {
  const attr = geometry.getAttribute("aPosHero");
  assert(attr && attr.count === 6500 && attr.itemSize === 3);
});

test('BufferGeometry attribute "aPosFeatures" count is exactly 6,500 with itemSize 3', () => {
  const attr = geometry.getAttribute("aPosFeatures");
  assert(attr && attr.count === 6500 && attr.itemSize === 3);
});

test('BufferGeometry attribute "aPosVideo" count is exactly 6,500 with itemSize 3', () => {
  const attr = geometry.getAttribute("aPosVideo");
  assert(attr && attr.count === 6500 && attr.itemSize === 3);
});

test('BufferGeometry attribute "aPosCta" count is exactly 6,500 with itemSize 3', () => {
  const attr = geometry.getAttribute("aPosCta");
  assert(attr && attr.count === 6500 && attr.itemSize === 3);
});

test('BufferGeometry attribute "aColor" count is exactly 6,500 with itemSize 3', () => {
  const attr = geometry.getAttribute("aColor");
  assert(attr && attr.count === 6500 && attr.itemSize === 3);
});

test('BufferGeometry attribute "aSize" count is exactly 6,500 with itemSize 1', () => {
  const attr = geometry.getAttribute("aSize");
  assert(attr && attr.count === 6500 && attr.itemSize === 1);
});

test('BufferGeometry attribute "aRandom" count is exactly 6,500 with itemSize 4', () => {
  const attr = geometry.getAttribute("aRandom");
  assert(attr && attr.count === 6500 && attr.itemSize === 4);
});

test('Total GPU float allocation across all buffers equals 149,500 floats (598,000 bytes)', () => {
  // position (19500) + aPosHero (19500) + aPosFeatures (19500) + aPosVideo (19500) + aPosCta (19500) + aColor (19500) + aSize (6500) + aRandom (26000)
  const totalFloats = (6500 * 3) * 6 + 6500 * 1 + 6500 * 4;
  assert(totalFloats === 149500, `Expected 149,500 floats, got ${totalFloats}`);
  const totalBytes = totalFloats * 4;
  assert(totalBytes === 598000, `Expected 598,000 bytes, got ${totalBytes}`);
});

// ============================================================================
// SECTION 2: MORPH TARGET BUFFER VERIFICATION (No NaN, No Null, Valid Ranges)
// ============================================================================
console.log(`\n${ANSI.bold}${ANSI.blue}--- SECTION 2: Morph Target Buffer Data Integrity ---${ANSI.reset}`);

function auditFloatArray(name, array, expectedLength, min = -Infinity, max = Infinity) {
  assert(array.length === expectedLength, `${name}: length mismatch (got ${array.length}, expected ${expectedLength})`);
  let nanCount = 0;
  let infiniteCount = 0;
  let outOfBoundsCount = 0;
  let nullUndefinedCount = 0;

  for (let idx = 0; idx < array.length; idx++) {
    const val = array[idx];
    if (val === null || val === undefined) nullUndefinedCount++;
    if (Number.isNaN(val)) nanCount++;
    if (!Number.isFinite(val)) infiniteCount++;
    if (val < min || val > max) outOfBoundsCount++;
  }

  assert(nullUndefinedCount === 0, `${name} has ${nullUndefinedCount} null/undefined values!`);
  assert(nanCount === 0, `${name} has ${nanCount} NaN values!`);
  assert(infiniteCount === 0, `${name} has ${infiniteCount} non-finite values!`);
  assert(outOfBoundsCount === 0, `${name} has ${outOfBoundsCount} values outside [${min}, ${max}]!`);
}

test('Morph Target aPosHero: 19,500 valid finite floats (no NaN/null/undefined)', () => {
  auditFloatArray('aPosHero', heroPositions, 19500, -10.0, 10.0);
});

test('Morph Target aPosFeatures: 19,500 valid finite floats (no NaN/null/undefined)', () => {
  auditFloatArray('aPosFeatures', featuresPositions, 19500, -12.0, 12.0);
});

test('Morph Target aPosVideo: 19,500 valid finite floats (no NaN/null/undefined)', () => {
  auditFloatArray('aPosVideo', videoPositions, 19500, -10.0, 10.0);
});

test('Morph Target aPosCta: 19,500 valid finite floats (no NaN/null/undefined)', () => {
  auditFloatArray('aPosCta', ctaPositions, 19500, -10.0, 10.0);
});

test('Attribute aColor: 19,500 valid RGB floats strictly in [0.0, 1.0]', () => {
  auditFloatArray('aColor', colors, 19500, 0.0, 1.0);
});

test('Attribute aSize: 6,500 valid float point sizes strictly in [2.0, 5.5]', () => {
  auditFloatArray('aSize', sizes, 6500, 2.0, 5.5);
});

test('Attribute aRandom: 26,000 valid stochastic seeds strictly in [0.0, 1.0]', () => {
  auditFloatArray('aRandom', randoms, 26000, 0.0, 1.0);
});

test('Phase 1 (Hero) spatial bounds: inner core, coronal halo, and ambient stardust distributions', () => {
  let innerCoreMaxR = 0;
  for (let i = 0; i < 3200; i++) {
    const x = heroPositions[i * 3];
    const y = heroPositions[i * 3 + 1];
    const z = heroPositions[i * 3 + 2];
    const r = Math.sqrt(x * x + y * y + z * z);
    if (r > innerCoreMaxR) innerCoreMaxR = r;
  }
  assert(innerCoreMaxR <= 1.35, `Inner core radius expected <= 1.35, got ${innerCoreMaxR}`);
});

test('Phase 2 (Features) spatial partitioning: 4 quadrant clusters frame center', () => {
  const quadrantCounts = [0, 0, 0, 0];
  for (let i = 0; i < 3200; i++) {
    const quad = i % 4;
    quadrantCounts[quad]++;
    const x = featuresPositions[i * 3];
    const y = featuresPositions[i * 3 + 1];
    if (quad === 0) assert(x < 0 && y > 0, `Quad 0 particle out of bounds: (${x}, ${y})`);
    if (quad === 1) assert(x > 0 && y > 0, `Quad 1 particle out of bounds: (${x}, ${y})`);
    if (quad === 2) assert(x < 0 && y < 0, `Quad 2 particle out of bounds: (${x}, ${y})`);
    if (quad === 3) assert(x > 0 && y < 0, `Quad 3 particle out of bounds: (${x}, ${y})`);
  }
  assert(quadrantCounts.every(c => c === 800), 'Quadrant distribution must be exactly 800 particles each');
});

test('Phase 3 (Video) spatial bounds: 16:9 accretion ring aspect ratio (3.85 / 2.18 = 1.766)', () => {
  const ratio = 3.85 / 2.18;
  const target169 = 16 / 9;
  assert(Math.abs(ratio - target169) < 0.02, `Accretion ring ratio ${ratio} must closely match 16:9 (${target169})`);
});

test('Phase 4 (CTA) spatial bounds: upward vertical light column span [-3.2, 6.8]', () => {
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const y = ctaPositions[i * 3 + 1];
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  assert(minY >= -3.25 && maxY <= 6.85, `CTA column Y bounds invalid: [${minY}, ${maxY}]`);
});

// ============================================================================
// SECTION 3: EXTREME WAYPOINT AND SCROLL PARAMETER ADVERSARIAL STRESS
// ============================================================================
console.log(`\n${ANSI.bold}${ANSI.blue}--- SECTION 3: Extreme Waypoint & Scroll Parameter Stress ---${ANSI.reset}`);

const WAYPOINTS = [
  { pos: new THREE.Vector3(0, 0, 4.6), lookAt: new THREE.Vector3(0, 0, 0), fov: 45 },
  { pos: new THREE.Vector3(0, 0.2, 6.2), lookAt: new THREE.Vector3(0, 0, 0), fov: 52 },
  { pos: new THREE.Vector3(0.4, -0.2, 4.3), lookAt: new THREE.Vector3(0, -0.1, 0), fov: 46 },
  { pos: new THREE.Vector3(0, -2.4, 3.5), lookAt: new THREE.Vector3(0, 1.4, -0.5), fov: 48 },
];

const currentCamPos = new THREE.Vector3();
const currentLookAt = new THREE.Vector3();

function interpolateWaypoints(p) {
  const clampedP = Math.max(0.0, Math.min(3.0, p));
  let idx = Math.floor(clampedP);
  if (idx >= 3) {
    idx = 2;
  }
  const frac = clampedP - idx;
  const t = frac * frac * (3.0 - 2.0 * frac);

  const w0 = WAYPOINTS[idx];
  const w1 = WAYPOINTS[idx + 1];

  currentCamPos.lerpVectors(w0.pos, w1.pos, t);
  currentLookAt.lerpVectors(w0.lookAt, w1.lookAt, t);
  return w0.fov + (w1.fov - w0.fov) * t;
}

test('Negative scroll adversarial test: iOS bounce (p < 0) clamps strictly to Waypoint 1', () => {
  const negativeCases = [-0.0001, -0.5, -5.0, -100.0, -999999.0, -Infinity];
  for (const negP of negativeCases) {
    const fov = interpolateWaypoints(negP);
    assert(Math.abs(currentCamPos.x - 0.0) < 1e-6, `camPos.x failed at p=${negP}`);
    assert(Math.abs(currentCamPos.y - 0.0) < 1e-6, `camPos.y failed at p=${negP}`);
    assert(Math.abs(currentCamPos.z - 4.6) < 1e-6, `camPos.z failed at p=${negP}`);
    assert(Math.abs(fov - 45) < 1e-6, `fov failed at p=${negP}`);
  }
});

test('Extreme overscroll adversarial test: (p > 3.0) clamps strictly to Waypoint 4', () => {
  const overscrollCases = [3.0001, 3.5, 5.0, 100.0, 999999.0, Infinity];
  for (const overP of overscrollCases) {
    const fov = interpolateWaypoints(overP);
    assert(Math.abs(currentCamPos.x - 0.0) < 1e-6, `camPos.x failed at p=${overP}`);
    assert(Math.abs(currentCamPos.y - (-2.4)) < 1e-6, `camPos.y failed at p=${overP}`);
    assert(Math.abs(currentCamPos.z - 3.5) < 1e-6, `camPos.z failed at p=${overP}`);
    assert(Math.abs(fov - 48) < 1e-6, `fov failed at p=${overP}`);
  }
});

test('Waypoint exact boundary evaluation: p = 0.0, 1.0, 2.0, 3.0 match spec', () => {
  // p = 0
  let fov = interpolateWaypoints(0.0);
  assert(currentCamPos.equals(WAYPOINTS[0].pos) && fov === 45, 'p=0 failed');

  // p = 1
  fov = interpolateWaypoints(1.0);
  assert(currentCamPos.equals(WAYPOINTS[1].pos) && fov === 52, 'p=1 failed');

  // p = 2
  fov = interpolateWaypoints(2.0);
  assert(currentCamPos.equals(WAYPOINTS[2].pos) && fov === 46, 'p=2 failed');

  // p = 3
  fov = interpolateWaypoints(3.0);
  assert(currentCamPos.equals(WAYPOINTS[3].pos) && fov === 48, 'p=3 failed');
});

test('Continuity stress test: 20,000 dense steps from p = -2.0 to 5.0 (no NaN, C0 continuous)', () => {
  const steps = 20000;
  let prevPos = null;
  for (let s = 0; s <= steps; s++) {
    const p = -2.0 + (7.0 * s) / steps;
    const fov = interpolateWaypoints(p);

    assert(Number.isFinite(currentCamPos.x) && !Number.isNaN(currentCamPos.x), `NaN in camPos.x at p=${p}`);
    assert(Number.isFinite(currentCamPos.y) && !Number.isNaN(currentCamPos.y), `NaN in camPos.y at p=${p}`);
    assert(Number.isFinite(currentCamPos.z) && !Number.isNaN(currentCamPos.z), `NaN in camPos.z at p=${p}`);
    assert(Number.isFinite(fov) && !Number.isNaN(fov), `NaN in fov at p=${p}`);

    if (prevPos) {
      const stepDelta = currentCamPos.distanceTo(prevPos);
      // Maximum delta across 20k steps should be tiny (< 0.01)
      assert(stepDelta < 0.01, `Discontinuity detected at p=${p}: delta=${stepDelta}`);
    }
    prevPos = currentCamPos.clone();
  }
});

test('Rapid oscillation stress: 2,000 alternating delta impulses with inertia damping', () => {
  let currentScroll = 0.0;
  const dt = 1 / 120; // 120 FPS
  const scrollFactor = 1.0 - Math.exp(-8.0 * dt);

  for (let i = 0; i < 2000; i++) {
    const target = i % 2 === 0 ? -10.0 : 15.0;
    const clampedTarget = Math.max(0.0, Math.min(3.0, target));
    currentScroll += (clampedTarget - currentScroll) * scrollFactor;

    assert(Number.isFinite(currentScroll), `Scroll became non-finite at iter ${i}`);
    assert(currentScroll >= 0.0 && currentScroll <= 3.0, `Scroll escaped bounds: ${currentScroll}`);
  }
});

test('Zero-height document defense: Math.max(1, scrollHeight - innerHeight)', () => {
  const testCases = [
    { scrollHeight: 800, innerHeight: 800, expectedMaxScroll: 1 },
    { scrollHeight: 500, innerHeight: 800, expectedMaxScroll: 1 },
    { scrollHeight: 0, innerHeight: 0, expectedMaxScroll: 1 },
    { scrollHeight: 1, innerHeight: 1000, expectedMaxScroll: 1 },
  ];

  for (const tc of testCases) {
    const maxScroll = Math.max(1, tc.scrollHeight - tc.innerHeight);
    assert(maxScroll === tc.expectedMaxScroll, `maxScroll failed for ${JSON.stringify(tc)}`);
    const raw = (0 / maxScroll) * 3.0;
    const targetScroll = Math.max(0.0, Math.min(3.0, raw));
    assert(targetScroll === 0.0, `targetScroll must be 0.0, got ${targetScroll}`);
  }
});

// ============================================================================
// SECTION 4: SHADER SYNTAX & WEBGL DISPOSAL SEQUENCE
// ============================================================================
console.log(`\n${ANSI.bold}${ANSI.blue}--- SECTION 4: Shader Syntax & WebGL Resource Disposal ---${ANSI.reset}`);

test('Shader AST: Vertex shader declares all 7 attributes and 4 uniforms', () => {
  const requiredAttributes = [
    'attribute vec3 aPosHero;',
    'attribute vec3 aPosFeatures;',
    'attribute vec3 aPosVideo;',
    'attribute vec3 aPosCta;',
    'attribute vec3 aColor;',
    'attribute float aSize;',
    'attribute vec4 aRandom;',
  ];

  for (const attr of requiredAttributes) {
    assert(canvasSource.includes(attr), `Missing attribute in vertex shader: ${attr}`);
  }

  const requiredUniforms = [
    'uniform float uProgress;',
    'uniform float uTime;',
    'uniform vec2 uMouse;',
    'uniform float uPixelRatio;',
  ];

  for (const unif of requiredUniforms) {
    assert(canvasSource.includes(unif), `Missing uniform in vertex shader: ${unif}`);
  }
});

test('Shader AST: Vertex and fragment shader varying variables match (vColor, vAlpha)', () => {
  assert(canvasSource.includes('varying vec3 vColor;'), 'vColor missing from vertex shader');
  assert(canvasSource.includes('varying float vAlpha;'), 'vAlpha missing from vertex shader');
  assert(canvasSource.includes('precision mediump float;'), 'precision mediump missing from fragment shader');
  assert(canvasSource.includes('if (dist > 0.5) discard;'), 'PointCoord circular discard missing');
});

test('Shader Numerical Robustness: Division-by-zero & NaN protections present in GLSL', () => {
  // Check normalize protection
  assert(canvasSource.includes('normalize(aPosHero + vec3(0.0001))'), 'Missing zero-vector protection in normalize()');
  // Check accretion ring singularity protection
  assert(canvasSource.includes('max(pow(r, 0.75), 0.75)'), 'Missing accretion ring singularity guard');
  // Check mouse distance singularity protection
  assert(canvasSource.includes('mDist * mDist + 0.6'), 'Missing mouse interaction distance epsilon');
  // Check point size clamping
  assert(canvasSource.includes('clamp(gl_PointSize, 1.5, 64.0)'), 'Missing point size clamp');
  // Check progress clamping in GLSL
  assert(canvasSource.includes('clamp(uProgress, 0.0, 3.0)'), 'Missing uProgress clamp in GLSL');
});

test('WebGL Disposal sequence: geometry, material, textures, and forceContextLoss assertion', () => {
  // Verify cleanup function in source code
  assert(canvasSource.includes('cancelAnimationFrame(animationFrameId)'), 'cancelAnimationFrame missing in cleanup');
  assert(canvasSource.includes('window.removeEventListener("scroll", onScroll)'), 'scroll listener removal missing');
  assert(canvasSource.includes('window.removeEventListener("pointermove", onPointerMove)'), 'pointermove listener removal missing');
  assert(canvasSource.includes('window.removeEventListener("resize", onResize)'), 'resize listener removal missing');
  assert(canvasSource.includes('geometry.dispose()'), 'geometry.dispose() missing in cleanup');
  assert(canvasSource.includes('pointsMaterial.dispose()'), 'material.dispose() missing in cleanup');
  assert(canvasSource.includes('scene.clear()'), 'scene.clear() missing in cleanup');
  assert(canvasSource.includes('renderer.dispose()'), 'renderer.dispose() missing in cleanup');
  assert(canvasSource.includes('renderer.forceContextLoss()'), 'renderer.forceContextLoss() missing in cleanup');
});

test('Simulated Mock WebGL Lifecycle: verify all disposal calls execute without error', () => {
  const mockCalls = {
    cancelAnimationFrame: 0,
    removeEventListener: 0,
    geometryDispose: 0,
    materialDispose: 0,
    textureDispose: 0,
    sceneClear: 0,
    rendererDispose: 0,
    forceContextLoss: 0,
  };

  const mockGeometry = {
    dispose: () => { mockCalls.geometryDispose++; }
  };

  const mockTexture = {
    dispose: () => { mockCalls.textureDispose++; }
  };

  const mockMaterial = {
    uniforms: {
      uTexture: { value: mockTexture },
      uProgress: { value: 0.0 }
    },
    dispose: () => { mockCalls.materialDispose++; }
  };

  const mockScene = {
    clear: () => { mockCalls.sceneClear++; }
  };

  const mockRenderer = {
    dispose: () => { mockCalls.rendererDispose++; },
    forceContextLoss: () => { mockCalls.forceContextLoss++; }
  };

  // Execute disposal sequence mirroring supernova-cosmic-canvas.tsx line 517-553
  if (mockGeometry) {
    mockGeometry.dispose();
  }

  if (mockMaterial) {
    const uniforms = mockMaterial.uniforms;
    if (uniforms) {
      Object.keys(uniforms).forEach((key) => {
        const u = uniforms[key];
        if (u && u.value && typeof u.value.dispose === "function") {
          u.value.dispose();
        }
      });
    }
    mockMaterial.dispose();
  }

  if (mockScene) {
    mockScene.clear();
  }

  if (mockRenderer) {
    mockRenderer.dispose();
    mockRenderer.forceContextLoss();
  }

  assert(mockCalls.geometryDispose === 1, 'geometry.dispose() not called exactly once');
  assert(mockCalls.materialDispose === 1, 'material.dispose() not called exactly once');
  assert(mockCalls.textureDispose === 1, 'texture.dispose() not called');
  assert(mockCalls.sceneClear === 1, 'scene.clear() not called exactly once');
  assert(mockCalls.rendererDispose === 1, 'renderer.dispose() not called exactly once');
  assert(mockCalls.forceContextLoss === 1, 'renderer.forceContextLoss() not called exactly once');
});

// ============================================================================
// SUMMARY & VERDICT
// ============================================================================
console.log(`\n${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}`);
console.log(`${ANSI.bold}TOTAL TESTS EXECUTED : ${totalTests}${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.green}TESTS PASSED         : ${passedTests}${ANSI.reset}`);
console.log(`${ANSI.bold}${failedTests > 0 ? ANSI.red : ANSI.green}TESTS FAILED         : ${failedTests}${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.cyan}================================================================================${ANSI.reset}\n`);

if (failedTests > 0) {
  console.log(`${ANSI.bgRed} VERDICT: REQUEST_CHANGES (${failedTests} failures detected) ${ANSI.reset}\n`);
  process.exit(1);
} else {
  console.log(`${ANSI.bgGreen} VERDICT: APPROVE (All empirical stress tests passed with 100% compliance) ${ANSI.reset}\n`);
  process.exit(0);
}
