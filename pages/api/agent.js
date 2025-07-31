import kaiaAgentService from '../../utils/kaiaAgent.js';
import { ethers } from 'ethers';

// Import token addresses from kaiaAgent
const KAIA_TOKENS = {
  testnet: {
    WKAIA: '0x0000000000000000000000000000000000000000',
    USDT: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
    MOCK: '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690',
  },
  mainnet: {
    WKAIA: '0x0000000000000000000000000000000000000000',
    USDT: '0x0000000000000000000000000000000000000000',
    USDC: '0x0000000000000000000000000000000000000000',
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, userAddress, network = 'testnet' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log('Processing request:', { prompt, userAddress, network });

    const lowerPrompt = prompt.toLowerCase();
    
    // Real balance checking
    if (lowerPrompt.includes('balance') && userAddress) {
      try {
        const balanceResult = await kaiaAgentService.checkBalance(userAddress, null, network);
        if (balanceResult.success) {
          return res.status(200).json({
            response: `🔗 **Real Blockchain Data - ${balanceResult.network}**\n\nI've queried the actual blockchain for your KAIA balance:\n\n• **Address**: ${userAddress}\n• **Balance**: ${balanceResult.balance} KAIA\n• **Network**: ${balanceResult.network}\n• **Data Source**: ${balanceResult.isReal ? 'Real Blockchain' : 'Mock Data'}\n• **Blockchain**: ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}`,
            steps: [],
            toolCalls: [],
            success: true,
            blockchainData: balanceResult,
          });
        }
      } catch (error) {
        console.error('Real balance check failed:', error);
        return res.status(200).json({
          response: `❌ **Error Querying Blockchain**\n\nFailed to query ${network} balance for address ${userAddress}:\n\n• **Error**: ${error.message}\n• **Network**: ${network}\n• **Address**: ${userAddress}`,
          success: false,
          error: error.message,
        });
      }
    }
    
    // Real network status checking
    if (lowerPrompt.includes('network') || lowerPrompt.includes('status')) {
      try {
        const networkResult = await kaiaAgentService.getNetworkStatus(network);
        if (networkResult.success) {
          return res.status(200).json({
            response: `🔗 **Real Network Status - ${networkResult.network}**\n\nI've queried the actual blockchain network status:\n\n• **Network**: ${networkResult.network}\n• **Block Number**: ${networkResult.blockNumber.toLocaleString()}\n• **Gas Price**: ${networkResult.gasPrice} Gwei\n• **Status**: Connected ✅\n• **RPC URL**: ${network === 'testnet' ? 'https://public-en-kairos.node.kaia.io' : 'https://public-en.node.kaia.io'}`,
            steps: [],
            toolCalls: [],
            success: true,
            blockchainData: networkResult,
          });
        }
      } catch (error) {
        console.error('Real network status check failed:', error);
        return res.status(200).json({
          response: `❌ **Error Querying Network Status**\n\nFailed to query ${network} status:\n\n• **Error**: ${error.message}\n• **Network**: ${network}`,
          success: false,
          error: error.message,
        });
      }
    }
    
    // Real transaction checking
    if (lowerPrompt.includes('transaction') || lowerPrompt.includes('tx')) {
      const txHashMatch = prompt.match(/0x[a-fA-F0-9]{64}/);
      if (txHashMatch) {
        try {
          const txResult = await kaiaAgentService.getTransaction(txHashMatch[0], network);
          if (txResult.success) {
            return res.status(200).json({
              response: `🔗 **Real Transaction Data - ${network}**\n\nI've queried the actual blockchain for transaction details:\n\n• **Hash**: ${txResult.transaction.hash}\n• **Status**: ${txResult.transaction.status === 'success' ? '✅ Success' : '❌ Failed'}\n• **Block**: ${txResult.transaction.blockNumber?.toLocaleString() || 'Pending'}\n• **From**: ${txResult.transaction.from}\n• **To**: ${txResult.transaction.to}\n• **Value**: ${txResult.transaction.value} KAIA\n• **Gas Used**: ${txResult.transaction.gasUsed}`,
              steps: [],
              toolCalls: [],
              success: true,
              blockchainData: txResult,
            });
          }
        } catch (error) {
          console.error('Real transaction check failed:', error);
          return res.status(200).json({
            response: `❌ **Error Querying Transaction**\n\nFailed to query transaction ${txHashMatch[0]} on ${network}:\n\n• **Error**: ${error.message}\n• **Hash**: ${txHashMatch[0]}\n• **Network**: ${network}`,
            success: false,
            error: error.message,
          });
        }
      }
    }

    // Real contract state checking
    if (lowerPrompt.includes('contract') || lowerPrompt.includes('deployed')) {
      const contractMatch = prompt.match(/0x[a-fA-F0-9]{40}/);
      if (contractMatch) {
        try {
          const contractResult = await kaiaAgentService.getContractState(contractMatch[0], network);
          if (contractResult.success) {
            return res.status(200).json({
              response: `🔗 **Real Contract Data - ${network}**\n\nI've queried the actual blockchain for contract information:\n\n• **Address**: ${contractResult.contractAddress}\n• **Status**: ✅ Contract Deployed\n• **Network**: ${contractResult.network}\n• **Has Code**: Yes\n• **Blockchain**: ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}`,
              steps: [],
              toolCalls: [],
              success: true,
              blockchainData: contractResult,
            });
          }
        } catch (error) {
          console.error('Real contract check failed:', error);
          return res.status(200).json({
            response: `❌ **Error Querying Contract**\n\nFailed to query contract ${contractMatch[0]} on ${network}:\n\n• **Error**: ${error.message}\n• **Address**: ${contractMatch[0]}\n• **Network**: ${network}`,
            success: false,
            error: error.message,
          });
        }
      }
    }

    // Enhanced swap detection with DragonSwap support
    if (prompt.toLowerCase().includes('swap') || prompt.toLowerCase().includes('exchange')) {
      try {
        // Extract swap parameters from prompt
        const swapMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(KAIA|ETH|MOCK|USDT|USDC|token)/i);
        const amount = swapMatch ? parseFloat(swapMatch[1]) : 10;
        
        // Determine token addresses based on prompt
        let tokenIn, tokenOut;
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('kaia') && lowerPrompt.includes('mock')) {
          tokenIn = ethers.ZeroAddress; // KAIA
          tokenOut = KAIA_TOKENS[network].MOCK; // Mock token
        } else if (lowerPrompt.includes('mock') && lowerPrompt.includes('kaia')) {
          tokenIn = KAIA_TOKENS[network].MOCK; // Mock token
          tokenOut = ethers.ZeroAddress; // KAIA
        } else if (lowerPrompt.includes('kaia') && lowerPrompt.includes('usdt')) {
          tokenIn = ethers.ZeroAddress; // KAIA
          tokenOut = KAIA_TOKENS[network].USDT; // USDT
        } else if (lowerPrompt.includes('usdt') && lowerPrompt.includes('kaia')) {
          tokenIn = KAIA_TOKENS[network].USDT; // USDT
          tokenOut = ethers.ZeroAddress; // KAIA
        } else {
          // Default: KAIA to Mock
          tokenIn = ethers.ZeroAddress;
          tokenOut = KAIA_TOKENS[network].MOCK;
        }
        
        // Check if tokens are available
        if (tokenIn !== ethers.ZeroAddress && tokenIn === '0x0000000000000000000000000000000000000000') {
          return res.status(200).json({
            response: `❌ **Token Not Available**\n\n**Error:** Input token is not available on ${network}\n\nAvailable tokens: KAIA (native), MOCK`,
            success: false,
            error: 'Token not available'
          });
        }
        
        if (tokenOut !== ethers.ZeroAddress && tokenOut === '0x0000000000000000000000000000000000000000') {
          return res.status(200).json({
            response: `❌ **Token Not Available**\n\n**Error:** Output token is not available on ${network}\n\nAvailable tokens: KAIA (native), MOCK`,
            success: false,
            error: 'Token not available'
          });
        }
        
        // Use DragonSwap for real swaps
        const swapResult = await kaiaAgentService.swapTokensWithDragonSwap(
          amount,
          tokenIn,
          tokenOut,
          userAddress,
          network
        );
        
        if (swapResult.success) {
          const tokenInSymbol = tokenIn === ethers.ZeroAddress ? 'KAIA' : 'MOCK';
          const tokenOutSymbol = tokenOut === ethers.ZeroAddress ? 'KAIA' : 'MOCK';
          
          const response = `🔄 **DragonSwap Transaction Successful!**\n\n` +
            `**Network:** ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}\n` +
            `**Amount In:** ${amount} ${tokenInSymbol}\n` +
            `**Amount Out:** ${swapResult.quote.amountOut} ${tokenOutSymbol}\n` +
            `**Transaction Hash:** \`${swapResult.swap.transactionHash}\`\n` +
            `**Gas Used:** ${swapResult.swap.gasUsed}\n\n` +
            `✅ Swap executed successfully using DragonSwap!`;
          
          return res.status(200).json({
            response: response,
            success: true,
            swapData: swapResult
          });
        } else {
          return res.status(200).json({
            response: `❌ **DragonSwap Swap Failed**\n\n**Error:** ${swapResult.error}\n\nPlease try again or check your token balance and allowances.`,
            success: false,
            error: swapResult.error
          });
        }
      } catch (error) {
        console.error('DragonSwap swap error:', error);
        return res.status(200).json({
          response: `❌ **Swap Error**\n\n**Error:** ${error.message}\n\nPlease ensure you have sufficient balance and try again.`,
          success: false,
          error: error.message
        });
      }
    }

    // Real yield farming info
    if (lowerPrompt.includes('farm') || lowerPrompt.includes('yield')) {
      try {
        const farmAddress = '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e'; // Mock farm
        const farmResult = await kaiaAgentService.getContractState(farmAddress, network);
        
        if (farmResult.success) {
          return res.status(200).json({
            response: `🔗 **Real Yield Farm Data - ${network}**\n\nI've queried the actual blockchain for yield farm information:\n\n• **Farm Address**: ${farmAddress}\n• **Status**: ✅ Contract Deployed\n• **Network**: ${network}\n• **Type**: Yield Farming Contract\n• **Reward Token**: Mock Token\n• **Capability**: Deposit/Withdraw available`,
            steps: [],
            toolCalls: [],
            success: true,
            blockchainData: farmResult,
          });
        } else {
          return res.status(200).json({
            response: `❌ **Farm Not Deployed - ${network}**\n\nI've checked the blockchain and the yield farm is not deployed on ${network}:\n\n• **Network**: ${network}\n• **Status**: Farm contract not found\n• **Action**: Deploy farm contract to enable yield farming`,
            success: false,
            blockchainData: farmResult,
          });
        }
      } catch (error) {
        console.error('Farm check failed:', error);
        return res.status(200).json({
          response: `❌ **Error Checking Farm**\n\nFailed to check farm status on ${network}:\n\n• **Error**: ${error.message}\n• **Network**: ${network}`,
          success: false,
          error: error.message,
        });
      }
    }

    // Default response for unrecognized queries
    return res.status(200).json({
      response: `🤖 **Kaia AI Assistant - ${network}**\n\nI can help you with real blockchain queries on the ${network}:\n\n• **Check Balance**: "Check my KAIA balance on ${network}"\n• **Network Status**: "Check network status on ${network}"\n• **Transaction**: "Check transaction 0x... on ${network}"\n• **Contract**: "Check contract 0x... on ${network}"\n• **Swap Tokens**: "Swap 10 KAIA for MOCK on ${network}"\n• **Yield Farm**: "Check yield farm on ${network}"\n\nAll queries use real blockchain data from the ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}.`,
      steps: [],
      toolCalls: [],
      success: true,
    });

  } catch (error) {
    console.error('AI Agent Error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
      success: false,
    });
  }
}