/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  // The Lambda container serves this static export through FastAPI.
  output: "export",
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig;
