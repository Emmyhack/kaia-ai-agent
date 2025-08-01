import { simpleWalletConnector } from '../../utils/simpleWalletConnector.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing simple wallet connector...');
    
    // Test available wallets
    const availableWallets = simpleWalletConnector.getAvailableWallets();
    console.log('Available wallets:', availableWallets.length);
    
    // Test wallet info (should be disconnected initially)
    const walletInfo = simpleWalletConnector.getWalletInfo();
    console.log('Wallet info:', walletInfo.isConnected ? 'CONNECTED' : 'DISCONNECTED');
    
    // Test network configurations
    const testnetInfo = simpleWalletConnector.getNetworkName('testnet');
    const mainnetInfo = simpleWalletConnector.getNetworkName('mainnet');
    
    const results = {
      availableWallets: availableWallets.length,
      walletStatus: walletInfo.isConnected ? 'CONNECTED' : 'DISCONNECTED',
      networkSupport: {
        testnet: testnetInfo,
        mainnet: mainnetInfo
      },
      supportedWallets: availableWallets.map(w => ({
        name: w.name,
        available: w.isAvailable
      }))
    };
    
    return res.status(200).json({
      success: true,
      message: 'Simple wallet connector is working perfectly!',
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Simple wallet connector test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}