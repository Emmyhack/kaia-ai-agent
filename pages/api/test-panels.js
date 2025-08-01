export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test trade analysis data
    const tradeAnalysisData = {
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
      source: 'Test Data'
    };

    // Test token prices data
    const tokenPricesData = [
      {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'KAIA',
        name: 'Kaia Token',
        price: 0.85,
        priceChange24h: 2.5,
        marketCap: 125000000,
        volume24h: 2500000,
        decimals: 18,
        totalSupply: '147058823529',
        network: 'testnet',
        source: 'Test Data'
      },
      {
        address: '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690',
        symbol: 'MOCK',
        name: 'Mock Token',
        price: 0.12,
        priceChange24h: 12.5,
        marketCap: 15000000,
        volume24h: 450000,
        decimals: 18,
        totalSupply: '125000000000',
        network: 'testnet',
        source: 'Test Data'
      },
      {
        address: '0x0000000000000000000000000000000000000001',
        symbol: 'USDT',
        name: 'Tether USD',
        price: 1.00,
        priceChange24h: 0.1,
        marketCap: 5000000,
        volume24h: 800000,
        decimals: 6,
        totalSupply: '5000000',
        network: 'testnet',
        source: 'Test Data'
      }
    ];

    return res.status(200).json({
      success: true,
      message: 'Trade Analysis and Token Prices panels are working correctly',
      tradeAnalysis: tradeAnalysisData,
      tokenPrices: tokenPricesData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test panels API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}