// In-memory LRU screenshot cache with TTL.
// Keyed by param hash, evicts on size limit or TTL expiry.

import { createHash } from 'crypto';
import type { ScreenshotParams } from './params.js';

interface CacheEntry {
  buffer: Buffer;
  metadata?: Record<string, unknown>;
  contentType: string;
  createdAt: number;
  ttl: number;
}

const MAX_ENTRIES = 200;
const MAX_TOTAL_BYTES = 500 * 1024 * 1024; // 500MB

const cache = new Map<string, CacheEntry>();
let totalBytes = 0;

export function cacheKey(params: ScreenshotParams): string {
  if (params.cache_key) return params.cache_key;
  const significant = {
    url: params.url,
    html: params.html,
    markdown: params.markdown,
    format: params.format,
    viewport_width: params.viewport_width,
    viewport_height: params.viewport_height,
    device_scale_factor: params.device_scale_factor,
    full_page: params.full_page,
    selector: params.selector,
    dark_mode: params.dark_mode,
    image_quality: params.image_quality,
    delay: params.delay,
    scripts: params.scripts,
    styles: params.styles,
    omit_background: params.omit_background,
    image_width: params.image_width,
    image_height: params.image_height,
    block_cookie_banners: params.block_cookie_banners,
    block_ads: params.block_ads,
    block_chats: params.block_chats,
    hide_selectors: params.hide_selectors,
    user_agent: params.user_agent,
    clip_x: params.clip_x,
    clip_y: params.clip_y,
    clip_width: params.clip_width,
    clip_height: params.clip_height,
  };
  return createHash('sha256').update(JSON.stringify(significant)).digest('hex').slice(0, 32);
}

export function cacheGet(key: string): (Omit<CacheEntry, 'createdAt' | 'ttl'>) | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > entry.ttl * 1000) {
    totalBytes -= entry.buffer.length;
    cache.delete(key);
    return null;
  }
  return { buffer: entry.buffer, metadata: entry.metadata, contentType: entry.contentType };
}

export function cacheSet(key: string, value: { buffer: Buffer; metadata?: Record<string, unknown>; contentType: string }, ttl: number): void {
  // Evict if over limits
  while (cache.size >= MAX_ENTRIES || totalBytes + value.buffer.length > MAX_TOTAL_BYTES) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    const entry = cache.get(oldest)!;
    totalBytes -= entry.buffer.length;
    cache.delete(oldest);
  }

  cache.set(key, {
    buffer: value.buffer,
    metadata: value.metadata,
    contentType: value.contentType,
    createdAt: Date.now(),
    ttl,
  });
  totalBytes += value.buffer.length;
}

export function cacheStats(): { entries: number; totalBytes: number } {
  return { entries: cache.size, totalBytes };
}

export function cacheClear(): void {
  cache.clear();
  totalBytes = 0;
}
