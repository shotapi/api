/**
 * ScreenshotOne-compatible parameter handling.
 * Covers ~30 params (Tier 1 + Tier 2) for SDK drop-in compatibility.
 * https://screenshotone.com/docs/options/
 */

// ── Types ──────────────────────────────────────────────────────────

export interface ScreenshotParams {
  // Source (mutually exclusive)
  url?: string;
  html?: string;
  markdown?: string;

  // Format
  format: 'png' | 'jpeg' | 'webp' | 'pdf';
  response_type: 'by_format' | 'json';

  // Viewport
  viewport_width: number;
  viewport_height: number;
  device_scale_factor: number;
  viewport_mobile: boolean;
  viewport_has_touch: boolean;

  // Capture options
  full_page: boolean;
  full_page_scroll: boolean;
  full_page_scroll_delay: number;
  full_page_max_height?: number;
  capture_beyond_viewport: boolean;
  selector?: string;

  // Clip region
  clip_x?: number;
  clip_y?: number;
  clip_width?: number;
  clip_height?: number;

  // Image output
  image_quality: number;
  image_width?: number;
  image_height?: number;
  omit_background: boolean;

  // PDF options
  pdf_print_background: boolean;
  pdf_landscape: boolean;
  pdf_paper_format: string;
  pdf_margin?: string;
  pdf_margin_top?: string;
  pdf_margin_right?: string;
  pdf_margin_bottom?: string;
  pdf_margin_left?: string;

  // Timing
  delay: number;
  timeout: number;
  navigation_timeout: number;
  wait_until: WaitUntilEvent[];
  wait_for_selector?: string;

  // Blocking
  block_ads: boolean;
  block_cookie_banners: boolean;
  block_chats: boolean;
  block_trackers: boolean;
  block_requests: string[];
  block_resources: string[];

  // Emulation
  dark_mode: boolean;
  reduced_motion: boolean;
  media_type?: 'screen' | 'print';

  // Customization
  scripts?: string;
  styles?: string;
  hide_selectors?: string[];
  click?: string;

  // Request options
  user_agent?: string;
  headers?: Record<string, string>;
  cookies?: CookieParam[];
  bypass_csp: boolean;
  ignore_host_errors: boolean;

  // Geolocation
  geolocation_latitude?: number;
  geolocation_longitude?: number;
  geolocation_accuracy?: number;

  // Timezone
  time_zone?: string;

  // Cache
  cache: boolean;
  cache_ttl: number;
  cache_key?: string;
}

export type WaitUntilEvent = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';

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

// ── Defaults ───────────────────────────────────────────────────────

export const DEFAULT_PARAMS: Omit<ScreenshotParams, 'url' | 'html' | 'markdown'> = {
  format: 'png',
  response_type: 'by_format',
  viewport_width: 1280,
  viewport_height: 1024,
  device_scale_factor: 1,
  viewport_mobile: false,
  viewport_has_touch: false,
  full_page: false,
  full_page_scroll: false,
  full_page_scroll_delay: 400,
  capture_beyond_viewport: true,
  image_quality: 80,
  omit_background: false,
  pdf_print_background: false,
  pdf_landscape: false,
  pdf_paper_format: 'letter',
  delay: 0,
  timeout: 60,
  navigation_timeout: 30,
  wait_until: ['load'],
  block_ads: false,
  block_cookie_banners: false,
  block_chats: false,
  block_trackers: false,
  block_requests: [],
  block_resources: [],
  dark_mode: false,
  reduced_motion: false,
  bypass_csp: false,
  ignore_host_errors: false,
  cache: false,
  cache_ttl: 14400,
};

// ── Parsing ────────────────────────────────────────────────────────

