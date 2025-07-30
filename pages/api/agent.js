import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { ethers } from 'ethers';

// Initialize the Google Gemini model
const model = google('gemini-1.5-pro-latest');

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
];

// Blockchain service class
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
      const rpcUrl = process.env.KAIA_RPC_URL || 'https://public-en-kairos.node.kaia.io';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      if (process.env.KAIA_PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.KAIA_PRIVATE_KEY, this.provider);
      }
      
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

  async checkBalance(userAddress, tokenAddress = null) {
    await this.initialize();
    
    try {
      if (!tokenAddress || tokenAddress === ethers.ZeroAddress) {
        const balance = await this.provider.getBalance(userAddress);
        return {
          balance: ethers.formatEther(balance),
          symbol: 'KAIA',
          success: true,
        };
      } else {
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
}

const kaiaAgentService = new KaiaAgentService();

// Define tools for the AI agent
const swapTokensTool = tool({
  description: 'Swap tokens on Kaia blockchain. Can swap from any token to KAIA token and vice versa.',
  parameters: z.object({
    tokenIn: z.string().describe('Address of the input token (use "0x0000000000000000000000000000000000000000" for native KAIA)'),
    tokenOut: z.string().describe('Address of the output token (use "0x0000000000000000000000000000000000000000" for native KAIA)'),
    amountIn: z.number().describe('Amount of input tokens to swap'),
    minAmountOut: z.number().describe('Minimum amount of output tokens expected'),
    recipient: z.string().describe('Address to receive the swapped tokens'),
  }),
  execute: async ({ tokenIn, tokenOut, amountIn, minAmountOut, recipient }) => {
    try {
      const result = await kaiaAgentService.swapTokens(tokenIn, tokenOut, amountIn, minAmountOut, recipient);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const getSwapQuoteTool = tool({
  description: 'Get a quote for token swap without executing the swap.',
  parameters: z.object({
    tokenIn: z.string().describe('Address of the input token'),
    tokenOut: z.string().describe('Address of the output token'),
    amountIn: z.number().describe('Amount of input tokens'),
  }),
  execute: async ({ tokenIn, tokenOut, amountIn }) => {
    try {
      const result = await kaiaAgentService.getSwapQuote(tokenIn, tokenOut, amountIn);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const checkBalanceTool = tool({
  description: 'Check the balance of KAIA tokens or other ERC20 tokens for a specific address.',
  parameters: z.object({
    userAddress: z.string().describe('The wallet address to check balance for'),
    tokenAddress: z.string().optional().describe('Token contract address (optional, defaults to native KAIA)'),
  }),
  execute: async ({ userAddress, tokenAddress }) => {
    try {
      const result = await kaiaAgentService.checkBalance(userAddress, tokenAddress);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const sendTokensTool = tool({
  description: 'Send KAIA tokens or other ERC20 tokens to another address.',
  parameters: z.object({
    tokenAddress: z.string().optional().describe('Token contract address (optional, defaults to native KAIA)'),
    recipientAddress: z.string().describe('Address to send tokens to'),
    amount: z.number().describe('Amount of tokens to send'),
  }),
  execute: async ({ tokenAddress, recipientAddress, amount }) => {
    try {
      const result = await kaiaAgentService.sendTokens(tokenAddress, recipientAddress, amount);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const analyzeYieldsTool = tool({
  description: 'Analyze yield farming opportunities and provide recommendations.',
  parameters: z.object({
    userAddress: z.string().describe('User address to analyze yields for'),
  }),
  execute: async ({ userAddress }) => {
    try {
      const totalValue = await kaiaAgentService.getTotalYieldValue(userAddress);
      
      const analysis = {
        totalYieldValue: totalValue.totalValue,
        numberOfFarms: 0, // Mock data for now
        farms: [],
        success: true,
      };
      
      return analysis;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const analyzeTradesTool = tool({
  description: 'Analyze on-chain trading activities and provide insights.',
  parameters: z.object({
    userAddress: z.string().describe('User address to analyze trades for'),
    timeframe: z.string().optional().describe('Timeframe for analysis (24h, 7d, 30d)'),
  }),
  execute: async ({ userAddress, timeframe = '24h' }) => {
    try {
      const analysis = {
        timeframe,
        totalTransactions: 0,
        totalVolume: '0',
        profitLoss: '0',
        topTokens: [],
        recommendations: [
          'Consider diversifying your portfolio across different DeFi protocols',
          'Monitor gas fees and execute transactions during low-congestion periods',
          'Set up yield farming positions for passive income generation'
        ],
        success: true,
      };
      
      return analysis;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const fiatToKaiaTool = tool({
  description: 'Convert fiat currency to KAIA tokens. This provides information about fiat-to-crypto conversion.',
  parameters: z.object({
    fiatAmount: z.number().describe('Amount in fiat currency'),
    fiatCurrency: z.string().describe('Fiat currency code (USD, EUR, etc.)'),
    recipientAddress: z.string().describe('Address to receive KAIA tokens'),
  }),
  execute: async ({ fiatAmount, fiatCurrency, recipientAddress }) => {
    try {
      const mockExchangeRate = 0.85;
      const kaiaAmount = fiatAmount * mockExchangeRate;
      
      return {
        success: true,
        fiatAmount,
        fiatCurrency,
        kaiaAmount,
        exchangeRate: mockExchangeRate,
        recipientAddress,
        message: `To convert ${fiatAmount} ${fiatCurrency} to ${kaiaAmount} KAIA, you would need to use a fiat on-ramp service like MoonPay, Transak, or a centralized exchange.`,
        recommendations: [
          'Use a reputable fiat on-ramp service',
          'Check for the best exchange rates',
          'Be aware of transaction fees',
          'Ensure your wallet address is correct'
        ]
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, userAddress } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const result = await generateText({
      model,
      prompt: `You are a helpful AI agent for the Kaia blockchain ecosystem. You can help users with:
      
      1. Token swapping - swap between any tokens and KAIA
      2. Balance checking - check KAIA and other token balances
      3. Token sending - send KAIA tokens to other addresses
      4. Yield farming - deposit/withdraw from yield farms and analyze yields
      5. Trade analysis - analyze on-chain trading activities
      6. Fiat conversion - provide information about converting fiat to KAIA
      
      User Address: ${userAddress || 'Not provided'}
      
      User Query: ${prompt}
      
      Please provide helpful and accurate information. If the user wants to perform blockchain operations, use the appropriate tools. Always explain what you're doing and provide clear instructions.`,
      
      tools: {
        swapTokens: swapTokensTool,
        getSwapQuote: getSwapQuoteTool,
        checkBalance: checkBalanceTool,
        sendTokens: sendTokensTool,
        analyzeYields: analyzeYieldsTool,
        analyzeTrades: analyzeTradesTool,
        fiatToKaia: fiatToKaiaTool,
      },
      
      maxSteps: 5,
      temperature: 0.7,
    });

    return res.status(200).json({
      response: result.text,
      steps: result.steps,
      toolCalls: result.steps.flatMap(step => step.toolCalls || []),
      success: true,
    });

  } catch (error) {
    console.error('AI Agent Error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
      success: false,
    });
  }
}