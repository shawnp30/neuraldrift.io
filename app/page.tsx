import React from "react";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";

// High-Fidelity Components
import { HomeHero } from "@/components/home/HomeHero";
import { ExpectationSection } from "@/components/home/ExpectationSection";
import { ArchitectsSpotlight } from "@/components/home/ArchitectsSpotlight";
import { PopularWorkflows } from "@/components/home/PopularWorkflows";
import { OptimizerFeature } from "@/components/home/OptimizerFeature";
import { LearningPreview } from "@/components/home/LearningPreview";
import { SocialProof } from "@/components/home/SocialProof";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { ComputeBridge } from "@/components/home/ComputeBridge";
import { PlatformSections } from "@/components/home/PlatformSections";
import { LoRAsPreview } from "@/components/home/LoRAsPreview";

// Types
interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tag: string;
  difficulty: string;
}

// Data fetching for guides (Used by LearningPreview or similar)
async function getLatestGuides(): Promise<GuideMeta[]> {
  try {
    const guidesDir = join(process.cwd(), "content/guides");
    const files = readdirSync(guidesDir).filter((f) => f.endsWith(".mdx"));

    const guides = files.map((filename) => {
      const filePath = join(guidesDir, filename);
      const fileContent = readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);
      return {
        slug: filename.replace(".mdx", ""),
        title: data.title || "Untitled Guide",
        description: data.description || "",
        publishedAt: data.publishedAt || "2024-01-01",
        tag: data.tag || "Guide",
        difficulty: data.difficulty || "Beginner",
      };
    });

    return guides
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 4);
  } catch (error) {
    console.error("Error fetching guides:", error);
    return [];
  }
}

export default async function HomePage() {
  // Fetch data for sections that need it
  const latestGuides = await getLatestGuides();

  return (
    <div className="bg-transparent text-[#e8e8f0] selection:bg-[#7c6af7]/30">
      {/* Hero: The cinematic entry point */}
      <HomeHero />

      {/* Onboarding: What NeuralDrift is and how people use it */}
      <ExpectationSection />

      {/* Social: Community growth & proof */}
      <SocialProof />

      {/* Hero: Featured Architect (The missing visual models entry point) */}
      <ArchitectsSpotlight />

      {/* Featured: The most popular ready-to-run pipelines */}
      <PopularWorkflows />

      {/* Optimization: Performance & Compatibility Engine */}
      <OptimizerFeature />

      {/* Overview: The 6 pillars of the platform */}
      <PlatformSections />

      {/* Educational pathways */}
      <LearningPreview />

      {/* Monetization/Partner: Hardware bridge */}
      <ComputeBridge />

      {/* Growth: Community loop */}
      <NewsletterSignup />

      {/* Global Styles for the entire Neuraldrift aesthetic */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @font-face {
          font-family: 'Berkeley Mono';
          src: local('Berkeley Mono'), local('Fira Code');
        }
        :root {
          --accent-cyan: #00e5ff;
          --accent-purple: #7c6af7;
          --accent-emerald: #10b981;
        }
        .nh-container {
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `,
        }}
      />
    </div>
  );
}
