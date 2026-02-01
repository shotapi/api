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

export function parseParams(query: Record<string, string>): ScreenshotParams {
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
  };
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
