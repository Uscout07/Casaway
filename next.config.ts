// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://casaway-backend.onrender.com/api/:path*',
      },
    ];
  },
  images: {
    domains: [
      'localhost',
      'github.com',
      'casaway-backend.onrender.com',
      'cdn.pixabay.com',
      'casaway.s3.us-east-1.amazonaws.com'
    ],
  },
};

export default nextConfig;
