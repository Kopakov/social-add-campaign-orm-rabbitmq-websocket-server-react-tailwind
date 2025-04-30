import amqp, { Connection, Channel } from 'amqplib';

let channel: Channel | null = null;
let connection: Connection | null = null;

const connect = async () => {
  try {
    connection = await amqp.connect('amqp://127.0.0.1:5672');
    channel = await connection.createChannel();
    
    // Create queues
    await channel.assertQueue('campaign_updates', { durable: true });
    await channel.assertQueue('campaign_analytics', { durable: true });
    
    console.log('RabbitMQ connected successfully');

    // Handle connection close
    connection.on('close', () => {
      console.log('RabbitMQ connection closed. Attempting to reconnect...');
      setTimeout(connect, 5000);
    });

    return true;
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connect, 5000);
    return false;
  }
};

export const setupRabbitMQ = async () => {
  await connect();
};

export const publishMessage = async (queue: string, message: any) => {
  if (!channel) {
    console.error('RabbitMQ channel not available');
    return;
  }

  try {
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  } catch (error) {
    console.error('RabbitMQ publish error:', error);
  }
};

export const consumeMessages = async (queue: string, callback: (message: any) => void) => {
  if (!channel) {
    console.error('RabbitMQ channel not available');
    return;
  }

  try {
    await channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('RabbitMQ consume error:', error);
  }
}; 