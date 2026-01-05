/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        // THE TUNNEL (Bypassing CORS)
        source: '/api/music/:path*',
        destination: 'https://saavn.dev/api/:path*',
      },
    ];
  },
};

export default nextConfig;

