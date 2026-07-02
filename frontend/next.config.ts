import type { NextConfig } from "next";

const mediaOrigin = new URL(
  process.env.NEXT_PUBLIC_MEDIA_ORIGIN ?? "http://localhost:4000"
);

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: mediaOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: mediaOrigin.hostname,
        port: mediaOrigin.port,
        pathname: "/uploads/**",
      },
    ],
    // Required as of Next.js 16 — explicit allowlist of optimization qualities.
    qualities: [75, 90],
  },
};

export default nextConfig;
