const Redis = require('ioredis');

const RedisClient = new Redis(process.env.REDIS_URL);
RedisClient.on('error', (err) => console.error('redis:', err.message));

module.exports = { RedisClient };