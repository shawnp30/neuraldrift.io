import { HeroSection } from "@/components/home/HeroSection";
import { FocusAreas } from "@/components/home/FocusAreas";
import { PipelineVisual } from "@/components/home/PipelineVisual";
import { GuidesPreview } from "@/components/home/GuidesPreview";
import { ComputeBridge } from "@/components/home/ComputeBridge";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CodeFeature } from "@/components/home/CodeFeature";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FocusAreas />
        <CodeFeature />
        <PipelineVisual />
        <GuidesPreview />
        <ComputeBridge />
        <NewsletterSignup />
      </main>
      <Footer />
    </>
  );
}
