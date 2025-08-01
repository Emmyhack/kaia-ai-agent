import { kaiascanService } from '../../utils/kaiascanService.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing Kaiascan service...');
    
    const network = req.query.network || 'testnet';
    
    // Test yield farming data
    const farmingResult = await kaiascanService.getRealYieldFarmingData(network);
    console.log('Farming data result:', farmingResult.success ? 'SUCCESS' : 'FAILED');
    
    // Test contract data
    const contractResult = await kaiascanService.getContractData('0x27A0239D6F238c6AD5b5952d70e62081D1cc896e', network);
    console.log('Contract data result:', contractResult.success ? 'SUCCESS' : 'FAILED');
    
    // Test token info
    const tokenResult = await kaiascanService.getTokenInfo('0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690', network);
    console.log('Token info result:', tokenResult.success ? 'SUCCESS' : 'FAILED');
    
    const results = {
      network: network,
      farmingData: {
        success: farmingResult.success,
        opportunities: farmingResult.success ? farmingResult.opportunities.length : 0,
        error: farmingResult.error || null
      },
      contractData: {
        success: contractResult.success,
        verified: contractResult.success ? contractResult.data?.verified : false,
        error: contractResult.error || null
      },
      tokenInfo: {
        success: tokenResult.success,
        symbol: tokenResult.success ? tokenResult.token?.symbol : null,
        error: tokenResult.error || null
      }
    };
    
    return res.status(200).json({
      success: true,
      message: 'Kaiascan service test completed!',
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Kaiascan service test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}