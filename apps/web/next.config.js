/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bodegadata/core', '@bodegadata/ui', '@bodegadata/species-config', 'three'],
}

module.exports = nextConfig
