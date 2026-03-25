import type { MetadataRoute } from "next";

const routes = [
  "",
  "/groups",
  "/personal",
  "/shared",
  "/reports",
  "/settings",
  "/help",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3004";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
