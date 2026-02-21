import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'layout-animations=(self)',
          },
        ],
      },
    ];
  },
  turbopack: {
    // Hier können später Regeln für Turbopack rein
  },
  /* config options here */
};
module.exports = nextConfig

export default withPWA(nextConfig);
