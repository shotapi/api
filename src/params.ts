/**
 * ScreenshotOne-compatible parameter handling.
 * Full API compatibility — accepts all ScreenshotOne params.
 * https://screenshotone.com/docs/options/
 */

// ── Types ──────────────────────────────────────────────────────────

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'tiff' | 'avif' | 'heif';
export type OutputFormat = ImageFormat | 'pdf' | 'html' | 'markdown';
export type ResponseType = 'by_format' | 'json' | 'empty';

export interface ScreenshotParams {
  // Source (mutually exclusive)
  url?: string;
  html?: string;
  markdown?: string;

  // Format
  format: OutputFormat;
  response_type: ResponseType;

  // Viewport
  viewport_width: number;
  viewport_height: number;
  device_scale_factor: number;
  viewport_mobile: boolean;
  viewport_has_touch: boolean;
  viewport_landscape: boolean;
  viewport_device?: string;

  // Capture options
  full_page: boolean;
  full_page_scroll: boolean;
  full_page_scroll_delay: number;
  full_page_scroll_by?: number;
  full_page_max_height?: number;
  full_page_algorithm: 'default' | 'by_sections';
  capture_beyond_viewport: boolean;
  selector?: string;
  selector_algorithm: 'default' | 'clip';
  selector_scroll_into_view: boolean;
  scroll_into_view?: string;
  scroll_into_view_adjust_top: number;

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
  pdf_fit_one_page: boolean;
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
  wait_for_selector_algorithm: 'at_least_one' | 'at_least_by_count';

  // Blocking
  block_ads: boolean;
  block_cookie_banners: boolean;
  block_banners_by_heuristics: boolean;
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
  scripts_wait_until?: WaitUntilEvent[];
  styles?: string;
  hide_selectors?: string[];
  click?: string;
  hover?: string;
  error_on_selector_not_found: boolean;
  error_on_click_selector_not_found: boolean;
  error_on_hover_selector_not_found: boolean;

  // Request options
  user_agent?: string;
  authorization?: string;
  headers?: Record<string, string>;
  cookies?: CookieParam[];
  bypass_csp: boolean;
  ignore_host_errors: boolean;
  proxy?: string;
  ip_country_code?: string;

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

  // Error handling
  fail_if_content_contains?: string;
  fail_if_content_missing?: string;
  fail_if_request_failed?: string;

  // Metadata
  metadata_image_size: boolean;
  metadata_fonts: boolean;
  metadata_icon: boolean;
  metadata_open_graph: boolean;
  metadata_page_title: boolean;
  metadata_content: boolean;
  metadata_content_format: 'html' | 'markdown';
  metadata_http_response_status_code: boolean;
  metadata_http_response_headers: boolean;

  // Storage (S3-compatible)
  store: boolean;
  storage_path?: string;
  storage_endpoint?: string;
  storage_access_key_id?: string;
  storage_secret_access_key?: string;
  storage_bucket?: string;
  storage_class?: string;
  storage_acl?: string;
  storage_return_location: boolean;

  // Async / Webhooks
  async: boolean;
  webhook_url?: string;
  webhook_sign: boolean;
  webhook_errors: boolean;

  // OpenAI Vision
  openai_api_key?: string;
  vision_prompt?: string;
  vision_max_tokens?: number;

