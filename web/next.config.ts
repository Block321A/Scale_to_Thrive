import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Student photos and company logos are stored in Supabase Storage; next/image must be told it may load them.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
