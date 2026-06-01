/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' }
    ]
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material']
  }
};

module.exports = nextConfig;

