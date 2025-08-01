import { kaiascanService } from '../../utils/kaiascanService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { network = 'testnet' } = req.body;

    // Get real trade analysis data from Kaiascan
    const analysisResult = await kaiascanService.getRealTradeAnalysis(network);

    if (analysisResult.success) {
      return res.status(200).json({
        success: true,
        analysis: {
          ...analysisResult.analysis,
          timestamp: new Date().toISOString(),
          network: network,
          source: 'Kaiascan API'
        }
      });
    } else {
      // Fallback to mock data if real data is not available
      const mockAnalysis = {
        marketCap: network === 'testnet' ? 125000000 : 450000000,
        marketCapChange: network === 'testnet' ? 2.5 : -1.8,
        volume24h: network === 'testnet' ? 2500000 : 8200000,
        volumeChange: network === 'testnet' ? 5.2 : -3.1,
        activeAddresses: network === 'testnet' ? 15000 : 45000,
        addressChange: network === 'testnet' ? 8.5 : 12.3,
        transactionCount: network === 'testnet' ? 85000 : 250000,
        transactionChange: network === 'testnet' ? 15.2 : 8.7,
        sentiment: network === 'testnet' 
          ? 'Bullish - Strong buying pressure with increasing volume and active addresses'
          : 'Neutral - Market showing mixed signals with moderate activity',
        recommendation: network === 'testnet'
          ? 'Consider accumulating KAIA tokens as market shows positive momentum'
          : 'Monitor market conditions and consider strategic positions',
        timestamp: new Date().toISOString(),
        network: network,
        source: 'Mock Data (Kaiascan API unavailable)'
      };

      return res.status(200).json({
        success: true,
        analysis: mockAnalysis
      });
    }
  } catch (error) {
    console.error('Trade analysis API error:', error);
    
    // Return mock data on error
    const mockAnalysis = {
      marketCap: 125000000,
      marketCapChange: 2.5,
      volume24h: 2500000,
      volumeChange: 5.2,
      activeAddresses: 15000,
      addressChange: 8.5,
      transactionCount: 85000,
      transactionChange: 15.2,
      sentiment: 'Bullish - Strong buying pressure with increasing volume and active addresses',
      recommendation: 'Consider accumulating KAIA tokens as market shows positive momentum',
      timestamp: new Date().toISOString(),
      network: 'testnet',
      source: 'Mock Data (Error fallback)'
    };

    return res.status(200).json({
      success: true,
      analysis: mockAnalysis
    });
  }
}