"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * SupernovaCosmicCanvas:
 * Cinematic full-screen Three.js scrollytelling background for NovaPilot AI.
 * 
 * Features:
 * 1. Full-screen fixed background canvas (z-0, pointer-events-none).
 * 2. Exactly 6,500 procedural GPU particles with custom THREE.ShaderMaterial.
 * 3. 4 morph target coordinate buffers:
 *    - aPosHero: Phase 1 (Hero) Concentrated glowing Nova core.
 *    - aPosFeatures: Phase 2 (Features) Centrifugal radial burst framing 4 badges.
 *    - aPosVideo: Phase 3 (Video) Relativistic 16:9 accretion ring framing video showcase.
 *    - aPosCta: Phase 4 (Download/CTA) Upward streamline light column focusing on Windows CTA.
 * 4. 4 Camera Waypoints with Hermite trajectory blending:
 *    - WP 1 (Hero): pos (0, 0, 4.6), lookAt (0, 0, 0), FOV 45
 *    - WP 2 (Features): pos (0, 0.2, 6.2), lookAt (0, 0, 0), FOV 52
 *    - WP 3 (Video): pos (0.4, -0.2, 4.3), lookAt (0, -0.1, 0), FOV 46
 *    - WP 4 (Download): pos (0, -2.4, 3.5), lookAt (0, 1.4, -0.5), FOV 48
 * 5. Smooth mouse cursor parallax and exponential inertia damping.
 * 6. Responsive viewport resizing with mobile portrait FOV widening.
 * 7. Full WebGL lifecycle cleanup and context disposal.
 */

// Exactly 6,500 procedural particles per architecture specifications
const PARTICLE_COUNT = 6500;

interface CameraWaypoint {
  pos: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov: number;
}

// 4 Camera Waypoints
const WAYPOINTS: CameraWaypoint[] = [
  // WP 1 (Hero): pos (0, 0, 4.6), lookAt (0, 0, 0), FOV 45
  {
    pos: new THREE.Vector3(0, 0, 4.6),
    lookAt: new THREE.Vector3(0, 0, 0),
    fov: 45,
  },
  // WP 2 (Features): pos (0, 0.2, 6.2), lookAt (0, 0, 0), FOV 52
  {
    pos: new THREE.Vector3(0, 0.2, 6.2),
    lookAt: new THREE.Vector3(0, 0, 0),
    fov: 52,
  },
  // WP 3 (Video): pos (0.4, -0.2, 4.3), lookAt (0, -0.1, 0), FOV 46
  {
    pos: new THREE.Vector3(0.4, -0.2, 4.3),
    lookAt: new THREE.Vector3(0, -0.1, 0),
    fov: 46,
  },
  // WP 4 (Download): pos (0, -2.4, 3.5), lookAt (0, 1.4, -0.5), FOV 48 (upward tilt)
  {
    pos: new THREE.Vector3(0, -2.4, 3.5),
    lookAt: new THREE.Vector3(0, 1.4, -0.5),
    fov: 48,
  },
];

