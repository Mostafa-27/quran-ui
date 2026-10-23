import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/page/[pageNumber]": ["./public/data/pages/*.json", "./public/data/*.json"],
  },
};

export default nextConfig;
