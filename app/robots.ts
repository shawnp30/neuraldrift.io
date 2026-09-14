import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard", "/auth/", "/stash", "/optimizer/result"],
      },
    ],
    sitemap: "https://neuraldrift.io/sitemap.xml",
  };
}
