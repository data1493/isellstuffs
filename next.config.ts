import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Store seam loads `postgres` only when DATABASE_URL is a Postgres URL.
  // Keep it external so cookie-default Agent Row still compiles.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
