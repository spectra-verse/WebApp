import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: [
    "@libsql/client",
    "@libsql/core",
    "@libsql/hrana-client",
    "@libsql/isomorphic-ws",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gravatar.com",
        port: "",
        pathname: "/avatar/**",
      },
    ],
  },
};

export default nextConfig;
