# 🚀 NovaPilot AI — Official Website & Landing Portal

[![Live Demo](https://img.shields.io/badge/Live%20Website-Cloudflare%20Pages-0052FF?style=for-the-badge&logo=cloudflare)](https://novapilot-website.pages.dev)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

> **The official high-performance, single-page interactive web portal for NovaPilot AI** — the undetectable, zero-latency desktop meeting copilot and interview intelligence system for Windows 10 & 11.

---

## 🌟 About NovaPilot AI

**NovaPilot AI** is an ultra-low latency desktop assistant engineered for high-stakes technical interviews, system design presentations, and executive meetings. Built with a strict **Zero Data Retention** philosophy, it operates locally with maximum privacy and undetectable stealth.

### Core Capabilities:
* **🛡️ 100% Undetectable Screen Sharing:** Utilizes Windows native `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)` kernel API. The HUD is rendered strictly to your physical monitor's display buffer and is completely invisible to Zoom, Microsoft Teams, Google Meet, and background employer surveillance tools.
* **🎙️ Dual-Stream WASAPI Audio Loopback:** Captures interviewer voices and microphone streams directly at the hardware layer without installing detectable virtual audio cables.
* **⚡ Embedded Local Whisper STT:** Real-time speech transcription operating in volatile RAM without saving persistent audio recordings or transmitting audio to the cloud.
* **🧠 Sub-12ms Multi-LLM Matrix:** Direct streaming integration with Gemini 2.0 Flash, Claude 3.5 Sonnet, DeepSeek R1, GPT-4o, and local offline Ollama models (BYOK).
* **🔒 Enterprise Cryptographic Vault:** Transcripts and notes are stored locally in an `AES-256` encrypted SQLite database with credentials stored in the Windows Credential Vault (Keytar).

---

## 💻 Landing Page Architecture

The website is engineered for 60 FPS performance, seamless user experience, and enterprise search engine indexing:

* **🌌 Ambient Cosmic Video Background:** Full-bleed continuous video backdrop with real-time interactive audio controls (Sound ON/OFF).
* **🖥️ Live Interactive Stealth Simulator:** Split-view comparison demonstrating what you see on your physical monitor versus what meeting participants see on Zoom/Teams screen-shares.
* **🏗️ Zero-Footprint Signal Isolation Bento Grid:** Deep architectural visualization of hardware loopback, local RAM execution, and AES-256 local vaults.
* **⚖️ Enterprise Legal & Compliance Suite:** Interactive dialog modals covering the **Employee Privacy Shield**, **Zero-Log Privacy Policy**, and **14-Day Money-Back Guarantee**.
* **🔍 Complete SEO & AI Schema.org:** Pre-configured with rich `SoftwareApplication`, `Organization`, and `FAQPage` JSON-LD structured data for Google Search and AI indexing.

---

## 🛠️ Tech Stack

* **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite 5](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Animation:** [Framer Motion](https://www.framer.com/motion/)
* **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) (Edge CDN with automated Git CI/CD)

---

## 🚀 Quick Start & Development

### 1. Clone the repository
```bash
git clone https://github.com/ellsimohammed8-prog/novapilot-website.git
cd novapilot-website
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production
```bash
npm run build
```
Outputs the optimized production bundle to the `dist/` directory.

---

## 🌐 Deploying to Cloudflare Pages

1. Push your repository to GitHub.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create Application** ➔ **Pages** ➔ **Connect to Git**.
3. Select `novapilot-website`.
4. Configure build settings:
   * **Framework preset:** `Vite`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
5. Click **Save and Deploy**.

---

## 📦 Production Download Verification

| Binary Artifact | Target OS | File Size | SHA-512 Verification Hash |
| :--- | :--- | :--- | :--- |
| `NovaPilot-AI-Setup-2.7.0.exe` | Windows 10 & 11 (x64) | 560 MB | `vNbPK67tyzGaaCSY7AJDy52op0hO9p459Jmgccez2G8phSLCGtJqmR/oS2r0/8PzIx4U/hrQO9PEDI7+srvf9A==` |
| `NovaPilot-AI-Portable-2.7.0.exe` | Windows 10 & 11 (x64) | 560 MB | Verified Clean |

---

## 📬 Support & Inquiries

For technical assistance, enterprise licensing, or security inquiries:
* **Official Support Desk:** [ellsimohammed8@gmail.com](mailto:ellsimohammed8@gmail.com)
* **Response SLA:** Within 2–4 hours

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

&copy; 2026 NovaPilot AI Systems. All rights reserved.
