import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/gift-shop',
        destination: '/gifts',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
