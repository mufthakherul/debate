import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import authRoutes from './routes/auth';
import debatesRoutes from './routes/debates';
import topicsRoutes from './routes/topics';
import scoresRoutes from './routes/scores';
import notificationsRoutes from './routes/notifications';
import streamingRoutes from './routes/streaming';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

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

// Socket.io placeholder for real-time debate features
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-debate', (debateId: string) => {
    socket.join(`debate-${debateId}`);
    logger.debug(`Socket ${socket.id} joined debate ${debateId}`);
  });
  
  socket.on('leave-debate', (debateId: string) => {
    socket.leave(`debate-${debateId}`);
    logger.debug(`Socket ${socket.id} left debate ${debateId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});

export { io };
