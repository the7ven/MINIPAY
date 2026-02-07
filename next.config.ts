import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true,
  disable: process.env.NODE_ENV === "development", // Désactivé en dev pour éviter les bugs de cache
  register: true,
});

const nextConfig: NextConfig = {
  /* Tes options de config habituelles ici */
  reactStrictMode: true,
  turbopack: {},
};

export default withPWA(nextConfig);