import { demoSwapService, demoYieldService } from '../../utils/demoServices.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing demo services...');
    
    // Test swap service
    await demoSwapService.initialize();
    const swapQuote = await demoSwapService.getSwapQuote(10, '0x0000000000000000000000000000000000000000', '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690', 'testnet');
    const swapResult = await demoSwapService.executeSwap(10, '0x0000000000000000000000000000000000000000', '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690', '0x8Ff09c0a34184c35F86F5229d91280DfB523B59A', 'testnet');
    
    // Test yield service
    await demoYieldService.initialize();
    const yieldOpportunities = await demoYieldService.getYieldOpportunities('testnet');
    const userPositions = await demoYieldService.getUserPositions('0x8Ff09c0a34184c35F86F5229d91280DfB523B59A', 'testnet');
    
    const results = {
      swap: {
        quote: swapQuote.success ? '✅ PASS' : '❌ FAIL',
        execution: swapResult.success ? '✅ PASS' : '❌ FAIL'
      },
      yield: {
        opportunities: yieldOpportunities.success ? '✅ PASS' : '❌ FAIL',
        positions: userPositions.success ? '✅ PASS' : '❌ FAIL'
      }
    };
    
    const allPassed = swapQuote.success && swapResult.success && yieldOpportunities.success && userPositions.success;
    
    if (allPassed) {
      return res.status(200).json({
        success: true,
        message: 'All demo services are working perfectly!',
        results: results,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Some demo services failed',
        results: results,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Demo service test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}