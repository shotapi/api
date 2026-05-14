import { describe, it, expect } from 'vitest';
import { ConcurrencyLimiter, QueueFullError } from '../src/limiter.js';

function deferred<T = void>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('ConcurrencyLimiter', () => {
  it('serializes when maxConcurrent=1', async () => {
    const limiter = new ConcurrencyLimiter({ maxConcurrent: 1, maxQueueDepth: 10 });
    const order: string[] = [];
    const a = deferred();
    const b = deferred();

    const p1 = limiter.run(async () => {
      order.push('start-1');
      await a.promise;
      order.push('end-1');
    });
    const p2 = limiter.run(async () => {
      order.push('start-2');
      await b.promise;
      order.push('end-2');
    });

    // Yield to let scheduling settle.
    await new Promise((r) => setImmediate(r));
    expect(order).toEqual(['start-1']);
    expect(limiter.stats.inFlight).toBe(1);
    expect(limiter.stats.queued).toBe(1);

    a.resolve();
    await new Promise((r) => setImmediate(r));
    expect(order).toEqual(['start-1', 'end-1', 'start-2']);

    b.resolve();
    await Promise.all([p1, p2]);
    expect(order).toEqual(['start-1', 'end-1', 'start-2', 'end-2']);
    expect(limiter.stats.inFlight).toBe(0);
    expect(limiter.stats.queued).toBe(0);
  });

  it('allows N tasks to run in parallel at maxConcurrent=N', async () => {
    const limiter = new ConcurrencyLimiter({ maxConcurrent: 3, maxQueueDepth: 10 });
    const gate = deferred();
    let started = 0;

    const tasks = Array.from({ length: 3 }, () =>
      limiter.run(async () => {
        started++;
        await gate.promise;
      })
    );

    await new Promise((r) => setImmediate(r));
    expect(started).toBe(3);
    expect(limiter.stats.inFlight).toBe(3);
    expect(limiter.stats.queued).toBe(0);

    gate.resolve();
    await Promise.all(tasks);
    expect(limiter.stats.inFlight).toBe(0);
  });

  it('queues callers beyond maxConcurrent and drains in order', async () => {
    const limiter = new ConcurrencyLimiter({ maxConcurrent: 2, maxQueueDepth: 10 });
    const gates = [deferred(), deferred(), deferred(), deferred()];
    const order: number[] = [];

    const tasks = gates.map((g, i) =>
      limiter.run(async () => {
        order.push(i);
        await g.promise;
      })
    );

    await new Promise((r) => setImmediate(r));
    expect(order).toEqual([0, 1]);
    expect(limiter.stats.queued).toBe(2);

    gates[0].resolve();
    await new Promise((r) => setImmediate(r));
    expect(order).toEqual([0, 1, 2]);

    gates[1].resolve();
    await new Promise((r) => setImmediate(r));
    expect(order).toEqual([0, 1, 2, 3]);

    gates[2].resolve();
    gates[3].resolve();
    await Promise.all(tasks);
    expect(limiter.stats.inFlight).toBe(0);
    expect(limiter.stats.queued).toBe(0);
  });

  it('rejects with QueueFullError when queue depth exceeded', async () => {
    const limiter = new ConcurrencyLimiter({ maxConcurrent: 1, maxQueueDepth: 2 });
    const blocker = deferred();

    // 1 in-flight + 2 queued = at capacity
    const running = [
      limiter.run(() => blocker.promise),
      limiter.run(() => blocker.promise),
      limiter.run(() => blocker.promise),
    ];

    await new Promise((r) => setImmediate(r));
    expect(limiter.stats.inFlight).toBe(1);
    expect(limiter.stats.queued).toBe(2);

    await expect(limiter.run(async () => 'never')).rejects.toBeInstanceOf(QueueFullError);

    blocker.resolve();
    await Promise.all(running);
  });

  it('releases slot when caller throws', async () => {
    const limiter = new ConcurrencyLimiter({ maxConcurrent: 1, maxQueueDepth: 5 });

    await expect(
      limiter.run(async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(limiter.stats.inFlight).toBe(0);

    // Should be able to run another task right after.
    const result = await limiter.run(async () => 42);
    expect(result).toBe(42);
  });

  it('does not over-admit when slot is handed off to a waiter', async () => {
    const limiter = new ConcurrencyLimiter({ maxConcurrent: 1, maxQueueDepth: 5 });
    const first = deferred();
    let peakInFlight = 0;
    const observe = () => {
      peakInFlight = Math.max(peakInFlight, limiter.stats.inFlight);
    };

    const p1 = limiter.run(async () => {
      observe();
      await first.promise;
      observe();
    });
    const p2 = limiter.run(async () => {
      observe();
    });
    const p3 = limiter.run(async () => {
      observe();
    });

    first.resolve();
    await Promise.all([p1, p2, p3]);
    expect(peakInFlight).toBe(1);
  });

  it('QueueFullError carries a positive retryAfterSeconds', async () => {
    const limiter = new ConcurrencyLimiter({ maxConcurrent: 1, maxQueueDepth: 1 });
    const blocker = deferred();
    const running = [limiter.run(() => blocker.promise), limiter.run(() => blocker.promise)];

    await new Promise((r) => setImmediate(r));

    try {
      await limiter.run(async () => 'never');
      throw new Error('expected QueueFullError');
    } catch (err) {
      expect(err).toBeInstanceOf(QueueFullError);
      expect((err as QueueFullError).retryAfterSeconds).toBeGreaterThan(0);
    }

    blocker.resolve();
    await Promise.all(running);
  });
});
