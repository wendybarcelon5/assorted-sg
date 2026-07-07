import type { NextConfig } from "next";

console.log("✅ NEXT CONFIG LOADED");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nnbuygmdkxnjtwwosuwq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;