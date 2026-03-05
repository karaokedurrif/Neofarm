/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // OvoSfera API (internal Docker service)
      {
        source: '/api/ovosfera/:path*',
        destination: 'http://api:8000/:path*',
      },
      // Genetics proxy (transitional — capones-backend via Docker gateway)
      {
        source: '/ext/:path*',
        destination: 'http://172.17.0.1:8001/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
