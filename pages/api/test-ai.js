import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Check if Google AI API key is available
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('GOOGLE_GENERATIVE_AI_API_KEY is not set');
    return res.status(500).json({
      error: 'AI service configuration error',
      details: 'Google AI API key is not configured',
      success: false,
    });
  }

  try {
    console.log('Testing AI with prompt:', prompt);
    console.log('API Key available:', !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const model = google('gemini-1.5-flash');
    
    const result = await generateText({
      model,
      prompt: `You are a helpful AI assistant. Please respond to this user query: ${prompt}`,
      maxSteps: 1,
      temperature: 0.7,
    });

    console.log('AI test response generated successfully');

    return res.status(200).json({
      response: result.text,
      success: true,
    });

  } catch (error) {
    console.error('AI Test Error:', error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
      success: false,
    });
  }
}