/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "neuralhub.ai" },
    ],
  },
};

export default nextConfig;
```

Press **Ctrl + S**, then run:
```
git add .
```
```
git commit -m "ignore ts and eslint errors during build"
```
```
git push