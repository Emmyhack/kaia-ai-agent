import { ethers } from 'ethers';

// Contract ABI - simplified for key functions
const KAIA_AI_AGENT_ABI = [
  "function swapTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address recipient) external returns (uint256)",
  "function getSwapQuote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut, uint256 feeAmount)",
  "function checkBalance(address user, address token) external view returns (uint256)",
  "function checkMultipleBalances(address user, address[] calldata tokens) external view returns (uint256[] memory balances)",
  "function sendTokens(address token, address to, uint256 amount) external",
  "function depositToYieldFarm(address farmAddress, uint256 amount, address user) external",
  "function withdrawFromYieldFarm(address farmAddress, uint256 amount, address user) external",
  "function getYieldFarmInfo(address farmAddress, address user) external view returns (uint256 stakedBalance, uint256 earnedRewards, uint256 totalStaked)",
  "function getUserYieldFarms(address user) external view returns (address[] memory)",
  "function getTotalYieldValue(address user) external view returns (uint256 totalValue)",
  "event TokenSwapped(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)",
  "event TokensSent(address indexed from, address indexed to, address indexed token, uint256 amount)",
];

class KaiaAgentService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.kaiaSDK = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Kaia provider
      const rpcUrl = process.env.KAIA_RPC_URL || 'https://public-en-kairos.node.kaia.io';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize signer if private key is available
      if (process.env.KAIA_PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.KAIA_PRIVATE_KEY, this.provider);
      }
      
      // Initialize contract
      if (process.env.CONTRACT_ADDRESS && this.signer) {
        this.contract = new ethers.Contract(
          process.env.CONTRACT_ADDRESS,
          KAIA_AI_AGENT_ABI,
          this.signer
        );
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize KaiaAgentService:', error);
      throw error;
    }
  }

  // Token swap functionality
  async swapTokens(tokenIn, tokenOut, amountIn, minAmountOut, recipient) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.swapTokens(
        tokenIn,
        tokenOut,
        ethers.parseEther(amountIn.toString()),
        ethers.parseEther(minAmountOut.toString()),
        recipient
      );
      
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Swap failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getSwapQuote(tokenIn, tokenOut, amountIn) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [amountOut, feeAmount] = await this.contract.getSwapQuote(
        tokenIn,
        tokenOut,
        ethers.parseEther(amountIn.toString())
      );
      
      return {
        amountOut: ethers.formatEther(amountOut),
        feeAmount: ethers.formatEther(feeAmount),
        success: true,
      };
    } catch (error) {
      console.error('Get quote failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Balance checking functionality
  async checkBalance(userAddress, tokenAddress = null) {
    await this.initialize();
    
    try {
      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        // Check native KAIA balance
        const balance = await this.provider.getBalance(userAddress);
        return {
          balance: ethers.formatEther(balance),
          symbol: 'KAIA',
          success: true,
        };
      } else {
        // Check ERC20 token balance
        const balance = await this.contract.checkBalance(userAddress, tokenAddress);
        return {
          balance: ethers.formatEther(balance),
          success: true,
        };
      }
    } catch (error) {
      console.error('Balance check failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async checkMultipleBalances(userAddress, tokenAddresses) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const balances = await this.contract.checkMultipleBalances(userAddress, tokenAddresses);
      
      return {
        balances: balances.map(balance => ethers.formatEther(balance)),
        success: true,
      };
    } catch (error) {
      console.error('Multiple balance check failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Token sending functionality
  async sendTokens(tokenAddress, recipientAddress, amount) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.sendTokens(
        tokenAddress || ethers.ZeroAddress,
        recipientAddress,
        ethers.parseEther(amount.toString())
      );
      
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Send tokens failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Yield farming functionality
  async depositToYieldFarm(farmAddress, amount, userAddress) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.depositToYieldFarm(
        farmAddress,
        ethers.parseEther(amount.toString()),
        userAddress
      );
      
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Deposit to yield farm failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async withdrawFromYieldFarm(farmAddress, amount, userAddress) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.contract.withdrawFromYieldFarm(
        farmAddress,
        ethers.parseEther(amount.toString()),
        userAddress
      );
      
      const receipt = await tx.wait();
      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error('Withdraw from yield farm failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getYieldFarmInfo(farmAddress, userAddress) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const [stakedBalance, earnedRewards, totalStaked] = await this.contract.getYieldFarmInfo(
        farmAddress,
        userAddress
      );
      
      return {
        stakedBalance: ethers.formatEther(stakedBalance),
        earnedRewards: ethers.formatEther(earnedRewards),
        totalStaked: ethers.formatEther(totalStaked),
        success: true,
      };
    } catch (error) {
      console.error('Get yield farm info failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getUserYieldFarms(userAddress) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const farms = await this.contract.getUserYieldFarms(userAddress);
      return {
        farms,
        success: true,
      };
    } catch (error) {
      console.error('Get user yield farms failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getTotalYieldValue(userAddress) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const totalValue = await this.contract.getTotalYieldValue(userAddress);
      return {
        totalValue: ethers.formatEther(totalValue),
        success: true,
      };
    } catch (error) {
      console.error('Get total yield value failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Utility functions
  async getGasPrice() {
    await this.initialize();
    const gasPrice = await this.provider.getFeeData();
    return gasPrice;
  }

  async getBlockNumber() {
    await this.initialize();
    return await this.provider.getBlockNumber();
  }

  async getTransaction(txHash) {
    await this.initialize();
    return await this.provider.getTransaction(txHash);
  }

  async getTransactionReceipt(txHash) {
    await this.initialize();
    return await this.provider.getTransactionReceipt(txHash);
  }
}

// Export singleton instance
export const kaiaAgentService = new KaiaAgentService();

// Export utility functions
export const formatKaia = (amount) => {
  return ethers.formatEther(amount);
};

export const parseKaia = (amount) => {
  return ethers.parseEther(amount.toString());
};

export const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

export default kaiaAgentService;