const apiBaseUrl = process.env.API_BASE_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  async rewrites() {
    if (!apiBaseUrl) {
      return [];
    }

    return [
      {
        source: "/api",
        destination: `${apiBaseUrl}/api`
      },
      {
        source: "/api/:path*",
        destination: `${apiBaseUrl}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
