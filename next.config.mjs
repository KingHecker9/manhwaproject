/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  serverExternalPackages: ['pdfjs-dist', 'pdf-to-png-converter', 'canvas'],
  allowedDevOrigins: ['192.168.137.1', '10.17.132.248'],
};

export default nextConfig;