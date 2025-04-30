import { createClient } from 'redis';

const redisClient = createClient({
  url: 'redis://localhost:6379'
});

export const setupRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
  }
};

export const getCache = async (key: string) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const setCache = async (key: string, value: any, expirySeconds = 3600) => {
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: expirySeconds
    });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}; 