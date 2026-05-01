require("dotenv").config();
const Redis = require("ioredis");

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_URL  = process.env.REDIS_URL || null;

const connOpts = REDIS_URL
  ? REDIS_URL
  : { host: REDIS_HOST, port: REDIS_PORT, maxRetriesPerRequest: null, retryStrategy(times) { return Math.min(times * 200, 5000); } };

const redis = new Redis(connOpts);
redis.on("connect", () => console.log(`✓ Redis connected (${REDIS_HOST}:${REDIS_PORT})`));
redis.on("error",   (err) => console.error("✗ Redis error:", err.message));

module.exports = redis;
