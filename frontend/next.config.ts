import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:9000/api/:path*",
      },
      {
        source: "/static/:path*",
        destination: "http://127.0.0.1:9000/static/:path*",
      },
    ];
  },
};

export default nextConfig;
