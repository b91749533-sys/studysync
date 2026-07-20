import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import taskRoutes from './routes/tasks';
import noteRoutes from './routes/notes';
import statsRoutes from './routes/stats';

// Import socket initializer
import { initSockets } from './sockets/socket';

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: '*', // For development purposes. Can be narrowed in production.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Set up API routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Configure WebSockets
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers
initSockets(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`StudySync Server is running on port ${PORT}`);
});
