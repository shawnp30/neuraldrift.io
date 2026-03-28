"use client";

import React from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { ValueProp } from "@/components/home/ValueProp";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LearningPreview } from "@/components/home/LearningPreview";
import { PopularWorkflows } from "@/components/home/PopularWorkflows";
import { HardwareComparison } from "@/components/home/HardwareComparison";
import { SocialProof } from "@/components/home/SocialProof";
import { DynamicCTA } from "@/components/DynamicCTA";

export default function HomePage() {
  return (
    <div className="nh-page">
      <div className="nh-noise" aria-hidden="true" />

      {/* Phase 1: Hero */}
      <HomeHero />

      {/* Phase 2: Value Prop */}
      <ValueProp />

      {/* Phase 3: How It Works */}
      <HowItWorks />

      {/* Phase 5: Workflow Previews (Moved up for conversion) */}
      <PopularWorkflows />

      {/* Phase 4: Learning Center */}
      <LearningPreview />

      {/* Phase 6: Hardware Comparison */}
      <HardwareComparison />

      {/* Phase 7: Social Proof */}
      <SocialProof />

      {/* Phase 8: Final CTA */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <DynamicCTA 
          title="Master the Architecture of Generative Intelligence."
          description="Don't just run models—understand them. Join the Neuraldrift Academy for premium video-led masterclasses on workflow stabilization and local training."
          ctaText="ENTER THE ACADEMY"
          ctaHref="/tutorials"
          variant="indigo"
          tag="// Academy Access"
        />
      </div>
    </div>
  );
}
