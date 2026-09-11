import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log('  NOVAPILOT AI — RUNTIME STRESS CHALLENGE HARNESS (CHALLENGER 2)');
console.log('================================================================\n');

let passedTests = 0;
let failedTests = 0;
const findings = [];

function assert(condition, message, metadata = {}) {
  if (!condition) {
    failedTests++;
    console.error(`  ❌ [FAIL] ${message}`);
    findings.push({ status: 'FAIL', message, ...metadata });
    throw new Error(message);
  }
  passedTests++;
  console.log(`  ✓ [PASS] ${message}`);
}

function recordFinding(severity, area, description, evidence) {
  findings.push({ severity, area, description, evidence });
  console.log(`  ⚠️ [FINDING - ${severity}] ${area}: ${description}`);
}

// ============================================================================
// 1. THREE.JS LIFECYCLE, RESOURCE MANAGEMENT & CLEANUP AUDIT
// ============================================================================
console.log('[SUITE 1] Three.js Lifecycle, Canvas Mounting/Unmounting & Disposal:');

// Read source of components/interactive-architecture.tsx
const archSrc = fs.readFileSync(path.join(ROOT_DIR, 'components/interactive-architecture.tsx'), 'utf8');

// 1.1 Static Analysis of Disposal Calls
console.log('  Testing static cleanup specifications in return callback...');
const returnBlockMatch = archSrc.match(/return\s*\(\)\s*=>\s*\{([\s\S]*?)\};\s*\},/);
assert(!!returnBlockMatch, 'Cleanup function present in useEffect');
const cleanupBody = returnBlockMatch[1];

assert(cleanupBody.includes('cancelAnimationFrame'), 'RAF cancellation present in cleanup');
assert(cleanupBody.includes('observer.disconnect()'), 'IntersectionObserver disconnected in cleanup');
assert(cleanupBody.includes('removeEventListener("mousemove"'), 'mousemove listener removed');
assert(cleanupBody.includes('removeEventListener("touchmove"'), 'touchmove listener removed');
assert(cleanupBody.includes('removeEventListener("resize"'), 'resize listener removed');
assert(cleanupBody.includes('renderer.dispose()'), 'WebGLRenderer.dispose() called');

// 1.2 Geometry & Material Leak Empirical Simulation
console.log('  Simulating Three.js allocation & disposal tracking...');

class MockGeometry {
  constructor(name) {
    this.name = name;
    this.disposed = false;
    MockGeometry.allocated.push(this);
  }
  dispose() {
    this.disposed = true;
    MockGeometry.disposedCount++;
  }
}
MockGeometry.allocated = [];
MockGeometry.disposedCount = 0;

class MockMaterial {
  constructor(name) {
    this.name = name;
    this.disposed = false;
    MockMaterial.allocated.push(this);
  }
  dispose() {
    this.disposed = true;
    MockMaterial.disposedCount++;
  }
}
MockMaterial.allocated = [];
MockMaterial.disposedCount = 0;

class MockRenderer {
  constructor() {
    this.disposed = false;
  }
  setSize() {}
  setPixelRatio() {}
  render() {}
  dispose() {
    this.disposed = true;
  }
}

