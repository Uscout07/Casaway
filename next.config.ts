// next.config.js
/** @type {import('next').NextConfig} */ // Add this JSDoc for better type checking
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
  images: { // <--- Changed from 'Images' to 'images'
    domains: ['localhost', 'github.com', 'casaway-backend.onrender.com' , "cdn.pixabay.com"],
  }
};

module.exports = nextConfig;