// next.config.js
module.exports = {
  generateRobotsTxt: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },

    ];
  },
  Images: {
    domains: ['localhost', 'res.cloudinary.com', 'casaway-backend.onrender.com' , "cdn.pixabay.com"],}
};
