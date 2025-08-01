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
  // Add security headers
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://public-en.node.kaia.io https://public-en-kairos.node.kaia.io https://api.kaiascope.com; frame-ancestors 'none';",
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