const Redis = require('ioredis');
const logger = require('./logger');

class RedisClient {
  constructor(url) {
    this.client = new Redis(url, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.client.on('error', (err) => {
      logger.error('Redis connection error', err);
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error', { key, error });
      throw error;
    }
  }

  async set(key, value, ttl) {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET error', { key, error });
      throw error;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error', { key, error });
      throw error;
    }
  }

  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error', { key, error });
      throw error;
    }
  }

  async publish(channel, message) {
    try {
      await this.client.publish(channel, message);
    } catch (error) {
      logger.error('Redis PUBLISH error', { channel, error });
      throw error;
    }
  }

  async subscribe(channel, callback) {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.subscribe(channel);
      subscriber.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message);
        }
      });
    } catch (error) {
      logger.error('Redis SUBSCRIBE error', { channel, error });
      throw error;
    }
  }

  async close() {
    await this.client.quit();
  }
}

module.exports = { RedisClient };