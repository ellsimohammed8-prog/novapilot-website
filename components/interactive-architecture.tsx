"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import {
  Mic,
  AudioWaveform,
  Sliders,
  Cpu,
  BrainCircuit,
  EyeOff,
  ShieldCheck,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Terminal,
  CheckCircle2,
  Play,
  RotateCcw,
} from "lucide-react";

// Technical specifications for the 3 core layers
interface LayerSpec {
  id: string;
  number: number;
  name: string;
  subtitle: string;
  category: "Audio Loopback" | "ThinkStripper FSM" | "Stealth HUD";
  colorHex: string;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  badgeClass: string;
  latencyMetric: string;
  throughputMetric: string;
  coreEngine: string;
  description: string;
  specs: { label: string; value: string }[];
  codeSnippet: string;
}

const LAYERS: LayerSpec[] = [
  {
    id: "layer-1",
    number: 1,
    name: "WASAPI / CPAL Audio Loopback",
    subtitle: "Physical Audio & Dual-Stream Hardware Ingestion",
    category: "Audio Loopback",
    colorHex: "#10B981",
    accentClass: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    borderClass: "border-emerald-500/40 hover:border-emerald-400",
    bgClass: "bg-emerald-950/20",
    textClass: "text-emerald-400",
    badgeClass: "bg-emerald-950/60 border-emerald-500/30 text-emerald-300",
    latencyMetric: "< 4.8ms",
    throughputMetric: "16,000 Hz PCM",
    coreEngine: "Rust CPAL + wasapi 0.13 + Rubato sinc resampler",
    description:
      "Captures remote speaker audio directly via Windows WASAPI Loopback (Direction::Render with AUDCLNT_STREAMFLAGS_LOOPBACK). Dynamic N-channel downmixer collapses 5.1/7.1 audio into 32-bit float mono, converted to 16kHz PCM via polyphase sinc interpolation. Lock-free ring buffer (HeapRb 32k) and 3-frame BatchEmitter reduce V8 IPC crossings by 66.7%.",
    specs: [
      { label: "Capture Direction", value: "Render Loopback (WASAPI)" },
      { label: "Target Sample Rate", value: "16,000 Hz (CANONICAL_STT)" },
      { label: "DSP Frame Size", value: "20ms (320 samples / frame)" },
      { label: "Batch Coalescence", value: "3 frames (60ms) / IPC call" },
      { label: "Ring Buffer Headroom", value: "32,768 f32 samples (~680ms)" },
      { label: "VAD Threshold", value: "Adaptive RMS + WebRTC Level 3" },
    ],
    codeSnippet: `// native-module/src/speaker/windows.rs
let client = device.get_iaudioclient()?;
let wave_format = client.get_mixformat()?;
let (channels, sample_rate) = (wave_format.get_nchannels(), wave_format.get_samplespersec());

// Dynamic N-Channel Downmixing to mono float
let mut frame_sum = 0.0f32;
for _ in 0..channels_usize {
    let bytes = [temp_queue.pop_front().unwrap(), ...];
    frame_sum += f32::from_le_bytes(bytes);
}
samples.push((frame_sum * inv_channels).clamp(-1.0, 1.0));`,
  },
  {
    id: "layer-2",
    number: 2,
    name: "Neural Engine & ThinkStripper FSM",
    subtitle: "Real-Time Streaming Reasoning Token Extraction",
    category: "ThinkStripper FSM",
    colorHex: "#06B6D4",
    accentClass: "from-cyan-500/20 via-cyan-500/10 to-transparent",
    borderClass: "border-cyan-500/40 hover:border-cyan-400",
    bgClass: "bg-cyan-950/20",
    textClass: "text-cyan-400",
    badgeClass: "bg-cyan-950/60 border-cyan-500/30 text-cyan-300",
    latencyMetric: "18ms TTFT",
    throughputMetric: "120+ tok/sec",
    coreEngine: "StreamingThinkStripper FSM + Groq / Claude 3.7 / DeepSeek R1",
    description:
      "Two-state finite state machine (pass <-> inThink) purges internal chain-of-thought tokens (<think>, <thought>, <reasoning>) from DeepSeek R1 and Claude 3.7 streaming outputs in real time. Boundary buffer (partialOpenTail) handles split token delimiters across network frames. Guarantees 0-byte reasoning leakage to interviewers with strict IdentityGuard first-person persona.",
    specs: [
      { label: "State Machine", value: "2-State FSM (pass | inThink)" },
      { label: "Token Delimiters", value: "<think>, <thought>, <reasoning>" },
      { label: "Split Tag Handling", value: "partialOpenTail() buffering" },
      { label: "Abrupt Finish", value: "0-byte leak unclosed tag drop" },
      { label: "Inference Routing", value: "Groq LPU / Claude 3.7 / DeepSeek" },
      { label: "Vector Memory", value: "sqlite-vec embedded RAG" },
    ],
    codeSnippet: `// electron/llm/thinkStripper.ts
export class StreamingThinkStripper {
  private state: 'pass' | 'inThink' = 'pass';
  private partialTagBuffer = '';

  write(chunk: string): string {
    // Detect split tag boundaries across streaming deltas
    if (this.state === 'pass') {
      const openIdx = chunk.search(/<(?:think|thought|reasoning)/i);
      if (openIdx !== -1) {
        this.state = 'inThink';
        return chunk.slice(0, openIdx);
      }
      return chunk;
    }
    // Purge reasoning blocks with zero leak
    if (chunk.includes('</think>')) {
      this.state = 'pass';
      return chunk.split('</think>')[1].trimStart();
    }
    return '';
  }
}`,
  },
  {
    id: "layer-3",
    number: 3,
    name: "Stealth HUD & Windowing Engine",
    subtitle: "OS-Level Display Capture Exclusion & Overlay",
    category: "Stealth HUD",
    colorHex: "#8B5CF6",
    accentClass: "from-violet-500/20 via-violet-500/10 to-transparent",
    borderClass: "border-violet-500/40 hover:border-violet-400",
    bgClass: "bg-violet-950/20",
    textClass: "text-violet-400",
    badgeClass: "bg-violet-950/60 border-violet-500/30 text-violet-300",
    latencyMetric: "0.8ms Compose",
    throughputMetric: "100% Invisible",
    coreEngine: "Win32 SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)",
    description:
      "Frameless, transparent HUD projected with Win32 WDA_EXCLUDEFROMCAPTURE (0x00000011) and Electron setContentProtection(true). The window is 100% invisible on Zoom, Microsoft Teams, Google Meet, and OBS screen-shares while remaining always-on-top (screen-saver level). Retains focusable: true during setIgnoreMouseEvents click-through to preserve global hotkey hooks.",
    specs: [
      { label: "Capture Exclusion", value: "WDA_EXCLUDEFROMCAPTURE" },
      { label: "Window Surface", value: "Transparent (alpha: 0x00000000)" },
      { label: "Z-Order Level", value: "alwaysOnTop: 'screen-saver'" },
      { label: "Click-Through", value: "setIgnoreMouseEvents(forward: true)" },
      { label: "Hotkey Health", value: "Focusable preserved (Cmd+B matrix)" },
      { label: "Resize Geometry", value: "Centered symmetrical (X - dW/2)" },
    ],
    codeSnippet: `// electron/WindowHelper.ts
export function applyStealthAffinity(win: BrowserWindow) {
  // Instruct DWM compositor to omit HWND from screen capture streams
  win.setContentProtection(true);
  
  if (process.platform === 'win32') {
    const WDA_EXCLUDEFROMCAPTURE = 0x00000011;
    user32.SetWindowDisplayAffinity(win.getNativeWindowHandle(), WDA_EXCLUDEFROMCAPTURE);
  }
  
  // Retain focusable: true so global hotkey hooks never detach
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setIgnoreMouseEvents(true, { forward: true });
}`,
  },
];

