import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/dashboard-canvas",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
