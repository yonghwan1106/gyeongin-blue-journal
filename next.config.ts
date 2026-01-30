import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '158.247.210.200',
        port: '8090',
        pathname: '/api/files/**',
      },
      {
        protocol: 'https',
        hostname: '158.247.210.200',
        port: '8090',
        pathname: '/api/files/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/pb/:path*',
        destination: 'http://158.247.210.200:8090/:path*',
      },
    ]
  },
}

export default nextConfig
