import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['heitu.wang', 'www.heitu.wang'],
  
  // Docker 支持：启用 standalone 输出模式
  output: 'standalone',
  
  // 生产优化
  compress: true,
  poweredByHeader: false,
  
  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
      {
        protocol: 'https',
        hostname: 'adoss.anystories.app',
      },
      {
        protocol: 'https',
        hostname: 'unavatar.io',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
