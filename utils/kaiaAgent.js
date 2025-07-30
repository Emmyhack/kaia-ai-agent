import { ethers } from 'ethers';

// Complete Contract ABI from compiled contract
const KAIA_AI_AGENT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_kaiaToken",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_swapRouter",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      }
    ],
    "name": "BalanceChecked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      }
    ],
    "name": "TokenSwapped",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TokensSent",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "farm",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "YieldFarmDeposit",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "farm",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "YieldFarmWithdraw",
    "type": "event"
  },
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [],
    "name": "BASIS_POINTS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_FEE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "agent",
        "type": "address"
      }
    ],
    "name": "addAuthorizedAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "authorizedAgents",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "checkBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "tokens",
        "type": "address[]"
      }
    ],
    "name": "checkMultipleBalances",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "balances",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "farmAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "claimFarmRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "farmAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "depositToYieldFarm",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "emergencyWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      }
    ],
    "name": "getSwapQuote",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountOut",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "feeAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getTotalYieldValue",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalValue",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getUserYieldFarms",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "farmAddress",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "getYieldFarmInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "stakedBalance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "earnedRewards",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalStaked",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "kaiaToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "agent",
        "type": "address"
      }
    ],
    "name": "removeAuthorizedAgent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "sendTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      }
    ],
    "name": "setSwapFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_router",
        "type": "address"
      }
    ],
    "name": "setSwapRouter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "swapFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "swapRouter",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenIn",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "tokenOut",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amountIn",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minAmountOut",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      }
    ],
    "name": "swapTokens",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "userBalances",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "userYieldFarms",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "farmAddress",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "withdrawFromYieldFarm",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

class KaiaAgentService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
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
        success: true,
        amountOut: ethers.formatEther(amountOut),
        feeAmount: ethers.formatEther(feeAmount),
      };
    } catch (error) {
      console.error('Get swap quote failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Balance checking functionality
  async checkBalance(userAddress, tokenAddress = null) {
    await this.initialize();
    
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      // If no token address provided, check native KAIA balance
      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        const balance = await this.provider.getBalance(userAddress);
        return {
          success: true,
          balance: ethers.formatEther(balance),
        };
      }
      
      // Check ERC20 token balance
      const balance = await this.contract.checkBalance(userAddress, tokenAddress);
      return {
        success: true,
        balance: ethers.formatEther(balance),
      };
    } catch (error) {
      console.error('Check balance failed:', error);
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
      const balances = await this.contract.checkMultipleBalances(
        userAddress,
        tokenAddresses
      );
      
      return {
        success: true,
        balances: balances.map(balance => ethers.formatEther(balance)),
      };
    } catch (error) {
      console.error('Check multiple balances failed:', error);
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
        success: true,
        stakedBalance: ethers.formatEther(stakedBalance),
        earnedRewards: ethers.formatEther(earnedRewards),
        totalStaked: ethers.formatEther(totalStaked),
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
        success: true,
        farms: farms,
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
        success: true,
        totalValue: ethers.formatEther(totalValue),
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
    return await this.provider.getFeeData();
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

// Create singleton instance
const kaiaAgentService = new KaiaAgentService();

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