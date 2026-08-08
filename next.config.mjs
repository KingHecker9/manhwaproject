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
  serverExternalPackages: ['pdfjs-dist', 'pdf-to-png-converter', 'canvas', '@napi-rs/canvas'],
  allowedDevOrigins: ['192.168.137.1', '10.154.129.248'],
  outputFileTracingIncludes: {
    '/api/upload': ['./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'],
  },
};

export default nextConfig;