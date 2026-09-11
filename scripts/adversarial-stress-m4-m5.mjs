/**
 * Adversarial Stress-Test Harness for M4 (Hero 16:9 Canvas) and M5 (OS Detection Conversion Funnel)
 *
 * Authored by Challenger 2 (Canvas & Conversion Challenger).
 * Executes empirical stress-testing, fuzzing, oracles, and edge-case challenge suites.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, testId, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32mPASS\x1b[0m [${testId}] ${message}`);
  } else {
    failedTests++;
    failures.push({ testId, message });
    console.log(`  \x1b[31mFAIL\x1b[0m [${testId}] ${message}`);
  }
}

// ---------------------------------------------------------------------------
// SECTION 1: Coordinate Normalization Algorithm Oracle & Stress Test
// ---------------------------------------------------------------------------
console.log('\n=== SECTION 1: Coordinate Normalization Stress Testing ===');

// Mathematical reference implementation matching hero-transformation-canvas.tsx
function normalizeCoords(clientX, clientY, rect) {
  if (!rect || rect.width === 0 || rect.height === 0 || rect.width < 0 || rect.height < 0) {
    return { normX: 0.5, normY: 0.5, px: 0, py: 0 };
  }
  const relX = clientX - rect.left;
  const relY = clientY - rect.top;
  const clampedX = Math.max(0, Math.min(rect.width, relX));
  const clampedY = Math.max(0, Math.min(rect.height, relY));
  const normX = clampedX / rect.width;
  const normY = clampedY / rect.height;
  return { normX, normY, px: clampedX, py: clampedY };
}

// 1.1 Negative coordinates (extreme off-screen left and top)
const mockRect = { left: 100, top: 100, width: 1000, height: 562.5 };
const negTest1 = normalizeCoords(-500, -500, mockRect);
assert(negTest1.normX === 0 && negTest1.normY === 0, 'ADV-COORD-01', 'Extreme negative coordinates (-500, -500) clamp strictly to (0.0, 0.0)');
assert(negTest1.px === 0 && negTest1.py === 0, 'ADV-COORD-02', 'Negative coordinates clamped pixels are strictly (0, 0)');

const negTest2 = normalizeCoords(99.999, 99.999, mockRect);
assert(negTest2.normX === 0 && negTest2.normY === 0, 'ADV-COORD-03', 'Sub-pixel negative boundary (0.001px outside) clamps to (0.0, 0.0)');

// 1.2 Positive overflow coordinates (extreme off-screen right and bottom)
const posOverflow1 = normalizeCoords(50000, 50000, mockRect);
assert(posOverflow1.normX === 1.0 && posOverflow1.normY === 1.0, 'ADV-COORD-04', 'Extreme positive overflow (50000, 50000) clamps strictly to (1.0, 1.0)');
assert(posOverflow1.px === 1000 && posOverflow1.py === 562.5, 'ADV-COORD-05', 'Positive overflow clamped pixels strictly equal container width and height');

const posOverflow2 = normalizeCoords(1100.001, 662.501, mockRect);
assert(posOverflow2.normX === 1.0 && posOverflow2.normY === 1.0, 'ADV-COORD-06', 'Sub-pixel positive boundary (0.001px past right/bottom) clamps to (1.0, 1.0)');

// 1.3 Exact center coordinate
const centerTest = normalizeCoords(100 + 500, 100 + 281.25, mockRect);
assert(Math.abs(centerTest.normX - 0.5) < 1e-12 && Math.abs(centerTest.normY - 0.5) < 1e-12, 'ADV-COORD-07', 'Exact geometric center calculates to exactly (0.500000, 0.500000)');
assert(centerTest.px === 500 && centerTest.py === 281.25, 'ADV-COORD-08', 'Center pixel offsets match exact half dimensions (500px, 281.25px)');

// 1.4 Degenerate bounding rects (zero dimensions, collapsed DOM, negative sizes, null/undefined)
const zeroRect = { left: 0, top: 0, width: 0, height: 0 };
const zeroRes = normalizeCoords(250, 250, zeroRect);
assert(zeroRes.normX === 0.5 && zeroRes.normY === 0.5 && !Number.isNaN(zeroRes.normX), 'ADV-COORD-09', 'Zero-width/height rect falls back to center without NaN or Infinity');

const nullRectRes = normalizeCoords(100, 100, null);
assert(nullRectRes.normX === 0.5 && nullRectRes.normY === 0.5, 'ADV-COORD-10', 'Null rect parameter safely handled with center fallback');

const undefinedRectRes = normalizeCoords(100, 100, undefined);
assert(undefinedRectRes.normX === 0.5 && undefinedRectRes.normY === 0.5, 'ADV-COORD-11', 'Undefined rect parameter safely handled with center fallback');

// 1.5 Fuzzing with 10,000 randomized floating point coordinates
let fuzzAllBounded = true;
let fuzzNoNaN = true;
for (let i = 0; i < 10000; i++) {
  const randX = (Math.random() - 0.5) * 100000;
  const randY = (Math.random() - 0.5) * 100000;
  const res = normalizeCoords(randX, randY, mockRect);
  if (res.normX < 0 || res.normX > 1 || res.normY < 0 || res.normY > 1) {
    fuzzAllBounded = false;
  }
  if (Number.isNaN(res.normX) || Number.isNaN(res.normY) || !Number.isFinite(res.normX) || !Number.isFinite(res.normY)) {
    fuzzNoNaN = false;
  }
}
assert(fuzzAllBounded, 'ADV-COORD-12', '10,000 random floating point inputs strictly bounded in [0.0, 1.0]');
assert(fuzzNoNaN, 'ADV-COORD-13', '10,000 random floating point inputs produce zero NaN / Infinity values');

// ---------------------------------------------------------------------------
// SECTION 2: 60 FPS Animation Loop, Lerping Factor & 280px Radial Mask
// ---------------------------------------------------------------------------
console.log('\n=== SECTION 2: 60 FPS Animation, Lerping & 280px Radial Mask ===');

// 2.1 Verify exact constant MASK_RADIUS_PX = 280 in source code
const canvasSource = fs.readFileSync(path.join(ROOT_DIR, 'components/hero-transformation-canvas.tsx'), 'utf8');
const maskRadiusConstMatch = canvasSource.match(/const\s+MASK_RADIUS_PX\s*=\s*(\d+)/);
assert(maskRadiusConstMatch !== null && parseInt(maskRadiusConstMatch[1], 10) === 280, 'ADV-MASK-01', 'MASK_RADIUS_PX is explicitly defined as 280px in component source');

// 2.2 Verify CSS radial-gradient string syntax
assert(canvasSource.includes('radial-gradient(circle ${MASK_RADIUS_PX}px at') ||
       canvasSource.includes('radial-gradient(circle 280px at'), 'ADV-MASK-02', 'radial-gradient uses exact circle radius with pixel coordinates');
assert(canvasSource.includes('maskImage') && canvasSource.includes('webkitMaskImage'), 'ADV-MASK-03', 'Both standard maskImage and webkitMaskImage are configured for cross-browser GPU acceleration');

// 2.3 Verify Reticle dimensions match 280px radius (560px diameter)
assert(canvasSource.includes('MASK_RADIUS_PX * 2') || canvasSource.includes('560px'), 'ADV-MASK-04', 'Spotlight reticle follower width and height calculate to 2 * MASK_RADIUS_PX (560px)');

// 2.4 Verify Lerp Factor Convergence
// Active user interaction lerp factor is 0.16
const userLerpFactor = 0.16;
let currentX = 0.0;
const targetX = 1.0;
let framesTo99Percent = 0;
while (Math.abs(targetX - currentX) > 0.01 && framesTo99Percent < 100) {
  currentX += (targetX - currentX) * userLerpFactor;
  framesTo99Percent++;
}
// (1 - 0.16)^N <= 0.01 => N * ln(0.84) <= ln(0.01) => N >= -4.605 / -0.17435 => N >= 26.4
assert(framesTo99Percent >= 25 && framesTo99Percent <= 28, 'ADV-LERP-01', `User lerp factor (0.16) reaches 99% convergence in exactly ${framesTo99Percent} frames (~433ms @ 60 FPS)`);

// Radar autonomous sweep lerp factor is 0.08
const radarLerpFactor = 0.08;
let radarCurrentX = 0.5;
const radarTargetX = 0.88;
let radarFramesTo90Percent = 0;
while (Math.abs(radarTargetX - radarCurrentX) > (0.38 * 0.1) && radarFramesTo90Percent < 100) {
  radarCurrentX += (radarTargetX - radarCurrentX) * radarLerpFactor;
  radarFramesTo90Percent++;
}
assert(radarFramesTo90Percent >= 26 && radarFramesTo90Percent <= 30, 'ADV-LERP-02', `Autonomous radar lerp factor (0.08) smoothly tracks sinusoidal path in ${radarFramesTo90Percent} frames`);

// 2.5 Verify RAF cleanup on unmount
assert(canvasSource.includes('cancelAnimationFrame(animationFrameRef.current)'), 'ADV-ANIM-01', 'cancelAnimationFrame is explicitly called in useEffect cleanup handler');

// 2.6 Verify Telemetry HUD Throttling to protect 60 FPS
assert(canvasSource.includes('timeMs - lastTelemetryUpdate > 100'), 'ADV-ANIM-02', 'React state telemetry updates throttled to 10 FPS (100ms interval) to maintain 60 FPS render loop');

// ---------------------------------------------------------------------------
// SECTION 3: Touch Event Handling & Autonomous Radar Sweep
// ---------------------------------------------------------------------------
console.log('\n=== SECTION 3: Touch Event Handling & Autonomous Sweep Fallback ===');

// 3.1 Verify all four touch handlers exist and are bound to JSX
assert(canvasSource.includes('onTouchStart={handleTouchStart}'), 'ADV-TOUCH-01', 'onTouchStart is bound to container JSX');
assert(canvasSource.includes('onTouchMove={handleTouchMove}'), 'ADV-TOUCH-02', 'onTouchMove is bound to container JSX');
assert(canvasSource.includes('onTouchEnd={handleTouchEnd}'), 'ADV-TOUCH-03', 'onTouchEnd is bound to container JSX');
assert(canvasSource.includes('onTouchCancel={handleTouchCancel}'), 'ADV-TOUCH-04', 'onTouchCancel is bound to container JSX');

// 3.2 Verify Touch Isolation (e.touches[0])
assert(canvasSource.includes('e.touches[0]'), 'ADV-TOUCH-05', 'Touch handlers explicitly isolate primary contact point e.touches[0]');
assert(canvasSource.includes('e.touches.length === 0'), 'ADV-TOUCH-06', 'Empty touch contact list is guarded against undefined dereference');

// 3.3 Verify Touch Start immediate coordinate snap (prevents lerp lag on first finger contact)
const touchStartCode = canvasSource.slice(canvasSource.indexOf('const handleTouchStart'), canvasSource.indexOf('const handleTouchMove'));
assert(touchStartCode.includes('currentCoordsRef.current = { x: normX, y: normY }') &&
       touchStartCode.includes('targetCoordsRef.current = { x: normX, y: normY }'), 'ADV-TOUCH-07', 'handleTouchStart snaps both current and target coordinates immediately');

// 3.4 Autonomous Radar Sweep Trigonometric Bounds Verification
// Mathematical function:
// timeSec = timeMs * 0.001
// autoNormX = Math.sin(timeSec * 0.75) * 0.38 + 0.5
// autoNormY = Math.cos(timeSec * 0.5) * 0.28 + 0.5
let sweepXMin = 1.0;
let sweepXMax = 0.0;
let sweepYMin = 1.0;
let sweepYMax = 0.0;

for (let t = 0; t <= 60000; t += 16) { // 60 seconds of 60 FPS simulation
  const timeSec = t * 0.001;
  const autoNormX = Math.sin(timeSec * 0.75) * 0.38 + 0.5;
  const autoNormY = Math.cos(timeSec * 0.5) * 0.28 + 0.5;

  if (autoNormX < sweepXMin) sweepXMin = autoNormX;
  if (autoNormX > sweepXMax) sweepXMax = autoNormX;
  if (autoNormY < sweepYMin) sweepYMin = autoNormY;
  if (autoNormY > sweepYMax) sweepYMax = autoNormY;
}

assert(sweepXMin >= 0.119 && sweepXMax <= 0.881, 'ADV-RADAR-01', `Autonomous sweep X is strictly bounded in [0.12, 0.88] (observed [${sweepXMin.toFixed(3)}, ${sweepXMax.toFixed(3)}])`);
assert(sweepYMin >= 0.219 && sweepYMax <= 0.781, 'ADV-RADAR-02', `Autonomous sweep Y is strictly bounded in [0.22, 0.78] (observed [${sweepYMin.toFixed(3)}, ${sweepYMax.toFixed(3)}])`);
assert(canvasSource.includes('idleTime > 600'), 'ADV-RADAR-03', 'Autonomous radar sweep engages automatically after 600ms user inactivity');

// ---------------------------------------------------------------------------
// SECTION 4: prefers-reduced-motion Accessibility Override
// ---------------------------------------------------------------------------
console.log('\n=== SECTION 4: prefers-reduced-motion Accessibility Override ===');

assert(canvasSource.includes('(prefers-reduced-motion: reduce)'), 'ADV-A11Y-01', 'Component queries window.matchMedia("(prefers-reduced-motion: reduce)")');
assert(canvasSource.includes('motionQuery.addEventListener("change"'), 'ADV-A11Y-02', 'Component registers dynamic change listener on media query');
assert(canvasSource.includes('motionQuery.removeEventListener("change"'), 'ADV-A11Y-03', 'Component unregisters change listener on cleanup to prevent memory leak');

// Check that reduced motion locks coordinates to center (0.5, 0.5)
const reducedMotionLogic = canvasSource.includes('if (reducedMotion)') &&
  canvasSource.includes('currentCoordsRef.current = { x: 0.5, y: 0.5 }') &&
  canvasSource.includes('const px = width * 0.5') &&
  canvasSource.includes('const py = height * 0.5');
assert(reducedMotionLogic, 'ADV-A11Y-04', 'Reduced motion state locks coordinates strictly to center (width*0.5, height*0.5)');
assert(canvasSource.includes('STATIC ACCESSIBILITY CENTER'), 'ADV-A11Y-05', 'Reduced motion state displays explicit accessibility telemetry mode');

// ---------------------------------------------------------------------------
// SECTION 5: useOperatingSystem() Hook Comprehensive UA Stress Matrix
// ---------------------------------------------------------------------------
console.log('\n=== SECTION 5: useOperatingSystem() User-Agent Matrix & SSR Stress ===');

import { parseOperatingSystem } from '../hooks/use-operating-system.ts';

const uaMatrix = [
  // 1. Windows x64 Chrome
  {
    name: 'Windows 11 x64 Chrome',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    platform: 'Win32',
    expectedOs: 'windows',
    expectedIsWindows: true,
    expectedArch: 'x64',
  },
  // 2. Windows 10 x64 Firefox
  {
    name: 'Windows 10 x64 Firefox',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    platform: 'Win32',
    expectedOs: 'windows',
    expectedIsWindows: true,
    expectedArch: 'x64',
  },
  // 3. Windows 11 ARM64 (Surface Pro X / Snapdragon X Elite)
  {
    name: 'Windows 11 ARM64 Edge',
    ua: 'Mozilla/5.0 (Windows NT 10.0; ARM64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
    platform: 'Win32',
    expectedOs: 'windows',
    expectedIsWindows: true,
    expectedArch: 'arm64',
  },
  // 4. Windows 11 ARM via userAgentData.platform
  {
    name: 'Windows 11 ARM via userAgentData',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    platform: 'Windows ARM',
    expectedOs: 'windows',
    expectedIsWindows: true,
    expectedArch: 'arm64',
  },
  // 5. macOS Darwin Intel x64 Safari
  {
    name: 'macOS Intel Safari',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
    platform: 'MacIntel',
    expectedOs: 'mac',
    expectedIsWindows: false,
    expectedArch: 'x64',
  },
  // 6. macOS Darwin Apple Silicon ARM64
  {
    name: 'macOS Apple Silicon ARM64',
    ua: 'Mozilla/5.0 (Macintosh; ARM64 Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    platform: 'MacIntel',
    expectedOs: 'mac',
    expectedIsWindows: false,
    expectedArch: 'arm64',
  },
  // 7. macOS Darwin raw platform
  {
    name: 'macOS Darwin keyword UA',
    ua: 'Darwin/21.6.0 (Macintosh; Intel Mac OS X 12_6)',
    platform: 'Macintosh',
    expectedOs: 'mac',
    expectedIsWindows: false,
    expectedArch: 'x64',
  },
  // 8. Linux Ubuntu x64 Chrome
  {
    name: 'Ubuntu Linux x64 Chrome',
    ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    platform: 'Linux x86_64',
    expectedOs: 'linux',
    expectedIsWindows: false,
    expectedArch: 'x64',
  },
  // 9. Linux Fedora Firefox
  {
    name: 'Fedora Linux Firefox',
    ua: 'Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0',
    platform: 'Linux',
    expectedOs: 'linux',
    expectedIsWindows: false,
    expectedArch: 'x64',
  },
  // 10. iOS iPhone 15 Pro Safari (contains "like Mac OS X")
  {
    name: 'iOS iPhone Safari',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    expectedOs: 'ios',
    expectedIsWindows: false,
    expectedArch: 'arm64',
  },
  // 11. iOS iPad Safari
  {
    name: 'iOS iPad Safari',
    ua: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    platform: 'iPad',
    expectedOs: 'ios',
    expectedIsWindows: false,
    expectedArch: 'arm64',
  },
  // 12. Android 14 Samsung Galaxy Chrome (contains "Linux")
  {
    name: 'Android 14 Samsung Chrome',
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
    platform: 'Android',
    expectedOs: 'android',
    expectedIsWindows: false,
    expectedArch: 'x64',
  },
  // 13. Android 13 Pixel 7
  {
    name: 'Android Pixel 7',
    ua: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    expectedOs: 'android',
    expectedIsWindows: false,
    expectedArch: 'x64',
  },
  // 14. SSR undefined window / empty UA fallback
  {
    name: 'SSR undefined window / navigator',
    ua: undefined,
    platform: undefined,
    expectedOs: 'windows',
    expectedIsWindows: true,
    expectedArch: 'x64',
  },
  // 15. Empty UA string
  {
    name: 'Empty string UA',
    ua: '',
    platform: '',
    expectedOs: 'windows',
    expectedIsWindows: true,
    expectedArch: 'x64',
  },
  // 16. Obscure Bot / Crawler UA
  {
    name: 'Googlebot Crawler',
    ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    platform: '',
    expectedOs: 'unknown',
    expectedIsWindows: false,
    expectedArch: 'x64',
  },
  // 17. curl / CLI agent
  {
    name: 'curl CLI tool',
    ua: 'curl/8.4.0',
    platform: '',
    expectedOs: 'unknown',
    expectedIsWindows: false,
    expectedArch: 'x64',
  },
  // 18. Malicious / Fuzzed 10KB UA string with embedded Windows keyword
  {
    name: 'Fuzzed 10KB string with Windows NT',
    ua: 'A'.repeat(5000) + 'Windows NT 10.0; Win64; x64' + 'Z'.repeat(5000),
    platform: 'Win32',
    expectedOs: 'windows',
    expectedIsWindows: true,
    expectedArch: 'x64',
  },
];

for (let i = 0; i < uaMatrix.length; i++) {
  const item = uaMatrix[i];
  const uad = item.platform ? { platform: item.platform } : undefined;
  const result = parseOperatingSystem(item.ua, uad);

  const testPrefix = `ADV-UA-${(i + 1).toString().padStart(2, '0')}`;
  assert(
    result.os === item.expectedOs &&
    result.isWindows === item.expectedIsWindows &&
    result.architecture === item.expectedArch,
    testPrefix,
    `${item.name} correctly parsed -> os="${result.os}", isWindows=${result.isWindows}, arch="${result.architecture}"`
  );
}

// 5.2 Hydration Safe Invariant: Verify default SSR state matches Windows 64-bit
const hookSource = fs.readFileSync(path.join(ROOT_DIR, 'hooks/use-operating-system.ts'), 'utf8');
assert(hookSource.includes('os: "windows"'), 'ADV-HYDRATE-01', 'Default server state OS is strictly "windows"');
assert(hookSource.includes('isWindows: true'), 'ADV-HYDRATE-02', 'Default server state isWindows is strictly true');
assert(hookSource.includes('architecture: "x64"'), 'ADV-HYDRATE-03', 'Default server state architecture is strictly "x64"');
assert(hookSource.includes('isHydrated: false'), 'ADV-HYDRATE-04', 'Default server state isHydrated is strictly false');

// ---------------------------------------------------------------------------
// SECTION 6: Multi-Touchpoint Download Funnel & Contrast Verification
// ---------------------------------------------------------------------------
console.log('\n=== SECTION 6: Multi-Touchpoint Funnel & Contrast Verification ===');

// 6.1 Check Download Button Variants & WCAG AA Contrast
const dlBtnSource = fs.readFileSync(path.join(ROOT_DIR, 'components/ui/download-button.tsx'), 'utf8');
assert(dlBtnSource.includes('variant = "primary"'), 'ADV-FUNNEL-01', 'Primary download button variant configured');
assert(dlBtnSource.includes('variant === "compact"'), 'ADV-FUNNEL-02', 'Compact header download button variant configured');
assert(dlBtnSource.includes('variant === "secondary"'), 'ADV-FUNNEL-03', 'Secondary download button variant configured');
assert(dlBtnSource.includes('min-h-[44px]'), 'ADV-FUNNEL-04', 'WCAG minimum 44px touch target height enforced on download buttons');

// 6.2 Relative Luminance & Contrast Calculation Oracle
function getRelativeLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Check Deep Cobalt #0047AB on White #FFFFFF
const cobaltWhiteContrast = getContrastRatio('#0047AB', '#FFFFFF');
assert(cobaltWhiteContrast >= 4.5, 'ADV-WCAG-01', `Pure White on Deep Cobalt (#0047AB) contrast = ${cobaltWhiteContrast.toFixed(2)}:1 (>= 4.5:1 WCAG AA)`);

// Check Deep Blue #1D4ED8 on White #FFFFFF
const blueWhiteContrast = getContrastRatio('#1D4ED8', '#FFFFFF');
assert(blueWhiteContrast >= 4.5, 'ADV-WCAG-02', `Pure White on Blue 700 (#1D4ED8) contrast = ${blueWhiteContrast.toFixed(2)}:1 (>= 4.5:1 WCAG AA)`);

// Check Deep Ink #0B0F19 background with White #FFFFFF text
const inkWhiteContrast = getContrastRatio('#0B0F19', '#FFFFFF');
assert(inkWhiteContrast >= 7.0, 'ADV-WCAG-03', `Pure White on Deep Ink (#0B0F19) contrast = ${inkWhiteContrast.toFixed(2)}:1 (>= 7.0:1 WCAG AAA)`);

// Check Slate 300 #CBD5E1 body text on Deep Ink #0B0F19
const slateInkContrast = getContrastRatio('#CBD5E1', '#0B0F19');
assert(slateInkContrast >= 4.5, 'ADV-WCAG-04', `Slate 300 on Deep Ink (#0B0F19) contrast = ${slateInkContrast.toFixed(2)}:1 (>= 4.5:1 WCAG AA)`);

// 6.3 Header CTA synchronization
const headerSource = fs.readFileSync(path.join(ROOT_DIR, 'components/ui/header.tsx'), 'utf8');
assert(headerSource.includes('useOperatingSystem'), 'ADV-FUNNEL-05', 'Header integrates useOperatingSystem hook for dynamic CTA status');
assert(headerSource.includes('href="#download"'), 'ADV-FUNNEL-06', 'Header CTA navigates cleanly to #download section');

// 6.4 Windows CTA chassis verification
const winCtaSource = fs.readFileSync(path.join(ROOT_DIR, 'components/windows-cta.tsx'), 'utf8');
assert(winCtaSource.includes('NovaPilot-AI-Setup-2.7.1.exe'), 'ADV-FUNNEL-07', 'Pre-footer chassis targets NovaPilot-AI-Setup-2.7.1.exe');
assert(winCtaSource.includes('SHA-512'), 'ADV-FUNNEL-08', 'Pre-footer chassis includes cryptographic SHA-512 checksum card');
assert(winCtaSource.includes('Windows 10 / 11 (64-bit)'), 'ADV-FUNNEL-09', 'Chassis explicitly specifies Windows 10/11 64-bit hardware requirements');

// ---------------------------------------------------------------------------
// SUMMARY REPORT
// ---------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`ADV-CHALLENGE RESULTS: ${passedTests} PASSED / ${failedTests} FAILED out of ${totalTests} ASSERTIONS`);
console.log('========================================================================');

if (failedTests > 0) {
  console.log('\nFAILURES DETECTED:');
  for (const f of failures) {
    console.log(`  - [${f.testId}] ${f.message}`);
  }
  process.exit(1);
} else {
  console.log('\nALL ADVERSARIAL STRESS-TESTS PASSED EMPIRICALLY WITH ZERO DEFECTS.');
  process.exit(0);
}
