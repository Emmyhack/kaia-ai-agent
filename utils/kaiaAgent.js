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

// Demo token address mapping (use .env or hardcoded for demo)
const TOKEN_ADDRESSES = {
  KAIA: ethers.ZeroAddress,
  MOCK: process.env.MOCK_ERC20_ADDRESS || '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690',
};

const YIELD_FARM_ADDRESS = process.env.MOCK_YIELD_FARM_ADDRESS || '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e';

// Network configurations
const NETWORKS = {
  testnet: {
    name: 'Kaia Testnet',
    rpcUrl: 'https://public-en-kairos.node.kaia.io',
    chainId: 1001,
    explorer: 'https://kaiascope.com',
    contractAddress: process.env.CONTRACT_ADDRESS || '0x554Ef03BA2A7CC0A539731CA6beF561fA2648c4E',
  },
  mainnet: {
    name: 'Kaia Mainnet',
    rpcUrl: 'https://public-en.node.kaia.io',
    chainId: 8217,
    explorer: 'https://kaiascope.com',
    contractAddress: process.env.MAINNET_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000', // Not deployed yet
  }
};

class KaiaAgentService {
  constructor() {
    this.testnetProvider = null;
    this.mainnetProvider = null;
    this.testnetContract = null;
    this.mainnetContract = null;
    this.signer = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize testnet provider
      this.testnetProvider = new ethers.JsonRpcProvider(NETWORKS.testnet.rpcUrl);
      
      // Initialize mainnet provider
      this.mainnetProvider = new ethers.JsonRpcProvider(NETWORKS.mainnet.rpcUrl);
      
      // Initialize signer if private key is available
      if (process.env.KAIA_PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.KAIA_PRIVATE_KEY, this.testnetProvider);
      }
      
      // Initialize contracts
      if (NETWORKS.testnet.contractAddress && NETWORKS.testnet.contractAddress !== '0x0000000000000000000000000000000000000000') {
        this.testnetContract = new ethers.Contract(
          NETWORKS.testnet.contractAddress,
          KAIA_AI_AGENT_ABI,
          this.signer || this.testnetProvider
        );
      }
      
      if (NETWORKS.mainnet.contractAddress && NETWORKS.mainnet.contractAddress !== '0x0000000000000000000000000000000000000000') {
        this.mainnetContract = new ethers.Contract(
          NETWORKS.mainnet.contractAddress,
          KAIA_AI_AGENT_ABI,
          this.mainnetProvider
        );
      }
      