  // Other
  request_gpu_rendering: boolean;
  fail_if_gpu_rendering_fails: boolean;
  include_shadow_dom: boolean;
  attachment_name?: string;
  external_identifier?: string;
  signature?: string;
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
  viewport_landscape: false,
  full_page: false,
  full_page_scroll: false,
  full_page_scroll_delay: 400,
  full_page_algorithm: 'default',
  capture_beyond_viewport: true,
  selector_algorithm: 'default',
  selector_scroll_into_view: false,
  scroll_into_view_adjust_top: 0,
  image_quality: 80,
  omit_background: false,
  pdf_print_background: false,
  pdf_fit_one_page: false,
  pdf_landscape: false,
  pdf_paper_format: 'letter',
  delay: 0,
  timeout: 60,
  navigation_timeout: 30,
  wait_until: ['load'],
  wait_for_selector_algorithm: 'at_least_one',
  block_ads: false,
  block_cookie_banners: false,
  block_banners_by_heuristics: false,
  block_chats: false,
  block_trackers: false,
  block_requests: [],
  block_resources: [],
  dark_mode: false,
  reduced_motion: false,
  error_on_selector_not_found: false,
  error_on_click_selector_not_found: true,
  error_on_hover_selector_not_found: true,
  bypass_csp: false,
  ignore_host_errors: false,
  cache: false,
  cache_ttl: 14400,
  fail_if_content_contains: undefined,
  fail_if_content_missing: undefined,
  fail_if_request_failed: undefined,
  metadata_image_size: false,
  metadata_fonts: false,
  metadata_icon: false,
  metadata_open_graph: false,
  metadata_page_title: false,
  metadata_content: false,
  metadata_content_format: 'html',
  metadata_http_response_status_code: false,
  metadata_http_response_headers: false,
  store: false,
  storage_return_location: false,
  async: false,
  webhook_sign: true,
  webhook_errors: false,
  request_gpu_rendering: false,
  fail_if_gpu_rendering_fails: false,
  include_shadow_dom: false,
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
  const viewportLandscape = parseBool(query.viewport_landscape, DEFAULT_PARAMS.viewport_landscape);
  let vpWidth = clampInt(query.viewport_width, 1, 7680, DEFAULT_PARAMS.viewport_width);
  let vpHeight = clampInt(query.viewport_height, 1, 7680, DEFAULT_PARAMS.viewport_height);
  if (viewportLandscape && vpWidth < vpHeight) {
    [vpWidth, vpHeight] = [vpHeight, vpWidth];
  }

