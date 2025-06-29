const Redis = require('ioredis');
const logger = require('./logger');

class RedisClient {
  constructor(url) {
    this.connected = false;
    this.client = null;
    this.errorLogged = false;
    
    try {
      this.client = new Redis(url, {
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 5000,
        lazyConnect: true,
        maxRetriesPerRequest: 0
      });

      this.client.on('error', (err) => {
        this.connected = false;
        // Only log the first error to avoid spam
        if (!this.errorLogged) {
          logger.error('Redis connection error', err);
          this.errorLogged = true;
        }
      });

      this.client.on('connect', () => {
        this.connected = true;
        this.errorLogged = false;
        logger.info('Connected to Redis');
      });

      this.client.on('close', () => {
        this.connected = false;
      });
    } catch (error) {
      logger.error('Failed to initialize Redis client', error);
      this.connected = false;
    }
  }

  async get(key) {
    if (!this.connected || !this.client) {
      return null;
    }
    
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error', { key, error });
      return null;
    }
  }

  async set(key, value, ttl) {
    if (!this.connected || !this.client) {
      return;
    }
    
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET error', { key, error });
    }
  }

  async del(key) {
    if (!this.connected || !this.client) {
      return;
    }
    
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error', { key, error });
    }
  }

  async exists(key) {
    if (!this.connected || !this.client) {
      return false;
    }
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error', { key, error });
      return false;
    }
  }

  async publish(channel, message) {
    if (!this.connected || !this.client) {
      return;
    }
    
    try {
      await this.client.publish(channel, message);
    } catch (error) {
      logger.error('Redis PUBLISH error', { channel, error });
    }
  }

  async subscribe(channel, callback) {
    if (!this.connected || !this.client) {
      return;
    }
    
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
    }
  }

  async close() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch (error) {
        logger.error('Error closing Redis connection', error);
      }
    }
  }

  isConnected() {
    return this.connected;
  }
}

module.exports = { RedisClient };