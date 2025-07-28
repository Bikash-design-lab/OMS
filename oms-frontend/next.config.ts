import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ This disables ESLint errors from breaking builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
