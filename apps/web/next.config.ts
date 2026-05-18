import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/analyze", destination: "/analiza", permanent: true },
      { source: "/assistant", destination: "/asistent", permanent: true },
      { source: "/reports", destination: "/izvestaji", permanent: true },
      { source: "/demo", destination: "/analiza", permanent: true },
      { source: "/hermes", destination: "/asistent", permanent: true },
      { source: "/method", destination: "/#kako-radi", permanent: true },
      { source: "/operator", destination: "/asistent", permanent: true },
    ];
  },
};

export default nextConfig;
