import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import debatesRoutes from './routes/debates';
import topicsRoutes from './routes/topics';
import scoresRoutes from './routes/scores';
import notificationsRoutes from './routes/notifications';
import streamingRoutes from './routes/streaming';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('combined'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/debates', debatesRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/streaming', streamingRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Virtual Debating Club API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
