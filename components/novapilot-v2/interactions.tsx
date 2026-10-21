"use client";

import { useEffect } from "react";

/**
 * Client behaviours for the v2 homepage — a React port of the approved
 * standalone build's script.js: FAQ accordion + SHA-512 checksum copy.
 * (The hero entrance is CSS-only, in app/css/novapilot-v2.css.)
 */
export default function V2Interactions() {
  useEffect(() => {
    // FAQ accordion
    const buttons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".np-v2 .faq-q"),
    );
    const onFaqClick = (btn: HTMLButtonElement) => () => {
      const item = btn.closest(".faq-item");
      const panel = item?.querySelector<HTMLElement>(".faq-a");
      if (!panel) return;
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      // Close all, then open the clicked one if it was closed.
      buttons.forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const p = b.closest(".faq-item")?.querySelector<HTMLElement>(".faq-a");
        if (p) p.hidden = true;
      });
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    };
    const handlers = buttons.map((btn) => {
      const handler = onFaqClick(btn);
      btn.addEventListener("click", handler);
      return { btn, handler };
    });

    // Copy SHA-512 checksum
    const copyBtn = document.getElementById("copy-sha");
    const hashEl = document.getElementById("sha-hash");
    let copyHandler: (() => void) | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    if (copyBtn && hashEl) {
      copyHandler = () => {
        const text = (hashEl.textContent ?? "").trim();
        const done = () => {
          copyBtn.textContent = "Copied";
          resetTimer = setTimeout(() => {
            copyBtn.textContent = "Copy checksum";
          }, 2500);
        };
        const fallback = () => {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
          } catch {
            /* no-op */
          }
          document.body.removeChild(ta);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard
            .writeText(text)
            .then(done)
            .catch(() => {
              fallback();
              done();
            });
        } else {
          fallback();
          done();
        }
      };
      copyBtn.addEventListener("click", copyHandler);
    }

    return () => {
      handlers.forEach(({ btn, handler }) =>
        btn.removeEventListener("click", handler),
      );
      if (copyBtn && copyHandler)
        copyBtn.removeEventListener("click", copyHandler);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return null;
}
