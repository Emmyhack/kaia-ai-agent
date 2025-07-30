export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, userAddress } = req.body;

  return res.status(200).json({
    response: `Test response: You said "${prompt}" and your address is ${userAddress || 'not provided'}`,
    success: true,
    test: true,
  });
}