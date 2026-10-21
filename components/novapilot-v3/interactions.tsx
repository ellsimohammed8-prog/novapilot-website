"use client";

import { useEffect } from "react";

/**
 * Client behaviours for the v3 homepage — a React port of the approved
 * standalone build's script.js: nav state, scroll reveal, explainer play
 * overlay, hero video, cursor glow, parallax and the live canvas waves.
 * Everything is scoped to .np-v3 and fully cleaned up on unmount.
 * (In the standalone, reveal-hiding was gated on a `js` class on <html>;
 * here the same gate is the `rv-on` class this component toggles on .np-v3.)
 */
export default function V3Interactions() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".np-v3");
    if (!root) return;
    root.classList.add("rv-on");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const cleanups: Array<() => void> = [];
    const on = (
      type: string,
      listener: EventListener,
      opts?: AddEventListenerOptions,
    ) => {
      window.addEventListener(type, listener, opts);
      cleanups.push(() => window.removeEventListener(type, listener, opts));
    };

    /* ---------- nav state ---------- */
    const nav = root.querySelector<HTMLElement>("#nav");
    const onScroll = () => {
      nav?.classList.toggle("scrolled", window.scrollY > 24);
    };
    on("scroll", onScroll, { passive: true });
    onScroll();

    /* ---------- scroll reveal ---------- */
    const rvEls = Array.from(root.querySelectorAll<HTMLElement>(".rv"));
    let revealIo: IntersectionObserver | null = null;
    if (reduced || !("IntersectionObserver" in window)) {
      rvEls.forEach((el) => el.classList.add("in"));
    } else {
      revealIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              revealIo?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.16 },
      );
      rvEls.forEach((el) => revealIo?.observe(el));
      cleanups.push(() => revealIo?.disconnect());
    }

    /* ---------- explainer video ---------- */
    const video = root.querySelector<HTMLVideoElement>("#explainer");
    const playBtn = root.querySelector<HTMLButtonElement>("#playBtn");
    if (video && playBtn) {
      const onPlayClick = () => {
        video.controls = true;
        playBtn.classList.add("hidden");
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      };
      playBtn.addEventListener("click", onPlayClick);
      cleanups.push(() => playBtn.removeEventListener("click", onPlayClick));
    }

    /* ---------- hero video ---------- */
    const heroVideo = root.querySelector<HTMLVideoElement>(".hero-video");
    if (heroVideo) {
      if (reduced) {
        heroVideo.pause();
        heroVideo.removeAttribute("autoplay");
      } else {
        heroVideo.muted = true;
        const hp = heroVideo.play();
        if (hp && hp.catch) hp.catch(() => {});
      }
    }

    if (reduced) {
      return () => {
        cleanups.forEach((fn) => fn());
        root.classList.remove("rv-on");
      };
    }

    /* ---------- shared pointer state ---------- */
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2; // target
    let gx = mx;
    let gy = my; // glow (smoothed)
    let px = 0;
    let py = 0; // parallax (smoothed)
    let hasPointer = false;

    /* ---------- cursor glow ---------- */
    const glow = root.querySelector<HTMLElement>("#glow");
    if (!finePointer && glow) glow.style.display = "none";

    on(
      "mousemove",
      (e: Event) => {
        const me = e as MouseEvent;
        mx = me.clientX;
        my = me.clientY;
        hasPointer = true;
        glow?.classList.add("on");
      },
      { passive: true },
    );

    /* ---------- parallax layers ---------- */
    type Layer = { el: HTMLElement; depth: number };
    const layers: Layer[] = [];
    if (finePointer) {
      root.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        layers.push({
          el,
          depth: parseFloat(el.getAttribute("data-depth") || "") || 0,
        });
      });
    }

    /* ---------- canvas waves ---------- */
    const canvas = root.querySelector<HTMLCanvasElement>("#waves");
    const hero = root.querySelector<HTMLElement>(".hero");
    const ctx = canvas?.getContext("2d") ?? null;
    let rafId = 0;

    if (canvas && hero && ctx) {
      let W = 0;
      let H = 0;
      let heroVisible = true;

      const sizeCanvas = () => {
        const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
        W = hero.clientWidth;
        H = hero.clientHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      };
      sizeCanvas();
      on("resize", sizeCanvas);

      const particles = Array.from({ length: 42 }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.6 + Math.random() * 1.7,
        s: 0.008 + Math.random() * 0.03,
        drift: (Math.random() - 0.5) * 0.006,
        tw: Math.random() * Math.PI * 2,
      }));

      let heroIo: IntersectionObserver | null = null;
      if ("IntersectionObserver" in window) {
        heroIo = new IntersectionObserver(
          (entries) => {
            heroVisible = entries[0].isIntersecting;
          },
          { threshold: 0.02 },
        );
        heroIo.observe(hero);
        cleanups.push(() => heroIo?.disconnect());
      }

      const ribbons = [
        { base: 0.6, amp: 26, len: 0.0038, speed: 0.16, width: 5.5, alpha: 0.05 },
        { base: 0.63, amp: 22, len: 0.0046, speed: 0.22, width: 2.0, alpha: 0.16 },
        { base: 0.66, amp: 30, len: 0.0031, speed: 0.12, width: 1.3, alpha: 0.22 },
        { base: 0.585, amp: 18, len: 0.0054, speed: 0.28, width: 1.0, alpha: 0.12 },
      ];

      const drawWaves = (t: number) => {
        ctx.clearRect(0, 0, W, H);
        const time = t / 1000;
        // pointer in hero-local coords
        const rect = hero.getBoundingClientRect();
        const lx = mx - rect.left;
        const ly = my - rect.top;

        ribbons.forEach((r) => {
          ctx.beginPath();
          for (let x = -10; x <= W + 10; x += 7) {
            const dx = x - lx;
            const prox = Math.exp(-(dx * dx) / (2 * 240 * 240)); // gaussian around cursor
            const env = 1 + 0.85 * prox;
            let y =
              H * r.base +
              Math.sin(x * r.len + time * r.speed * 2.2) * r.amp * env +
              Math.sin(x * r.len * 0.5 - time * r.speed * 1.3) * r.amp * 0.45;
            if (hasPointer) y += (ly - H * r.base) * 0.1 * prox;
            if (x === -10) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = "rgba(96,144,255," + r.alpha + ")";
          ctx.lineWidth = r.width;
          ctx.stroke();
        });

        // particles
        particles.forEach((p) => {
          p.y -= (p.s / H) * 10;
          p.x += (p.drift / W) * 10;
          if (p.y < -0.02) {
            p.y = 1.02;
            p.x = Math.random();
          }
          if (p.x < -0.02) p.x = 1.02;
          if (p.x > 1.02) p.x = -0.02;
          const a = 0.16 + 0.3 * (0.5 + 0.5 * Math.sin(time * 0.9 + p.tw));
          ctx.beginPath();
          ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(150,180,255," + a.toFixed(3) + ")";
          ctx.fill();
        });
      };

      /* ---------- main loop ---------- */
      const frame = (t: number) => {
        rafId = requestAnimationFrame(frame);
        if (document.hidden) return;

        if (finePointer && glow && hasPointer) {
          gx += (mx - gx) * 0.09;
          gy += (my - gy) * 0.09;
          glow.style.transform = "translate(" + gx + "px," + gy + "px)";
        }

        if (layers.length) {
          const tx = (mx / window.innerWidth - 0.5) * 2;
          const ty = (my / window.innerHeight - 0.5) * 2;
          px += (tx - px) * 0.045;
          py += (ty - py) * 0.045;
          layers.forEach((l) => {
            l.el.style.transform =
              "translate3d(" +
              (px * l.depth).toFixed(2) +
              "px," +
              (py * l.depth).toFixed(2) +
              "px,0)";
          });
        }

        if (heroVisible) drawWaves(t);
      };
      rafId = requestAnimationFrame(frame);
      cleanups.push(() => cancelAnimationFrame(rafId));
    }

    return () => {
      cleanups.forEach((fn) => fn());
      root.classList.remove("rv-on");
    };
  }, []);

  return null;
}
