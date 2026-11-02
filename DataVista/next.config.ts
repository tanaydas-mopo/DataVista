import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
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
