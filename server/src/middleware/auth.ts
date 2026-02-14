import { Request, Response, NextFunction } from 'express';

export function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  // Allow health endpoint without key
if (req.originalUrl?.startsWith('/api/health')) {
  return next();
}

  // Allow web UI in development mode
  const origin = req.get('origin');
  const allowedOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173'
  ];

  if (origin && allowedOrigins.includes(origin)) {
    return next();
  }

  // Check API key
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
}