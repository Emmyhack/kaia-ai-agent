export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    const envCheck = {
      googleApiKey: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      kaiaPrivateKey: !!process.env.KAIA_PRIVATE_KEY,
      kaiaRpcUrl: !!process.env.KAIA_RPC_URL,
      kaiascanApiKey: !!process.env.KAIASCAN_API_KEY,
      contractAddress: !!process.env.CONTRACT_ADDRESS,
    };

    return res.status(200).json({
      success: true,
      message: 'API is working',
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}