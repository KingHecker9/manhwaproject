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
      {
        protocol: 'https',
        hostname: 'pub-93430bb912754abc8e23166862ad4fc1.r2.dev',
      },
    ],
  },
  allowedDevOrigins: ['192.168.137.1', '10.154.129.248'],
};

export default nextConfig;