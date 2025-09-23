import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Clerk (autenticação)
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
      // Imagens de exemplo
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Google Images (produtos)
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn1.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn2.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn3.gstatic.com',
        port: '',
        pathname: '/**',
      },
      // Mercado Livre
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'http2.mlstatic.com.br',
        port: '',
        pathname: '/**',
      },
      // Vibromak (fornecedor)
      {
        protocol: 'https',
        hostname: 'vibromak.com.br',
        port: '',
        pathname: '/**',
      },
      // Sindileq
      {
        protocol: 'https',
        hostname: 'sindileq-pe.org.br',
        port: '',
        pathname: '/**',
      },
      // Cloudinary (CDN comum)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      // Outros CDNs comuns
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Configurações otimizadas para produção
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
