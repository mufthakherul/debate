import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Virtual Debating Club API is running' });
});

// Socket.io placeholder for real-time debate features
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-debate', (debateId: string) => {
    socket.join(`debate-${debateId}`);
    console.log(`Socket ${socket.id} joined debate ${debateId}`);
  });
  
  socket.on('leave-debate', (debateId: string) => {
    socket.leave(`debate-${debateId}`);
    console.log(`Socket ${socket.id} left debate ${debateId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };
