/**
 * ScreenshotOne-compatible parameter handling
 * https://screenshotone.com/docs/options/
 */

export interface ScreenshotParams {
  // Required
  url: string;

  // Format
  format: 'png' | 'jpeg' | 'webp' | 'pdf';

  // Viewport
  viewport_width: number;
  viewport_height: number;
  device_scale_factor: number;

  // Capture options
  full_page: boolean;
  selector?: string;

  // Image quality (jpeg/webp only)
  image_quality: number;

  // Timing
  delay: number;

  // Blocking (Phase 2)
  block_ads: boolean;
  block_cookie_banners: boolean;

  // Dark mode
  dark_mode: boolean;

  // Hide elements
  hide_selectors?: string[];

  // Custom headers and cookies
  headers?: Record<string, string>;
  cookies?: CookieParam[];
}

export interface CookieParam {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export const DEFAULT_PARAMS: Omit<ScreenshotParams, 'url'> = {
  format: 'png',
  viewport_width: 1280,
  viewport_height: 1024,
  device_scale_factor: 1,
  full_page: false,
  image_quality: 80,
  delay: 0,
  block_ads: false,
  block_cookie_banners: false,
  dark_mode: false,
};

export function parseParams(query: Record<string, any>): ScreenshotParams {
  const url = query.url;

  if (!url) {
    throw new Error('url parameter is required');
  }

  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL provided');
  }

  return {
    url,
    format: parseFormat(query.format),
    viewport_width: parseInt(query.viewport_width) || DEFAULT_PARAMS.viewport_width,
    viewport_height: parseInt(query.viewport_height) || DEFAULT_PARAMS.viewport_height,
    device_scale_factor: parseFloat(query.device_scale_factor) || DEFAULT_PARAMS.device_scale_factor,
    full_page: parseBoolean(query.full_page, DEFAULT_PARAMS.full_page),
    selector: query.selector || undefined,
    image_quality: parseInt(query.image_quality) || DEFAULT_PARAMS.image_quality,
    delay: parseInt(query.delay) || DEFAULT_PARAMS.delay,
    block_ads: parseBoolean(query.block_ads, DEFAULT_PARAMS.block_ads),
    block_cookie_banners: parseBoolean(query.block_cookie_banners, DEFAULT_PARAMS.block_cookie_banners),
    dark_mode: parseBoolean(query.dark_mode, DEFAULT_PARAMS.dark_mode),
    hide_selectors: parseHideSelectors(query.hide_selectors),
    headers: parseHeaders(query.headers),
    cookies: parseCookies(query.cookies),
  };
}

function parseHideSelectors(value?: string | string[]): string[] | undefined {
  if (!value) return undefined;
  // Support array (JSON body) or comma-separated string (query string)
  const raw = Array.isArray(value) ? value : value.split(',');
  const selectors = raw.map(s => String(s).trim()).filter(Boolean);
  return selectors.length > 0 ? selectors : undefined;
}

function parseFormat(format?: string): ScreenshotParams['format'] {
  const validFormats = ['png', 'jpeg', 'webp', 'pdf'];
  if (format && validFormats.includes(format)) {
    return format as ScreenshotParams['format'];
  }
  return DEFAULT_PARAMS.format;
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
}

// Headers that must not be overridden for security reasons
const BLOCKED_HEADERS = new Set([
  'host',
  'content-length',
  'transfer-encoding',
  'connection',
  'upgrade',
]);

function parseHeaders(value?: string | Record<string, string>): Record<string, string> | undefined {
  if (!value) return undefined;

  let headers: Record<string, string>;
  if (typeof value === 'string') {
    try {
      headers = JSON.parse(value);
    } catch {
      throw new Error('Invalid headers: must be a JSON object');
    }
  } else if (typeof value === 'object' && !Array.isArray(value)) {
    headers = value;
  } else {
    throw new Error('Invalid headers: must be a JSON object');
  }

  // Validate all values are strings and check blocked headers
  for (const [key, val] of Object.entries(headers)) {
    if (typeof val !== 'string') {
      throw new Error(`Invalid header value for "${key}": must be a string`);
    }
    if (BLOCKED_HEADERS.has(key.toLowerCase())) {
      throw new Error(`Header "${key}" cannot be overridden`);
    }
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
}

function parseCookies(value?: string | CookieParam[]): CookieParam[] | undefined {
  if (!value) return undefined;

  let cookies: CookieParam[];
  if (typeof value === 'string') {
    try {
      cookies = JSON.parse(value);
    } catch {
      throw new Error('Invalid cookies: must be a JSON array of cookie objects');
    }
  } else if (Array.isArray(value)) {
    cookies = value;
  } else {
    throw new Error('Invalid cookies: must be a JSON array of cookie objects');
  }

  if (!Array.isArray(cookies)) {
    throw new Error('Invalid cookies: must be a JSON array of cookie objects');
  }

  for (const cookie of cookies) {
    if (!cookie.name || typeof cookie.name !== 'string') {
      throw new Error('Each cookie must have a "name" string');
    }
    if (cookie.value === undefined || typeof cookie.value !== 'string') {
      throw new Error('Each cookie must have a "value" string');
    }
    if (cookie.domain !== undefined && typeof cookie.domain !== 'string') {
      throw new Error(`Invalid domain for cookie "${cookie.name}": must be a string`);
    }
    if (cookie.path !== undefined && typeof cookie.path !== 'string') {
      throw new Error(`Invalid path for cookie "${cookie.name}": must be a string`);
    }
  }

  return cookies.length > 0 ? cookies : undefined;
}
