import kaiaAgentService from '../../utils/kaiaAgent.js';
import { ethers } from 'ethers';
import { rateLimitMiddleware } from '../../utils/rateLimiter.js';
import { validation } from '../../utils/validation.js';

// Simple token addresses
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

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validate request body
  const validationResult = validation.validateApiRequest(req.body);
  
  if (!validationResult.valid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request data',
      details: validationResult.errors.join(', '),
      response: `❌ **Validation Error**\n\nPlease check your input:\n\n${validationResult.errors.map(err => `• ${err}`).join('\n')}`
    });
  }
  
  const { prompt, userAddress, network } = validationResult.sanitizedData;

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
    
    // Real contract checking
    if (lowerPrompt.includes('contract') || lowerPrompt.includes('address')) {
      const contractMatch = prompt.match(/0x[a-fA-F0-9]{40}/);
      if (contractMatch) {
        try {
          const contractResult = await kaiaAgentService.getContractState(contractMatch[0], network);
          if (contractResult.success) {
            return res.status(200).json({
              response: `🔗 **Real Contract Data - ${network}**\n\nI've queried the actual blockchain for contract details:\n\n• **Address**: ${contractResult.contract.address}\n• **Balance**: ${contractResult.contract.balance} KAIA\n• **Code**: ${contractResult.contract.hasCode ? '✅ Has Code' : '❌ No Code'}\n• **Network**: ${contractResult.network}\n• **Block**: ${contractResult.contract.blockNumber?.toLocaleString() || 'Unknown'}`,
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

    // Simple swap detection
    if (lowerPrompt.includes('swap') || lowerPrompt.includes('exchange')) {
      try {
        // Extract swap parameters from prompt
        const swapMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(KAIA|ETH|MOCK|USDT|USDC|token)/i);
        const amount = swapMatch ? parseFloat(swapMatch[1]) : 10;
        
        // Simple mock swap response
        const tokenInSymbol = 'KAIA';
        const tokenOutSymbol = 'MOCK';
        const mockAmountOut = (amount * 0.85).toFixed(6);
        const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
        const mockGasUsed = Math.floor(Math.random() * 200000) + 150000;
        const mockBlockNumber = Math.floor(Math.random() * 1000000) + 1000000;
        
        const response = `🔄 **Token Swap Successful!**\n\n` +
          `**Network:** ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}\n` +
          `**Amount In:** ${amount} ${tokenInSymbol}\n` +
          `**Amount Out:** ${mockAmountOut} ${tokenOutSymbol}\n` +
          `**Rate:** 1 ${tokenInSymbol} = 0.85 ${tokenOutSymbol}\n` +
          `**Transaction Hash:** \`${mockTxHash}\`\n` +
          `**Gas Used:** ${mockGasUsed.toLocaleString()}\n` +
          `**Block Number:** ${mockBlockNumber.toLocaleString()}\n` +
          `**Demo Mode:** Simulated swap for testing\n` +
          `\n✅ Swap completed successfully!`;
        
        return res.status(200).json({
          response: response,
          success: true,
          swapData: {
            success: true,
            transactionHash: mockTxHash,
            gasUsed: mockGasUsed,
            blockNumber: mockBlockNumber,
            network: network,
            isDemo: true
          }
        });
      } catch (error) {
        console.error('Swap error:', error);
        return res.status(200).json({
          response: `❌ **Swap Error**\n\n**Error:** ${error.message}\n\nPlease try again.`,
          success: false,
          error: error.message
        });
      }
    }

    // Token Transfer functionality
    if (lowerPrompt.includes('transfer') || lowerPrompt.includes('send')) {
      try {
        // Extract transfer parameters from prompt
        const transferMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(KAIA|MOCK|USDT|USDC|token)/i);
        const amount = transferMatch ? parseFloat(transferMatch[1]) : 10;
        
        // Extract recipient address
        const addressMatch = prompt.match(/0x[a-fA-F0-9]{40}/);
        const recipientAddress = addressMatch ? addressMatch[0] : '0x8Ff09c0a34184c35F86F5229d91280DfB523B59A'; // Default recipient
        
        // Determine token address
        let tokenAddress = ethers.ZeroAddress; // Default to KAIA
        if (lowerPrompt.includes('mock')) {
          tokenAddress = KAIA_TOKENS[network].MOCK;
        } else if (lowerPrompt.includes('usdt')) {
          tokenAddress = KAIA_TOKENS[network].USDT;
        } else if (lowerPrompt.includes('usdc')) {
          tokenAddress = KAIA_TOKENS[network].USDC;
        }
        
        const transferResult = await kaiaAgentService.transferTokens(
          tokenAddress,
          userAddress,
          recipientAddress,
          amount,
          network
        );
        
        if (transferResult.success) {
          const response = `💸 **Token Transfer Successful!**\n\n` +
            `**Network:** ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}\n` +
            `**Amount:** ${amount} ${transferResult.token}\n` +
            `**From:** ${transferResult.from}\n` +
            `**To:** ${transferResult.to}\n` +
            `**Transaction Hash:** \`${transferResult.transactionHash}\`\n` +
            `**Gas Used:** ${transferResult.gasUsed}\n\n` +
            `✅ Transfer completed successfully!`;
          
          return res.status(200).json({
            response: response,
            success: true,
            transferData: transferResult
          });
        } else {
          return res.status(200).json({
            response: `❌ **Transfer Failed**\n\n**Error:** ${transferResult.error}\n\nPlease check your balance and try again.`,
            success: false,
            error: transferResult.error
          });
        }
      } catch (error) {
        console.error('Token transfer error:', error);
        return res.status(200).json({
          response: `❌ **Transfer Error**\n\n**Error:** ${error.message}\n\nPlease ensure you have sufficient balance.`,
          success: false,
          error: error.message
        });
      }
    }

    // Enhanced yield farming detection with Kaiascan integration
    if (lowerPrompt.includes('farm') || lowerPrompt.includes('yield') || lowerPrompt.includes('stake')) {
      try {
        if (lowerPrompt.includes('opportunities') || lowerPrompt.includes('suggest')) {
          // Import and use Kaiascan service for real yield farming data
          const { kaiascanService } = await import('../../utils/kaiascanService.js');
          
          const result = await kaiascanService.getRealYieldFarmingData(network);
          
          if (result.success && result.opportunities.length > 0) {
            const farms = result.opportunities;
            
            let response = `🌾 **Real Yield Farming Opportunities - ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}**\n\n`;
            
            farms.forEach((farm, index) => {
              const apy = farm.onChainData?.apy || '0.00';
              const tvl = farm.onChainData?.totalSupply || '0';
              const risk = parseFloat(apy) > 20 ? 'High' : parseFloat(apy) > 10 ? 'Medium' : 'Low';
              
              response += `**${index + 1}. ${farm.name}**\n` +
                `• **Type:** ${farm.type}\n` +
                `• **APY:** ${apy}%\n` +
                `• **TVL:** ${parseFloat(tvl).toLocaleString()} KAIA\n` +
                `• **Risk:** ${risk}\n` +
                `• **Rewards:** ${farm.rewardToken?.symbol || 'KAIA'}\n` +
                `• **Address:** \`${farm.address}\`\n` +
                `• **Block:** ${farm.onChainData?.blockNumber?.toLocaleString() || 'N/A'}\n` +
                `• **Status:** ${farm.onChainData?.isActive ? '🟢 Active' : '🔴 Inactive'}\n\n`;
            });
            
            response += `📊 **Data Source:** Real on-chain data from Kaiascan API\n`;
            response += `🔗 **Verified:** Contract data from blockchain explorer\n`;
            response += `\n💡 **Recommendation:** Consider ${farms[0].name} for the best APY (${farms[0].onChainData?.apy || '0.00'}%).`;
            
            return res.status(200).json({
              response: response,
              success: true,
              farmingData: { 
                opportunities: farms, 
                network: network,
                isReal: true,
                source: 'Kaiascan API'
              }
            });
          } else {
            // Fallback to mock data if no real farms found
            const mockFarms = [
              {
                name: 'KaiaFarm KAIA-MOCK',
                type: 'Single Asset Staking',
                apy: '25.5',
                totalStaked: '150000',
                rewardRate: '35.2',
                isActive: true
              }
            ];

            let response = `🌾 **Yield Farming Opportunities - ${network}**\n\n`;
            
            mockFarms.forEach((farm, index) => {
              response += `**${index + 1}. ${farm.name} (Demo)**\n` +
                `• **Type:** ${farm.type}\n` +
                `• **APY:** ${farm.apy}%\n` +
                `• **Total Staked:** ${farm.totalStaked} tokens\n` +
                `• **Reward Rate:** ${farm.rewardRate} KAIA/day\n` +
                `• **Status:** ${farm.isActive ? '🟢 Active' : '🔴 Inactive'}\n\n`;
            });
            
            response += `🧪 **${mockFarms.length} demo farm(s) for testing**\n`;
            response += `\n💡 **Recommendation:** Consider ${mockFarms[0].name} for the best APY (${mockFarms[0].apy}%).`;
            
            return res.status(200).json({
              response: response,
              success: true,
              farmingData: { opportunities: mockFarms, network: network, isDemo: true }
            });
          }
        } else if (lowerPrompt.includes('position') || lowerPrompt.includes('my') || lowerPrompt.includes('staked')) {
          // Simple mock user positions
          const mockPositions = [
            {
              farmName: 'KaiaFarm KAIA-MOCK',
              stakedAmount: '500.00',
              stakingToken: 'MOCK',
              earnedRewards: '25.50',
              rewardToken: 'KAIA',
              apy: '25.5',
              isActive: true
            }
          ];

          let response = `🌾 **Your Yield Farming Positions - ${network}**\n\n`;
          
          if (mockPositions.length === 0) {
            response += `📭 **No active positions found**\n\nYou don't have any active yield farming positions yet.\n\n💡 **Get started:** Try staking in one of our demo farms!`;
          } else {
            mockPositions.forEach((pos, index) => {
              response += `**${index + 1}. ${pos.farmName}**\n` +
                `• **Staked:** ${pos.stakedAmount} ${pos.stakingToken}\n` +
                `• **Earned:** ${pos.earnedRewards} ${pos.rewardToken}\n` +
                `• **APY:** ${pos.apy}%\n` +
                `• **Status:** ${pos.isActive ? '🟢 Active' : '🔴 Inactive'}\n\n`;
            });
            
            response += `🧪 **Demo Mode:** These are simulated positions for testing\n`;
            response += `\n💡 **Total Value:** ${mockPositions.reduce((sum, pos) => sum + parseFloat(pos.stakedAmount), 0).toFixed(2)} tokens staked`;
          }
          
          return res.status(200).json({
            response: response,
            success: true,
            positions: mockPositions
          });
        }
      } catch (error) {
        console.error('Yield farming error:', error);
        return res.status(200).json({
          response: `❌ **Yield Farming Error**\n\n**Error:** ${error.message}\n\nPlease try again.`,
          success: false,
          error: error.message
        });
      }
    }

    // Default AI response for other queries
    const defaultResponse = `🤖 **Kaia AI Agent Response**\n\nI'm here to help you with Kaia Chain operations! Here are some things I can do:\n\n` +
      `**🔗 Blockchain Queries:**\n` +
      `• Check your KAIA balance\n` +
      `• Get network status\n` +
      `• Look up transactions\n` +
      `• Query contract data\n\n` +
      `**🔄 Token Operations:**\n` +
      `• Swap tokens (e.g., "Swap 10 KAIA for MOCK")\n` +
      `• Transfer tokens (e.g., "Transfer 5 KAIA to 0x...")` +
      `\n\n**🌾 Yield Farming:**\n` +
      `• Show farming opportunities\n` +
      `• Check your positions\n\n` +
      `**📊 Examples:**\n` +
      `• "What's my balance?"\n` +
      `• "Swap 10 KAIA for MOCK"\n` +
      `• "Show yield farming opportunities"\n` +
      `• "Check transaction 0x..."\n\n` +
      `**Network:** ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}`;

    return res.status(200).json({
      response: defaultResponse,
      success: true,
      isDefault: true
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      response: `❌ **Unexpected Error**\n\nSomething went wrong while processing your request:\n\n**Error:** ${error.message}\n\nPlease try again or contact support if the problem persists.`
    });
  }
};

export default rateLimitMiddleware(handler);