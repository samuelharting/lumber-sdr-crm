import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes and middleware
import healthRoutes from './routes/health';
import leadRoutes from './routes/leads';
import activityRoutes from './routes/activities';
import leadsAuxRoutes from './routes/leads-aux';
import queueRoutes from './routes/queue';
import { authenticateApiKey } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Apply API key auth to all /api routes except /api/health
app.use('/api', authenticateApiKey);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/leads', leadsAuxRoutes);
app.use('/api/queue', queueRoutes);

// Add CORS handling for web UI bypass
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && ['http://127.0.0.1:5173', 'http://localhost:5173'].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-API-KEY, Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH');
  }
  next();
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;