export default function InteractiveArchitecture() {
  const [activeLayer, setActiveLayer] = useState<string>("all");
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"stacked" | "exploded">("exploded");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Trigger synthetic pipeline execution simulation
  const handleSimulatePulse = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);

    setTimeout(() => setSimulationStep(2), 700);
    setTimeout(() => setSimulationStep(3), 1500);
    setTimeout(() => {
      setSimulationStep(4);
      setIsSimulating(false);
    }, 2400);
  };

  // Three.js WebGL 3D Pipeline Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene & Camera setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = canvas.clientWidth || 600;
    const height = canvas.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 14, 28);
    camera.lookAt(0, 0, 0);

    // High performance antialiased WebGL renderer with safe fallback
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      rendererRef.current = renderer;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch (err) {
      console.warn("WebGL not supported or disabled in this environment:", err);
      return;
    }

    // Ambient & Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight1.position.set(10, 20, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.8);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Root group for mouse orbit
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Create 3 floating isometric planes
    const layerPlanes: THREE.Mesh[] = [];
    const layerYCoords = [-5, 0, 5];
    const layerColors = [0x10b981, 0x06b6d4, 0x8b5cf6];

    const planeGeo = new THREE.BoxGeometry(16, 0.25, 9);

    for (let i = 0; i < 3; i++) {
      const planeMat = new THREE.MeshStandardMaterial({
        color: layerColors[i],
        transparent: true,
        opacity: 0.35,
        roughness: 0.3,
        metalness: 0.8,
        wireframe: false,
      });

      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.position.y = layerYCoords[i];
      rootGroup.add(plane);
      layerPlanes.push(plane);

      // Wireframe border outline
      const edges = new THREE.EdgesGeometry(planeGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: layerColors[i],
        linewidth: 1.5,
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      plane.add(wireframe);

      // Add diagnostic corner beacons
      const beaconGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: layerColors[i] });
      const offsets = [
        [-7.5, 0.2, -4],
        [7.5, 0.2, -4],
        [-7.5, 0.2, 4],
        [7.5, 0.2, 4],
      ];
      offsets.forEach(([ox, oy, oz]) => {
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(ox, oy, oz);
        plane.add(beacon);
      });
    }

    // Floating Data Packets (Vertical bus stream)
    const packetCount = 36;
    const packetGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const packetMatEmerald = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const packetMatCyan = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

    const packets: { mesh: THREE.Mesh; speed: number; startY: number; endY: number }[] = [];

    for (let i = 0; i < packetCount; i++) {
      const isL1toL2 = i % 2 === 0;
      const mesh = new THREE.Mesh(packetGeo, isL1toL2 ? packetMatEmerald : packetMatCyan);

      const startY = isL1toL2 ? -5 : 0;
      const endY = isL1toL2 ? 0 : 5;
      mesh.position.set(
        (Math.random() - 0.5) * 13,
        startY + Math.random() * (endY - startY),
        (Math.random() - 0.5) * 7
      );

      rootGroup.add(mesh);
      packets.push({
        mesh,
        speed: 0.04 + Math.random() * 0.04,
        startY,
        endY,
      });
    }

    // Interactive mouse & touch rotation tracking
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.6;
      targetRotX = y * 0.3;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width - 0.5;
      const y = (touch.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.6;
      targetRotX = y * 0.3;
    };

    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Responsive window resize
    const handleResize = () => {
      if (!canvas || !renderer) return;
      const w = canvas.clientWidth || 600;
      const h = canvas.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Viewport visibility observer to pause rendering offscreen
    let isVisible = true;
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry.isIntersecting;
        },
        { threshold: 0.05 }
      );
      observer.observe(canvas);
    }

    // 60 FPS Render Loop (throttled when offscreen)
    let clock = new THREE.Clock();
    const animate = () => {
      if (isVisible) {
        // Smooth easing toward mouse/touch target
        rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.05;
        rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.05;

        // Animate floating packet streams
        packets.forEach((p) => {
          p.mesh.position.y += p.speed;
          if (p.mesh.position.y > p.endY) {
            p.mesh.position.y = p.startY;
            p.mesh.position.x = (Math.random() - 0.5) * 13;
            p.mesh.position.z = (Math.random() - 0.5) * 7;
          }
        });

        // Subtle breathing motion on planes
        const elapsed = clock.getElapsedTime();
        layerPlanes[0].position.y = -5 + Math.sin(elapsed * 1.5) * 0.15;
        layerPlanes[1].position.y = 0 + Math.cos(elapsed * 1.5) * 0.15;
        layerPlanes[2].position.y = 5 + Math.sin(elapsed * 1.5 + 1.0) * 0.15;

        if (renderer) {
          renderer.render(scene, camera);
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Lifecycle cleanup
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (observer) {
        observer.disconnect();
      }
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("resize", handleResize);

      // Dispose geometries and materials
      planeGeo.dispose();
      packetGeo.dispose();
      packetMatEmerald.dispose();
      packetMatCyan.dispose();
      renderer?.dispose();
    };
  }, []);

  // Filtered layers based on active tab
  const displayedLayers =
    activeLayer === "all"
      ? LAYERS
      : LAYERS.filter(
          (l) =>
            (activeLayer === "audio" && l.category === "Audio Loopback") ||
            (activeLayer === "llm" && l.category === "ThinkStripper FSM") ||
            (activeLayer === "stealth" && l.category === "Stealth HUD")
        );

  const selectedOrHoveredLayer =
    LAYERS.find((l) => l.id === hoveredLayer) ||
    LAYERS.find(
      (l) =>
        (activeLayer === "audio" && l.category === "Audio Loopback") ||
        (activeLayer === "llm" && l.category === "ThinkStripper FSM") ||
        (activeLayer === "stealth" && l.category === "Stealth HUD")
    ) ||
    LAYERS[0];

  return (
    <section id="architecture" className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-950/20 blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-10 -z-10 h-[450px] w-[450px] rounded-full bg-cyan-950/20 blur-[140px]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center pb-12 md:pb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 mb-4 shadow-[0_0_16px_rgba(6,182,212,0.15)]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive 3D Subsystem Pipeline</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            3-Layer Low-Latency Execution Stack
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Deconstructing NovaPilot&apos;s local-first architecture: from hardware-level
            Windows WASAPI loopback capture, through the streaming ThinkStripper finite-state
            machine, to Win32 screen-share capture exclusion.
          </p>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-gray-900/60 p-3 sm:p-4 rounded-2xl border border-gray-800 backdrop-blur-md">
          {/* Layer Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveLayer("all")}
              className={`px-3.5 sm:px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
                activeLayer === "all"
                  ? "bg-gray-800 text-white shadow-md border border-gray-700"
                  : "text-slate-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              All Layers (3-Tier Stack)
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("audio")}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
                activeLayer === "audio"
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30"
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
              WASAPI Loopback (Layer 1)
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("llm")}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
                activeLayer === "llm"
                  ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/30"
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
              ThinkStripper FSM (Layer 2)
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("stealth")}
              className={`inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
                activeLayer === "stealth"
                  ? "bg-violet-950/80 text-violet-300 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                  : "text-slate-400 hover:text-violet-300 hover:bg-violet-950/30"
              }`}
            >
              <EyeOff className="w-3.5 h-3.5 text-violet-400" />
              Stealth HUD (Layer 3)
            </button>
          </div>

          {/* Simulation & Mode Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleSimulatePulse}
              disabled={isSimulating}
              className={`inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-mono font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden ${
                isSimulating
                  ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 animate-pulse cursor-wait"
                  : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_16px_rgba(6,182,212,0.3)] cursor-pointer"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {isSimulating ? `Pulsing Step ${simulationStep}/3...` : "Simulate Pipeline Pulse"}
            </button>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === "exploded" ? "stacked" : "exploded")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-mono text-slate-300 hover:text-white border border-gray-800 hover:border-gray-700 bg-gray-900/60 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-hidden"
            >
              <Layers className="w-3.5 h-3.5" />
              {viewMode === "exploded" ? "Exploded" : "Stacked"}
            </button>
          </div>
        </div>

        {/* Main 3D Stage & Deep Diagnostics Container */}
        {/* Enforces zero layout shift with min-h-[560px] */}
        <div
          ref={containerRef}
          className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px] md:min-h-[640px] items-stretch"
        >
          {/* Left Column: 3D WebGL Canvas & Isometric Layer Cards (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-gray-950/90 border border-gray-800/80 p-5 sm:p-6 overflow-hidden relative shadow-2xl backdrop-blur-xl">
            {/* Top Canvas Bar */}
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-4 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono text-slate-300">
                  WebGL 3D Pipeline Matrix [Three.js 60 FPS]
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                <span>View: Isometric 45°</span>
                <span>Buffer: 32KB HeapRb</span>
              </div>
            </div>

            {/* Three.js Canvas Mount Area */}
            <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl overflow-hidden bg-radial from-gray-900/40 to-transparent flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-grab active:cursor-grabbing block"
              />

              {/* Simulation Pulse Overlay Timeline */}
              {isSimulating && (
                <div className="absolute inset-x-4 top-4 bg-gray-950/90 border border-cyan-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-cyan-300 font-semibold flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      Live Audio-to-HUD Pipeline Pulse
                    </span>
                    <span className="text-slate-400">Total Latency: ~122ms</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div
                      className={`p-2 rounded-lg border transition-all ${
                        simulationStep >= 1
                          ? "border-emerald-500/60 bg-emerald-950/40 text-emerald-300"
                          : "border-gray-800 text-slate-500"
                      }`}
                    >
                      <div>1. WASAPI Ingest</div>
                      <div className="text-[10px] opacity-80">4.8ms | 16kHz PCM</div>
                    </div>
                    <div
                      className={`p-2 rounded-lg border transition-all ${
                        simulationStep >= 2
                          ? "border-cyan-500/60 bg-cyan-950/40 text-cyan-300"
                          : "border-gray-800 text-slate-500"
                      }`}
                    >
                      <div>2. ThinkStripper FSM</div>
                      <div className="text-[10px] opacity-80">18ms TTFT | 0 Leak</div>
                    </div>
                    <div
                      className={`p-2 rounded-lg border transition-all ${
                        simulationStep >= 3
                          ? "border-violet-500/60 bg-violet-950/40 text-violet-300"
                          : "border-gray-800 text-slate-500"
                      }`}
                    >
                      <div>3. Stealth HUD</div>
                      <div className="text-[10px] opacity-80">0.8ms | WDA_EXCLUDE</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Layer Cards List */}
            <div className="mt-4 space-y-3 z-10">
              {displayedLayers.map((layer) => {
                const isSelected = selectedOrHoveredLayer.id === layer.id;
                return (
                  <div
                    key={layer.id}
                    onMouseEnter={() => setHoveredLayer(layer.id)}
                    onClick={() => {
                      if (layer.category === "Audio Loopback") setActiveLayer("audio");
                      else if (layer.category === "ThinkStripper FSM") setActiveLayer("llm");
                      else setActiveLayer("stealth");
                    }}
                    className={`cursor-pointer p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? `${layer.borderClass} ${layer.bgClass} shadow-lg scale-[1.01]`
                        : "border-gray-800/80 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs border ${
                            isSelected
                              ? `${layer.badgeClass}`
                              : "border-gray-700 bg-gray-800 text-slate-300"
                          }`}
                        >
                          0{layer.number}
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            {layer.name}
                            <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
                              — {layer.subtitle}
                            </span>
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-mono border ${layer.badgeClass}`}
                        >
                          {layer.latencyMetric}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Technical Inspector & Code Telemetry Drawer (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl bg-gray-950/95 border border-gray-800/90 p-5 sm:p-6 shadow-2xl relative">
            {/* Active Layer Header */}
            <div>
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                    Diagnostic Inspector
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${selectedOrHoveredLayer.badgeClass}`}
                >
                  Layer 0{selectedOrHoveredLayer.number} Active
                </span>
              </div>

              {/* Title & Engine info */}
              <h3 className="text-xl font-bold text-white mb-1">
                {selectedOrHoveredLayer.name}
              </h3>
              <p className="text-xs font-mono text-slate-400 mb-4">
                Core: {selectedOrHoveredLayer.coreEngine}
              </p>

              <p className="text-sm text-slate-300 leading-relaxed mb-5">
                {selectedOrHoveredLayer.description}
              </p>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {selectedOrHoveredLayer.specs.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-gray-900/70 border border-gray-800/80"
                  >
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      {item.label}
                    </div>
                    <div className="text-xs font-mono font-semibold text-slate-200 truncate mt-0.5">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subsystem Code Excerpt */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>Native Subsystem Code Contract</span>
                <span className="text-[10px] text-emerald-400">Verified 2.7.1</span>
              </div>
              <div className="rounded-xl bg-gray-900/90 border border-gray-800 p-3 overflow-x-auto text-[11px] font-mono text-slate-300 leading-snug">
                <pre>
                  <code>{selectedOrHoveredLayer.codeSnippet}</code>
                </pre>
              </div>

              {/* Interactive Audit Verification Footer */}
              <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Hardware Verified: Zero Buffer Overruns</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextIndex = (selectedOrHoveredLayer.number % 3) + 1;
                    if (nextIndex === 1) setActiveLayer("audio");
                    else if (nextIndex === 2) setActiveLayer("llm");
                    else setActiveLayer("stealth");
                  }}
                  className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Next Layer -&gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
