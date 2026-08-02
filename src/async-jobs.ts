import crypto from 'crypto';
import type { ScreenshotParams } from './params.js';
import { takeScreenshot } from './screenshot.js';
import { screenshotLimiter } from './limiter.js';
import { uploadToStorage } from './storage.js';
import { analyzeWithVision } from './vision.js';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface Job {
  id: string;
  status: JobStatus;
  createdAt: number;
  completedAt?: number;
  result?: {
    screenshot?: string;
    content_type?: string;
    store?: { location: string };
    vision?: { result: string };
    metadata?: Record<string, unknown>;
  };
  error?: string;
}

const jobs = new Map<string, Job>();

const MAX_JOBS = 1000;
const JOB_TTL_MS = 30 * 60 * 1000;

function evictStaleJobs() {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL_MS) {
      jobs.delete(id);
    }
  }
  if (jobs.size > MAX_JOBS) {
    const oldest = [...jobs.entries()]
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .slice(0, jobs.size - MAX_JOBS);
    for (const [id] of oldest) jobs.delete(id);
  }
}

export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

export function createAsyncJob(params: ScreenshotParams): string {
  evictStaleJobs();

  const id = crypto.randomUUID();
  const job: Job = { id, status: 'pending', createdAt: Date.now() };
  jobs.set(id, job);

  processJob(id, params).catch(() => {});

  return id;
}

async function processJob(id: string, params: ScreenshotParams) {
  const job = jobs.get(id);
  if (!job) return;

  job.status = 'processing';

  try {
    const result = await screenshotLimiter.run(() => takeScreenshot(params));
    const contentType = {
      png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp',
      gif: 'image/gif', tiff: 'image/tiff', avif: 'image/avif',
      heif: 'image/heif', pdf: 'application/pdf', html: 'text/html',
      markdown: 'text/markdown',
    }[params.format] || 'application/octet-stream';

    job.result = {
      screenshot: result.buffer.toString('base64'),
      content_type: contentType,
      metadata: result.metadata,
    };

    if (params.store && params.storage_bucket) {
      const upload = await uploadToStorage(result.buffer, params);
      job.result.store = { location: upload.location };
    }

    if (params.openai_api_key) {
      const vision = await analyzeWithVision(result.buffer, params);
      job.result.vision = vision;
    }

    job.status = 'completed';
    job.completedAt = Date.now();

    if (params.webhook_url) {
      await deliverWebhook(params.webhook_url, job);
    }
  } catch (err) {
    job.status = 'failed';
    job.completedAt = Date.now();
    job.error = err instanceof Error ? err.message : 'Unknown error';

    if (params.webhook_errors && params.webhook_url) {
      await deliverWebhook(params.webhook_url, job);
    }
  }
}

async function deliverWebhook(url: string, job: Job) {
  const payload = {
    id: job.id,
    status: job.status,
    ...(job.result || {}),
    ...(job.error ? { error: job.error } : {}),
    completed_at: job.completedAt ? new Date(job.completedAt).toISOString() : undefined,
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      if (res.ok) return;
    } catch {
      // retry
    }
    if (attempt < 2) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
  }
}
