import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cron from 'node-cron';

import newsRoutes from './routes/newsRoutes';
import { runAggregatorJob } from './workers/aggregator';

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // HTTP request logger

// Routes
app.use('/api/news', newsRoutes);

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Schedule the Aggregation Worker to run every 30 minutes to stay within the 100/day GNews limit (48 * 2 = 96)
cron.schedule('*/30 * * * *', () => {
  console.log('⏰ Cron triggered: Running Aggregation Job');
  runAggregatorJob();
});

app.listen(port, () => {
  console.log(`[server]: AI News App backend is running at http://localhost:${port}`);
  console.log(`[server]: Cron jobs scheduled. Automatically fetching news every 30 minutes.`);
});
