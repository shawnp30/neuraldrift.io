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
      { source: '/gpu-guide', destination: '/hardware', permanent: true },
      { source: '/tools/vram-calculator', destination: '/hardware', permanent: true },
      { source: '/tools/benchmark-lookup', destination: '/hardware', permanent: true },
      { source: '/optimizer', destination: '/hardware', permanent: true },
    ]
  },
};
export default nextConfig;
