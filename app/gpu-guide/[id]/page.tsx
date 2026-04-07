'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PerformanceSpec {
  model: string;
  resolution: string;
  time: string;
  cost: string;
  recommended: boolean;
}

interface GPUDetailProps {
  params: {
    id: string;
  };
}

// Example data structure - you'd fetch this based on the ID
const gpuDetails = {
  'runpod': {
    name: 'RunPod',
    tagline: 'GPU pods on demand — ComfyUI template, per-second billing',
    image: '/gpu-images/runpod.png',
    pricing: {
      rtx4090: '$0.34/hr',
      a100_80gb: '$1.89/hr',
      h100: '$2.49/hr'
    },
    overview: 'RunPod offers on-demand GPU instances with per-second billing, making it ideal for variable workloads. Their ComfyUI template comes pre-configured, so you can start generating immediately.',
    canRun: [
      {
        model: 'Wan 2.1 14B',
        resolution: '720p (5min video)',
        time: '5 minutes',
        cost: '$0.16',
        recommended: true
      },
      {
        model: 'HunyuanVideo',
        resolution: '720p (5sec video)',
        time: '8-12 minutes',
        cost: '$0.25-0.40',
        recommended: true
      },
      {
        model: 'FLUX.1 Dev',
        resolution: '1024x1024',
        time: '15-25 seconds',
        cost: '$0.002-0.003',
        recommended: true
      },
      {
        model: 'SDXL',
        resolution: '1024x1024',
        time: '8-15 seconds',
        cost: '$0.001-0.002',
        recommended: true
      },
      {
        model: 'AnimateDiff',
        resolution: '512x512 (16 frames)',
        time: '45-90 seconds',
        cost: '$0.004-0.008',
        recommended: true
      }
    ],
    cannotRun: [
      {
        model: 'Local-only workflows',
        reason: 'Requires cloud setup; not suitable for one-off local testing'
      },
      {
        model: 'Real-time inference',
        reason: 'Instance startup adds 30-60 seconds overhead'
      }
    ],
    recommended: [
      {
        useCase: 'Video Generation (Wan 2.1, HunyuanVideo)',
        gpu: 'A100 80GB',
        reason: 'Best price/performance for video. 80GB handles full resolution without offloading.'
      },
      {
        useCase: 'Batch Image Generation (FLUX, SDXL)',
        gpu: 'RTX 4090',
        reason: 'Fastest consumer GPU. Great for generating 50-200 images in one session.'
      },
      {
        useCase: 'Experimentation & Testing',
        gpu: 'RTX 4090',
        reason: 'Lower cost for quick iterations. Upgrade to A100 when scaling up.'
      }
    ],
    notRecommended: [
      {
        useCase: 'Single image generation',
        reason: 'Instance startup time makes it inefficient. Use Comfy Cloud or local.'
      },
      {
        useCase: 'Interactive workflows',
        reason: 'Latency from cloud connection makes real-time adjustments frustrating.'
      }
    ],
    tips: [
      'Use the ComfyUI template to avoid setup time',
      'Terminate pods when done — billing stops immediately',
      'Start with RTX 4090, upgrade to A100 only if you hit VRAM limits',
      'Download outputs immediately — storage costs add up',
      'Use volume storage for models to avoid re-downloading'
    ]
  }
};

export default function GPUDetailPage({ params }: GPUDetailProps) {
  const detail = gpuDetails[params.id as keyof typeof gpuDetails];
  
  if (!detail) {
    return <div>GPU option not found</div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-[#0A0A0A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link 
            href="/gpu-guide" 
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-cyan-400 transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to GPU Guide</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-bold text-white mb-4">
                {detail.name}
              </h1>
              <p className="text-xl text-neutral-300 mb-6">
                {detail.tagline}
              </p>
              <div className="flex flex-wrap gap-3">
                {Object.entries(detail.pricing).map(([gpu, price]) => (
                  <div key={gpu} className="px-4 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                    <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                      {gpu.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-white">{price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-64 lg:h-80 rounded-xl overflow-hidden border border-neutral-800">
              <Image
                src={detail.image}
                alt={detail.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-lg text-neutral-300 leading-relaxed">
          {detail.overview}
        </p>
      </div>

      {/* What It Can Run */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-800">
        <h2 className="text-3xl font-bold text-white mb-8">What It Can Run</h2>
        <div className="grid gap-4">
          {detail.canRun.map((spec, index) => (
            <div 
              key={index}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{spec.model}</h3>
                  <p className="text-neutral-400">{spec.resolution}</p>
                </div>
                {spec.recommended && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">
                    Recommended
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Generation Time</span>
                  <p className="text-lg font-semibold text-white mt-1">{spec.time}</p>
                </div>
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Estimated Cost</span>
                  <p className="text-lg font-semibold text-cyan-400 mt-1">{spec.cost}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What It Can't Run / Limitations */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-800">
        <h2 className="text-3xl font-bold text-white mb-8">Limitations</h2>
        <div className="grid gap-4">
          {detail.cannotRun.map((item, index) => (
            <div 
              key={index}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-6"
            >
              <h3 className="text-lg font-bold text-white mb-2">{item.model}</h3>
              <p className="text-neutral-300">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Use Cases */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-800">
        <h2 className="text-3xl font-bold text-white mb-4">Recommended For</h2>
        <p className="text-neutral-400 mb-8">Best use cases and GPU configurations for this platform</p>
        <div className="grid gap-4">
          {detail.recommended.map((rec, index) => (
            <div 
              key={index}
              className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/30 rounded-lg p-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{rec.useCase}</h3>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                      {rec.gpu}
                    </span>
                  </div>
                  <p className="text-neutral-300">{rec.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Not Recommended */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-800">
        <h2 className="text-3xl font-bold text-white mb-4">Not Recommended For</h2>
        <p className="text-neutral-400 mb-8">Use cases where other options might be better</p>
        <div className="grid gap-4">
          {detail.notRecommended.map((item, index) => (
            <div 
              key={index}
              className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30 rounded-lg p-6"
            >
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2"></div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{item.useCase}</h3>
                  <p className="text-neutral-300">{item.reason}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-800">
        <h2 className="text-3xl font-bold text-white mb-8">Pro Tips</h2>
        <div className="grid gap-3">
          {detail.tips.map((tip, index) => (
            <div 
              key={index}
              className="flex items-start gap-4 bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-cyan-500/50 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                <span className="text-cyan-400 text-xs font-bold">{index + 1}</span>
              </div>
              <p className="text-neutral-200 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-neutral-800">
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-neutral-300 mb-6">
            Visit {detail.name} to set up your GPU instance and start generating
          </p>
          <a 
            href="#" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors"
          >
            <span>Visit {detail.name}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
