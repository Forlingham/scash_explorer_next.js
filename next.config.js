/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== 'production') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://explorer.scash.network/api/:path*',
          // destination: 'http://127.0.0.1:5100/api/:path*',
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