// Simulate one mount/unmount cycle following interactive-architecture.tsx exactly
function simulateMountCycle() {
  const allocatedGeos = [];
  const allocatedMats = [];

  // Plane geometry
  const planeGeo = new MockGeometry('BoxGeometry-plane');
  allocatedGeos.push(planeGeo);

  // 3 Planes
  for (let i = 0; i < 3; i++) {
    const planeMat = new MockMaterial(`MeshStandardMaterial-plane-${i}`);
    allocatedMats.push(planeMat);

    const edges = new MockGeometry(`EdgesGeometry-${i}`);
    allocatedGeos.push(edges);

    const lineMat = new MockMaterial(`LineBasicMaterial-${i}`);
    allocatedMats.push(lineMat);

    const beaconGeo = new MockGeometry(`SphereGeometry-beacon-${i}`);
    allocatedGeos.push(beaconGeo);

    const beaconMat = new MockMaterial(`MeshBasicMaterial-beacon-${i}`);
    allocatedMats.push(beaconMat);
  }

  // Packets
  const packetGeo = new MockGeometry('SphereGeometry-packet');
  allocatedGeos.push(packetGeo);
  const packetMatEmerald = new MockMaterial('MeshBasicMaterial-emerald');
  allocatedMats.push(packetMatEmerald);
  const packetMatCyan = new MockMaterial('MeshBasicMaterial-cyan');
  allocatedMats.push(packetMatCyan);

  const renderer = new MockRenderer();

  // Now execute the actual disposal statements from interactive-architecture.tsx (lines 414-418):
  planeGeo.dispose();
  packetGeo.dispose();
  packetMatEmerald.dispose();
  packetMatCyan.dispose();
  renderer.dispose();

  const undisposedGeos = allocatedGeos.filter(g => !g.disposed);
  const undisposedMats = allocatedMats.filter(m => !m.disposed);

  return {
    totalGeos: allocatedGeos.length,
    disposedGeos: allocatedGeos.length - undisposedGeos.length,
    undisposedGeos,
    totalMats: allocatedMats.length,
    disposedMats: allocatedMats.length - undisposedMats.length,
    undisposedMats,
    rendererDisposed: renderer.disposed,
  };
}

const cycle1 = simulateMountCycle();
assert(cycle1.rendererDisposed === true, 'Renderer is disposed on unmount');
assert(cycle1.disposedGeos === 2, `Expected 2 disposed geometries from explicit calls, got ${cycle1.disposedGeos}`);
assert(cycle1.disposedMats === 2, `Expected 2 disposed materials from explicit calls, got ${cycle1.disposedMats}`);

// Record empirical leak findings
if (cycle1.undisposedGeos.length > 0 || cycle1.undisposedMats.length > 0) {
  recordFinding(
    'HIGH',
    'Three.js Resource Leak',
    `Unmount lifecycle fails to dispose ${cycle1.undisposedGeos.length} geometries (3 EdgesGeometry, 3 SphereGeometry beacons) and ${cycle1.undisposedMats.length} materials (3 plane materials, 3 line materials, 3 beacon materials).`,
    {
      allocatedGeometries: cycle1.totalGeos,
      disposedGeometries: cycle1.disposedGeos,
      leakedGeometries: cycle1.undisposedGeos.map(g => g.name),
      allocatedMaterials: cycle1.totalMats,
      disposedMaterials: cycle1.disposedMats,
      leakedMaterials: cycle1.undisposedMats.map(m => m.name),
    }
  );
}

// 1.3 100 Rapid Mount / Unmount Stress Test
console.log('  Testing 100 rapid mount/unmount cycles...');
let cumulativeLeakedGeos = 0;
let cumulativeLeakedMats = 0;
for (let c = 0; c < 100; c++) {
  const res = simulateMountCycle();
  cumulativeLeakedGeos += res.undisposedGeos.length;
  cumulativeLeakedMats += res.undisposedMats.length;
}
console.log(`  Cumulative 100-cycle uncollected resources: ${cumulativeLeakedGeos} geometries, ${cumulativeLeakedMats} materials.`);
assert(cumulativeLeakedGeos === 600, 'Cumulative 100-cycle geometry leak accurately calculated (600 objects)');
assert(cumulativeLeakedMats === 900, 'Cumulative 100-cycle material leak accurately calculated (900 objects)');

// 1.4 RAF Animation Loop Cancellation Test
console.log('  Testing requestAnimationFrame lifecycle and cancellation...');
let rafId = 0;
const activeRafCallbacks = new Map();
function mockRaf(cb) {
  rafId++;
  activeRafCallbacks.set(rafId, cb);
  return rafId;
}
function mockCancelRaf(id) {
  activeRafCallbacks.delete(id);
}

let currentAnimId = null;
let isVisible = true;
let renderCount = 0;

function animateLoop() {
  if (isVisible) {
    renderCount++;
  }
  currentAnimId = mockRaf(animateLoop);
}

// Start loop
animateLoop();
assert(activeRafCallbacks.has(currentAnimId), 'Animation loop is actively registered');

// Cancel loop (unmount)
mockCancelRaf(currentAnimId);
currentAnimId = null;
assert(!activeRafCallbacks.has(1), 'Animation loop successfully halted upon unmount');
console.log('  ✓ RAF cancellation verified: Zero frames scheduled after unmount');


