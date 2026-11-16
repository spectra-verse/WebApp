import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Serve the install scripts from our own domain. jsDelivr caches @main for
  // up to 12h and once served a stale 404; raw GitHub refreshes within ~5 min.
  async rewrites() {
    const raw =
      "https://raw.githubusercontent.com/spectra-verse/WebApp/main/scripts";
    return [
      { source: "/install.sh", destination: `${raw}/spectraverse-install.sh` },
      {
        source: "/install-mac.sh",
        destination: `${raw}/spectraverse-install-mac-native.sh`,
      },
      { source: "/install.ps1", destination: `${raw}/spectraverse-install.ps1` },
    ];
  },
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
