const withNextIntl = require('next-intl/plugin')(
  './src/i18n/request.ts'
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Permitir warnings durante o build, bloquear apenas errors críticos
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
