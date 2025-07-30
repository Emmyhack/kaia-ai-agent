import kaiaAgentService from '../../utils/kaiaAgent.js';

// Mock AI responses for demo purposes
const mockResponses = {
  balance: "I can help you check your balance! For the demo, I'll show you a mock balance. Your KAIA balance would be checked using the blockchain. In a real scenario, this would query the actual blockchain for your token balances.",
  
  swap: "I can help you swap tokens! For the demo, I'll simulate a token swap. This would involve calling the swap contract on the Kaia blockchain. The demo uses mock contracts for testing purposes.",
  
  send: "I can help you send tokens! For the demo, I'll simulate sending tokens to another address. This would create a transaction on the Kaia blockchain.",
  
  farm: "I can help you with yield farming! For the demo, I'll show you mock yield farm information. This would involve interacting with yield farm contracts on the Kaia blockchain.",
  
  default: "I'm your Kaia AI Assistant! I can help you with blockchain operations like checking balances, swapping tokens, sending tokens, and yield farming. For the demo, I use mock contracts to simulate these operations."
};

// Function to determine response based on user input
function getMockResponse(prompt, userAddress) {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('balance') || lowerPrompt.includes('check')) {
    return mockResponses.balance;
  } else if (lowerPrompt.includes('swap') || lowerPrompt.includes('trade')) {
    return mockResponses.swap;
  } else if (lowerPrompt.includes('send') || lowerPrompt.includes('transfer')) {
    return mockResponses.send;
  } else if (lowerPrompt.includes('farm') || lowerPrompt.includes('yield')) {
    return mockResponses.farm;
  } else {
    return mockResponses.default;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, userAddress } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log('Processing request:', { prompt, userAddress });

    // Generate mock response
    const response = getMockResponse(prompt, userAddress);

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