import SupernovaCosmicCanvas from "@/components/supernova-cosmic-canvas";
import Interactive3dCursor from "@/components/interactive-3d-cursor";
import Hero from "@/components/hero";
import VideoShowcase from "@/components/video-showcase";
import GeoFaqSection from "@/components/geo-faq-section";
import WindowsCta from "@/components/windows-cta";
import ErrorBoundary from "@/components/error-boundary";

export const metadata = {
  title: "NovaPilot AI — Executive Stealth HUD Copilot for Windows",
  description:
    "Executive stealth HUD copilot for Windows featuring hardware WASAPI loopback audio ingestion, ThinkStripper reasoning extraction FSM, and WDA_EXCLUDEFROMCAPTURE screen-share protection.",
};

export default function Home() {
  return (
    <>
      {/* Fixed Full-Screen Background Three.js Scrollytelling Canvas */}
      <SupernovaCosmicCanvas />

      {/* Interactive 3D Glowing Cyan Reticle & Micro-Trail Cursor */}
      <Interactive3dCursor />

      {/* Section 1 & 2: Hero Hook, Windows Download CTA, 4 Floating Glassmorphic Badges */}
      <Hero />

      {/* Section 3: 16:9 Commercial Video Showcase Enveloped by Phase 3 Accretion Ring */}
      <div id="architecture" className="relative scroll-mt-20">
        <div id="demo">
          <ErrorBoundary fallback={<div className="min-h-[100px]" />}>
            <VideoShowcase />
          </ErrorBoundary>
        </div>
      </div>

      {/* Section 4: On-Page GEO Authority & Technical FAQ Accordion */}
      <GeoFaqSection />

      {/* Section 5: High-Conversion Windows Download Portal & Verified System Specs */}
      <WindowsCta />
    </>
  );
}
