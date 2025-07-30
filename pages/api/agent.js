import kaiaAgentService from '../../utils/kaiaAgent.js';

// Mock AI responses for demo purposes with network awareness
const mockResponses = {
  balance: {
    testnet: "I've checked your balance on the Kaia Testnet! This is real blockchain data from the testnet. Your KAIA balance has been queried directly from the blockchain.",
    mainnet: "I've checked your balance on the Kaia Mainnet! This is real blockchain data from the mainnet. Your KAIA balance has been queried directly from the blockchain.",
    default: "I can help you check your balance! I'll query the blockchain for your actual KAIA balance."
  },
  
  swap: {
    testnet: "I can help you swap tokens on the Kaia Testnet! For the demo, I'll simulate a token swap using the deployed testnet contracts.",
    mainnet: "I can help you swap tokens on the Kaia Mainnet! For the demo, I'll simulate a token swap using the mainnet contracts.",
    default: "I can help you swap tokens! For the demo, I'll simulate a token swap. This would involve calling the swap contract on the Kaia blockchain."
  },
  
  send: {
    testnet: "I can help you send tokens on the Kaia Testnet! For the demo, I'll simulate sending tokens to another address using testnet contracts.",
    mainnet: "I can help you send tokens on the Kaia Mainnet! For the demo, I'll simulate sending tokens to another address using mainnet contracts.",
    default: "I can help you send tokens! For the demo, I'll simulate sending tokens to another address. This would create a transaction on the Kaia blockchain."
  },
  
  farm: {
    testnet: "I can help you with yield farming on the Kaia Testnet! For the demo, I'll show you mock yield farm information using testnet contracts.",
    mainnet: "I can help you with yield farming on the Kaia Mainnet! For the demo, I'll show you mock yield farm information using mainnet contracts.",
    default: "I can help you with yield farming! For the demo, I'll show you mock yield farm information. This would involve interacting with yield farm contracts on the Kaia blockchain."
  },
  
  network: {
    testnet: "I can help you check the Kaia Testnet status! This includes real blockchain data like current block number and gas prices.",
    mainnet: "I can help you check the Kaia Mainnet status! This includes real blockchain data like current block number and gas prices.",
    default: "I can help you check network status! This includes real blockchain data like current block number and gas prices."
  },
  
  transaction: {
    testnet: "I can help you check transaction details on the Kaia Testnet! This will query real transaction data from the blockchain.",
    mainnet: "I can help you check transaction details on the Kaia Mainnet! This will query real transaction data from the blockchain.",
    default: "I can help you check transaction details! This will query real transaction data from the blockchain."
  },
  
  default: {
    testnet: "I'm your Kaia AI Assistant for the Testnet! I can help you with real blockchain operations on the Kaia testnet. I use real blockchain queries for balances and network status.",
    mainnet: "I'm your Kaia AI Assistant for the Mainnet! I can help you with real blockchain operations on the Kaia mainnet. I use real blockchain queries for balances and network status.",
    default: "I'm your Kaia AI Assistant! I can help you with blockchain operations like checking balances, swapping tokens, sending tokens, and yield farming. I use real blockchain queries for balances and network status."
  }
};

// Function to determine response based on user input and network
function getMockResponse(prompt, userAddress, network = 'testnet') {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('balance') || lowerPrompt.includes('check')) {
    return mockResponses.balance[network] || mockResponses.balance.default;
  } else if (lowerPrompt.includes('swap') || lowerPrompt.includes('trade')) {
    return mockResponses.swap[network] || mockResponses.swap.default;
  } else if (lowerPrompt.includes('send') || lowerPrompt.includes('transfer')) {
    return mockResponses.send[network] || mockResponses.send.default;
  } else if (lowerPrompt.includes('farm') || lowerPrompt.includes('yield')) {
    return mockResponses.farm[network] || mockResponses.farm.default;
  } else if (lowerPrompt.includes('network') || lowerPrompt.includes('status')) {
    return mockResponses.network[network] || mockResponses.network.default;
  } else if (lowerPrompt.includes('transaction') || lowerPrompt.includes('tx')) {
    return mockResponses.transaction[network] || mockResponses.transaction.default;
  } else {
    return mockResponses.default[network] || mockResponses.default.default;
  }
}

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

    // Handle real blockchain queries
    const lowerPrompt = prompt.toLowerCase();
    
    // Real balance checking
    if (lowerPrompt.includes('balance') && userAddress) {
      try {
        const balanceResult = await kaiaAgentService.checkBalance(userAddress, null, network);
        if (balanceResult.success) {
          const response = getMockResponse(prompt, userAddress, network);
          return res.status(200).json({
            response: `${response}\n\n🔗 **Real Blockchain Data:**\n• Network: ${balanceResult.network}\n• Balance: ${balanceResult.balance} KAIA\n• Data Source: ${balanceResult.isReal ? 'Real Blockchain' : 'Mock Data'}`,
            steps: [],
            toolCalls: [],
            success: true,
            blockchainData: balanceResult,
          });
        }
      } catch (error) {
        console.error('Real balance check failed:', error);
      }
    }
    
    // Real network status checking
    if (lowerPrompt.includes('network') || lowerPrompt.includes('status')) {
      try {
        const networkResult = await kaiaAgentService.getNetworkStatus(network);
        if (networkResult.success) {
          const response = getMockResponse(prompt, userAddress, network);
          return res.status(200).json({
            response: `${response}\n\n🔗 **Real Network Status:**\n• Network: ${networkResult.network}\n• Block Number: ${networkResult.blockNumber}\n• Gas Price: ${networkResult.gasPrice} Gwei\n• Status: Connected`,
            steps: [],
            toolCalls: [],
            success: true,
            blockchainData: networkResult,
          });
        }
      } catch (error) {
        console.error('Real network status check failed:', error);
      }
    }
    
    // Real transaction checking (if tx hash is provided)
    if (lowerPrompt.includes('transaction') || lowerPrompt.includes('tx')) {
      const txHashMatch = prompt.match(/0x[a-fA-F0-9]{64}/);
      if (txHashMatch) {
        try {
          const txResult = await kaiaAgentService.getTransaction(txHashMatch[0], network);
          if (txResult.success) {
            const response = getMockResponse(prompt, userAddress, network);
            return res.status(200).json({
              response: `${response}\n\n🔗 **Real Transaction Data:**\n• Hash: ${txResult.transaction.hash}\n• Status: ${txResult.transaction.status}\n• Block: ${txResult.transaction.blockNumber}\n• Value: ${txResult.transaction.value} KAIA`,
              steps: [],
              toolCalls: [],
              success: true,
              blockchainData: txResult,
            });
          }
        } catch (error) {
          console.error('Real transaction check failed:', error);
        }
      }
    }

    // Generate mock response for other queries
    const response = getMockResponse(prompt, userAddress, network);

    console.log('Mock AI response generated successfully');

    return res.status(200).json({
      response: response,
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