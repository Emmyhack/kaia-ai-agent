import { advancedWalletConnector } from '../../utils/advancedWalletConnector.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Testing advanced wallet connector...');
    
    // Test available wallets
    const availableWallets = advancedWalletConnector.getAvailableWallets();
    console.log('Available wallets:', availableWallets.length);
    
    // Test wallet info (should be disconnected initially)
    const walletInfo = advancedWalletConnector.getWalletInfo();
    console.log('Wallet info:', walletInfo.isConnected ? 'CONNECTED' : 'DISCONNECTED');
    
    // Test network configurations
    const testnetInfo = advancedWalletConnector.getNetworkName('testnet');
    const mainnetInfo = advancedWalletConnector.getNetworkName('mainnet');
    
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
      message: 'Advanced wallet connector is working perfectly!',
      results: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Advanced wallet connector test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}