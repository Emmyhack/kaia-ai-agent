import { ethers } from 'ethers';

class KaiascanService {
  constructor() {
    this.apiKey = process.env.KAIASCAN_API_KEY || '';
    this.baseUrl = {
      testnet: 'https://testnet.kaiascan.com/api',
      mainnet: 'https://kaiascan.com/api'
    };
  }

  // Get yield farming contracts from Kaiascan
  async getYieldFarmingContracts(network = 'testnet') {
    try {
      const baseUrl = this.baseUrl[network];
      const endpoint = `${baseUrl}/v1/contracts`;
      
      // Known yield farming contract addresses on Kaia Chain
      const knownFarms = {
        testnet: [
          {
            address: '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e',
            name: 'KaiaFarm KAIA-MOCK',
            type: 'Single Asset Staking',
            stakingToken: '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690', // MOCK token
            rewardToken: '0x0000000000000000000000000000000000000000' // KAIA
          }
        ],
        mainnet: [
          // Add mainnet farm addresses when available
        ]
      };

      const farms = knownFarms[network] || [];
      const farmData = [];

      for (const farm of farms) {
        try {
          // Get contract data from Kaiascan
          const contractData = await this.getContractData(farm.address, network);
          
          if (contractData.success) {
            farmData.push({
              ...farm,
              ...contractData.data,
              isReal: true
            });
          }
        } catch (error) {
          console.log(`Failed to get data for farm ${farm.address}:`, error.message);
        }
      }

      return {
        success: true,
        farms: farmData,
        network: network
      };
    } catch (error) {
      console.error('Failed to get yield farming contracts:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }

  // Get contract data from Kaiascan
  async getContractData(contractAddress, network = 'testnet') {
    try {
      const baseUrl = this.baseUrl[network];
      const endpoint = `${baseUrl}/v1/contracts/${contractAddress}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          address: contractAddress,
          name: data.name || 'Unknown Farm',
          type: data.type || 'Yield Farming',
          verified: data.verified || false,
          sourceCode: data.sourceCode || null,
          abi: data.abi || null,
          compilerVersion: data.compilerVersion || null,
          optimizationUsed: data.optimizationUsed || null,
          runs: data.runs || null,
          constructorArguments: data.constructorArguments || null,
          evmVersion: data.evmVersion || null,
          licenseType: data.licenseType || null,
          proxy: data.proxy || false,
          implementation: data.implementation || null,
          swarmSource: data.swarmSource || null
        }
      };
    } catch (error) {
      console.error('Failed to get contract data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get contract transactions from Kaiascan
  async getContractTransactions(contractAddress, network = 'testnet', page = 1, offset = 10) {
    try {
      const baseUrl = this.baseUrl[network];
      const endpoint = `${baseUrl}/v1/contracts/${contractAddress}/transactions?page=${page}&offset=${offset}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        transactions: data.result || [],
        total: data.total || 0,
        page: page,
        offset: offset
      };
    } catch (error) {
      console.error('Failed to get contract transactions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get token information from Kaiascan
  async getTokenInfo(tokenAddress, network = 'testnet') {
    try {
      const baseUrl = this.baseUrl[network];
      const endpoint = `${baseUrl}/v1/tokens/${tokenAddress}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Accept': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        token: {
          address: tokenAddress,
          name: data.name || 'Unknown Token',
          symbol: data.symbol || 'UNKNOWN',
          decimals: data.decimals || 18,
          totalSupply: data.totalSupply || '0',
          price: data.price || '0',
          marketCap: data.marketCap || '0',
          volume24h: data.volume24h || '0',
          holders: data.holders || 0,
          verified: data.verified || false
        }
      };
    } catch (error) {
      console.error('Failed to get token info:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get real yield farming data with on-chain analysis
  async getRealYieldFarmingData(network = 'testnet') {
    try {
      const provider = new ethers.JsonRpcProvider(
        network === 'testnet' 
          ? 'https://public-en-kairos.node.kaia.io'
          : 'https://public-en.node.kaia.io'
      );

      // Known yield farming contracts
      const farms = [
        {
          address: '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e',
          name: 'KaiaFarm KAIA-MOCK',
          type: 'Single Asset Staking',
          stakingToken: '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690',
          rewardToken: '0x0000000000000000000000000000000000000000'
        }
      ];

      const opportunities = [];

      for (const farm of farms) {
        try {
          // Get contract data from Kaiascan
          const contractData = await this.getContractData(farm.address, network);
          
          // Get on-chain data
          const onChainData = await this.getOnChainFarmData(farm.address, provider);
          
          // Get token info
          const stakingTokenInfo = await this.getTokenInfo(farm.stakingToken, network);
          const rewardTokenInfo = await this.getTokenInfo(farm.rewardToken, network);

          opportunities.push({
            name: farm.name,
            address: farm.address,
            type: farm.type,
            contractData: contractData.success ? contractData.data : null,
            onChainData: onChainData.success ? onChainData.data : null,
            stakingToken: stakingTokenInfo.success ? stakingTokenInfo.token : null,
            rewardToken: rewardTokenInfo.success ? rewardTokenInfo.token : null,
            isReal: true,
            network: network
          });

        } catch (error) {
          console.log(`Failed to get data for farm ${farm.address}:`, error.message);
        }
      }

      return {
        success: true,
        opportunities: opportunities,
        network: network
      };
    } catch (error) {
      console.error('Failed to get real yield farming data:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }

  // Get on-chain farm data
  async getOnChainFarmData(farmAddress, provider) {
    try {
      // Basic farm contract ABI
      const farmABI = [
        'function totalSupply() external view returns (uint256)',
        'function balanceOf(address account) external view returns (uint256)',
        'function rewardRate() external view returns (uint256)',
        'function periodFinish() external view returns (uint256)',
        'function rewardsDuration() external view returns (uint256)',
        'function stakingToken() external view returns (address)',
        'function rewardToken() external view returns (address)'
      ];

      const farmContract = new ethers.Contract(farmAddress, farmABI, provider);
      
      // Get farm data
      const [totalSupply, rewardRate, periodFinish, rewardsDuration] = await Promise.all([
        farmContract.totalSupply().catch(() => 0),
        farmContract.rewardRate().catch(() => 0),
        farmContract.periodFinish().catch(() => 0),
        farmContract.rewardsDuration().catch(() => 86400) // Default 1 day
      ]);

      // Calculate APY
      const currentTime = Math.floor(Date.now() / 1000);
      const isActive = periodFinish > currentTime;
      
      let apy = 0;
      if (isActive && totalSupply > 0) {
        const annualRewards = (rewardRate * 365 * 24 * 60 * 60) / rewardsDuration;
        apy = (annualRewards / totalSupply) * 100;
      }

      return {
        success: true,
        data: {
          totalSupply: ethers.formatEther(totalSupply),
          rewardRate: ethers.formatEther(rewardRate),
          periodFinish: periodFinish,
          rewardsDuration: rewardsDuration,
          isActive: isActive,
          apy: apy.toFixed(2),
          blockNumber: await provider.getBlockNumber()
        }
      };
    } catch (error) {
      console.error('Failed to get on-chain farm data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const kaiascanService = new KaiascanService();
export default KaiascanService;