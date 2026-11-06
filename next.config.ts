import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle in .next/standalone, used by the Docker image
  output: "standalone",
  // Keep the dev-only Next.js badge away from the sidebar's logout button
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
