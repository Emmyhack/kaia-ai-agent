import { ethers } from 'ethers';

// Standard DEX Router ABI (compatible with Uniswap V2 style DEXes)
const DEX_ROUTER_ABI = [
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

// ERC20 Token ABI
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
  'function name() external view returns (string)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)'
];

class KaiaDexService {
  constructor() {
    this.providers = {};
    this.routers = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize providers for different networks
      this.providers.testnet = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
      this.providers.mainnet = new ethers.JsonRpcProvider('https://public-en.node.kaia.io');

      // Known DEX routers on Kaia chain (you'll need to replace with actual addresses)
      const DEX_ROUTERS = {
        testnet: {
          // Add actual DEX router addresses here
          'KaiaSwap': '0x0000000000000000000000000000000000000000', // Replace with actual address
          'KaiaDex': '0x0000000000000000000000000000000000000000'   // Replace with actual address
        },
        mainnet: {
          'KaiaSwap': '0x0000000000000000000000000000000000000000', // Replace with actual address
          'KaiaDex': '0x0000000000000000000000000000000000000000'   // Replace with actual address
        }
      };

      // Initialize routers
      for (const network of ['testnet', 'mainnet']) {
        this.routers[network] = {};
        for (const [dexName, routerAddress] of Object.entries(DEX_ROUTERS[network])) {
          if (routerAddress !== '0x0000000000000000000000000000000000000000') {
            this.routers[network][dexName] = new ethers.Contract(
              routerAddress,
              DEX_ROUTER_ABI,
              this.providers[network]
            );
          }
        }
      }

      this.initialized = true;
      console.log('KaiaDexService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize KaiaDexService:', error);
      throw error;
    }
  }

  // Get available DEXes for a network
  async getAvailableDexes(network = 'testnet') {
    await this.initialize();
    
    // For testnet, return mock DEXes since real DEXes aren't deployed yet
    if (network === 'testnet') {
      return [
        'KaiaSwap',
        'KaiaDex'
      ];
    }
    
    const availableDexes = [];
    for (const [dexName, router] of Object.entries(this.routers[network] || {})) {
      if (router) {
        try {
          // Test if router is responsive
          await router.WETH();
          availableDexes.push(dexName);
        } catch (error) {
          console.log(`DEX ${dexName} not available on ${network}:`, error.message);
        }
      }
    }
    
    return availableDexes;
  }

  // Get swap quote from a specific DEX
  async getSwapQuote(dexName, amountIn, tokenInAddress, tokenOutAddress, network = 'testnet') {
    await this.initialize();
    
    // For testnet, provide realistic mock quotes since real DEXes aren't deployed
    if (network === 'testnet') {
      try {
        const provider = this.providers[network];
        
        // Get real blockchain data for realistic simulation
        const blockNumber = await provider.getBlockNumber();
        const feeData = await provider.getFeeData();
        
        // Simulate realistic swap rates based on token pairs
        let mockRate;
        if (tokenInAddress === ethers.ZeroAddress && tokenOutAddress !== ethers.ZeroAddress) {
          // KAIA to Token
          mockRate = 0.85 + (Math.random() * 0.3); // 0.85 - 1.15
        } else if (tokenInAddress !== ethers.ZeroAddress && tokenOutAddress === ethers.ZeroAddress) {
          // Token to KAIA
          mockRate = 1.15 + (Math.random() * 0.3); // 1.15 - 1.45
        } else {
          // Token to Token
          mockRate = 0.95 + (Math.random() * 0.2); // 0.95 - 1.15
        }
        
        const mockAmountOut = amountIn * mockRate;
        const mockSlippage = 0.5 + (Math.random() * 1); // 0.5% - 1.5% slippage
        
        return {
          success: true,
          dex: dexName,
          amountIn: amountIn,
          amountOut: mockAmountOut.toFixed(6),
          amountOutMin: (mockAmountOut * (1 - mockSlippage / 100)).toFixed(6),
          path: [tokenInAddress, tokenOutAddress],
          network: network,
          isReal: false,
          isTestnet: true,
          blockNumber: blockNumber,
          gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei')
        };
      } catch (error) {
        console.error(`Mock quote generation failed for ${dexName}:`, error);
        return {
          success: false,
          error: 'Failed to generate mock quote',
          dex: dexName,
          network: network
        };
      }
    }
    
    // For mainnet, use real DEX contracts
    const router = this.routers[network]?.[dexName];
    if (!router) {
      throw new Error(`DEX ${dexName} not available on ${network}`);
    }

    try {
      const path = [tokenInAddress, tokenOutAddress];
      const amounts = await router.getAmountsOut(
        ethers.parseEther(amountIn.toString()),
        path
      );
      
      const amountOut = ethers.formatEther(amounts[1]);
      const amountOutMin = parseFloat(amountOut) * 0.95; // 5% slippage
      
      return {
        success: true,
        dex: dexName,
        amountIn: amountIn,
        amountOut: amountOut,
        amountOutMin: amountOutMin.toFixed(6),
        path: path,
        network: network,
        isReal: true
      };
    } catch (error) {
      console.error(`Failed to get quote from ${dexName}:`, error);
      return {
        success: false,
        error: error.message,
        dex: dexName,
        network: network
      };
    }
  }

  // Execute swap on a specific DEX
  async executeSwap(dexName, amountIn, amountOutMin, tokenInAddress, tokenOutAddress, userAddress, signer, network = 'testnet') {
    await this.initialize();
    
    // For testnet, simulate swap execution since real DEXes aren't deployed
    if (network === 'testnet') {
      try {
        const provider = this.providers[network];
        
        // Get real blockchain data for realistic simulation
        const blockNumber = await provider.getBlockNumber();
        const feeData = await provider.getFeeData();
        
        // Generate realistic transaction hash based on block number
        const mockTxHash = `0x${blockNumber.toString(16).padStart(8, '0')}${Math.random().toString(16).substring(2, 58)}`;
        
        // Calculate realistic gas usage based on transaction type
        const baseGas = 21000; // Base transaction gas
        const tokenTransferGas = 65000; // ERC20 transfer gas
        const swapGas = tokenInAddress === ethers.ZeroAddress ? baseGas + 50000 : tokenTransferGas + 80000;
        const gasUsed = swapGas + Math.floor(Math.random() * 20000);
        
        return {
          success: true,
          dex: dexName,
          transactionHash: mockTxHash,
          gasUsed: gasUsed.toString(),
          blockNumber: blockNumber,
          network: network,
          isReal: false,
          isTestnet: true,
          gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei')
        };
      } catch (error) {
        console.error(`Mock swap execution failed for ${dexName}:`, error);
        return {
          success: false,
          error: 'Failed to simulate swap execution',
          dex: dexName,
          network: network
        };
      }
    }
    
    // For mainnet, use real DEX contracts
    const router = this.routers[network]?.[dexName];
    if (!router) {
      throw new Error(`DEX ${dexName} not available on ${network}`);
    }

    if (!signer) {
      throw new Error('Signer required for swap execution');
    }

    try {
      const routerWithSigner = router.connect(signer);
      const path = [tokenInAddress, tokenOutAddress];
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes

      let tx;
      if (tokenInAddress === ethers.ZeroAddress) {
        // Swap ETH for tokens
        tx = await routerWithSigner.swapExactETHForTokens(
          ethers.parseEther(amountOutMin.toString()),
          path,
          userAddress,
          deadline,
          { value: ethers.parseEther(amountIn.toString()) }
        );
      } else if (tokenOutAddress === ethers.ZeroAddress) {
        // Swap tokens for ETH
        tx = await routerWithSigner.swapExactTokensForETH(
          ethers.parseEther(amountIn.toString()),
          ethers.parseEther(amountOutMin.toString()),
          path,
          userAddress,
          deadline
        );
      } else {
        // Swap tokens for tokens
        tx = await routerWithSigner.swapExactTokensForTokens(
          ethers.parseEther(amountIn.toString()),
          ethers.parseEther(amountOutMin.toString()),
          path,
          userAddress,
          deadline
        );
      }

      const receipt = await tx.wait();
      
      return {
        success: true,
        dex: dexName,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        network: network,
        isReal: true
      };
    } catch (error) {
      console.error(`Failed to execute swap on ${dexName}:`, error);
      return {
        success: false,
        error: error.message,
        dex: dexName,
        network: network
      };
    }
  }

  // Check token allowance
  async checkAllowance(tokenAddress, ownerAddress, spenderAddress, network = 'testnet') {
    await this.initialize();
    
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        this.providers[network]
      );
      
      const allowance = await tokenContract.allowance(ownerAddress, spenderAddress);
      const balance = await tokenContract.balanceOf(ownerAddress);
      const decimals = await tokenContract.decimals();
      
      return {
        success: true,
        allowance: ethers.formatUnits(allowance, decimals),
        balance: ethers.formatUnits(balance, decimals),
        tokenAddress: tokenAddress,
        network: network
      };
    } catch (error) {
      console.error('Failed to check allowance:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }

  // Approve tokens for swap
  async approveTokens(tokenAddress, spenderAddress, amount, signer, network = 'testnet') {
    await this.initialize();
    
    if (!signer) {
      throw new Error('Signer required for token approval');
    }

    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ERC20_ABI,
        signer
      );
      
      const decimals = await tokenContract.decimals();
      const tx = await tokenContract.approve(
        spenderAddress,
        ethers.parseUnits(amount.toString(), decimals)
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        network: network
      };
    } catch (error) {
      console.error('Failed to approve tokens:', error);
      return {
        success: false,
        error: error.message,
        network: network
      };
    }
  }

  // Get best swap quote across all available DEXes
  async getBestSwapQuote(amountIn, tokenInAddress, tokenOutAddress, network = 'testnet') {
    await this.initialize();
    
    const availableDexes = await this.getAvailableDexes(network);
    const quotes = [];
    
    for (const dexName of availableDexes) {
      const quote = await this.getSwapQuote(dexName, amountIn, tokenInAddress, tokenOutAddress, network);
      if (quote.success) {
        quotes.push(quote);
      }
    }
    
    if (quotes.length === 0) {
      return {
        success: false,
        error: 'No DEXes available for swap',
        network: network
      };
    }
    
    // Find the best quote (highest amount out)
    const bestQuote = quotes.reduce((best, current) => 
      parseFloat(current.amountOut) > parseFloat(best.amountOut) ? current : best
    );
    
    return {
      success: true,
      bestQuote: bestQuote,
      allQuotes: quotes,
      network: network
    };
  }
}

export default KaiaDexService;