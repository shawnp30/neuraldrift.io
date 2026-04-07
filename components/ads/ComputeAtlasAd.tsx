import React from "react";
import Image from "next/image";

interface Props {
  type?: "horizontal" | "sidebar";
}

export const ComputeAtlasAd = ({ type = "horizontal" }: Props) => {
  if (type === "sidebar") {
    return (
      <div className="rounded-2xl border border-[#7c6af7]/20 bg-gradient-to-br from-[#7c6af7]/10 to-[#22d3ee]/5 p-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-[#7c6af7]">
          {"// Hardware Partner"}
        </p>
        <h3 className="mb-2 font-syne text-lg font-bold text-white">
          Need more VRAM?
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-[#8888a0]">
          Plan your next AI workstation upgrade with ComputeAtlas. Get exact
          hardware recommendations for your target workflows.
        </p>
        <a
          href="https://computeatlas.ai/ai-hardware-estimator?ref=neuraldrift"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-xl bg-[#7c6af7] py-3 text-center text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
        >
          Check Estimator →
        </a>
      </div>
    );
  }

  return (
    <div className="group my-12 overflow-hidden rounded-2xl border border-[#2a2a30] bg-[#111113] p-1">
      <a
        href="https://computeatlas.ai/recommended-builds?ref=neuraldrift"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-6 p-6 md:flex-row"
      >
        <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-lg md:w-48">
          <Image
            src="/images/computeatlas-promo.png"
            alt="ComputeAtlas Builds"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded border border-[#4ade80]/20 bg-[#4ade80]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#4ade80]">
              Hardware Recommendation
            </span>
          </div>
          <h3 className="mb-2 font-syne text-xl font-bold text-white">
            The Best GPUs for Local AI in 2026
          </h3>
          <p className="text-sm leading-relaxed text-[#8888a0]">
            From budget 12GB builds to the dual-5090 monsters. See what the
            experts at ComputeAtlas recommend for ComfyUI and FLUX training.
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="rounded-xl border border-[#7c6af7]/30 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-[#7c6af7] transition-all group-hover:bg-[#7c6af7] group-hover:text-white">
            See Builds →
          </div>
        </div>
      </a>
    </div>
  );
};