const VERTEX_SHADER = `
uniform float uProgress;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPixelRatio;

attribute vec3 aPosHero;
attribute vec3 aPosFeatures;
attribute vec3 aPosVideo;
attribute vec3 aPosCta;
attribute vec3 aColor;
attribute float aSize;
attribute vec4 aRandom;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vColor = aColor;
  float p = clamp(uProgress, 0.0, 3.0);

  // Piecewise Hermite curve interpolation across the 4 morph target buffers
  vec3 pos = aPosHero;
  if (p <= 1.0) {
    float t = smoothstep(0.0, 1.0, p);
    pos = mix(aPosHero, aPosFeatures, t);
  } else if (p <= 2.0) {
    float t = smoothstep(1.0, 2.0, p);
    pos = mix(aPosFeatures, aPosVideo, t);
  } else {
    float t = smoothstep(2.0, 3.0, p);
    pos = mix(aPosVideo, aPosCta, t);
  }

  // Phase 1 (Hero): Concentrated glowing Nova core responding to cursor parallax
  float heroWeight = max(0.0, 1.0 - p);
  if (heroWeight > 0.001) {
    float pulse = sin(uTime * 1.8 + aRandom.x * 6.28318) * 0.06;
    pos += normalize(aPosHero + vec3(0.0001)) * (pulse * heroWeight);
    float angle = uTime * 0.07 * (aRandom.z - 0.5);
    float ca = cos(angle);
    float sa = sin(angle);
    pos.xz = mat2(ca, -sa, sa, ca) * pos.xz;
  }

  // Phase 3 (Video): Relativistic accretion ring differential orbit
  float videoWeight = 1.0 - abs(p - 2.0);
  if (videoWeight > 0.001) {
    float r = length(pos.xy);
    float swirl = (0.55 / max(pow(r, 0.75), 0.75)) * uTime * 0.35;
    float csw = cos(swirl);
    float ssw = sin(swirl);
    pos.xy = mat2(csw, -ssw, ssw, csw) * pos.xy;
  }

  // Phase 4 (CTA): Upward streamline light column flow
  float ctaWeight = max(0.0, p - 2.0);
  if (ctaWeight > 0.001) {
    float speed = 1.8 + aRandom.y * 2.2;
    float streamY = mod(pos.y + uTime * speed + 3.2, 10.0) - 3.2;
    pos.y = mix(pos.y, streamY, ctaWeight);
  }

  // Interactive cursor parallax perturbation across all phases
  float mouseInfluence = 1.0;
  vec3 mouseWorld = vec3(uMouse.x * 3.2, uMouse.y * 2.2, 0.0);
  vec3 mDiff = pos - mouseWorld;
  float mDist = length(mDiff);
  if (mDist < 4.0) {
    pos += (mDiff / (mDist * mDist + 0.5)) * (0.35 * mouseInfluence);
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Attenuated point size with subtle shimmer (refined star photons, zero blinding white wall blowout)
  float shimmer = 0.85 + 0.3 * sin(uTime * 2.4 + aRandom.w * 6.28318);
  gl_PointSize = aSize * uPixelRatio * shimmer * (20.0 / -mvPosition.z);
  gl_PointSize = clamp(gl_PointSize, 1.5, 64.0);

  // Depth and distance alpha modulation with clean central typography clearing in Hero phase
  float depthFade = smoothstep(22.0, 2.0, -mvPosition.z);
  float centerDist = length(pos.xy);
  float centerDim = p < 0.8 ? smoothstep(0.4, 2.0, centerDist) * 0.7 + 0.3 : 1.0;
  vAlpha = clamp(aRandom.z * 0.45 + 0.55, 0.35, 1.0) * depthFade * centerDim;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  // Soft circular points and radial gaussian alpha falloff
  float dist = length(gl_PointCoord - vec2(0.5));
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.05, dist) * vAlpha;
  gl_FragColor = vec4(vColor, alpha);
}
`;

