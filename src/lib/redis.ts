import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient() {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.error("Redis bağlantı hatası:", err.message);
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// ─── Yardımcı fonksiyonlar ──────────────────────────

/** Önbellekten oku, yoksa hesaplayıp kaydet */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Redis bağlantı hatası durumunda devam et
  }

  const data = await fetcher();
  
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch {
    // Redis yazma hatası durumunda sessizce devam et
  }

  return data;
}

/** Belirli bir desene uyan tüm anahtarları sil */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Redis hatası durumunda sessizce devam et
  }
}

export default redis;