      this.initialized = true;
      console.log('KaiaAgentService initialized with real blockchain connections');
    } catch (error) {
      console.error('Failed to initialize KaiaAgentService:', error);
      throw error;
    }
  }

  // Token swap functionality
  async swapTokens(tokenIn, tokenOut, amountIn, minAmountOut, recipient) {
    await this.initialize();
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    // Force use of mock addresses for demo
    const tokenInAddr = TOKEN_ADDRESSES[tokenIn] || tokenIn;
    const tokenOutAddr = TOKEN_ADDRESSES[tokenOut] || tokenOut;

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const tx = await contract.swapTokens(
        tokenInAddr,
        tokenOutAddr,
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
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const [amountOut, feeAmount] = await contract.getSwapQuote(
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

  // Real balance checking functionality
  async checkBalance(userAddress, tokenAddress = null, network = 'testnet') {
    await this.initialize();
    
    const provider = network === 'mainnet' ? this.mainnetProvider : this.testnetProvider;
    
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // If no token address provided, check native KAIA balance
      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        const balance = await provider.getBalance(userAddress);
        return {
          success: true,
          balance: ethers.formatEther(balance),
          tokenAddress: ethers.ZeroAddress,
          tokenName: 'KAIA',
          network: network,
          isReal: true,
        };
      }
      
      // For ERC20 tokens, check if it's our mock token
      if (tokenAddress === TOKEN_ADDRESSES.MOCK) {
        // Mock response for demo token
        const mockBalance = Math.random() * 1000;
        return {
          success: true,
          balance: mockBalance.toFixed(4),
          tokenAddress: tokenAddress,
          tokenName: 'Mock Token',
          network: network,
          isReal: false,
        };
      }
      
      // For other ERC20 tokens, try to query the actual contract
      try {
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)', 'function name() view returns (string)', 'function symbol() view returns (string)'],
          provider
        );
        
        const [balance, name, symbol] = await Promise.all([
          tokenContract.balanceOf(userAddress),
          tokenContract.name().catch(() => 'Unknown'),
          tokenContract.symbol().catch(() => 'UNKNOWN')
        ]);
        
        return {
          success: true,
          balance: ethers.formatEther(balance),
          tokenAddress: tokenAddress,
          tokenName: `${name} (${symbol})`,
          network: network,
          isReal: true,
        };
      } catch (tokenError) {
        console.log('Token contract query failed, using mock response:', tokenError.message);
        // Fallback to mock response
        const mockBalance = Math.random() * 1000;
        return {
          success: true,
          balance: mockBalance.toFixed(4),
          tokenAddress: tokenAddress,
          tokenName: 'Unknown Token',
          network: network,
          isReal: false,
        };
      }
    } catch (error) {
      console.error('Check balance failed:', error);
      return {
        success: false,
        error: error.message,
        network: network,
      };
    }
  }

  async checkMultipleBalances(userAddress, tokenAddresses) {
    await this.initialize();
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const balances = await contract.checkMultipleBalances(
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
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const tx = await contract.sendTokens(
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
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    // Force use of mock yield farm address for demo
    const farmAddr = YIELD_FARM_ADDRESS;

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const tx = await contract.depositToYieldFarm(farmAddr, ethers.parseEther(amount.toString()), userAddress);
      
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
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const tx = await contract.withdrawFromYieldFarm(
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
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const [stakedBalance, earnedRewards, totalStaked] = await contract.getYieldFarmInfo(
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
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const farms = await contract.getUserYieldFarms(userAddress);
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
    
    if (!this.testnetContract && !this.mainnetContract) {
      throw new Error('Contract not initialized for any network');
    }

    try {
      const contract = this.testnetContract || this.mainnetContract;
      const totalValue = await contract.getTotalYieldValue(userAddress);
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

  // Real network status checking
  async getNetworkStatus(network = 'testnet') {
    await this.initialize();
    
    const provider = network === 'mainnet' ? this.mainnetProvider : this.testnetProvider;
    
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const [blockNumber, gasPrice] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData()
      ]);
      
      return {
        success: true,
        network: NETWORKS[network].name,
        blockNumber: blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice, 'gwei'),
        isConnected: true,
      };
    } catch (error) {
      console.error('Get network status failed:', error);
      return {
        success: false,
        error: error.message,
        network: NETWORKS[network].name,
        isConnected: false,
      };
    }
  }

  // Real transaction checking
  async getTransaction(txHash, network = 'testnet') {
    await this.initialize();
    
    const provider = network === 'mainnet' ? this.mainnetProvider : this.testnetProvider;
    
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!tx) {
        return {
          success: false,
          error: 'Transaction not found',
          network: network,
        };
      }
      
      return {
        success: true,
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          gasUsed: receipt?.gasUsed?.toString() || '0',
          status: receipt?.status === 1 ? 'success' : 'failed',
          blockNumber: tx.blockNumber,
        },
        network: network,
        isReal: true,
      };
    } catch (error) {
      console.error('Get transaction failed:', error);
      return {
        success: false,
        error: error.message,
        network: network,
      };
    }
  }

  // Real contract state checking
  async getContractState(contractAddress, network = 'testnet') {
    await this.initialize();
    
    const provider = network === 'mainnet' ? this.mainnetProvider : this.testnetProvider;
    
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    try {
      // Basic contract info
      const code = await provider.getCode(contractAddress);
      
      if (code === '0x') {
        return {
          success: false,
          error: 'Contract not found at address',
          network: network,
        };
      }
      
      return {
        success: true,
        contractAddress: contractAddress,
        hasCode: true,
        network: network,
        isReal: true,
      };
    } catch (error) {
      console.error('Get contract state failed:', error);
      return {
        success: false,
        error: error.message,
        network: network,
      };
    }
  }

  // Utility functions
  async getGasPrice() {
    await this.initialize();
    return await this.testnetProvider.getFeeData(); // Default to testnet for now
  }

  async getBlockNumber() {
    await this.initialize();
    return await this.testnetProvider.getBlockNumber(); // Default to testnet for now
  }

  async getTransactionReceipt(txHash) {
    await this.initialize();
    return await this.testnetProvider.getTransactionReceipt(txHash); // Default to testnet for now
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