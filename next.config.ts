import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  eslint: {
    // Lint is its own step (npm run lint); the build must not hide type errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
