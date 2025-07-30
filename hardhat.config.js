require("@nomicfoundation/hardhat-toolbox");
require("dotenv/config");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    kaia: {
      url: "https://public-en-kairos.node.kaia.io",
      chainId: 1001,
      accounts: process.env.KAIA_PRIVATE_KEY ? [process.env.KAIA_PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 Gwei
    },
    "kaia-testnet": {
      url: "https://public-en-kairos.node.kaia.io",
      chainId: 1001,
      accounts: process.env.KAIA_PRIVATE_KEY ? [process.env.KAIA_PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 Gwei
    },
    "kaia-mainnet": {
      url: "https://public-en.node.kaia.io",
      chainId: 8217,
      accounts: process.env.KAIA_PRIVATE_KEY ? [process.env.KAIA_PRIVATE_KEY] : [],
      gasPrice: 25000000000, // 25 Gwei
    },
  },
  etherscan: {
    apiKey: {
      kaia: process.env.KAIASCAN_API_KEY || "no-api-key-needed",
      "kaia-testnet": process.env.KAIASCAN_API_KEY || "no-api-key-needed",
    },
    customChains: [
      {
        network: "kaia",
        chainId: 8217,
        urls: {
          apiURL: "https://api.kaiascope.com/api",
          browserURL: "https://kaiascope.com",
        },
      },
      {
        network: "kaia-testnet", 
        chainId: 1001,
        urls: {
          apiURL: "https://api.kaiascope.com/api",
          browserURL: "https://kaiascope.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};