export function parseParams(query: Record<string, any>): ScreenshotParams {
  const url = query.url;
  const html = query.html;
  const markdown = query.markdown;

  const sourceCount = [url, html, markdown].filter(Boolean).length;
  if (sourceCount === 0) {
    throw new Error('One of url, html, or markdown parameter is required');
  }
  if (sourceCount > 1) {
    throw new Error('Only one of url, html, or markdown can be specified');
  }

  if (url) {
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid URL provided');
    }
  }

  const format = parseFormat(query.format);

  return {
    url: url || undefined,
    html: html || undefined,
    markdown: markdown || undefined,
    format,
    response_type: parseResponseType(query.response_type),
    viewport_width: clampInt(query.viewport_width, 1, 7680, DEFAULT_PARAMS.viewport_width),
    viewport_height: clampInt(query.viewport_height, 1, 7680, DEFAULT_PARAMS.viewport_height),
    device_scale_factor: clampFloat(query.device_scale_factor, 0.1, 5, DEFAULT_PARAMS.device_scale_factor),
    viewport_mobile: parseBool(query.viewport_mobile, DEFAULT_PARAMS.viewport_mobile),
    viewport_has_touch: parseBool(query.viewport_has_touch, DEFAULT_PARAMS.viewport_has_touch),
    full_page: parseBool(query.full_page, DEFAULT_PARAMS.full_page),
    full_page_scroll: parseBool(query.full_page_scroll, DEFAULT_PARAMS.full_page_scroll),
    full_page_scroll_delay: clampInt(query.full_page_scroll_delay, 100, 5000, DEFAULT_PARAMS.full_page_scroll_delay),
    full_page_max_height: optionalPositiveInt(query.full_page_max_height),
    capture_beyond_viewport: parseBool(query.capture_beyond_viewport, DEFAULT_PARAMS.capture_beyond_viewport),
    selector: query.selector || undefined,
    clip_x: optionalNonNegativeInt(query.clip_x),
    clip_y: optionalNonNegativeInt(query.clip_y),
    clip_width: optionalPositiveInt(query.clip_width),
    clip_height: optionalPositiveInt(query.clip_height),
    image_quality: clampInt(query.image_quality, 0, 100, DEFAULT_PARAMS.image_quality),
    image_width: optionalPositiveInt(query.image_width),
    image_height: optionalPositiveInt(query.image_height),
    omit_background: parseBool(query.omit_background, DEFAULT_PARAMS.omit_background),
    pdf_print_background: parseBool(query.pdf_print_background, DEFAULT_PARAMS.pdf_print_background),
    pdf_landscape: parseBool(query.pdf_landscape, DEFAULT_PARAMS.pdf_landscape),
    pdf_paper_format: parsePdfPaperFormat(query.pdf_paper_format),
    pdf_margin: query.pdf_margin || undefined,
    pdf_margin_top: query.pdf_margin_top || undefined,
    pdf_margin_right: query.pdf_margin_right || undefined,
    pdf_margin_bottom: query.pdf_margin_bottom || undefined,
    pdf_margin_left: query.pdf_margin_left || undefined,
    delay: clampInt(query.delay, 0, 30, DEFAULT_PARAMS.delay),
    timeout: clampInt(query.timeout, 1, 90, DEFAULT_PARAMS.timeout),
    navigation_timeout: clampInt(query.navigation_timeout, 1, 30, DEFAULT_PARAMS.navigation_timeout),
    wait_until: parseWaitUntil(query.wait_until),
    wait_for_selector: query.wait_for_selector || undefined,
    block_ads: parseBool(query.block_ads, DEFAULT_PARAMS.block_ads),
    block_cookie_banners: parseBool(query.block_cookie_banners, DEFAULT_PARAMS.block_cookie_banners),
    block_chats: parseBool(query.block_chats, DEFAULT_PARAMS.block_chats),
    block_trackers: parseBool(query.block_trackers, DEFAULT_PARAMS.block_trackers),
    block_requests: parseStringArray(query.block_requests),
    block_resources: parseBlockResources(query.block_resources),
    dark_mode: parseBool(query.dark_mode, DEFAULT_PARAMS.dark_mode),
    reduced_motion: parseBool(query.reduced_motion, DEFAULT_PARAMS.reduced_motion),
    media_type: parseMediaType(query.media_type),
    scripts: query.scripts || undefined,
    styles: query.styles || undefined,
    hide_selectors: parseHideSelectors(query.hide_selectors),
    click: query.click || undefined,
    user_agent: query.user_agent || undefined,
    headers: parseHeaders(query.headers),
    cookies: parseCookies(query.cookies),
    bypass_csp: parseBool(query.bypass_csp, DEFAULT_PARAMS.bypass_csp),
    ignore_host_errors: parseBool(query.ignore_host_errors, DEFAULT_PARAMS.ignore_host_errors),
    geolocation_latitude: optionalFloat(query.geolocation_latitude, -90, 90),
    geolocation_longitude: optionalFloat(query.geolocation_longitude, -180, 180),
    geolocation_accuracy: optionalPositiveInt(query.geolocation_accuracy),
    time_zone: query.time_zone || undefined,
    cache: parseBool(query.cache, DEFAULT_PARAMS.cache),
    cache_ttl: clampInt(query.cache_ttl, 60, 2592000, DEFAULT_PARAMS.cache_ttl),
    cache_key: query.cache_key || undefined,
  };
}

// ── Parse helpers ──────────────────────────────────────────────────

function parseBool(value: string | boolean | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
}

function clampInt(value: any, min: number, max: number, defaultValue: number): number {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.max(min, Math.min(max, parsed));
}

function clampFloat(value: any, min: number, max: number, defaultValue: number): number {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.max(min, Math.min(max, parsed));
}

function optionalPositiveInt(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function optionalNonNegativeInt(value: any): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function optionalFloat(value: any, min: number, max: number): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed)) return undefined;
  if (parsed < min || parsed > max) {
    throw new Error(`Value must be between ${min} and ${max}`);
  }
  return parsed;
}

function parseFormat(format?: string): ScreenshotParams['format'] {
  if (!format) return DEFAULT_PARAMS.format;
  // ScreenshotOne accepts 'jpg' as alias for 'jpeg'
  if (format === 'jpg') return 'jpeg';
  const valid = ['png', 'jpeg', 'webp', 'pdf'];
  if (valid.includes(format)) return format as ScreenshotParams['format'];
  return DEFAULT_PARAMS.format;
}

