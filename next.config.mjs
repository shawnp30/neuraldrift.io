/** @type {import("next").NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
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
