import { ethers } from 'ethers';

// Yield Farming Contract ABI
const YIELD_FARM_ABI = [
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function earned(address account) external view returns (uint256)',
  'function rewardRate() external view returns (uint256)',
  'function totalStaked() external view returns (uint256)',
  'function stakingToken() external view returns (address)',
  'function rewardToken() external view returns (address)',
  'function periodFinish() external view returns (uint256)',
  'function rewardsDuration() external view returns (uint256)',
  'function getRewardForDuration() external view returns (uint256)',
  'function deposit(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function getReward() external'
];

// LP Token ABI for liquidity pools
const LP_TOKEN_ABI = [
  'function token0() external view returns (address)',
  'function token1() external view returns (address)',
  'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function totalSupply() external view returns (uint256)'
];

class KaiaYieldService {
  constructor() {
    this.providers = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize providers
      this.providers.testnet = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
      this.providers.mainnet = new ethers.JsonRpcProvider('https://public-en.node.kaia.io');

      this.initialized = true;
      console.log('KaiaYieldService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize KaiaYieldService:', error);
      throw error;
    }
  }

  // Get real yield farming opportunities
  async getYieldFarmingOpportunities(network = 'testnet') {
    await this.initialize();
    
    const provider = this.providers[network];
    
    // For testnet, provide realistic mock yield farms since real farms aren't deployed yet
    if (network === 'testnet') {
      try {
        // Get real blockchain data for realistic simulation
        const blockNumber = await provider.getBlockNumber();
        const feeData = await provider.getFeeData();
        
        const mockFarms = [
          {
            name: 'KaiaFarm KAIA-MOCK',
            address: '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e',
            type: 'Single Asset Staking',
            stakingToken: { symbol: 'MOCK', name: 'Mock Token' },
            rewardToken: { symbol: 'KAIA', name: 'Kaia Token' },
            apy: (Math.random() * 30 + 15).toFixed(2), // 15-45% APY
            totalStaked: (Math.random() * 500000 + 100000).toFixed(2),
            rewardRate: (Math.random() * 50 + 10).toFixed(2),
            isActive: true
          },
          {
            name: 'KaiaFarm LP Staking',
            address: '0x0000000000000000000000000000000000000000',
            type: 'LP Staking',
            stakingToken: { symbol: 'LP-MOCK', name: 'Mock LP Token' },
            rewardToken: { symbol: 'KAIA', name: 'Kaia Token' },
            apy: (Math.random() * 40 + 20).toFixed(2), // 20-60% APY
            totalStaked: (Math.random() * 300000 + 50000).toFixed(2),
            rewardRate: (Math.random() * 30 + 5).toFixed(2),
            isActive: true
          },
          {
            name: 'KaiaFarm USDT Staking',
            address: '0x0000000000000000000000000000000000000000',
            type: 'Single Asset Staking',
            stakingToken: { symbol: 'USDT', name: 'Tether USD' },
            rewardToken: { symbol: 'KAIA', name: 'Kaia Token' },
            apy: (Math.random() * 25 + 10).toFixed(2), // 10-35% APY
            totalStaked: (Math.random() * 800000 + 200000).toFixed(2),
            rewardRate: (Math.random() * 40 + 15).toFixed(2),
            isActive: true
          }
        ];

        const opportunities = mockFarms.map(farm => ({
          name: farm.name,
          address: farm.address,
          type: farm.type,
          apy: farm.apy,
          totalStaked: farm.totalStaked,
          rewardRate: farm.rewardRate,
          periodFinish: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: farm.isActive,
          stakingToken: farm.stakingToken,
          rewardToken: farm.rewardToken,
          network: network,
          isReal: false,
          isTestnet: true,
          blockNumber: blockNumber,
          gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei')
        }));

        return {
          success: true,
          opportunities: opportunities,
          network: network
        };
      } catch (error) {
        console.error('Mock yield farming data generation failed:', error);
        return {
          success: false,
          error: 'Failed to generate mock yield farming data',
          network: network
        };
      }
    }
    
    // Known yield farming contracts on Kaia chain (replace with actual addresses)
    const YIELD_FARMS = {
      mainnet: [
        // Add mainnet yield farms here
      ]
    };

    const opportunities = [];
    
    for (const farm of YIELD_FARMS[network] || []) {
      if (farm.address === '0x0000000000000000000000000000000000000000') {
        continue; // Skip placeholder addresses
      }

      try {
        const farmContract = new ethers.Contract(farm.address, YIELD_FARM_ABI, provider);
        
        // Get farm data
        const [totalStaked, rewardRate, periodFinish, rewardsDuration] = await Promise.all([
          farmContract.totalStaked(),
          farmContract.rewardRate(),
          farmContract.periodFinish(),
          farmContract.rewardsDuration()
        ]);

        // Calculate APY
        const rewardForDuration = await farmContract.getRewardForDuration();
        const currentTime = Math.floor(Date.now() / 1000);
        const isActive = periodFinish > currentTime;
        
        let apy = 0;
        if (isActive && totalStaked > 0) {
          const annualRewards = (rewardForDuration * 365 * 24 * 60 * 60) / rewardsDuration;
          apy = (annualRewards / totalStaked) * 100;
        }

        // Get token information
        const stakingTokenInfo = await this.getTokenInfo(farm.stakingToken, network);
        const rewardTokenInfo = await this.getTokenInfo(farm.rewardToken, network);

        opportunities.push({
          name: farm.name,
          address: farm.address,
          type: farm.type,
          apy: apy.toFixed(2),
          totalStaked: ethers.formatEther(totalStaked),
          rewardRate: ethers.formatEther(rewardRate),
          periodFinish: new Date(periodFinish * 1000).toISOString(),
          isActive: isActive,
          stakingToken: stakingTokenInfo,
          rewardToken: rewardTokenInfo,
          network: network,
          isReal: true
        });

      } catch (error) {
        console.error(`Failed to get data for farm ${farm.name}:`, error);
        return {
          success: false,
          error: `Failed to get data for farm ${farm.name}: ${error.message}`,
          network: network
        };
      }
    }

    return {
      success: true,
      opportunities: opportunities,
      network: network
    };
  }

  // Get user's yield farming positions
  async getUserYieldPositions(userAddress, network = 'testnet') {
    await this.initialize();
    
    const provider = this.providers[network];
    const positions = [];

    // Known yield farming contracts
    const YIELD_FARMS = {
      testnet: [
        {
          name: 'KaiaFarm KAIA-MOCK',
          address: '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e'
        }
      ],
      mainnet: []
    };

    for (const farm of YIELD_FARMS[network] || []) {
      if (farm.address === '0x0000000000000000000000000000000000000000') {
        continue;
      }

      try {
        const farmContract = new ethers.Contract(farm.address, YIELD_FARM_ABI, provider);
        
        const [stakedBalance, earnedRewards] = await Promise.all([
          farmContract.balanceOf(userAddress),
          farmContract.earned(userAddress)
        ]);

        if (stakedBalance > 0 || earnedRewards > 0) {
          positions.push({
            farmName: farm.name,
            farmAddress: farm.address,
            stakedBalance: ethers.formatEther(stakedBalance),
            earnedRewards: ethers.formatEther(earnedRewards),
            network: network,
            isReal: true
          });
        }
      } catch (error) {
        console.error(`Failed to get user position for ${farm.name}:`, error);
      }
    }

    return {
      success: true,
      positions: positions,
      network: network
    };
  }

  // Get token information
  async getTokenInfo(tokenAddress, network = 'testnet') {
    if (tokenAddress === ethers.ZeroAddress) {
      return {
        symbol: 'KAIA',
        name: 'Kaia Token',
        address: ethers.ZeroAddress
      };
    }

    try {
      const provider = this.providers[network];
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function symbol() external view returns (string)',
        'function name() external view returns (string)',
        'function decimals() external view returns (uint8)'
      ], provider);

      const [symbol, name, decimals] = await Promise.all([
        tokenContract.symbol(),
        tokenContract.name(),
        tokenContract.decimals()
      ]);

      return {
        symbol: symbol,
        name: name,
        address: tokenAddress,
        decimals: decimals
      };
    } catch (error) {
      console.error('Failed to get token info:', error);
      return {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        address: tokenAddress
      };
    }
  }

  // Calculate optimal yield strategy
  async calculateOptimalStrategy(userAddress, availableFunds, network = 'testnet') {
    await this.initialize();
    
    const opportunities = await this.getYieldFarmingOpportunities(network);
    const userPositions = await this.getUserYieldPositions(userAddress, network);
    
    if (!opportunities.success) {
      return {
        success: false,
        error: 'Failed to get yield opportunities'
      };
    }

    // Filter active farms with good APY
    const activeFarms = opportunities.opportunities.filter(farm => 
      farm.isActive && parseFloat(farm.apy) > 5 // Only farms with >5% APY
    );

    // Sort by APY (highest first)
    activeFarms.sort((a, b) => parseFloat(b.apy) - parseFloat(a.apy));

    // Calculate optimal allocation
    const recommendations = [];
    let remainingFunds = availableFunds;

    for (const farm of activeFarms.slice(0, 3)) { // Top 3 farms
      const allocation = Math.min(remainingFunds * 0.4, parseFloat(farm.totalStaked) * 0.01); // Max 40% per farm, 1% of total staked
      
      if (allocation > 0) {
        recommendations.push({
          farm: farm,
          recommendedAllocation: allocation.toFixed(2),
          expectedAPY: farm.apy,
          expectedAnnualReturn: (allocation * parseFloat(farm.apy) / 100).toFixed(2)
        });
        
        remainingFunds -= allocation;
      }
    }

    return {
      success: true,
      recommendations: recommendations,
      totalRecommendedAllocation: (availableFunds - remainingFunds).toFixed(2),
      remainingFunds: remainingFunds.toFixed(2),
      userPositions: userPositions.positions,
      network: network
    };
  }

  // Get yield farming analytics
  async getYieldAnalytics(network = 'testnet') {
    await this.initialize();
    
    const opportunities = await this.getYieldFarmingOpportunities(network);
    
    if (!opportunities.success) {
      return {
        success: false,
        error: 'Failed to get yield opportunities'
      };
    }

    const activeFarms = opportunities.opportunities.filter(farm => farm.isActive);
    
    if (activeFarms.length === 0) {
      return {
        success: false,
        error: 'No active yield farms found'
      };
    }

    // Calculate analytics
    const totalStaked = activeFarms.reduce((sum, farm) => sum + parseFloat(farm.totalStaked), 0);
    const avgAPY = activeFarms.reduce((sum, farm) => sum + parseFloat(farm.apy), 0) / activeFarms.length;
    const maxAPY = Math.max(...activeFarms.map(farm => parseFloat(farm.apy)));
    const minAPY = Math.min(...activeFarms.map(farm => parseFloat(farm.apy)));

    // Categorize farms by type
    const farmTypes = {};
    activeFarms.forEach(farm => {
      if (!farmTypes[farm.type]) {
        farmTypes[farm.type] = [];
      }
      farmTypes[farm.type].push(farm);
    });

    return {
      success: true,
      analytics: {
        totalActiveFarms: activeFarms.length,
        totalStaked: totalStaked.toFixed(2),
        averageAPY: avgAPY.toFixed(2),
        maxAPY: maxAPY.toFixed(2),
        minAPY: minAPY.toFixed(2),
        farmTypes: farmTypes
      },
      network: network
    };
  }
}

export default KaiaYieldService;