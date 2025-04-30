import { Server } from 'socket.io';
import { consumeMessages } from './rabbitmq';

export const setupWebSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });

    // Subscribe to campaign updates
    socket.on('subscribe_campaign', (campaignId: string) => {
      socket.join(`campaign_${campaignId}`);
    });

    // Unsubscribe from campaign updates
    socket.on('unsubscribe_campaign', (campaignId: string) => {
      socket.leave(`campaign_${campaignId}`);
    });
  });

  // Setup message consumers with retry logic
  const setupConsumers = () => {
    // Listen for campaign updates from RabbitMQ
    consumeMessages('campaign_updates', (message) => {
      if (message && message.campaignId) {
        io.to(`campaign_${message.campaignId}`).emit('campaign_update', message);
      }
    });

    // Listen for analytics updates
    consumeMessages('campaign_analytics', (message) => {
      if (message && message.campaignId) {
        io.to(`campaign_${message.campaignId}`).emit('analytics_update', message);
      }
    });
  };

  // Initial setup
  setupConsumers();

  // Retry setup every 5 seconds if RabbitMQ is not available
  setInterval(setupConsumers, 5000);
}; 