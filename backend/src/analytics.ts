export type EventParams = Record<string, string | number>;

export interface Analytics {
  track(name: string, params?: EventParams): void;
  flush(): Promise<void>;
  close(): Promise<void>;
}

export const noopAnalytics: Analytics = { track() {}, flush: async () => {}, close: async () => {} };

interface Options {
  measurementId?: string;
  apiSecret?: string;
  fetchFn?: typeof fetch;
  flushMs?: number;
  timeoutMs?: number;
  maxQueue?: number;
  log?: (msg: string) => void;
}

const BATCH = 25; // Measurement Protocol limit per request

// Events are anonymous: a constant client_id, no user data.
export function createAnalytics(o: Options): Analytics {
  if (!o.measurementId || !o.apiSecret) return noopAnalytics;
  const { measurementId, apiSecret } = o;
  const fetchFn = o.fetchFn ?? fetch;
  const maxQueue = o.maxQueue ?? 1000;
  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;
  let queue: { name: string; params: EventParams }[] = [];

  async function flush() {
    while (queue.length) {
      const events = queue.splice(0, BATCH);
      try {
        await fetchFn(url, {
          method: "POST",
          body: JSON.stringify({ client_id: "apimocker-server", events }),
          signal: AbortSignal.timeout(o.timeoutMs ?? 3000),
        });
      } catch (e) {
        o.log?.(`analytics delivery failed: ${(e as Error).message}`);
      }
    }
  }

  const timer = setInterval(() => void flush(), o.flushMs ?? 10_000);
  timer.unref();

  return {
    track(name, params = {}) {
      if (queue.length >= maxQueue) queue.shift();
      queue.push({ name, params });
    },
    flush,
    async close() {
      clearInterval(timer);
      await flush();
    },
  };
}
