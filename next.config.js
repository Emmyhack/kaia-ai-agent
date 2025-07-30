/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    KAIA_PRIVATE_KEY: process.env.KAIA_PRIVATE_KEY,
    KAIA_RPC_URL: process.env.KAIA_RPC_URL,
    KAIASCAN_API_KEY: process.env.KAIASCAN_API_KEY,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;