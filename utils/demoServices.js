import { ethers } from 'ethers';

// Simplified demo services that work 100% of the time
export class DemoSwapService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Initialize providers
      this.testnetProvider = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
      this.mainnetProvider = new ethers.JsonRpcProvider('https://public-en.node.kaia.io');
      this.initialized = true;
    } catch (error) {
      console.log('Provider initialization failed, using fallback mode');
      this.initialized = true;
    }
  }

  async getSwapQuote(amountIn, tokenIn, tokenOut, network = 'testnet') {
    await this.initialize();
    
    try {
      // Get real blockchain data if possible
      let blockNumber = 0;
      let gasPrice = '25';
      
      try {
        const provider = network === 'testnet' ? this.testnetProvider : this.mainnetProvider;
        if (provider) {
          blockNumber = await provider.getBlockNumber();
          const feeData = await provider.getFeeData();
          gasPrice = ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
        }
      } catch (error) {
        console.log('Using fallback blockchain data');
        blockNumber = Math.floor(Math.random() * 1000000) + 1000000;
        gasPrice = (Math.random() * 10 + 20).toFixed(2);
      }

      // Generate realistic swap rates
      let rate;
      if (tokenIn === ethers.ZeroAddress && tokenOut !== ethers.ZeroAddress) {
        // KAIA to Token
        rate = 0.85 + (Math.random() * 0.3);
      } else if (tokenIn !== ethers.ZeroAddress && tokenOut === ethers.ZeroAddress) {
        // Token to KAIA
        rate = 1.15 + (Math.random() * 0.3);
      } else {
        // Token to Token
        rate = 0.95 + (Math.random() * 0.2);
      }

      const amountOut = amountIn * rate;
      const slippage = 0.5 + (Math.random() * 1);
      const amountOutMin = amountOut * (1 - slippage / 100);

      return {
        success: true,
        amountIn: amountIn,
        amountOut: amountOut.toFixed(6),
        amountOutMin: amountOutMin.toFixed(6),
        rate: rate.toFixed(4),
        slippage: slippage.toFixed(2),
        gasPrice: gasPrice,
        blockNumber: blockNumber,
        network: network,
        isDemo: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate swap quote',
        network: network
      };
    }
  }

  async executeSwap(amountIn, tokenIn, tokenOut, userAddress, network = 'testnet') {
    await this.initialize();
    
    try {
      // Get real blockchain data if possible
      let blockNumber = 0;
      let gasPrice = '25';
      
      try {
        const provider = network === 'testnet' ? this.testnetProvider : this.mainnetProvider;
        if (provider) {
          blockNumber = await provider.getBlockNumber();
          const feeData = await provider.getFeeData();
          gasPrice = ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
        }
      } catch (error) {
        console.log('Using fallback blockchain data');
        blockNumber = Math.floor(Math.random() * 1000000) + 1000000;
        gasPrice = (Math.random() * 10 + 20).toFixed(2);
      }

      // Generate realistic transaction data
      const txHash = `0x${blockNumber.toString(16).padStart(8, '0')}${Math.random().toString(16).substring(2, 58)}`;
      const gasUsed = Math.floor(Math.random() * 200000) + 150000;

      return {
        success: true,
        transactionHash: txHash,
        gasUsed: gasUsed,
        gasPrice: gasPrice,
        blockNumber: blockNumber,
        network: network,
        isDemo: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to execute swap',
        network: network
      };
    }
  }
}

export class DemoYieldService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Initialize providers
      this.testnetProvider = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
      this.mainnetProvider = new ethers.JsonRpcProvider('https://public-en.node.kaia.io');
      this.initialized = true;
    } catch (error) {
      console.log('Provider initialization failed, using fallback mode');
      this.initialized = true;
    }
  }

  async getYieldOpportunities(network = 'testnet') {
    await this.initialize();
    
    try {
      // Get real blockchain data if possible
      let blockNumber = 0;
      
      try {
        const provider = network === 'testnet' ? this.testnetProvider : this.mainnetProvider;
        if (provider) {
          blockNumber = await provider.getBlockNumber();
        }
      } catch (error) {
        console.log('Using fallback blockchain data');
        blockNumber = Math.floor(Math.random() * 1000000) + 1000000;
      }

      const opportunities = [
        {
          name: 'KaiaFarm KAIA-MOCK',
          type: 'Single Asset Staking',
          stakingToken: { symbol: 'MOCK', name: 'Mock Token' },
          rewardToken: { symbol: 'KAIA', name: 'Kaia Token' },
          apy: (Math.random() * 30 + 15).toFixed(2),
          totalStaked: (Math.random() * 500000 + 100000).toFixed(2),
          rewardRate: (Math.random() * 50 + 10).toFixed(2),
          isActive: true,
          address: '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e'
        },
        {
          name: 'KaiaFarm LP Staking',
          type: 'LP Staking',
          stakingToken: { symbol: 'LP-MOCK', name: 'Mock LP Token' },
          rewardToken: { symbol: 'KAIA', name: 'Kaia Token' },
          apy: (Math.random() * 40 + 20).toFixed(2),
          totalStaked: (Math.random() * 300000 + 50000).toFixed(2),
          rewardRate: (Math.random() * 30 + 5).toFixed(2),
          isActive: true,
          address: '0x0000000000000000000000000000000000000000'
        },
        {
          name: 'KaiaFarm USDT Staking',
          type: 'Single Asset Staking',
          stakingToken: { symbol: 'USDT', name: 'Tether USD' },
          rewardToken: { symbol: 'KAIA', name: 'Kaia Token' },
          apy: (Math.random() * 25 + 10).toFixed(2),
          totalStaked: (Math.random() * 800000 + 200000).toFixed(2),
          rewardRate: (Math.random() * 40 + 15).toFixed(2),
          isActive: true,
          address: '0x0000000000000000000000000000000000000000'
        }
      ];

      return {
        success: true,
        opportunities: opportunities,
        network: network,
        blockNumber: blockNumber,
        isDemo: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get yield opportunities',
        network: network
      };
    }
  }

  async getUserPositions(userAddress, network = 'testnet') {
    await this.initialize();
    
    try {
      const positions = [
        {
          farmName: 'KaiaFarm KAIA-MOCK',
          stakedAmount: (Math.random() * 1000 + 100).toFixed(2),
          stakingToken: 'MOCK',
          earnedRewards: (Math.random() * 50 + 10).toFixed(2),
          rewardToken: 'KAIA',
          apy: (Math.random() * 30 + 15).toFixed(2),
          isActive: true
        }
      ];

      return {
        success: true,
        positions: positions,
        network: network,
        isDemo: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get user positions',
        network: network
      };
    }
  }
}

// Export default instances
export const demoSwapService = new DemoSwapService();
export const demoYieldService = new DemoYieldService();