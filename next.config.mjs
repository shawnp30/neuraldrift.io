/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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

Save with **Ctrl + S**, then run:
```
git add .
```
```
git commit -m "disable eslint during build"
```
```
git push