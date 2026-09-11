export const metadata = {
  title: "NovaPilot AI — Executive Stealth HUD Copilot",
  description:
    "Zero-latency dual-stream WASAPI audio capture, real-time reasoning extraction, and 100% stealth screen-share protection for Windows 10 & 11.",
};

import PageIllustration from "@/components/page-illustration";
import Hero from "@/components/hero";
import VideoShowcase from "@/components/video-showcase";
import InteractiveArchitecture from "@/components/interactive-architecture";
import MediaShowcase from "@/components/media-showcase";
import FeaturesGrid from "@/components/features-grid";
import SpecsTable from "@/components/specs-table";
import WindowsCta from "@/components/windows-cta";

export default function Home() {
  return (
    <>
      <PageIllustration />
      <Hero />
      <VideoShowcase />
      <InteractiveArchitecture />
      <MediaShowcase />
      <FeaturesGrid />
      <SpecsTable />
      <WindowsCta />
    </>
  );
}
