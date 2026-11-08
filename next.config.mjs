/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    // The benchmark page checks that artifacts exist with a runtime path under public/, so the
    // tracer bundles all of public/ (workflow evidence included) into its function, past Vercel's
    // 250 MB limit. Its pages are prerendered at build time, where public/ is present, and the
    // CDN serves public/ itself, so the function needs none of it.
    // Keys are globs ("[id]" would be a character class), so match the route segment with "*".
    outputFileTracingExcludes: { "/lab/benchmarks/*": ["public/**"] },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "neuraldrift" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatar.vercel.sh" },
      { protocol: "https", hostname: "comfyanonymous.github.io" },
    ],
  },
  async redirects() {
    return [
      // Legacy paths → canonical URLs (single hop, avoid chains)
      { source: "/proof", destination: "/proofs", permanent: true },
      { source: "/proof/upload", destination: "/proofs/upload", permanent: true },
      { source: "/loras", destination: "/lora-training", permanent: true },
      {
        source: "/tools/prompt-generator",
        destination: "/prompt-generator",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;

