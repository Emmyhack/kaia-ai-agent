import { ethers } from 'ethers';

// DragonSwap Router ABI (simplified for common swap functions)
const DRAGONSWAP_ROUTER_ABI = [
  // Get amounts out
  'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
  // Swap exact tokens for tokens
  'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  // Swap exact ETH for tokens
  'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
  // Swap exact tokens for ETH
  'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
  // Get WETH address
  'function WETH() external pure returns (address)'
];

// ERC20 Token ABI (for approvals and balance checks)
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)'
];

class DragonSwapService {
  constructor() {
    this.testnetProvider = null;
    this.mainnetProvider = null;
    this.testnetRouter = null;
    this.mainnetRouter = null;
    this.signer = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Initialize providers
      this.testnetProvider = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
      this.mainnetProvider = new ethers.JsonRpcProvider('https://public-en.node.kaia.io');
      
      // Initialize signer if private key is available
      if (process.env.KAIA_PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.KAIA_PRIVATE_KEY, this.testnetProvider);
      }

      // Initialize routers
      const testnetRouterAddress = '0x554Ef03BA2A7CC0A539731CA6beF561fA2648c4E'; // DragonSwap router on testnet
      const mainnetRouterAddress = '0x0000000000000000000000000000000000000000'; // TODO: Add mainnet router address
      
      if (testnetRouterAddress && testnetRouterAddress !== '0x0000000000000000000000000000000000000000') {
        this.testnetRouter = new ethers.Contract(testnetRouterAddress, DRAGONSWAP_ROUTER_ABI, this.signer || this.testnetProvider);
      }
      
      if (mainnetRouterAddress && mainnetRouterAddress !== '0x0000000000000000000000000000000000000000') {
        this.mainnetRouter = new ethers.Contract(mainnetRouterAddress, DRAGONSWAP_ROUTER_ABI, this.mainnetProvider);
      }

      this.initialized = true;
      console.log('DragonSwapService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize DragonSwapService:', error);
      throw error;
    }
  }

  // Get swap quote
  async getSwapQuote(amountIn, tokenInAddress, tokenOutAddress, network = 'testnet') {
    await this.initialize();
    
    const provider = network === 'mainnet' ? this.mainnetProvider : this.testnetProvider;
    const router = network === 'mainnet' ? this.mainnetRouter : this.testnetRouter;
    
    // For testnet, use mock implementation since DragonSwap isn't deployed
    if (network === 'testnet') {
      try {
        // Simulate realistic swap quote
        const mockRate = tokenInAddress === ethers.ZeroAddress ? 0.85 : 1.18; // KAIA to MOCK rate
        const mockAmountOut = amountIn * mockRate;
        const mockSlippage = 0.5; // 0.5% slippage
        
        return {
          success: true,
          amountIn: amountIn,
          amountOut: mockAmountOut.toFixed(6),
          amountOutMin: (mockAmountOut * (1 - mockSlippage / 100)).toFixed(6),
          path: [tokenInAddress, tokenOutAddress],
          network: network,
          isMock: true,
          rate: mockRate,
          slippage: mockSlippage
        };
      } catch (error) {
        console.error('Mock swap quote failed:', error);
        return {
          success: false,
          error: error.message,
          network: network
        };
      }
    }
    
    // For mainnet, use real DragonSwap (when available)
    if (!router) {
      throw new Error('Router not initialized for this network');
    }

    try {
      // Convert amount to wei
      const amountInWei = ethers.parseEther(amountIn.toString());
      
      // Create path
      const path = [tokenInAddress, tokenOutAddress];
      
      // Get amounts out
      const amounts = await router.getAmountsOut(amountInWei, path);
      const amountOut = amounts[1];
      
      return {
        success: true,
        amountIn: amountIn,
        amountOut: ethers.formatEther(amountOut),
        path: path,
        network: network,
        isMock: false
      };
    } catch (error) {
      console.error('Get swap quote failed:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }

  // Execute swap
  async executeSwap(amountIn, amountOutMin, tokenInAddress, tokenOutAddress, userAddress, network = 'testnet') {
    await this.initialize();
    
    const provider = network === 'mainnet' ? this.mainnetProvider : this.testnetProvider;
    const router = network === 'mainnet' ? this.mainnetRouter : this.testnetRouter;
    
    // For testnet, simulate swap execution
    if (network === 'testnet') {
      try {
        // Simulate transaction hash
        const mockTxHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const mockGasUsed = Math.floor(Math.random() * 50000) + 150000; // Realistic gas usage
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          success: true,
          transactionHash: mockTxHash,
          gasUsed: mockGasUsed.toString(),
          network: network,
          isMock: true,
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000
        };
      } catch (error) {
        console.error('Mock swap execution failed:', error);
        return {
          success: false,
          error: error.message,
          network: network
        };
      }
    }
    
    // For mainnet, use real DragonSwap (when available)
    if (!router || !this.signer) {
      throw new Error('Router or signer not initialized');
    }

    try {
      const amountInWei = ethers.parseEther(amountIn.toString());
      const amountOutMinWei = ethers.parseEther(amountOutMin.toString());
      const path = [tokenInAddress, tokenOutAddress];
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes from now

      // Check if swapping ETH for tokens
      const isETHToToken = tokenInAddress === ethers.ZeroAddress;
      const isTokenToETH = tokenOutAddress === ethers.ZeroAddress;

      let tx;
      if (isETHToToken) {
        // Swap ETH for tokens
        tx = await router.swapExactETHForTokens(
          amountOutMinWei,
          path,
          userAddress,
          deadline,
          { value: amountInWei }
        );
      } else if (isTokenToETH) {
        // Swap tokens for ETH
        tx = await router.swapExactTokensForETH(
          amountInWei,
          amountOutMinWei,
          path,
          userAddress,
          deadline
        );
      } else {
        // Swap tokens for tokens
        tx = await router.swapExactTokensForTokens(
          amountInWei,
          amountOutMinWei,
          path,
          userAddress,
          deadline
        );
      }

      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        network: network,
        isMock: false
      };
    } catch (error) {
      console.error('Execute swap failed:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }

  // Check token allowance
  async checkAllowance(tokenAddress, ownerAddress, spenderAddress, network = 'testnet') {
    await this.initialize();
    
    const provider = network === 'mainnet' ? this.mainnetProvider : this.testnetProvider;
    
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
      
      return {
        success: true,
        allowance: ethers.formatEther(allowance),
        network: network
      };
    } catch (error) {
      console.error('Check allowance failed:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }

  // Approve tokens for swap
  async approveTokens(tokenAddress, spenderAddress, amount, network = 'testnet') {
    await this.initialize();
    
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const amountWei = ethers.parseEther(amount.toString());
      
      const tx = await tokenContract.approve(spenderAddress, amountWei);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        network: network
      };
    } catch (error) {
      console.error('Approve tokens failed:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }

  // Get token info
  async getTokenInfo(tokenAddress, network = 'testnet') {
    await this.initialize();
    
    const provider = network === 'mainnet' ? this.mainnetProvider : this.testnetProvider;
    
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [name, symbol, decimals] = await Promise.all([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals()
      ]);
      
      return {
        success: true,
        name: name,
        symbol: symbol,
        decimals: decimals,
        address: tokenAddress,
        network: network
      };
    } catch (error) {
      console.error('Get token info failed:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }
}

export default DragonSwapService;