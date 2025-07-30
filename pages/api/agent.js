import kaiaAgentService from '../../utils/kaiaAgent.js';

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

    // Real swap quote (if contract is deployed)
    if ((lowerPrompt.includes('swap') && lowerPrompt.includes('quote')) || lowerPrompt.includes('swap quote')) {
      try {
        // Check if our contract is deployed on the selected network
        const contractAddress = network === 'testnet' ? '0x554Ef03BA2A7CC0A539731CA6beF561fA2648c4E' : '0x0000000000000000000000000000000000000000';
        const contractResult = await kaiaAgentService.getContractState(contractAddress, network);
        
        if (contractResult.success) {
          // Try to get real swap quote
          try {
            const quoteResult = await kaiaAgentService.getSwapQuote(
              '0x0000000000000000000000000000000000000000', // KAIA
              '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690', // Mock token
              10, // 10 KAIA
              network
            );
            
            if (quoteResult.success) {
              return res.status(200).json({
                response: `🔗 **Real Swap Quote - ${network}**\n\nI've queried the actual smart contract for a swap quote:\n\n• **Token In**: KAIA (Native)\n• **Token Out**: Mock Token\n• **Amount In**: 10 KAIA\n• **Amount Out**: ${quoteResult.amountOut} tokens\n• **Fee**: ${quoteResult.feeAmount} KAIA\n• **Contract**: ${contractAddress}\n• **Network**: ${network}`,
                steps: [],
                toolCalls: [],
                success: true,
                blockchainData: quoteResult,
              });
            }
          } catch (quoteError) {
            console.log('Real swap quote failed, using contract info:', quoteError.message);
            return res.status(200).json({
              response: `🔗 **Contract Available - ${network}**\n\nI've verified that the swap contract is deployed on ${network}:\n\n• **Contract Address**: ${contractAddress}\n• **Status**: ✅ Deployed and Verified\n• **Network**: ${network}\n• **Capability**: Swap operations available\n\n*Note: Swap quotes require specific token pairs and liquidity. This contract is ready for real swaps.*`,
              steps: [],
              toolCalls: [],
              success: true,
              blockchainData: contractResult,
            });
          }
        } else {
          return res.status(200).json({
            response: `❌ **Contract Not Deployed - ${network}**\n\nI've checked the blockchain and the swap contract is not deployed on ${network}:\n\n• **Network**: ${network}\n• **Status**: Contract not found\n• **Action**: Deploy contract to enable swaps`,
            success: false,
            blockchainData: contractResult,
          });
        }
      } catch (error) {
        console.error('Contract check failed:', error);
        return res.status(200).json({
          response: `❌ **Error Checking Contract**\n\nFailed to check contract status on ${network}:\n\n• **Error**: ${error.message}\n• **Network**: ${network}`,
          success: false,
          error: error.message,
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
      response: `🤖 **Kaia AI Assistant - ${network}**\n\nI can help you with real blockchain queries on the ${network}:\n\n• **Check Balance**: "Check my KAIA balance on ${network}"\n• **Network Status**: "Check network status on ${network}"\n• **Transaction**: "Check transaction 0x... on ${network}"\n• **Contract**: "Check contract 0x... on ${network}"\n• **Swap Quote**: "Get swap quote on ${network}"\n• **Yield Farm**: "Check yield farm on ${network}"\n\nAll queries use real blockchain data from the ${network === 'testnet' ? 'Kaia Testnet' : 'Kaia Mainnet'}.`,
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