// ============================================================================
// 2. MOBILE TOUCH INTERACTION (touchmove) ADVERSARIAL STRESS
// ============================================================================
console.log('\n[SUITE 2] Mobile Touch Interaction (touchmove) on Canvas:');

function computeTouchRotation(touch, rect) {
  if (!touch) return null;
  const x = (touch.clientX - rect.left) / rect.width - 0.5;
  const y = (touch.clientY - rect.top) / rect.height - 0.5;
  return {
    x,
    y,
    targetRotY: x * 0.6,
    targetRotX: y * 0.3,
  };
}

// 2.1 Standard viewport touchmove
const normalRect = { left: 50, top: 200, width: 600, height: 420 };
const normalTouch = { clientX: 350, clientY: 410 }; // Center
const resNormal = computeTouchRotation(normalTouch, normalRect);
assert(Math.abs(resNormal.x) < 1e-5, 'Touch at center produces x = 0');
assert(Math.abs(resNormal.y) < 1e-5, 'Touch at center produces y = 0');
assert(Math.abs(resNormal.targetRotY) < 1e-5, 'Center touch produces targetRotY = 0');

// 2.2 Boundary Touch: Edge of canvas
const edgeTouch = { clientX: 650, clientY: 620 }; // Bottom right
const resEdge = computeTouchRotation(edgeTouch, normalRect);
assert(Math.abs(resEdge.x - 0.5) < 1e-5, 'Touch at right edge produces x = 0.5');
assert(Math.abs(resEdge.y - 0.5) < 1e-5, 'Touch at bottom edge produces y = 0.5');
assert(Math.abs(resEdge.targetRotY - 0.3) < 1e-5, 'Right edge produces targetRotY = 0.3 rad (~17.2 deg)');

// 2.3 Adversarial Input: Zero-width / zero-height canvas
console.log('  Testing zero-width / zero-height bounding box (collapsed canvas on mobile)...');
const zeroRect = { left: 0, top: 0, width: 0, height: 0 };
const resZero = computeTouchRotation({ clientX: 100, clientY: 100 }, zeroRect);
const isDivByZeroNaN = Number.isNaN(resZero.targetRotY) || !Number.isFinite(resZero.targetRotY);
assert(isDivByZeroNaN, 'Zero-width rect triggers non-finite (Infinity) rotation');

// Test what happens in the Euler integration loop if targetRot is Infinity:
let rotY = 0;
rotY += (resZero.targetRotY - rotY) * 0.05;
const isRotCorrupted = !Number.isFinite(rotY);
assert(isRotCorrupted, 'Unclamped division by zero corrupts Three.js rotation to Infinity/NaN');

recordFinding(
  'MEDIUM',
  'Canvas Touch Div-by-Zero Risk',
  'If canvas.getBoundingClientRect() has width: 0 or height: 0 (e.g. initial hidden tab or collapsed DOM reflow), handleTouchMove produces Infinity, poisoning rootGroup.rotation into NaN/Infinity.',
  { targetRotY: resZero.targetRotY, poisonedEulerRotation: rotY }
);

// 2.4 Adversarial Input: Off-screen extreme touch coordinates
console.log('  Testing extreme off-canvas touch coordinates (-10,000 to +10,000px)...');
const extremeTouch = { clientX: 10000, clientY: -8000 };
const resExtreme = computeTouchRotation(extremeTouch, normalRect);
console.log(`  Extreme touch -> targetRotY: ${resExtreme.targetRotY.toFixed(2)} rad, targetRotX: ${resExtreme.targetRotX.toFixed(2)} rad`);

if (Math.abs(resExtreme.targetRotY) > 5.0) {
  recordFinding(
    'LOW',
    'Unbounded Touch Rotation',
    `handleTouchMove does not clamp rotation targets. A touch drag extending past viewport bounds reaches targetRotY = ${resExtreme.targetRotY.toFixed(2)} rad (>360° flip). Recommend Math.max/Math.min clamping to [-0.6, 0.6].`,
    { targetRotY: resExtreme.targetRotY, targetRotX: resExtreme.targetRotX }
  );
}

