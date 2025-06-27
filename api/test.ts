mport { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Test environment variables
    const mongoUri = process.env.MONGODB_URI;
    
    res.status(200).json({ 
      success: true,
      hasMongoUri: !!mongoUri,
      mongoUriPrefix: mongoUri ? mongoUri.substring(0, 20) + '...' : 'Not found',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
