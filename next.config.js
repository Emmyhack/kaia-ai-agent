/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    KAIA_PRIVATE_KEY: process.env.KAIA_PRIVATE_KEY,
    KAIA_RPC_URL: process.env.KAIA_RPC_URL,
    KAIASCAN_API_KEY: process.env.KAIASCAN_API_KEY,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  },
  webpack: (config, { isServer }) => {
    // Optimize for production builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Reduce bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  },
  // Disable static export for Vercel
  output: 'standalone',
  // Compress static assets
  compress: true,
  // Reduce image optimization
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;