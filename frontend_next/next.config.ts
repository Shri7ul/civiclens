import type { NextConfig } from "next";

const nextConfig: NextConfig = { eslint: { ignoreDuringBuilds: true }, typescript: { ignoreBuildErrors: true },
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;


