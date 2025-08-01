import KaiaDexService from './kaiaDex.js';
import KaiaYieldService from './kaiaYield.js';
import WalletConnector from './walletConnector.js';

// Test utility to verify services work correctly on testnet
export const testServices = {
  // Test DEX service
  async testDexService() {
    console.log('🧪 Testing KaiaDexService...');
    
    try {
      const dexService = new KaiaDexService();
      await dexService.initialize();
      
      // Test available DEXes
      const availableDexes = await dexService.getAvailableDexes('testnet');
      console.log('✅ Available DEXes:', availableDexes);
      
      // Test swap quote
      const quote = await dexService.getSwapQuote(
        'KaiaSwap',
        10,
        '0x0000000000000000000000000000000000000000', // KAIA
        '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690', // MOCK
        'testnet'
      );
      console.log('✅ Swap quote:', quote.success ? 'SUCCESS' : 'FAILED');
      
      // Test best quote
      const bestQuote = await dexService.getBestSwapQuote(
        10,
        '0x0000000000000000000000000000000000000000', // KAIA
        '0x8C82fa4dc47a9bf5034Bb38815c843B75EF76690', // MOCK
        'testnet'
      );
      console.log('✅ Best quote:', bestQuote.success ? 'SUCCESS' : 'FAILED');
      
      return { success: true, message: 'DEX service tests passed' };
    } catch (error) {
      console.error('❌ DEX service test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test Yield service
  async testYieldService() {
    console.log('🧪 Testing KaiaYieldService...');
    
    try {
      const yieldService = new KaiaYieldService();
      await yieldService.initialize();
      
      // Test yield farming opportunities
      const opportunities = await yieldService.getYieldFarmingOpportunities('testnet');
      console.log('✅ Yield opportunities:', opportunities.success ? 'SUCCESS' : 'FAILED');
      
      // Test user positions (with mock address)
      const positions = await yieldService.getUserYieldPositions(
        '0x8Ff09c0a34184c35F86F5229d91280DfB523B59A',
        'testnet'
      );
      console.log('✅ User positions:', positions.success ? 'SUCCESS' : 'FAILED');
      
      // Test yield analytics
      const analytics = await yieldService.getYieldAnalytics('testnet');
      console.log('✅ Yield analytics:', analytics.success ? 'SUCCESS' : 'FAILED');
      
      return { success: true, message: 'Yield service tests passed' };
    } catch (error) {
      console.error('❌ Yield service test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Test Wallet Connector
  async testWalletConnector() {
    console.log('🧪 Testing WalletConnector...');
    
    try {
      const walletConnector = new WalletConnector();
      
      // Test available wallets
      const availableWallets = walletConnector.getAvailableWallets();
      console.log('✅ Available wallets:', availableWallets.length);
      
      // Test wallet info (should be disconnected initially)
      const walletInfo = walletConnector.getWalletInfo();
      console.log('✅ Wallet info:', walletInfo.isConnected ? 'CONNECTED' : 'DISCONNECTED');
      
      return { success: true, message: 'Wallet connector tests passed' };
    } catch (error) {
      console.error('❌ Wallet connector test failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting service tests...\n');
    
    const results = {
      dex: await this.testDexService(),
      yield: await this.testYieldService(),
      wallet: await this.testWalletConnector()
    };
    
    console.log('\n📊 Test Results:');
    console.log('DEX Service:', results.dex.success ? '✅ PASS' : '❌ FAIL');
    console.log('Yield Service:', results.yield.success ? '✅ PASS' : '❌ FAIL');
    console.log('Wallet Connector:', results.wallet.success ? '✅ PASS' : '❌ FAIL');
    
    const allPassed = results.dex.success && results.yield.success && results.wallet.success;
    
    if (allPassed) {
      console.log('\n🎉 All tests passed! Services are ready for testnet use.');
    } else {
      console.log('\n⚠️ Some tests failed. Check the errors above.');
    }
    
    return {
      success: allPassed,
      results: results
    };
  }
};

// Export for use in API testing
export default testServices;