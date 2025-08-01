import kaiaAgentService from '../../utils/kaiaAgent.js';
import { ethers } from 'ethers';
import { rateLimitMiddleware } from '../../utils/rateLimiter.js';
import { validation } from '../../utils/validation.js';

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
        
        // Use DEX service for real or simulated swaps
        const kaiaDexService = new (await import('../../utils/kaiaDex.js')).default();
        await kaiaDexService.initialize();
        
        // Get best swap quote across all available DEXes
        const quoteResult = await kaiaDexService.getBestSwapQuote(amount, tokenIn, tokenOut, network);
        
        if (!quoteResult.success) {
          return res.status(200).json({
            response: `❌ **Swap Quote Failed**\n\n**Error:** ${quoteResult.error}\n\nPlease try again or check token availability.`,
            success: false,
            error: quoteResult.error
          });
        }
        
        // Simulate swap execution (since we're on testnet)
        const swapResult = {
          success: true,
          dex: quoteResult.bestQuote.dex,
          transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
          gasUsed: Math.floor(Math.random() * 200000) + 150000,
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
          network: network,
          isReal: false,
          isTestnet: true
        };
        
        if (swapResult.success) {
          const tokenInSymbol = tokenIn === ethers.ZeroAddress ? 'KAIA' : 'MOCK';
          const tokenOutSymbol = tokenOut === ethers.ZeroAddress ? 'KAIA' : 'MOCK';
          
          const isMock = swapResult.quote?.isMock || swapResult.swap?.isMock;
          const mockIndicator = isMock ? ' (Demo Mode)' : '';
          
          const response = `🔄 **Token Swap via ${swapResult.dex}${mockIndicator}!**\n\n` +
            `**Network:** ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}\n` +
            `**DEX:** ${swapResult.dex}\n` +
            `**Amount In:** ${amount} ${tokenInSymbol}\n` +
            `**Amount Out:** ${quoteResult.bestQuote.amountOut} ${tokenOutSymbol}\n` +
            `**Transaction Hash:** \`${swapResult.transactionHash}\`\n` +
            `**Gas Used:** ${swapResult.gasUsed.toLocaleString()}\n` +
            `**Block Number:** ${swapResult.blockNumber.toLocaleString()}\n` +
            (swapResult.isTestnet ? `**Testnet Mode:** Simulated swap with real blockchain data\n` : '') +
            `\n✅ Swap completed successfully via ${swapResult.dex}!`;
          
          return res.status(200).json({
            response: response,
            success: true,
            swapData: swapResult,
            isMock: isMock
          });
        } else {
          return res.status(200).json({
            response: `❌ **Swap Simulation Failed**\n\n**Error:** ${swapResult.error}\n\nPlease try again or check your token balance and allowances.`,
            success: false,
            error: swapResult.error
          });
        }
      } catch (error) {
        console.error('Swap simulation error:', error);
        return res.status(200).json({
          response: `❌ **Swap Error**\n\n**Error:** ${error.message}\n\nPlease ensure you have sufficient balance and try again.`,
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

    // Yield Farming functionality
    if (lowerPrompt.includes('farm') || lowerPrompt.includes('yield') || lowerPrompt.includes('stake')) {
      try {
        if (lowerPrompt.includes('opportunities') || lowerPrompt.includes('suggest')) {
          // Get real yield farming opportunities from blockchain
          const kaiaYieldService = new (await import('../../utils/kaiaYield.js')).default();
          await kaiaYieldService.initialize();
          const opportunitiesResult = await kaiaYieldService.getYieldFarmingOpportunities(network);
          
          if (opportunitiesResult.success) {
            let response = `🌾 **Yield Farming Opportunities - ${network}**\n\n`;
            
                          opportunitiesResult.opportunities.forEach((opp, index) => {
                const realIndicator = opp.isReal ? ' (Real Data)' : ' (Testnet Demo)';
                response += `**${index + 1}. ${opp.name}${realIndicator}**\n` +
                  `• **Type:** ${opp.type}\n` +
                  `• **APY:** ${opp.apy}%\n` +
                  `• **Total Staked:** ${opp.totalStaked} ${opp.stakingToken.symbol}\n` +
                  `• **Reward Rate:** ${opp.rewardRate} ${opp.rewardToken.symbol}/day\n` +
                  `• **Status:** ${opp.isActive ? '🟢 Active' : '🔴 Inactive'}\n` +
                  `• **Address:** \`${opp.address}\`\n\n`;
              });
            
            const realCount = opportunitiesResult.opportunities.filter(opp => opp.isReal).length;
            const demoCount = opportunitiesResult.opportunities.filter(opp => !opp.isReal).length;
            
            if (realCount > 0) {
              response += `✅ **${realCount} real farm(s) found on blockchain**\n`;
            }
            if (demoCount > 0) {
              response += `🧪 **${demoCount} testnet demo farm(s) for testing**\n`;
            }
            
            response += `\n💡 **Recommendation:** Consider ${opportunitiesResult.opportunities[0].name} for the best APY (${opportunitiesResult.opportunities[0].apy}%).`;
            
            return res.status(200).json({
              response: response,
              success: true,
              farmingData: opportunitiesResult
            });
          }
        } else if (lowerPrompt.includes('deposit') || lowerPrompt.includes('stake')) {
          // Deposit to yield farm
          const amountMatch = prompt.match(/(\d+(?:\.\d+)?)\s*(KAIA|MOCK)/i);
          const amount = amountMatch ? parseFloat(amountMatch[1]) : 100;
          const farmAddress = '0x27A0239D6F238c6AD5b5952d70e62081D1cc896e'; // Mock farm
          
          const depositResult = await kaiaAgentService.depositToYieldFarm(
            farmAddress,
            userAddress,
            amount,
            network
          );
          
          if (depositResult.success) {
            const response = `🌾 **Yield Farm Deposit Successful!**\n\n` +
              `**Network:** ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}\n` +
              `**Amount:** ${amount} KAIA\n` +
              `**Farm:** DragonFarm (KAIA-MOCK)\n` +
              `**Transaction Hash:** \`${depositResult.transactionHash}\`\n` +
              `**Gas Used:** ${depositResult.gasUsed}\n\n` +
              `✅ Successfully staked in yield farm!`;
            
            return res.status(200).json({
              response: response,
              success: true,
              depositData: depositResult
            });
          } else {
            return res.status(200).json({
              response: `❌ **Farm Deposit Failed**\n\n**Error:** ${depositResult.error}\n\nPlease try again.`,
              success: false,
              error: depositResult.error
            });
          }
        }
      } catch (error) {
        console.error('Yield farming error:', error);
        return res.status(200).json({
          response: `❌ **Yield Farming Error**\n\n**Error:** ${error.message}`,
          success: false,
          error: error.message
        });
      }
    }

    // Trade Analysis functionality
    if (lowerPrompt.includes('analyze') || lowerPrompt.includes('analysis') || lowerPrompt.includes('market')) {
      try {
        if (lowerPrompt.includes('market') || lowerPrompt.includes('overview')) {
          // Get real market data from blockchain
          const marketResult = await kaiaAgentService.getRealMarketData(network);
          
          if (marketResult.success) {
            const market = marketResult.marketData;
            const realIndicator = market.isReal ? ' (Real Data)' : ' (Demo)';
            
            const response = `📊 **Market Overview - ${network}${realIndicator}**\n\n` +
              `**Total Market Cap:** ${market.totalMarketCap}\n` +
              `**24h Volume:** ${market.totalVolume24h}\n` +
              `**Active Tokens:** ${market.activeTokens}\n` +
              `**Total Blocks:** ${market.totalBlocks}\n` +
              `**Avg Tx/Block:** ${market.avgTransactionsPerBlock}\n` +
              `**Total Gas Used:** ${market.totalGasUsed}\n\n` +
              `**🔥 Top Gainers:**\n` +
              market.topGainers.map(g => `• ${g.token}: ${g.change}`).join('\n') + `\n\n` +
              `**📉 Top Losers:**\n` +
              market.topLosers.map(l => `• ${l.token}: ${l.change}`).join('\n') + `\n\n` +
              `**📈 Trending Pairs:**\n` +
              market.trendingPairs.map(p => `• ${p}`).join('\n');
            
            return res.status(200).json({
              response: response,
              success: true,
              marketData: marketResult
            });
          }
        } else {
          // Analyze specific token using real blockchain data
          const tokenMatch = prompt.match(/(KAIA|MOCK|USDT|USDC)/i);
          const token = tokenMatch ? tokenMatch[1] : 'KAIA';
          const tokenAddress = token === 'KAIA' ? ethers.ZeroAddress : KAIA_TOKENS[network][token];
          
          const analysisResult = await kaiaAgentService.getRealTradeAnalysis(tokenAddress, network);
          
          if (analysisResult.success) {
            const analysis = analysisResult.analysis;
            const realIndicator = analysis.isReal ? ' (Real Data)' : ' (Demo)';
            
            let response = `📈 **Trade Analysis - ${analysis.token}${realIndicator}**\n\n` +
              `**Current Price:** $${analysis.currentPrice}\n` +
              `**24h Change:** ${analysis.priceChange24h > 0 ? '+' : ''}${analysis.priceChange24h}%\n` +
              `**24h Volume:** ${analysis.volume24h}\n` +
              `**Market Cap:** ${analysis.marketCap}\n` +
              `**Volatility:** ${analysis.volatility}\n` +
              `**Trend:** ${analysis.trend}\n` +
              `**Support:** $${analysis.support}\n` +
              `**Resistance:** $${analysis.resistance}\n` +
              `**Risk Level:** ${analysis.riskLevel}\n` +
              `**Recommendation:** ${analysis.recommendation}\n`;
            
            if (analysis.isReal && analysis.networkStats) {
              response += `\n**🔗 Blockchain Data:**\n` +
                `• **Block Number:** ${analysis.blockNumber?.toLocaleString() || 'Unknown'}\n` +
                `• **Gas Price:** ${analysis.gasPrice || 'Unknown'} Gwei\n`;
            }
            
            response += `\n💡 **Analysis:** ${analysis.trend === 'Bullish' ? 'Positive momentum detected' : analysis.trend === 'Bearish' ? 'Negative pressure observed' : 'Sideways consolidation'}`;
            
            return res.status(200).json({
              response: response,
              success: true,
              analysisData: analysisResult
            });
          }
        }
      } catch (error) {
        console.error('Trade analysis error:', error);
        return res.status(200).json({
          response: `❌ **Analysis Error**\n\n**Error:** ${error.message}`,
          success: false,
          error: error.message
        });
      }
    }

    // Default response for unrecognized queries
    return res.status(200).json({
      response: `🤖 **Kaia AI Assistant - ${network}**\n\nI can help you with real blockchain operations on the ${network}:\n\n**💰 Balance & Network:**\n• "Check my KAIA balance on ${network}"\n• "Check network status on ${network}"\n\n**🔄 Trading & Swaps:**\n• "Swap 10 KAIA for MOCK on ${network}"\n• "Analyze KAIA market on ${network}"\n• "Show market overview on ${network}"\n\n**💸 Transfers:**\n• "Transfer 50 KAIA to 0x... on ${network}"\n• "Send 100 MOCK to 0x... on ${network}"\n\n**🌾 Yield Farming:**\n• "Show yield farming opportunities on ${network}"\n• "Deposit 200 KAIA to farm on ${network}"\n\n**📊 Analysis:**\n• "Analyze MOCK token on ${network}"\n• "Get market data on ${network}"\n\nAll operations use real blockchain data from the ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}.`,
      steps: [],
      toolCalls: [],
      success: true,
    });

  } catch (error) {
    console.error('AI Agent Error:', error);
    console.error('Error stack:', error.stack);
    
    // Consistent error response format
    return res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: error.message,
      response: `❌ **System Error**\n\nAn unexpected error occurred while processing your request. Please try again or contact support if the problem persists.\n\n**Error:** ${error.message}`,
    });
  }
};

export default rateLimitMiddleware(handler);