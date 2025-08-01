import { kaiascanService } from '../../utils/kaiascanService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { network = 'testnet' } = req.body;

    // Get real token prices data from Kaiascan
    const marketResult = await kaiascanService.getRealMarketData(network);

    if (marketResult.success && marketResult.tokens && marketResult.tokens.length > 0) {
      return res.status(200).json({
        success: true,
        tokens: marketResult.tokens.map(token => ({
          ...token,
          network: network,
          source: 'Kaiascan API'
        }))
      });
    } else {
      // Fallback to mock data if real data is not available
      const mockTokens = [
        {
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'KAIA',
          name: 'Kaia Token',
          price: network === 'testnet' ? 0.85 : 1.25,
          priceChange24h: network === 'testnet' ? 2.5 : -1.8,
          marketCap: network === 'testnet' ? 125000000 : 450000000,
          volume24h: network === 'testnet' ? 2500000 : 8200000,
          decimals: 18,
          totalSupply: network === 'testnet' ? '147058823529' : '360000000000',
          network: network,
          source: 'Mock Data (Kaiascan API unavailable)'
        },
        {
          address: '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690',
          symbol: 'MOCK',
          name: 'Mock Token',
          price: network === 'testnet' ? 0.12 : 0.18,
          priceChange24h: network === 'testnet' ? 12.5 : 8.2,
          marketCap: network === 'testnet' ? 15000000 : 25000000,
          volume24h: network === 'testnet' ? 450000 : 1200000,
          decimals: 18,
          totalSupply: '125000000000',
          network: network,
          source: 'Mock Data (Kaiascan API unavailable)'
        },
        {
          address: '0x0000000000000000000000000000000000000001',
          symbol: 'USDT',
          name: 'Tether USD',
          price: 1.00,
          priceChange24h: 0.1,
          marketCap: network === 'testnet' ? 5000000 : 15000000,
          volume24h: network === 'testnet' ? 800000 : 2500000,
          decimals: 6,
          totalSupply: network === 'testnet' ? '5000000' : '15000000',
          network: network,
          source: 'Mock Data (Kaiascan API unavailable)'
        },
        {
          address: '0x0000000000000000000000000000000000000002',
          symbol: 'USDC',
          name: 'USD Coin',
          price: 1.00,
          priceChange24h: 0.05,
          marketCap: network === 'testnet' ? 3000000 : 10000000,
          volume24h: network === 'testnet' ? 600000 : 1800000,
          decimals: 6,
          totalSupply: network === 'testnet' ? '3000000' : '10000000',
          network: network,
          source: 'Mock Data (Kaiascan API unavailable)'
        }
      ];

      return res.status(200).json({
        success: true,
        tokens: mockTokens
      });
    }
  } catch (error) {
    console.error('Token prices API error:', error);
    
    // Return mock data on error
    const mockTokens = [
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
        source: 'Mock Data (Error fallback)'
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
        source: 'Mock Data (Error fallback)'
      }
    ];

    return res.status(200).json({
      success: true,
      tokens: mockTokens
    });
  }
}