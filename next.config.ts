import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  turbopack: {
    // Hier können später Regeln für Turbopack rein
  },
  /* config options here */
};
module.exports = nextConfig

export default withPWA(nextConfig);