function parseResponseType(value?: string): 'by_format' | 'json' {
  if (value === 'json') return 'json';
  return 'by_format';
}

function parsePdfPaperFormat(value?: string): string {
  if (!value) return DEFAULT_PARAMS.pdf_paper_format;
  const valid = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'legal', 'letter', 'tabloid'];
  return valid.includes(value.toLowerCase()) ? value.toLowerCase() : DEFAULT_PARAMS.pdf_paper_format;
}

const VALID_WAIT_UNTIL = new Set(['load', 'domcontentloaded', 'networkidle', 'commit']);

function parseWaitUntil(value?: string | string[]): WaitUntilEvent[] {
  if (!value) return [...DEFAULT_PARAMS.wait_until];
  const raw = Array.isArray(value) ? value : value.split(',');
  const events = raw.map(s => String(s).trim().toLowerCase()).filter(s => VALID_WAIT_UNTIL.has(s)) as WaitUntilEvent[];
  return events.length > 0 ? events : [...DEFAULT_PARAMS.wait_until];
}

function parseMediaType(value?: string): 'screen' | 'print' | undefined {
  if (value === 'screen' || value === 'print') return value;
  return undefined;
}

function parseHideSelectors(value?: string | string[]): string[] | undefined {
  if (!value) return undefined;
  const raw = Array.isArray(value) ? value : value.split(',');
  const selectors = raw.map(s => String(s).trim()).filter(Boolean);
  return selectors.length > 0 ? selectors : undefined;
}

function parseStringArray(value?: string | string[]): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : value.split(',');
  return raw.map(s => String(s).trim()).filter(Boolean);
}

const VALID_RESOURCE_TYPES = new Set([
  'document', 'stylesheet', 'image', 'media', 'font', 'script',
  'texttrack', 'xhr', 'fetch', 'eventsource', 'websocket', 'manifest', 'other',
]);

function parseBlockResources(value?: string | string[]): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : value.split(',');
  return raw.map(s => String(s).trim().toLowerCase()).filter(s => VALID_RESOURCE_TYPES.has(s));
}

// Headers that must not be overridden for security
const BLOCKED_HEADERS = new Set([
  'host', 'content-length', 'transfer-encoding', 'connection', 'upgrade',
]);

function parseHeaders(value?: string | string[] | Record<string, string>): Record<string, string> | undefined {
  if (!value) return undefined;

  let headers: Record<string, string>;

  if (typeof value === 'string') {
    try {
      headers = JSON.parse(value);
    } catch {
      throw new Error('Invalid headers: must be a JSON object');
    }
  } else if (Array.isArray(value)) {
    // ScreenshotOne format: ["Name:Value", "Name2:Value2"]
    headers = {};
    for (const item of value) {
      const idx = String(item).indexOf(':');
      if (idx === -1) throw new Error(`Invalid header format: "${item}" (expected "Name:Value")`);
      headers[String(item).slice(0, idx).trim()] = String(item).slice(idx + 1).trim();
    }
  } else if (typeof value === 'object') {
    headers = value;
  } else {
    throw new Error('Invalid headers: must be a JSON object or array of "Name:Value" strings');
  }

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

function parseCookies(value?: string | string[] | CookieParam[]): CookieParam[] | undefined {
  if (!value) return undefined;

  let cookies: CookieParam[];

  if (typeof value === 'string') {
    try {
      cookies = JSON.parse(value);
    } catch {
      throw new Error('Invalid cookies: must be a JSON array of cookie objects');
    }
  } else if (Array.isArray(value)) {
    // Could be array of CookieParam objects or ScreenshotOne format strings
    if (value.length > 0 && typeof value[0] === 'string') {
      cookies = (value as string[]).map(parseCookieString);
    } else {
      cookies = value as CookieParam[];
    }
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
  }

  return cookies.length > 0 ? cookies : undefined;
}

// Parse ScreenshotOne cookie string format: "name=value; Domain=...; Secure; HttpOnly"
function parseCookieString(str: string): CookieParam {
  const parts = str.split(';').map(s => s.trim());
  const [first, ...rest] = parts;
  const eqIdx = first.indexOf('=');
  if (eqIdx === -1) throw new Error(`Invalid cookie format: "${str}"`);

  const cookie: CookieParam = {
    name: first.slice(0, eqIdx).trim(),
    value: first.slice(eqIdx + 1).trim(),
  };

  for (const part of rest) {
    const lower = part.toLowerCase();
    if (lower === 'secure') {
      cookie.secure = true;
    } else if (lower === 'httponly') {
      cookie.httpOnly = true;
    } else if (lower.startsWith('domain=')) {
      cookie.domain = part.slice(7).trim();
    } else if (lower.startsWith('path=')) {
      cookie.path = part.slice(5).trim();
    } else if (lower.startsWith('samesite=')) {
      const ss = part.slice(9).trim();
      if (ss === 'Strict' || ss === 'Lax' || ss === 'None') cookie.sameSite = ss;
    }
  }

  return cookie;
}
