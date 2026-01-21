const Redis = require("ioredis");
const fs = require("fs");
const path = require("path");

class StorageService {
  constructor() {
    this.redis = null;
    this.inMemoryStore = new Map();
    this.useRedis = false;
    this.storageFile = path.join(__dirname, '../../data/storage.json');

    // Ensure data directory exists
    const dataDir = path.dirname(this.storageFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Load from file on startup
    this.loadFromFile();

    if (process.env.REDIS_URL) {
      this.redis = new Redis(process.env.REDIS_URL);
      this.useRedis = true;
      this.redis.on("error", (err) => {
        console.warn("Redis connection refused, falling back to file storage:", err.message);
        this.useRedis = false;
        this.redis = null;
      });
    }
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const data = JSON.parse(fs.readFileSync(this.storageFile, 'utf8'));
        this.inMemoryStore = new Map(Object.entries(data));
        console.log(`[Storage] Loaded ${this.inMemoryStore.size} items from file`);
      }
    } catch (err) {
      console.warn('[Storage] Failed to load from file:', err.message);
    }
  }

  saveToFile() {
    try {
      const data = Object.fromEntries(this.inMemoryStore);
      fs.writeFileSync(this.storageFile, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('[Storage] Failed to save to file:', err.message);
    }
  }

  async set(key, value) {
    if (this.useRedis && this.redis) {
      return this.redis.set(key, JSON.stringify(value));
    }
    this.inMemoryStore.set(key, value);
    this.saveToFile(); // Persist to file
    console.log(`[Storage] SET: ${key} (size: ${typeof value === 'string' ? value.length : 'N/A'} chars)`);
    return "OK";
  }

  async get(key) {
    if (this.useRedis && this.redis) {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    }
    const value = this.inMemoryStore.get(key) || null;
    console.log(`[Storage] GET: ${key} (found: ${value ? 'YES' : 'NO'})`);
    return value;
  }

  async del(key) {
    if (this.useRedis && this.redis) {
      return this.redis.del(key);
    }
    this.inMemoryStore.delete(key);
    this.saveToFile(); // Persist to file
    return 1;
  }
}

module.exports = new StorageService();
