// Bounded-queue semaphore for screenshot concurrency.
//
// Chromium renders are RAM-heavy (~500MB-1GB each). On a small box, an
// unbounded request fan-out can OOM neighbors. This limiter caps in-flight
// renders to maxConcurrent, queues up to maxQueueDepth waiters, and rejects
// the rest with QueueFullError so the caller can return 503 + Retry-After.

export class QueueFullError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super('Server busy: too many concurrent screenshots');
    this.name = 'QueueFullError';
  }
}

export interface LimiterOptions {
  maxConcurrent: number;
  maxQueueDepth: number;
}

function intFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function defaultOptions(): LimiterOptions {
  return {
    maxConcurrent: intFromEnv('MAX_CONCURRENT_SCREENSHOTS', 2),
    maxQueueDepth: intFromEnv('MAX_QUEUE_DEPTH', 10),
  };
}

type SlotResolver = () => void;

export class ConcurrencyLimiter {
  private inFlight = 0;
  private readonly waiters: SlotResolver[] = [];
  private readonly opts: LimiterOptions;

  constructor(opts?: LimiterOptions) {
    this.opts = opts ?? defaultOptions();
  }

  get stats(): { inFlight: number; queued: number; maxConcurrent: number; maxQueueDepth: number } {
    return {
      inFlight: this.inFlight,
      queued: this.waiters.length,
      maxConcurrent: this.opts.maxConcurrent,
      maxQueueDepth: this.opts.maxQueueDepth,
    };
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private async acquire(): Promise<void> {
    if (this.inFlight < this.opts.maxConcurrent) {
      this.inFlight++;
      return;
    }
    if (this.waiters.length >= this.opts.maxQueueDepth) {
      // Rough ETA: queued count divided by parallelism.
      const retryAfter = Math.max(1, Math.ceil(this.waiters.length / this.opts.maxConcurrent));
      throw new QueueFullError(retryAfter);
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
    // Slot ownership was handed to us by release() — inFlight already incremented.
  }

  private release(): void {
    const next = this.waiters.shift();
    if (next) {
      // Hand the slot directly to the next waiter (no decrement, no race).
      next();
    } else {
      this.inFlight--;
    }
  }
}

export const screenshotLimiter = new ConcurrencyLimiter();
