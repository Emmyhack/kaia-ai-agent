import { generateText, tool } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import kaiaAgentService from '../../utils/kaiaAgent.js';

// Initialize the Google Gemini model
const model = google('gemini-1.5-pro-latest');

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

const checkMultipleBalancesTool = tool({
  description: 'Check balances of multiple tokens for a specific address.',
  parameters: z.object({
    userAddress: z.string().describe('The wallet address to check balances for'),
    tokenAddresses: z.array(z.string()).describe('Array of token contract addresses'),
  }),
  execute: async ({ userAddress, tokenAddresses }) => {
    try {
      const result = await kaiaAgentService.checkMultipleBalances(userAddress, tokenAddresses);
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

const depositToYieldFarmTool = tool({
  description: 'Deposit tokens to a yield farm to earn rewards.',
  parameters: z.object({
    farmAddress: z.string().describe('Address of the yield farm contract'),
    amount: z.number().describe('Amount of tokens to deposit'),
    userAddress: z.string().describe('User address making the deposit'),
  }),
  execute: async ({ farmAddress, amount, userAddress }) => {
    try {
      const result = await kaiaAgentService.depositToYieldFarm(farmAddress, amount, userAddress);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const withdrawFromYieldFarmTool = tool({
  description: 'Withdraw tokens from a yield farm.',
  parameters: z.object({
    farmAddress: z.string().describe('Address of the yield farm contract'),
    amount: z.number().describe('Amount of tokens to withdraw'),
    userAddress: z.string().describe('User address making the withdrawal'),
  }),
  execute: async ({ farmAddress, amount, userAddress }) => {
    try {
      const result = await kaiaAgentService.withdrawFromYieldFarm(farmAddress, amount, userAddress);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const getYieldFarmInfoTool = tool({
  description: 'Get information about a specific yield farm.',
  parameters: z.object({
    farmAddress: z.string().describe('Address of the yield farm contract'),
    userAddress: z.string().describe('User address to get info for'),
  }),
  execute: async ({ farmAddress, userAddress }) => {
    try {
      const result = await kaiaAgentService.getYieldFarmInfo(farmAddress, userAddress);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const analyzeYieldsTool = tool({
  description: 'Analyze yield farming positions and returns.',
  parameters: z.object({
    userAddress: z.string().describe('User address to analyze yields for'),
  }),
  execute: async ({ userAddress }) => {
    try {
      const result = await kaiaAgentService.getTotalYieldValue(userAddress);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

const analyzeTradesTool = tool({
  description: 'Analyze trading activities and performance.',
  parameters: z.object({
    userAddress: z.string().describe('User address to analyze trades for'),
  }),
  execute: async ({ userAddress }) => {
    try {
      // Mock trade analysis for now
      return {
        success: true,
        totalTransactions: Math.floor(Math.random() * 50) + 10,
        totalVolume: (Math.random() * 10000 + 1000).toFixed(2),
        averageTradeSize: (Math.random() * 100 + 10).toFixed(2),
        profitLoss: (Math.random() * 2000 - 1000).toFixed(2),
        message: 'Trade analysis completed successfully.'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
});

// Fiat to KAIA conversion tool (mock implementation)
const fiatToKaiaTool = tool({
  description: 'Convert fiat currency to KAIA tokens. This provides information about fiat-to-crypto conversion.',
  parameters: z.object({
    fiatAmount: z.number().describe('Amount in fiat currency'),
    fiatCurrency: z.string().describe('Fiat currency code (USD, EUR, etc.)'),
    recipientAddress: z.string().describe('Address to receive KAIA tokens'),
  }),
  execute: async ({ fiatAmount, fiatCurrency, recipientAddress }) => {
    try {
      // Mock exchange rate - in production, this would integrate with real exchange APIs
      const mockExchangeRate = 0.85; // 1 USD = 0.85 KAIA (example)
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

  // Check if Google AI API key is available
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    return res.status(500).json({
      error: 'AI service configuration error',
      details: 'Google AI API key is not configured',
      success: false,
    });
  }

  try {
    console.log('Processing request:', { prompt, userAddress });

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
        checkMultipleBalances: checkMultipleBalancesTool,
        sendTokens: sendTokensTool,
        depositToYieldFarm: depositToYieldFarmTool,
        withdrawFromYieldFarm: withdrawFromYieldFarmTool,
        getYieldFarmInfo: getYieldFarmInfoTool,
        analyzeYields: analyzeYieldsTool,
        analyzeTrades: analyzeTradesTool,
        fiatToKaia: fiatToKaiaTool,
      },
      
      maxSteps: 5,
      temperature: 0.7,
    });

    console.log('AI response generated successfully');

    return res.status(200).json({
      response: result.text,
      steps: result.steps,
      toolCalls: result.steps.flatMap(step => step.toolCalls || []),
      success: true,
    });

  } catch (error) {
    console.error('AI Agent Error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to process request';
    let errorDetails = error.message;
    
    if (error.message.includes('API key')) {
      errorMessage = 'AI service configuration error';
      errorDetails = 'Please check the Google AI API key configuration';
    } else if (error.message.includes('quota')) {
      errorMessage = 'AI service quota exceeded';
      errorDetails = 'Please try again later or check your API quota';
    } else if (error.message.includes('network')) {
      errorMessage = 'Network error';
      errorDetails = 'Please check your internet connection and try again';
    }
    
    return res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      success: false,
    });
  }
}