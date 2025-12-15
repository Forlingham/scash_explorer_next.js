/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== 'production') {
      const serverUrl = process.env.SERVER_URL || 'http://127.0.0.1:5100/api'
      return [
        {
          source: '/api/:path*',
          destination: `${serverUrl}/:path*`,
        },
      ];
    }
    return [];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    return config;
  },

};

module.exports = nextConfig;