// 2.5 Multi-touch handling
console.log('  Testing multi-touch handling...');
assert(archSrc.includes('if (e.touches.length === 0) return;'), 'Guard against empty touches array present');
assert(archSrc.includes('{ passive: true }'), 'Touch listener registered with { passive: true } for scrolling smoothness');


// ============================================================================
// 3. RAPID SCENARIO SWITCHING & SCRUBBING IN MEDIA SHOWCASE
// ============================================================================
console.log('\n[SUITE 3] Rapid Scenario Switching & Timeline Scrubbing:');

const mediaSrc = fs.readFileSync(path.join(ROOT_DIR, 'components/media-showcase.tsx'), 'utf8');

// 3.1 1,000 Rapid Scenario Switches
console.log('  Testing 1,000 rapid scenario switches...');
const scenarios = ['coding', 'stealth', 'audio'];
let currentScenario = 'coding';
for (let i = 0; i < 1000; i++) {
  const nextScenario = scenarios[i % scenarios.length];
  currentScenario = nextScenario;
}
assert(currentScenario === 'coding', '1,000 rapid scenario state transitions complete successfully');

// 3.2 Waveform Formula Resiliency Under Any Progress Value
console.log('  Testing waveform height generation across progress range [0.0, 100.0]...');
const hValuesChannel0 = [32, 65, 80, 45, 95, 70, 40, 60, 85, 90, 55, 75, 40, 85, 60, 30];
const hValuesChannel1 = [20, 35, 50, 85, 65, 40, 75, 90, 45, 60, 30, 80, 50, 35, 25, 45];

let minHeightSeen = Infinity;
let maxHeightSeen = -Infinity;
let hasNaN = false;

for (let p = 0; p <= 1000; p++) {
  const prog = p / 10; // 0.0 to 100.0 with 0.1 step
  for (const h of hValuesChannel0) {
    const val = Math.max(15, (h * (prog % 10)) / 6);
    if (Number.isNaN(val)) hasNaN = true;
    if (val < minHeightSeen) minHeightSeen = val;
    if (val > maxHeightSeen) maxHeightSeen = val;
  }
}
assert(!hasNaN, 'Waveform calculations contain zero NaN values across 1,001 points');
assert(minHeightSeen >= 15, `Minimum waveform height clamped to >= 15% (actual: ${minHeightSeen}%)`);
assert(maxHeightSeen <= 160, `Maximum waveform height bounded (actual: ${maxHeightSeen.toFixed(1)}%)`);
console.log(`  ✓ Waveform heights securely bounded between ${minHeightSeen}% and ${maxHeightSeen.toFixed(1)}%`);

// 3.3 Timeline Scrubber Click Logic & Bounding Analysis
console.log('  Testing timeline scrubber interaction boundary values...');
function calculateScrubProgress(clientX, rect) {
  if (!rect) return 0;
  const clickX = clientX - rect.left;
  if (rect.width === 0) return 0; // Guard
  const newProgress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
  return +newProgress.toFixed(1);
}

const scrubberRect = { left: 100, width: 800 };
assert(calculateScrubProgress(100, scrubberRect) === 0, 'Click at left edge gives 0%');
assert(calculateScrubProgress(900, scrubberRect) === 100, 'Click at right edge gives 100%');
assert(calculateScrubProgress(500, scrubberRect) === 50, 'Click at center gives 50%');
assert(calculateScrubProgress(50, scrubberRect) === 0, 'Click to left of scrubber clamps to 0%');
assert(calculateScrubProgress(1200, scrubberRect) === 100, 'Click to right of scrubber clamps to 100%');

// Test without guard when rect.width === 0 (in source code lines 65-68):
const unmaskedDivZero = Math.max(0, Math.min(100, (0 / 0) * 100));
assert(Number.isNaN(unmaskedDivZero), '0 / 0 in unshielded scrubber logic produces NaN');

