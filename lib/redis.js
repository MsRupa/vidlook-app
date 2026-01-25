import { Redis } from '@upstash/redis';

let redis = null;

export function getRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export async function getCachedData(key) {
  try {
    const redisClient = getRedis();
    if (!redisClient) return null;
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCachedData(key, data, ttlSeconds = 3600) {
  try {
    const redisClient = getRedis();
    if (!redisClient) return false;
    await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function invalidateCache(key) {
  try {
    const redisClient = getRedis();
    if (!redisClient) return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}
