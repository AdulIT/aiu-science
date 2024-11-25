/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://92.38.48.142:8080/api/:path*',
        },
      ];
    },
  };

export default nextConfig;
