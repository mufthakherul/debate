import { Server } from 'socket.io';
import { createServer } from 'http';
import { config } from './config';
import { logger } from './utils/logger';
import app from './app';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

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