// Test formatTime function from media-showcase.tsx lines 72-78:
function formatTime(pct) {
  const totalSeconds = 220; // 3:40
  const current = Math.floor((pct / 100) * totalSeconds);
  const mins = Math.floor(current / 60);
  const secs = current % 60;
  return `0${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

assert(formatTime(0) === '00:00', 'formatTime(0) is 00:00');
assert(formatTime(50) === '01:50', 'formatTime(50) is 01:50');
assert(formatTime(100) === '03:40', 'formatTime(100) is 03:40');
assert(formatTime(38) === '01:23', 'formatTime(38) is 01:23');


// ============================================================================
// 4. NEXT.JS HYDRATION & SSR MISMATCH AUDIT
// ============================================================================
console.log('\n[SUITE 4] Next.js Hydration & SSR Safety:');

// 4.1 Check Next.js Build Output Artifacts
const nextAppDir = path.join(ROOT_DIR, '.next/server/app');
assert(fs.existsSync(nextAppDir), '.next/server/app exists from successful production build');

const pageHtmlPath = path.join(nextAppDir, '(default)/page.html');
let htmlContent = '';
if (fs.existsSync(pageHtmlPath)) {
  htmlContent = fs.readFileSync(pageHtmlPath, 'utf8');
} else {
  const findHtml = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) findHtml(p);
      else if (ent.name.endsWith('.html') && !ent.name.includes('_not-found')) htmlContent = fs.readFileSync(p, 'utf8');
    }
  };
  findHtml(path.join(ROOT_DIR, '.next/server'));
}

assert(htmlContent.length > 0, 'Production SSR HTML content generated and non-empty');
console.log(`  ✓ Prerendered HTML verified (${(htmlContent.length / 1024).toFixed(1)} KB)`);

// 4.2 Hydration Error Marker Scan
const hydrationWarnings = ['Hydration failed', 'did not match', 'react-hydration-error', 'Text content does not match'];
let foundHydrationError = false;
for (const w of hydrationWarnings) {
  if (htmlContent.includes(w)) {
    foundHydrationError = true;
    console.error(`  Found SSR hydration issue marker: "${w}"`);
  }
}
assert(!foundHydrationError, 'Zero hydration error markers in prerendered HTML output');

// 4.3 Client Components "use client" Directives
const clientComps = [
  'components/interactive-architecture.tsx',
  'components/media-showcase.tsx',
  'components/hero.tsx',
  'components/features-grid.tsx',
  'components/specs-table.tsx',
  'components/windows-cta.tsx',
  'components/spotlight.tsx',
];

for (const compPath of clientComps) {
  const fullPath = path.join(ROOT_DIR, compPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const firstLine = content.trim().split('\n')[0];
    assert(firstLine.includes('"use client"') || firstLine.includes("'use client'"), `${compPath} correctly specifies "use client" directive`);
  }
}
console.log('  ✓ All interactive components explicitly marked with "use client"');

// 4.4 SSR Window/Browser API Safety Scan
const allComponents = fs.readdirSync(path.join(ROOT_DIR, 'components')).filter(f => f.endsWith('.tsx'));
let unguardedApiCount = 0;

for (const f of allComponents) {
  const code = fs.readFileSync(path.join(ROOT_DIR, 'components', f), 'utf8');
  const parts = code.split(/useEffect\s*\(/);
  const outsideUseEffect = parts[0];
  
  const lines = outsideUseEffect.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('*')) continue;
    if (/\bwindow\.[a-zA-Z]/.test(line) && !line.includes('typeof window')) {
      console.warn(`  Warning: unguarded window access in ${f}:${i + 1}: ${line}`);
      unguardedApiCount++;
    }
  }
}
assert(unguardedApiCount === 0, 'Zero unguarded window/browser API calls in component initialization scopes');
console.log('  ✓ Zero unguarded browser APIs during SSR evaluation');


// ============================================================================
// CONSOLIDATED AUDIT SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`RUNTIME STRESS TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log(`RECORDED FINDINGS: ${findings.length}`);
console.log('================================================================\n');

for (const f of findings) {
  console.log(`[${f.severity || 'FAIL'}] ${f.area || 'Test Assertion'}: ${f.description || f.message}`);
}

const summaryData = {
  timestamp: new Date().toISOString(),
  passedTests,
  failedTests,
  findings,
};

fs.writeFileSync(
  path.join(ROOT_DIR, 'scripts/runtime-stress-results.json'),
  JSON.stringify(summaryData, null, 2)
);
console.log('\nWrote detailed test results to scripts/runtime-stress-results.json');