export default function SupernovaCosmicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let pointsMaterial: THREE.ShaderMaterial | null = null;
    let points: THREE.Points | null = null;

    // Vectors for zero-allocation camera interpolation
    const currentCamPos = new THREE.Vector3();
    const currentLookAt = new THREE.Vector3();

    // Smoothed state parameters
    let currentScrollProgress = 0.0;
    const targetScroll = { value: 0.0 };

    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    let lastTime = performance.now();

    try {
      // 1. Scene setup
      scene = new THREE.Scene();

      const initialWidth = window.innerWidth;
      const initialHeight = window.innerHeight;
      const initialAspect = initialWidth / Math.max(1, initialHeight);

      // 2. Camera setup
      camera = new THREE.PerspectiveCamera(WAYPOINTS[0].fov, initialAspect, 0.1, 100);
      camera.position.copy(WAYPOINTS[0].pos);
      camera.lookAt(WAYPOINTS[0].lookAt);

      // 3. Renderer setup
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(initialWidth, initialHeight);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(pixelRatio);

      // 4. Procedural Particle Attribute Generation
      geometry = new THREE.BufferGeometry();

      const heroPositions = new Float32Array(PARTICLE_COUNT * 3);
      const featuresPositions = new Float32Array(PARTICLE_COUNT * 3);
      const videoPositions = new Float32Array(PARTICLE_COUNT * 3);
      const ctaPositions = new Float32Array(PARTICLE_COUNT * 3);
      const colors = new Float32Array(PARTICLE_COUNT * 3);
      const sizes = new Float32Array(PARTICLE_COUNT);
      const randoms = new Float32Array(PARTICLE_COUNT * 4);

      // Cybernetic color palette: Cobalt Blue, Electric Blue, Cyan, White
      const palette = [
        new THREE.Color("#0047AB"), // Cobalt Blue
        new THREE.Color("#1D4ED8"), // Electric Blue
        new THREE.Color("#00F0FF"), // Cyan
        new THREE.Color("#FFFFFF"), // Pure White
      ];

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const i4 = i * 4;

        // Stochastic attributes
        randoms[i4 + 0] = Math.random();
        randoms[i4 + 1] = Math.random();
        randoms[i4 + 2] = Math.random();
        randoms[i4 + 3] = Math.random();

        sizes[i] = 1.4 + Math.random() * 2.2;

        // Determine particle color from palette: vibrant cyan & electric blue dominant, rare white sparkles
        let particleColor: THREE.Color;
        if (i < 400) {
          // Delicate stellar spark highlights (pure white diamond stars)
          particleColor = palette[3];
        } else if (i < 3800) {
          // High-luminance cybernetic cyan and electric blue
          particleColor = Math.random() > 0.35 ? palette[2] : palette[1];
        } else {
          // Deep cosmic backdrop cobalt & electric blue
          particleColor = Math.random() > 0.4 ? palette[0] : palette[1];
        }
        colors[i3 + 0] = particleColor.r;
        colors[i3 + 1] = particleColor.g;
        colors[i3 + 2] = particleColor.b;

        // -------------------------------------------------------------
        // Phase 1: aPosHero (Luminous cosmic halo framing Hero typography)
        // -------------------------------------------------------------
        const u1 = Math.random();
        const u2 = Math.random();
        const u3 = Math.random();
        let rHero: number;
        if (i < 1200) {
          // Delicate ambient embers within the central field (sparse, low density)
          rHero = 0.8 + 1.2 * u1;
        } else if (i < 4800) {
          // Radiant cosmic torus/halo framing the Hero typography card
          rHero = 2.4 + 2.2 * Math.pow(u1, 1.2);
        } else {
          // Ambient stellar context
          rHero = 4.2 + 4.8 * u1;
        }
        const thetaHero = Math.acos(2.0 * u2 - 1.0);
        const phiHero = 2.0 * Math.PI * u3;

        heroPositions[i3 + 0] = rHero * Math.sin(thetaHero) * Math.cos(phiHero) * 1.35;
        heroPositions[i3 + 1] = rHero * Math.sin(thetaHero) * Math.sin(phiHero) * 0.85;
        heroPositions[i3 + 2] = rHero * Math.cos(thetaHero) * 0.75;

        // -------------------------------------------------------------
        // Phase 2: aPosFeatures (Centrifugal radial burst framing 4 badges)
        // -------------------------------------------------------------
        // Badges: WASAPI (Top-Left), Screen-Share (Top-Right), ThinkStripper (Bottom-Left), Privacy (Bottom-Right)
        if (i < 3200) {
          // Condensations framing the 4 key badges
          const quad = i % 4;
          let cx = 0;
          let cy = 0;
          if (quad === 0) {
            cx = -3.6;
            cy = 1.9;
          } else if (quad === 1) {
            cx = 3.6;
            cy = 1.9;
          } else if (quad === 2) {
            cx = -3.6;
            cy = -1.9;
          } else {
            cx = 3.6;
            cy = -1.9;
          }
          const spreadX = (Math.random() - 0.5) * 2.2;
          const spreadY = (Math.random() - 0.5) * 1.3;
          const spreadZ = (Math.random() - 0.5) * 1.0;
          featuresPositions[i3 + 0] = cx + spreadX;
          featuresPositions[i3 + 1] = cy + spreadY;
          featuresPositions[i3 + 2] = spreadZ;
        } else {
          // Centrifugal perimeter burst leaving center negative space clean
          const angle = (i / (PARTICLE_COUNT - 3200)) * Math.PI * 2.0 + Math.random() * 0.1;
          const rBurst = 3.8 + Math.random() * 2.8;
          featuresPositions[i3 + 0] = rBurst * Math.cos(angle) * 1.3;
          featuresPositions[i3 + 1] = rBurst * Math.sin(angle) * 0.9;
          featuresPositions[i3 + 2] = (Math.random() - 0.5) * 2.6;
        }

        // -------------------------------------------------------------
        // Phase 3: aPosVideo (Relativistic 16:9 accretion ring)
        // -------------------------------------------------------------
        const majorAxis = 3.85;
        const minorAxis = 2.18;
        const ringAngle = (i / PARTICLE_COUNT) * Math.PI * 2.0;
        const tubeAngle = (i * 13.37) % (Math.PI * 2.0);
        const tubeRadius = (Math.random() - 0.5) * 0.65;

        let xBase: number, yBase: number, zBase: number;
        if (i < 4200) {
          xBase = (majorAxis + tubeRadius * Math.cos(tubeAngle)) * Math.cos(ringAngle);
          yBase = (minorAxis + tubeRadius * Math.cos(tubeAngle)) * Math.sin(ringAngle);
          zBase = tubeRadius * Math.sin(tubeAngle) * 0.8;
        } else {
          // Broad surrounding cosmic halo and floating particles framing the viewport
          const rHalo = 2.8 + Math.random() * 4.6;
          xBase = rHalo * Math.cos(ringAngle) * 1.35;
          yBase = rHalo * Math.sin(ringAngle) * 0.95;
          zBase = (Math.random() - 0.5) * 2.5;
        }

        // Relativistic inclination: pitch 14 deg around X, yaw -8 deg around Y
        const pitchRad = 14.0 * (Math.PI / 180.0);
        const yawRad = -8.0 * (Math.PI / 180.0);

        const yRot = yBase * Math.cos(pitchRad) - zBase * Math.sin(pitchRad);
        const zRot = yBase * Math.sin(pitchRad) + zBase * Math.cos(pitchRad);

        const xFinal = xBase * Math.cos(yawRad) + zRot * Math.sin(yawRad);
        const zFinal = -xBase * Math.sin(yawRad) + zRot * Math.cos(yawRad);

        videoPositions[i3 + 0] = xFinal;
        videoPositions[i3 + 1] = yRot;
        videoPositions[i3 + 2] = zFinal;

        // -------------------------------------------------------------
        // Phase 4: aPosCta (Upward streamline light column + expansive celestial field)
        // -------------------------------------------------------------
        const ySpan = -3.2 + 10.0 * (i / PARTICLE_COUNT);
        const spiralAngle = (i * 0.25) + ySpan * 0.7;

        if (i < 3000) {
          const rColumn = 0.55 + 0.22 * (ySpan + 3.2) + (Math.random() - 0.5) * 0.45;
          ctaPositions[i3 + 0] = rColumn * Math.cos(spiralAngle);
          ctaPositions[i3 + 1] = ySpan;
          ctaPositions[i3 + 2] = rColumn * Math.sin(spiralAngle);
        } else {
          // Broad starfield framing FAQ and Download portals
          const rField = 2.2 + Math.random() * 4.5;
          const thetaField = (i / (PARTICLE_COUNT - 3000)) * Math.PI * 2.0;
          ctaPositions[i3 + 0] = rField * Math.cos(thetaField) * 1.3;
          ctaPositions[i3 + 1] = ySpan;
          ctaPositions[i3 + 2] = rField * Math.sin(thetaField) * 1.1;
        }
      }

      // Three.js BufferGeometry attributes
      geometry.setAttribute("position", new THREE.BufferAttribute(heroPositions, 3));
      geometry.setAttribute("aPosHero", new THREE.BufferAttribute(heroPositions, 3));
      geometry.setAttribute("aPosFeatures", new THREE.BufferAttribute(featuresPositions, 3));
      geometry.setAttribute("aPosVideo", new THREE.BufferAttribute(videoPositions, 3));
      geometry.setAttribute("aPosCta", new THREE.BufferAttribute(ctaPositions, 3));
      geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 4));

      // 5. Shader Material
      pointsMaterial = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uProgress: { value: 0.0 },
          uTime: { value: 0.0 },
          uMouse: { value: new THREE.Vector2(0, 0) },
          uPixelRatio: { value: pixelRatio },
        },
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      });

      points = new THREE.Points(geometry, pointsMaterial);
      scene.add(points);

      // Interactive state bridge
      let isVideoActive = false;
      let activeHoverBadge: number | null = null;

      const onBadgeHover = (e: Event) => {
        const custom = e as CustomEvent<{ index: number | null }>;
        activeHoverBadge = custom.detail?.index ?? null;
      };
      const onVideoPlay = (e: Event) => {
        const custom = e as CustomEvent<{ isPlaying: boolean }>;
        isVideoActive = custom.detail?.isPlaying ?? false;
      };
      window.addEventListener("novapilot:badge-hover", onBadgeHover);
      window.addEventListener("novapilot:video-play", onVideoPlay);

      // 6. Scroll tracking listener
      const onScroll = () => {
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const raw = (window.scrollY / maxScroll) * 3.0;
        targetScroll.value = Math.max(0.0, Math.min(3.0, raw));
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      // 7. Pointermove parallax listener
      const onPointerMove = (e: PointerEvent) => {
        targetMouse.x = (e.clientX / window.innerWidth) * 2.0 - 1.0;
        targetMouse.y = -(e.clientY / window.innerHeight) * 2.0 + 1.0;
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });

      // 8. Viewport resize listener with mobile portrait FOV widening
      const onResize = () => {
        if (!renderer || !camera || !pointsMaterial) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspect = width / Math.max(1, height);

        camera.aspect = aspect;
        // Dynamically widen FOV on mobile portrait viewports to prevent horizontal clipping
        if (aspect < 1.0) {
          camera.fov = 45 + (1.0 - aspect) * 18.0;
        } else {
          camera.fov = 45;
        }
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        const pr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(pr);
        pointsMaterial.uniforms.uPixelRatio.value = pr;
      };
      window.addEventListener("resize", onResize, { passive: true });

      // Trajectory helper for 4-waypoint interpolation
      const interpolateWaypoints = (p: number): number => {
        const clampedP = Math.max(0.0, Math.min(3.0, p));
        let idx = Math.floor(clampedP);
        if (idx >= 3) {
          idx = 2;
        }
        const frac = clampedP - idx;
        // Smoothstep interpolation between adjacent waypoints
        const t = frac * frac * (3.0 - 2.0 * frac);

        const w0 = WAYPOINTS[idx];
        const w1 = WAYPOINTS[idx + 1];

        currentCamPos.lerpVectors(w0.pos, w1.pos, t);
        currentLookAt.lerpVectors(w0.lookAt, w1.lookAt, t);
        return w0.fov + (w1.fov - w0.fov) * t;
      };

      // 9. 60 FPS Render Loop with exponential inertia damping
      const animate = (now: number) => {
        animationFrameId = requestAnimationFrame(animate);

        const dt = Math.min((now - lastTime) / 1000.0, 0.1);
        lastTime = now;
        const elapsed = now * 0.001;

        // Scroll tracking with exponential inertia damping:
        // S_current += (S_target - S_current) * (1.0 - Math.exp(-8.0 * dt))
        const scrollFactor = 1.0 - Math.exp(-8.0 * dt);
        currentScrollProgress += (targetScroll.value - currentScrollProgress) * scrollFactor;

        // Mouse parallax & inertia lerping:
        // currentMouse += (targetMouse - currentMouse) * (1.0 - Math.exp(-6.0 * dt))
        const mouseFactor = 1.0 - Math.exp(-6.0 * dt);
        currentMouse.x += (targetMouse.x - currentMouse.x) * mouseFactor;
        currentMouse.y += (targetMouse.y - currentMouse.y) * mouseFactor;

        // Interpolate camera waypoint position, lookAt, and FOV
        const baseFov = interpolateWaypoints(currentScrollProgress);

        if (camera) {
          const width = window.innerWidth;
          const height = window.innerHeight;
          const aspect = width / Math.max(1, height);

          // Apply mouse parallax to camera position and target
          camera.position.set(
            currentCamPos.x + currentMouse.x * 0.35,
            currentCamPos.y + currentMouse.y * 0.25,
            currentCamPos.z
          );

          camera.lookAt(
            currentLookAt.x + currentMouse.x * 0.12,
            currentLookAt.y + currentMouse.y * 0.08,
            currentLookAt.z
          );

          // Mobile portrait FOV compensation
          if (aspect < 1.0) {
            camera.fov = baseFov + (1.0 - aspect) * 18.0;
          } else {
            camera.fov = baseFov;
          }
          camera.updateProjectionMatrix();
        }

        // Update shader uniforms
        if (pointsMaterial) {
          pointsMaterial.uniforms.uProgress.value = currentScrollProgress;
          // When video is active or a badge is hovered, energize the particle time
          const timeSpeed = isVideoActive ? 1.8 : (activeHoverBadge !== null ? 1.35 : 1.0);
          pointsMaterial.uniforms.uTime.value = elapsed * timeSpeed;
          pointsMaterial.uniforms.uMouse.value.set(currentMouse.x, currentMouse.y);
        }

        // Render frame
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animationFrameId = requestAnimationFrame(animate);

      // 10. WebGL Lifecycle & Clean Disposal
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("novapilot:badge-hover", onBadgeHover);
        window.removeEventListener("novapilot:video-play", onVideoPlay);

        if (geometry) {
          geometry.dispose();
          geometry = null;
        }

        if (pointsMaterial) {
          // Dispose any textures if attached
          const uniforms = pointsMaterial.uniforms;
          if (uniforms) {
            Object.keys(uniforms).forEach((key) => {
              const u = uniforms[key];
              if (u && u.value && typeof u.value.dispose === "function") {
                u.value.dispose();
              }
            });
          }
          pointsMaterial.dispose();
          pointsMaterial = null;
        }

        if (scene) {
          scene.clear();
          scene = null;
        }

        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
          renderer = null;
        }
      };
    } catch (err) {
      console.warn("WebGL SupernovaCosmicCanvas initialization error:", err);
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
