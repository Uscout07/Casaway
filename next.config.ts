// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  generateRobotsTxt: true,
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
      'casaway.s3.us-east-1.amazonaws.com' // ✅ Added S3 bucket domain
    ],
  },
};

module.exports = nextConfig;
