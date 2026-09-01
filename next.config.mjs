/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'jvcnrfmqjnruclesovby.supabase.co',
      },
    ],
  },
  allowedDevOrigins: ['192.168.137.1', '10.154.129.248'],
};

export default nextConfig;