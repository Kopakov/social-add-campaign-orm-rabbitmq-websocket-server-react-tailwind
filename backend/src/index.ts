import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupRedis } from './services/redis';
import { setupRabbitMQ } from './services/rabbitmq';
import { campaignRoutes } from './routes/campaigns';
import { setupWebSocket } from './services/websocket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000"],  // Frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/campaigns', campaignRoutes);

// Initialize services
setupRedis();
setupRabbitMQ();
setupWebSocket(io);

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 