import testServices from '../../utils/testServices.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🧪 Running service tests...');
    
    const testResults = await testServices.runAllTests();
    
    if (testResults.success) {
      return res.status(200).json({
        success: true,
        message: 'All services are working correctly on testnet',
        results: testResults.results,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Some services failed tests',
        results: testResults.results,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Service test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}