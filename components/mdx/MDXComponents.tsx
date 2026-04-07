import React from "react";
import Image from "next/image";

export const MDXComponents = {
  h1: (props: any) => (
    <h1
      className="mb-6 mt-12 font-syne text-4xl font-black leading-tight tracking-tight text-white md:text-5xl"
      {...props}
    />
  ),
  h2: (props: any) => (
    <h2
      className="mb-5 mt-10 border-b border-[#2a2a30] pb-3 font-syne text-2xl font-black tracking-tight text-white md:text-3xl"
      {...props}
    />
  ),
  h3: (props: any) => (
    <h3
      className="mb-4 mt-8 font-syne text-xl font-bold tracking-tight text-white md:text-2xl"
      {...props}
    />
  ),
  p: (props: any) => (
    <p
      className="mb-6 text-[18px] font-normal leading-[1.8] text-[#e8e8f0]"
      {...props}
    />
  ),
  ul: (props: any) => <ul className="mb-8 list-none space-y-3" {...props} />,
  ol: (props: any) => (
    <ol
      className="mb-8 list-inside list-decimal space-y-3 text-[#e8e8f0]"
      {...props}
    />
  ),
  li: (props: any) => (
    <li className="flex items-start gap-3 text-[17px] leading-relaxed text-[#e8e8f0]">
      <span className="mt-1.5 flex-shrink-0 text-[#7c6af7]">→</span>
      <span {...props} />
    </li>
  ),
  blockquote: (props: any) => (
    <blockquote
      className="mb-8 rounded-r-xl border-l-4 border-[#7c6af7] bg-[#7c6af7]/5 p-6 italic text-[#8888a0]"
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      className="rounded bg-[#2a2a30] px-1.5 py-0.5 font-mono text-[0.9em] text-[#22d3ee]"
      {...props}
    />
  ),
  pre: (props: any) => (
    <div className="group relative my-8">
      <div className="absolute right-0 top-0 z-10 p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#8888a0]">
          Code Block
        </span>
      </div>
      <pre
        className="overflow-x-auto rounded-xl border border-[#2a2a30] bg-[#1e1e1e] p-6 font-mono text-[14px] leading-relaxed text-[#f8f8f2] shadow-2xl"
        {...props}
      />
    </div>
  ),
  hr: () => <hr className="my-12 border-[#2a2a30]" />,
  table: (props: any) => (
    <div className="my-8 overflow-x-auto rounded-xl border border-[#2a2a30]">
      <table className="w-full border-collapse text-left" {...props} />
    </div>
  ),
  th: (props: any) => (
    <th
      className="border-b border-[#2a2a30] bg-[#111113] p-4 font-syne text-sm font-bold text-[#7c6af7]"
      {...props}
    />
  ),
  td: (props: any) => (
    <td
      className="border-b border-[#2a2a30] p-4 text-sm text-[#8888a0]"
      {...props}
    />
  ),
  img: (props: any) => (
    <figure className="my-10">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#2a2a30] shadow-2xl">
        <Image
          src={props.src}
          alt={props.alt || ""}
          fill
          className="object-cover"
        />
      </div>
      {props.alt && (
        <figcaption className="mt-4 text-center font-mono text-xs uppercase tracking-widest text-[#8888a0] opacity-60">
          {"// "}
          {props.alt}
        </figcaption>
      )}
    </figure>
  ),
  // Custom Callouts
  tip: (props: any) => (
    <div className="my-8 flex gap-4 rounded-2xl border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-6">
      <div className="mt-0.5 text-2xl">💡</div>
      <div>
        <p className="mb-1 font-syne text-sm font-bold uppercase tracking-widest text-[#22d3ee]">
          Pro Tip
        </p>
        <div className="text-sm leading-relaxed text-[#e8e8f0]" {...props} />
      </div>
    </div>
  ),
  warning: (props: any) => (
    <div className="my-8 flex gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
      <div className="mt-0.5 text-2xl">⚠️</div>
      <div>
        <p className="mb-1 font-syne text-sm font-bold uppercase tracking-widest text-red-500">
          Warning
        </p>
        <div className="text-sm leading-relaxed text-[#e8e8f0]" {...props} />
      </div>
    </div>
  ),
  note: (props: any) => (
    <div className="my-8 flex gap-4 rounded-2xl border border-[#7c6af7]/20 bg-[#7c6af7]/5 p-6">
      <div className="mt-0.5 text-2xl">📝</div>
      <div>
        <p className="mb-1 font-syne text-sm font-bold uppercase tracking-widest text-[#7c6af7]">
          Note
        </p>
        <div className="text-sm leading-relaxed text-[#e8e8f0]" {...props} />
      </div>
    </div>
  ),
  stats: (props: any) => (
    <div className="my-10 grid grid-cols-2 gap-4 md:grid-cols-4" {...props} />
  ),
  stat: ({ value, label }: { value: string; label: string }) => (
    <div className="group rounded-xl border border-[#2a2a30] bg-[#111113] p-4 text-center transition-all hover:border-[#7c6af7]/50">
      <div className="mb-1 font-syne text-2xl font-black text-white">
        {value}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#8888a0]">
        {label}
      </div>
    </div>
  ),
};