  return {
    url: url || undefined,
    html: html || undefined,
    markdown: markdown || undefined,
    format,
    response_type: parseResponseType(query.response_type),
    viewport_width: vpWidth,
    viewport_height: vpHeight,
    device_scale_factor: clampFloat(query.device_scale_factor, 0.1, 5, DEFAULT_PARAMS.device_scale_factor),
    viewport_mobile: parseBool(query.viewport_mobile, DEFAULT_PARAMS.viewport_mobile),
    viewport_has_touch: parseBool(query.viewport_has_touch, DEFAULT_PARAMS.viewport_has_touch),
    viewport_landscape: viewportLandscape,
    viewport_device: query.viewport_device || undefined,
    full_page: parseBool(query.full_page, DEFAULT_PARAMS.full_page),
    full_page_scroll: parseBool(query.full_page_scroll, DEFAULT_PARAMS.full_page_scroll),
    full_page_scroll_delay: clampInt(query.full_page_scroll_delay, 100, 5000, DEFAULT_PARAMS.full_page_scroll_delay),
    full_page_scroll_by: optionalPositiveInt(query.full_page_scroll_by),
    full_page_max_height: optionalPositiveInt(query.full_page_max_height),
    full_page_algorithm: parseEnum(query.full_page_algorithm, ['default', 'by_sections'], DEFAULT_PARAMS.full_page_algorithm),
    capture_beyond_viewport: parseBool(query.capture_beyond_viewport, DEFAULT_PARAMS.capture_beyond_viewport),
    selector: query.selector || undefined,
    selector_algorithm: parseEnum(query.selector_algorithm, ['default', 'clip'], DEFAULT_PARAMS.selector_algorithm),
    selector_scroll_into_view: parseBool(query.selector_scroll_into_view, DEFAULT_PARAMS.selector_scroll_into_view),
    scroll_into_view: query.scroll_into_view || undefined,
    scroll_into_view_adjust_top: clampInt(query.scroll_into_view_adjust_top, -10000, 10000, DEFAULT_PARAMS.scroll_into_view_adjust_top),
    clip_x: optionalNonNegativeInt(query.clip_x),
    clip_y: optionalNonNegativeInt(query.clip_y),
    clip_width: optionalPositiveInt(query.clip_width),
    clip_height: optionalPositiveInt(query.clip_height),
    image_quality: clampInt(query.image_quality, 0, 100, DEFAULT_PARAMS.image_quality),
    image_width: optionalPositiveInt(query.image_width),
    image_height: optionalPositiveInt(query.image_height),
    omit_background: parseBool(query.omit_background, DEFAULT_PARAMS.omit_background),
    pdf_print_background: parseBool(query.pdf_print_background, DEFAULT_PARAMS.pdf_print_background),
    pdf_fit_one_page: parseBool(query.pdf_fit_one_page, DEFAULT_PARAMS.pdf_fit_one_page),
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
    wait_for_selector_algorithm: parseEnum(query.wait_for_selector_algorithm, ['at_least_one', 'at_least_by_count'], DEFAULT_PARAMS.wait_for_selector_algorithm),
    block_ads: parseBool(query.block_ads, DEFAULT_PARAMS.block_ads),
    block_cookie_banners: parseBool(query.block_cookie_banners, DEFAULT_PARAMS.block_cookie_banners),
    block_banners_by_heuristics: parseBool(query.block_banners_by_heuristics, DEFAULT_PARAMS.block_banners_by_heuristics),
    block_chats: parseBool(query.block_chats, DEFAULT_PARAMS.block_chats),
    block_trackers: parseBool(query.block_trackers, DEFAULT_PARAMS.block_trackers),
    block_requests: parseStringArray(query.block_requests),
    block_resources: parseBlockResources(query.block_resources),
    dark_mode: parseBool(query.dark_mode, DEFAULT_PARAMS.dark_mode),
    reduced_motion: parseBool(query.reduced_motion, DEFAULT_PARAMS.reduced_motion),
    media_type: parseMediaType(query.media_type),
    scripts: query.scripts || undefined,
    scripts_wait_until: query.scripts_wait_until ? parseWaitUntil(query.scripts_wait_until) : undefined,
    styles: query.styles || undefined,
    hide_selectors: parseHideSelectors(query.hide_selectors),
    click: query.click || undefined,
    hover: query.hover || undefined,
    error_on_selector_not_found: parseBool(query.error_on_selector_not_found, DEFAULT_PARAMS.error_on_selector_not_found),
    error_on_click_selector_not_found: parseBool(query.error_on_click_selector_not_found, DEFAULT_PARAMS.error_on_click_selector_not_found),
    error_on_hover_selector_not_found: parseBool(query.error_on_hover_selector_not_found, DEFAULT_PARAMS.error_on_hover_selector_not_found),
    user_agent: query.user_agent || undefined,
    authorization: query.authorization || undefined,
    headers: parseHeaders(query.headers),
    cookies: parseCookies(query.cookies),
    bypass_csp: parseBool(query.bypass_csp, DEFAULT_PARAMS.bypass_csp),
    ignore_host_errors: parseBool(query.ignore_host_errors, DEFAULT_PARAMS.ignore_host_errors),
    proxy: query.proxy || undefined,
    ip_country_code: parseIpCountryCode(query.ip_country_code),
    geolocation_latitude: optionalFloat(query.geolocation_latitude, -90, 90),
    geolocation_longitude: optionalFloat(query.geolocation_longitude, -180, 180),
    geolocation_accuracy: optionalPositiveInt(query.geolocation_accuracy),
    time_zone: query.time_zone || undefined,
    cache: parseBool(query.cache, DEFAULT_PARAMS.cache),
    cache_ttl: clampInt(query.cache_ttl, 60, 2592000, DEFAULT_PARAMS.cache_ttl),
    cache_key: query.cache_key || undefined,
    fail_if_content_contains: query.fail_if_content_contains || undefined,
    fail_if_content_missing: query.fail_if_content_missing || undefined,
    fail_if_request_failed: query.fail_if_request_failed || undefined,
    metadata_image_size: parseBool(query.metadata_image_size, DEFAULT_PARAMS.metadata_image_size),
    metadata_fonts: parseBool(query.metadata_fonts, DEFAULT_PARAMS.metadata_fonts),
    metadata_icon: parseBool(query.metadata_icon, DEFAULT_PARAMS.metadata_icon),
    metadata_open_graph: parseBool(query.metadata_open_graph, DEFAULT_PARAMS.metadata_open_graph),
    metadata_page_title: parseBool(query.metadata_page_title, DEFAULT_PARAMS.metadata_page_title),
    metadata_content: parseBool(query.metadata_content, DEFAULT_PARAMS.metadata_content),
    metadata_content_format: parseEnum(query.metadata_content_format, ['html', 'markdown'], DEFAULT_PARAMS.metadata_content_format),
    metadata_http_response_status_code: parseBool(query.metadata_http_response_status_code, DEFAULT_PARAMS.metadata_http_response_status_code),
    metadata_http_response_headers: parseBool(query.metadata_http_response_headers, DEFAULT_PARAMS.metadata_http_response_headers),
    store: parseBool(query.store, DEFAULT_PARAMS.store),
    storage_path: query.storage_path || undefined,
    storage_endpoint: query.storage_endpoint || undefined,
    storage_access_key_id: query.storage_access_key_id || undefined,
    storage_secret_access_key: query.storage_secret_access_key || undefined,
    storage_bucket: query.storage_bucket || undefined,
    storage_class: query.storage_class || undefined,
    storage_acl: query.storage_acl || undefined,
    storage_return_location: parseBool(query.storage_return_location, DEFAULT_PARAMS.storage_return_location),
    async: parseBool(query.async, DEFAULT_PARAMS.async),
    webhook_url: query.webhook_url || undefined,
    webhook_sign: parseBool(query.webhook_sign, DEFAULT_PARAMS.webhook_sign),
    webhook_errors: parseBool(query.webhook_errors, DEFAULT_PARAMS.webhook_errors),
    openai_api_key: query.openai_api_key || undefined,
    vision_prompt: query.vision_prompt || undefined,
    vision_max_tokens: optionalPositiveInt(query.vision_max_tokens),
    request_gpu_rendering: parseBool(query.request_gpu_rendering, DEFAULT_PARAMS.request_gpu_rendering),
    fail_if_gpu_rendering_fails: parseBool(query.fail_if_gpu_rendering_fails, DEFAULT_PARAMS.fail_if_gpu_rendering_fails),
    include_shadow_dom: parseBool(query.include_shadow_dom, DEFAULT_PARAMS.include_shadow_dom),
    attachment_name: query.attachment_name || undefined,
    external_identifier: query.external_identifier || undefined,
    signature: query.signature || undefined,
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

function parseFormat(format?: string): OutputFormat {
  if (!format) return DEFAULT_PARAMS.format;
  if (format === 'jpg') return 'jpeg';
  const valid: OutputFormat[] = ['png', 'jpeg', 'webp', 'gif', 'tiff', 'avif', 'heif', 'pdf', 'html', 'markdown'];
  if (valid.includes(format as OutputFormat)) return format as OutputFormat;
  return DEFAULT_PARAMS.format;
}

function parseResponseType(value?: string): ResponseType {
  if (value === 'json' || value === 'empty') return value;
  return 'by_format';
}

function parseEnum<T extends string>(value: string | undefined, valid: T[], defaultValue: T): T {
  if (!value) return defaultValue;
  const lower = value.toLowerCase() as T;
  return valid.includes(lower) ? lower : defaultValue;
}

const VALID_COUNTRY_CODES = new Set([
  'us', 'gb', 'de', 'it', 'fr', 'cn', 'ca', 'es', 'jp', 'kr', 'in', 'au', 'br', 'mx', 'nz', 'pe', 'is', 'ie',
]);

function parseIpCountryCode(value?: string): string | undefined {
  if (!value) return undefined;
  const lower = value.toLowerCase();
  return VALID_COUNTRY_CODES.has(lower) ? lower : undefined;
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
