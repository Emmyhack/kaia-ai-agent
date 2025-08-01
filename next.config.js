/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    KAIA_PRIVATE_KEY: process.env.KAIA_PRIVATE_KEY,
    KAIA_RPC_URL: process.env.KAIA_RPC_URL,
    KAIASCAN_API_KEY: process.env.KAIASCAN_API_KEY,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    NEXT_PUBLIC_MOCK_ERC20_ADDRESS: process.env.MOCK_ERC20_ADDRESS,
    NEXT_PUBLIC_MOCK_YIELD_FARM_ADDRESS: process.env.MOCK_YIELD_FARM_ADDRESS,
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
  // Add experimental features for better performance
  experimental: {
    optimizeCss: false, // Disable to prevent build issues
    scrollRestoration: true,
  },
  // Add headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Optimize for Vercel
  swcMinify: true,
  poweredByHeader: false,
};

module.exports = nextConfig;