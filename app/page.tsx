"use client";

import React from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { ValueProp } from "@/components/home/ValueProp";
import { HowItWorks } from "@/components/home/HowItWorks";
import { LearningPreview } from "@/components/home/LearningPreview";
import { PopularWorkflows } from "@/components/home/PopularWorkflows";
import { HardwareComparison } from "@/components/home/HardwareComparison";
import { SocialProof } from "@/components/home/SocialProof";
import { FinalCTA } from "@/components/home/FinalCTA";

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
      <FinalCTA />
    </div>
  );
}
