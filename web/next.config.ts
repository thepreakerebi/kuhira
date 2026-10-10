import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Links shared before pages moved under a language segment.
  async redirects() {
    return [
      { source: "/farmer", destination: "/rw/farmer", permanent: true },
      { source: "/farmer/:lang(en|rw)", destination: "/:lang/farmer", permanent: true },
      { source: "/method", destination: "/en/method", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
