import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/portfolio/simcraft",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
