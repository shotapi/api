import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/screenshot.js', () => ({
  takeScreenshot: vi.fn().mockResolvedValue({
    buffer: Buffer.from('fake-png'),
    metadata: { title: 'Test' },
  }),
  getBrowser: vi.fn(),
}));

vi.mock('../src/limiter.js', () => ({
  screenshotLimiter: {
    run: vi.fn((fn: () => Promise<any>) => fn()),
  },
  QueueFullError: class extends Error {},
}));

vi.mock('../src/storage.js', () => ({
  uploadToStorage: vi.fn().mockResolvedValue({ location: 'https://bucket.s3.amazonaws.com/test.png' }),
}));

vi.mock('../src/vision.js', () => ({
  analyzeWithVision: vi.fn().mockResolvedValue({ result: 'A webpage screenshot' }),
}));

import { createAsyncJob, getJob } from '../src/async-jobs.js';
import { DEFAULT_PARAMS, type ScreenshotParams } from '../src/params.js';

function makeParams(overrides: Partial<ScreenshotParams> = {}): ScreenshotParams {
  return {
    ...DEFAULT_PARAMS,
    url: 'https://example.com',
    async: true,
    ...overrides,
  };
}

describe('async-jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a job and returns an ID', () => {
    const id = createAsyncJob(makeParams());
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('job starts as pending', () => {
    const id = createAsyncJob(makeParams());
    const job = getJob(id);
    expect(job).toBeDefined();
    expect(job!.status).toMatch(/pending|processing/);
  });

  it('job completes with screenshot result', async () => {
    const id = createAsyncJob(makeParams());
    // Wait for background processing
    await new Promise(r => setTimeout(r, 100));
    const job = getJob(id);
    expect(job!.status).toBe('completed');
    expect(job!.result).toBeDefined();
    expect(job!.result!.screenshot).toBeDefined();
    expect(job!.result!.content_type).toBe('image/png');
  });

  it('delivers webhook on completion', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }));
    const id = createAsyncJob(makeParams({ webhook_url: 'https://example.com/hook' }));
    await new Promise(r => setTimeout(r, 200));

    const job = getJob(id);
    expect(job!.status).toBe('completed');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://example.com/hook',
      expect.objectContaining({ method: 'POST' }),
    );
    fetchSpy.mockRestore();
  });

  it('returns undefined for unknown job ID', () => {
    expect(getJob('nonexistent')).toBeUndefined();
  });

  it('includes store location when store=true', async () => {
    const id = createAsyncJob(makeParams({
      store: true,
      storage_bucket: 'test',
      storage_access_key_id: 'AK',
      storage_secret_access_key: 'SK',
    }));
    await new Promise(r => setTimeout(r, 100));
    const job = getJob(id);
    expect(job!.result!.store).toEqual({ location: 'https://bucket.s3.amazonaws.com/test.png' });
  });

  it('includes vision result when openai_api_key provided', async () => {
    const id = createAsyncJob(makeParams({ openai_api_key: 'sk-test' }));
    await new Promise(r => setTimeout(r, 100));
    const job = getJob(id);
    expect(job!.result!.vision).toEqual({ result: 'A webpage screenshot' });
  });
});
