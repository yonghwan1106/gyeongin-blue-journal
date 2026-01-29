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
    ],
  },
}

export default nextConfig
