import { describe, it, expect } from 'vitest';
import { parseParams, DEFAULT_PARAMS, type ScreenshotParams } from '../src/params.js';

function parse(overrides: Record<string, any> = {}): ScreenshotParams {
  return parseParams({ url: 'https://example.com', ...overrides });
}

describe('parseParams', () => {
  // ── Source params ──────────────────────────────────────────────

  describe('source', () => {
    it('requires at least one source', () => {
      expect(() => parseParams({})).toThrow('One of url, html, or markdown');
    });

    it('rejects multiple sources', () => {
      expect(() => parseParams({ url: 'https://x.com', html: '<h1>hi</h1>' })).toThrow('Only one of');
      expect(() => parseParams({ url: 'https://x.com', markdown: '# hi' })).toThrow('Only one of');
      expect(() => parseParams({ html: '<h1>hi</h1>', markdown: '# hi' })).toThrow('Only one of');
    });

    it('accepts url source', () => {
      const p = parse();
      expect(p.url).toBe('https://example.com');
      expect(p.html).toBeUndefined();
      expect(p.markdown).toBeUndefined();
    });

    it('accepts html source', () => {
      const p = parseParams({ html: '<h1>Hello</h1>' });
      expect(p.html).toBe('<h1>Hello</h1>');
      expect(p.url).toBeUndefined();
    });

    it('accepts markdown source', () => {
      const p = parseParams({ markdown: '# Hello' });
      expect(p.markdown).toBe('# Hello');
      expect(p.url).toBeUndefined();
    });

    it('validates URL format', () => {
      expect(() => parseParams({ url: 'not-a-url' })).toThrow('Invalid URL');
    });
  });

  // ── Format ─────────────────────────────────────────────────────

  describe('format', () => {
    it('defaults to png', () => {
      expect(parse().format).toBe('png');
    });

    it('accepts valid formats', () => {
      expect(parse({ format: 'jpeg' }).format).toBe('jpeg');
      expect(parse({ format: 'webp' }).format).toBe('webp');
      expect(parse({ format: 'pdf' }).format).toBe('pdf');
    });

    it('maps jpg to jpeg (ScreenshotOne compat)', () => {
      expect(parse({ format: 'jpg' }).format).toBe('jpeg');
    });

    it('falls back to default for invalid format', () => {
      expect(parse({ format: 'bmp' }).format).toBe('png');
    });
  });

  // ── Response type ──────────────────────────────────────────────

  describe('response_type', () => {
    it('defaults to by_format', () => {
      expect(parse().response_type).toBe('by_format');
    });

    it('accepts json', () => {
      expect(parse({ response_type: 'json' }).response_type).toBe('json');
    });
  });

  // ── Viewport ───────────────────────────────────────────────────

  describe('viewport', () => {
    it('uses defaults', () => {
      const p = parse();
      expect(p.viewport_width).toBe(1280);
      expect(p.viewport_height).toBe(1024);
      expect(p.device_scale_factor).toBe(1);
    });

    it('parses custom viewport', () => {
      const p = parse({ viewport_width: '1920', viewport_height: '1080', device_scale_factor: '2' });
      expect(p.viewport_width).toBe(1920);
      expect(p.viewport_height).toBe(1080);
      expect(p.device_scale_factor).toBe(2);
    });

    it('clamps viewport to valid range', () => {
      expect(parse({ viewport_width: '0' }).viewport_width).toBe(1);
      expect(parse({ viewport_width: '99999' }).viewport_width).toBe(7680);
    });

    it('clamps device_scale_factor', () => {
      expect(parse({ device_scale_factor: '0.01' }).device_scale_factor).toBe(0.1);
      expect(parse({ device_scale_factor: '10' }).device_scale_factor).toBe(5);
    });

    it('handles viewport_mobile and viewport_has_touch', () => {
      const p = parse({ viewport_mobile: 'true', viewport_has_touch: 'true' });
      expect(p.viewport_mobile).toBe(true);
      expect(p.viewport_has_touch).toBe(true);
    });
  });

  // ── Full page ──────────────────────────────────────────────────

  describe('full_page', () => {
    it('defaults to false', () => {
      expect(parse().full_page).toBe(false);
    });

    it('parses full_page_scroll options', () => {
      const p = parse({ full_page: 'true', full_page_scroll: 'true', full_page_scroll_delay: '200' });
      expect(p.full_page).toBe(true);
      expect(p.full_page_scroll).toBe(true);
      expect(p.full_page_scroll_delay).toBe(200);
    });

    it('clamps full_page_scroll_delay', () => {
      expect(parse({ full_page_scroll_delay: '50' }).full_page_scroll_delay).toBe(100);
      expect(parse({ full_page_scroll_delay: '10000' }).full_page_scroll_delay).toBe(5000);
    });

    it('parses full_page_max_height', () => {
      expect(parse({ full_page_max_height: '5000' }).full_page_max_height).toBe(5000);
      expect(parse().full_page_max_height).toBeUndefined();
    });
  });

  // ── Clip region ────────────────────────────────────────────────

  describe('clip', () => {
    it('all clip params undefined by default', () => {
      const p = parse();
      expect(p.clip_x).toBeUndefined();
      expect(p.clip_y).toBeUndefined();
      expect(p.clip_width).toBeUndefined();
      expect(p.clip_height).toBeUndefined();
    });

    it('parses clip region', () => {
      const p = parse({ clip_x: '10', clip_y: '20', clip_width: '300', clip_height: '400' });
      expect(p.clip_x).toBe(10);
      expect(p.clip_y).toBe(20);
      expect(p.clip_width).toBe(300);
      expect(p.clip_height).toBe(400);
    });

    it('allows clip_x and clip_y to be 0', () => {
      const p = parse({ clip_x: '0', clip_y: '0', clip_width: '100', clip_height: '100' });
      expect(p.clip_x).toBe(0);
      expect(p.clip_y).toBe(0);
    });
  });

  // ── Image output ───────────────────────────────────────────────

  describe('image output', () => {
    it('clamps image_quality', () => {
      expect(parse({ image_quality: '-1' }).image_quality).toBe(0);
      expect(parse({ image_quality: '101' }).image_quality).toBe(100);
    });

    it('parses image resize', () => {
      const p = parse({ image_width: '640', image_height: '480' });
      expect(p.image_width).toBe(640);
      expect(p.image_height).toBe(480);
    });

    it('omit_background defaults to false', () => {
      expect(parse().omit_background).toBe(false);
      expect(parse({ omit_background: 'true' }).omit_background).toBe(true);
    });
  });

  // ── PDF options ────────────────────────────────────────────────

  describe('pdf options', () => {
    it('defaults', () => {
      const p = parse();
      expect(p.pdf_print_background).toBe(false);
      expect(p.pdf_landscape).toBe(false);
      expect(p.pdf_paper_format).toBe('letter');
    });

    it('accepts valid paper formats', () => {
      expect(parse({ pdf_paper_format: 'a4' }).pdf_paper_format).toBe('a4');
      expect(parse({ pdf_paper_format: 'A4' }).pdf_paper_format).toBe('a4');
      expect(parse({ pdf_paper_format: 'tabloid' }).pdf_paper_format).toBe('tabloid');
    });

    it('rejects invalid paper format', () => {
      expect(parse({ pdf_paper_format: 'banana' }).pdf_paper_format).toBe('letter');
    });

    it('parses margin overrides', () => {
      const p = parse({ pdf_margin: '20px', pdf_margin_top: '10px' });
      expect(p.pdf_margin).toBe('20px');
      expect(p.pdf_margin_top).toBe('10px');
    });
  });

  // ── Timing ─────────────────────────────────────────────────────

  describe('timing', () => {
    it('clamps delay to 0-30', () => {
      expect(parse({ delay: '-1' }).delay).toBe(0);
      expect(parse({ delay: '60' }).delay).toBe(30);
    });

    it('clamps timeout to 1-90', () => {
      expect(parse({ timeout: '0' }).timeout).toBe(1);
      expect(parse({ timeout: '120' }).timeout).toBe(90);
    });

    it('clamps navigation_timeout to 1-30', () => {
      expect(parse({ navigation_timeout: '0' }).navigation_timeout).toBe(1);
      expect(parse({ navigation_timeout: '60' }).navigation_timeout).toBe(30);
    });

    it('parses wait_until from string', () => {
      expect(parse({ wait_until: 'networkidle' }).wait_until).toEqual(['networkidle']);
      expect(parse({ wait_until: 'load,domcontentloaded' }).wait_until).toEqual(['load', 'domcontentloaded']);
    });

    it('parses wait_until from array', () => {
      expect(parse({ wait_until: ['load', 'networkidle'] }).wait_until).toEqual(['load', 'networkidle']);
    });

    it('filters invalid wait_until values', () => {
      expect(parse({ wait_until: 'invalid' }).wait_until).toEqual(['load']);
    });

    it('wait_for_selector is optional', () => {
      expect(parse().wait_for_selector).toBeUndefined();
      expect(parse({ wait_for_selector: '#main' }).wait_for_selector).toBe('#main');
    });
  });

  // ── Blocking ───────────────────────────────────────────────────

  describe('blocking', () => {
    it('all blocking defaults to false/empty', () => {
      const p = parse();
      expect(p.block_ads).toBe(false);
      expect(p.block_cookie_banners).toBe(false);
      expect(p.block_chats).toBe(false);
      expect(p.block_trackers).toBe(false);
      expect(p.block_requests).toEqual([]);
      expect(p.block_resources).toEqual([]);
    });

    it('parses block_resources from comma-separated string', () => {
      expect(parse({ block_resources: 'image,font,stylesheet' }).block_resources).toEqual(['image', 'font', 'stylesheet']);
    });

    it('filters invalid resource types', () => {
      expect(parse({ block_resources: 'image,banana,font' }).block_resources).toEqual(['image', 'font']);
    });

    it('parses block_requests', () => {
      expect(parse({ block_requests: 'ads.example.com,tracker.io' }).block_requests).toEqual(['ads.example.com', 'tracker.io']);
    });
  });

  // ── Emulation ──────────────────────────────────────────────────

  describe('emulation', () => {
    it('dark_mode defaults to false', () => {
      expect(parse().dark_mode).toBe(false);
    });

    it('reduced_motion defaults to false', () => {
      expect(parse().reduced_motion).toBe(false);
    });

    it('media_type defaults to undefined', () => {
      expect(parse().media_type).toBeUndefined();
    });

    it('accepts valid media_type', () => {
      expect(parse({ media_type: 'print' }).media_type).toBe('print');
      expect(parse({ media_type: 'screen' }).media_type).toBe('screen');
    });

    it('rejects invalid media_type', () => {
      expect(parse({ media_type: 'tv' }).media_type).toBeUndefined();
    });
  });

  // ── Customization ──────────────────────────────────────────────

  describe('customization', () => {
    it('scripts and styles are optional', () => {
      expect(parse().scripts).toBeUndefined();
      expect(parse().styles).toBeUndefined();
    });

    it('passes through scripts and styles', () => {
      const p = parse({ scripts: 'document.body.style.color="red"', styles: 'body{color:red}' });
      expect(p.scripts).toBe('document.body.style.color="red"');
      expect(p.styles).toBe('body{color:red}');
    });

    it('click is optional', () => {
      expect(parse().click).toBeUndefined();
      expect(parse({ click: '#btn' }).click).toBe('#btn');
    });

    it('parses hide_selectors from string', () => {
      expect(parse({ hide_selectors: '.ad,.banner' }).hide_selectors).toEqual(['.ad', '.banner']);
    });

    it('parses hide_selectors from array', () => {
      expect(parse({ hide_selectors: ['.ad', '.banner'] }).hide_selectors).toEqual(['.ad', '.banner']);
    });
  });

  // ── Request options ────────────────────────────────────────────

  describe('request options', () => {
    it('user_agent is optional', () => {
      expect(parse().user_agent).toBeUndefined();
      expect(parse({ user_agent: 'MyBot/1.0' }).user_agent).toBe('MyBot/1.0');
    });

    it('bypass_csp defaults to false', () => {
      expect(parse().bypass_csp).toBe(false);
    });

    it('ignore_host_errors defaults to false', () => {
      expect(parse().ignore_host_errors).toBe(false);
    });
  });

  // ── Headers ────────────────────────────────────────────────────

  describe('headers', () => {
    it('parses headers from JSON string', () => {
      const p = parse({ headers: '{"X-Custom":"value"}' });
      expect(p.headers).toEqual({ 'X-Custom': 'value' });
    });

    it('parses headers from object', () => {
      const p = parse({ headers: { 'X-Custom': 'value' } });
      expect(p.headers).toEqual({ 'X-Custom': 'value' });
    });

    it('parses headers from array (ScreenshotOne format)', () => {
      const p = parse({ headers: ['X-Custom:value', 'Accept:text/html'] });
      expect(p.headers).toEqual({ 'X-Custom': 'value', Accept: 'text/html' });
    });

    it('rejects blocked headers', () => {
      expect(() => parse({ headers: { Host: 'evil.com' } })).toThrow('cannot be overridden');
      expect(() => parse({ headers: { 'content-length': '0' } })).toThrow('cannot be overridden');
    });

    it('rejects non-string header values', () => {
      expect(() => parse({ headers: { num: 123 } })).toThrow('must be a string');
    });

    it('returns undefined for empty headers', () => {
      expect(parse({ headers: {} }).headers).toBeUndefined();
    });

    it('rejects invalid JSON headers string', () => {
      expect(() => parse({ headers: 'not json' })).toThrow('Invalid headers');
    });

    it('rejects invalid header array format', () => {
      expect(() => parse({ headers: ['no-colon-here'] })).toThrow('Invalid header format');
    });
  });

  // ── Cookies ────────────────────────────────────────────────────

  describe('cookies', () => {
    it('parses cookies from JSON string', () => {
      const p = parse({ cookies: JSON.stringify([{ name: 'a', value: 'b' }]) });
      expect(p.cookies).toEqual([{ name: 'a', value: 'b' }]);
    });

    it('parses cookies from object array', () => {
      const p = parse({ cookies: [{ name: 'a', value: 'b' }] });
      expect(p.cookies).toEqual([{ name: 'a', value: 'b' }]);
    });

    it('parses cookies from ScreenshotOne string format', () => {
      const p = parse({ cookies: ['session=abc123; Domain=example.com; Secure; HttpOnly'] });
      expect(p.cookies).toEqual([{
        name: 'session',
        value: 'abc123',
        domain: 'example.com',
        secure: true,
        httpOnly: true,
      }]);
    });

    it('parses SameSite cookie attribute', () => {
      const p = parse({ cookies: ['tok=v; SameSite=Strict'] });
      expect(p.cookies![0].sameSite).toBe('Strict');
    });

    it('parses Path cookie attribute', () => {
      const p = parse({ cookies: ['tok=v; Path=/api'] });
      expect(p.cookies![0].path).toBe('/api');
    });

    it('rejects cookies without name', () => {
      expect(() => parse({ cookies: [{ value: 'b' }] })).toThrow('must have a "name"');
    });

    it('rejects cookies without value', () => {
      expect(() => parse({ cookies: [{ name: 'a' }] })).toThrow('must have a "value"');
    });

    it('returns undefined for empty cookies', () => {
      expect(parse({ cookies: [] }).cookies).toBeUndefined();
    });
  });

  // ── Geolocation ────────────────────────────────────────────────

  describe('geolocation', () => {
    it('all undefined by default', () => {
      const p = parse();
      expect(p.geolocation_latitude).toBeUndefined();
      expect(p.geolocation_longitude).toBeUndefined();
      expect(p.geolocation_accuracy).toBeUndefined();
    });

    it('parses valid geolocation', () => {
      const p = parse({ geolocation_latitude: '37.7749', geolocation_longitude: '-122.4194', geolocation_accuracy: '100' });
      expect(p.geolocation_latitude).toBe(37.7749);
      expect(p.geolocation_longitude).toBe(-122.4194);
      expect(p.geolocation_accuracy).toBe(100);
    });

    it('rejects out-of-range latitude', () => {
      expect(() => parse({ geolocation_latitude: '91' })).toThrow('between -90 and 90');
    });

    it('rejects out-of-range longitude', () => {
      expect(() => parse({ geolocation_longitude: '181' })).toThrow('between -180 and 180');
    });
  });

  // ── Cache ──────────────────────────────────────────────────────

  describe('cache', () => {
    it('defaults to disabled', () => {
      expect(parse().cache).toBe(false);
    });

    it('parses cache options', () => {
      const p = parse({ cache: 'true', cache_ttl: '3600', cache_key: 'my-key' });
      expect(p.cache).toBe(true);
      expect(p.cache_ttl).toBe(3600);
      expect(p.cache_key).toBe('my-key');
    });

    it('clamps cache_ttl', () => {
      expect(parse({ cache_ttl: '10' }).cache_ttl).toBe(60);
      expect(parse({ cache_ttl: '99999999' }).cache_ttl).toBe(2592000);
    });
  });

  // ── Boolean parsing ────────────────────────────────────────────

  describe('boolean parsing', () => {
    it('accepts "true" and "1"', () => {
      expect(parse({ full_page: 'true' }).full_page).toBe(true);
      expect(parse({ full_page: '1' }).full_page).toBe(true);
    });

    it('treats other strings as false', () => {
      expect(parse({ full_page: 'false' }).full_page).toBe(false);
      expect(parse({ full_page: 'yes' }).full_page).toBe(false);
      expect(parse({ full_page: '0' }).full_page).toBe(false);
    });

    it('accepts native boolean from JSON body', () => {
      expect(parse({ full_page: true }).full_page).toBe(true);
      expect(parse({ full_page: false }).full_page).toBe(false);
    });
  });

  // ── Extended formats ────────────────────────────────────────────

  describe('extended formats', () => {
    it('accepts gif, tiff, avif, heif formats', () => {
      expect(parse({ format: 'gif' }).format).toBe('gif');
      expect(parse({ format: 'tiff' }).format).toBe('tiff');
      expect(parse({ format: 'avif' }).format).toBe('avif');
      expect(parse({ format: 'heif' }).format).toBe('heif');
    });

    it('accepts html and markdown output formats', () => {
      expect(parse({ format: 'html' }).format).toBe('html');
      expect(parse({ format: 'markdown' }).format).toBe('markdown');
    });

    it('accepts empty response type', () => {
      expect(parse({ response_type: 'empty' }).response_type).toBe('empty');
    });
  });

  // ── Viewport extensions ────────────────────────────────────────

  describe('viewport extensions', () => {
    it('viewport_landscape swaps dimensions when width < height', () => {
      const p = parse({ viewport_width: '768', viewport_height: '1024', viewport_landscape: 'true' });
      expect(p.viewport_width).toBe(1024);
      expect(p.viewport_height).toBe(768);
    });

    it('viewport_landscape does nothing when width >= height', () => {
      const p = parse({ viewport_width: '1920', viewport_height: '1080', viewport_landscape: 'true' });
      expect(p.viewport_width).toBe(1920);
      expect(p.viewport_height).toBe(1080);
    });

    it('viewport_device is passthrough', () => {
      expect(parse({ viewport_device: 'iPhone 13' }).viewport_device).toBe('iPhone 13');
      expect(parse().viewport_device).toBeUndefined();
    });
  });

  // ── Capture extensions ─────────────────────────────────────────

  describe('capture extensions', () => {
    it('full_page_scroll_by is optional positive int', () => {
      expect(parse().full_page_scroll_by).toBeUndefined();
      expect(parse({ full_page_scroll_by: '500' }).full_page_scroll_by).toBe(500);
    });

    it('full_page_algorithm defaults to default', () => {
      expect(parse().full_page_algorithm).toBe('default');
      expect(parse({ full_page_algorithm: 'by_sections' }).full_page_algorithm).toBe('by_sections');
    });

    it('selector_algorithm defaults to default', () => {
      expect(parse().selector_algorithm).toBe('default');
      expect(parse({ selector_algorithm: 'clip' }).selector_algorithm).toBe('clip');
    });

    it('selector_scroll_into_view defaults to false', () => {
      expect(parse().selector_scroll_into_view).toBe(false);
      expect(parse({ selector_scroll_into_view: 'true' }).selector_scroll_into_view).toBe(true);
    });

    it('scroll_into_view is optional', () => {
      expect(parse().scroll_into_view).toBeUndefined();
      expect(parse({ scroll_into_view: '#pricing' }).scroll_into_view).toBe('#pricing');
    });

    it('scroll_into_view_adjust_top defaults to 0', () => {
      expect(parse().scroll_into_view_adjust_top).toBe(0);
      expect(parse({ scroll_into_view_adjust_top: '50' }).scroll_into_view_adjust_top).toBe(50);
    });
  });

  // ── PDF extensions ─────────────────────────────────────────────

  describe('pdf extensions', () => {
    it('pdf_fit_one_page defaults to false', () => {
      expect(parse().pdf_fit_one_page).toBe(false);
      expect(parse({ pdf_fit_one_page: 'true' }).pdf_fit_one_page).toBe(true);
    });
  });

  // ── Customization extensions ───────────────────────────────────

  describe('customization extensions', () => {
    it('hover is optional', () => {
      expect(parse().hover).toBeUndefined();
      expect(parse({ hover: '#menu' }).hover).toBe('#menu');
    });

    it('scripts_wait_until parses events', () => {
      expect(parse().scripts_wait_until).toBeUndefined();
      expect(parse({ scripts_wait_until: 'networkidle' }).scripts_wait_until).toEqual(['networkidle']);
    });

    it('error_on_selector_not_found defaults to false', () => {
      expect(parse().error_on_selector_not_found).toBe(false);
    });

    it('error_on_click_selector_not_found defaults to true', () => {
      expect(parse().error_on_click_selector_not_found).toBe(true);
    });

    it('error_on_hover_selector_not_found defaults to true', () => {
      expect(parse().error_on_hover_selector_not_found).toBe(true);
    });
  });

  // ── Blocking extensions ────────────────────────────────────────

  describe('blocking extensions', () => {
    it('block_banners_by_heuristics defaults to false', () => {
      expect(parse().block_banners_by_heuristics).toBe(false);
      expect(parse({ block_banners_by_heuristics: 'true' }).block_banners_by_heuristics).toBe(true);
    });

    it('wait_for_selector_algorithm defaults to at_least_one', () => {
      expect(parse().wait_for_selector_algorithm).toBe('at_least_one');
      expect(parse({ wait_for_selector_algorithm: 'at_least_by_count' }).wait_for_selector_algorithm).toBe('at_least_by_count');
    });
  });

  // ── Request extensions ─────────────────────────────────────────

  describe('request extensions', () => {
    it('authorization is optional', () => {
      expect(parse().authorization).toBeUndefined();
      expect(parse({ authorization: 'Bearer token' }).authorization).toBe('Bearer token');
    });

    it('proxy is optional', () => {
      expect(parse().proxy).toBeUndefined();
      expect(parse({ proxy: 'http://proxy:8080' }).proxy).toBe('http://proxy:8080');
    });

    it('ip_country_code accepts valid codes', () => {
      expect(parse({ ip_country_code: 'us' }).ip_country_code).toBe('us');
      expect(parse({ ip_country_code: 'GB' }).ip_country_code).toBe('gb');
    });

    it('ip_country_code rejects invalid codes', () => {
      expect(parse({ ip_country_code: 'xx' }).ip_country_code).toBeUndefined();
    });
  });

  // ── Error handling ─────────────────────────────────────────────

  describe('error handling params', () => {
    it('fail_if params are optional', () => {
      const p = parse();
      expect(p.fail_if_content_contains).toBeUndefined();
      expect(p.fail_if_content_missing).toBeUndefined();
      expect(p.fail_if_request_failed).toBeUndefined();
    });

    it('fail_if params pass through strings', () => {
      const p = parse({
        fail_if_content_contains: 'Access Denied',
        fail_if_content_missing: 'Welcome',
        fail_if_request_failed: '*.api.com',
      });
      expect(p.fail_if_content_contains).toBe('Access Denied');
      expect(p.fail_if_content_missing).toBe('Welcome');
      expect(p.fail_if_request_failed).toBe('*.api.com');
    });
  });

  // ── Metadata ───────────────────────────────────────────────────

  describe('metadata params', () => {
    it('all metadata defaults to false', () => {
      const p = parse();
      expect(p.metadata_image_size).toBe(false);
      expect(p.metadata_fonts).toBe(false);
      expect(p.metadata_icon).toBe(false);
      expect(p.metadata_open_graph).toBe(false);
      expect(p.metadata_page_title).toBe(false);
      expect(p.metadata_content).toBe(false);
      expect(p.metadata_http_response_status_code).toBe(false);
      expect(p.metadata_http_response_headers).toBe(false);
    });

    it('metadata_content_format defaults to html', () => {
      expect(parse().metadata_content_format).toBe('html');
      expect(parse({ metadata_content_format: 'markdown' }).metadata_content_format).toBe('markdown');
    });
  });

  // ── Storage ────────────────────────────────────────────────────

  describe('storage params', () => {
    it('store defaults to false', () => {
      expect(parse().store).toBe(false);
    });

    it('parses all storage params', () => {
      const p = parse({
        store: 'true',
        storage_path: 'screenshots/test.png',
        storage_bucket: 'my-bucket',
      });
      expect(p.store).toBe(true);
      expect(p.storage_path).toBe('screenshots/test.png');
      expect(p.storage_bucket).toBe('my-bucket');
    });
  });

  // ── Async / Webhooks ───────────────────────────────────────────

  describe('async params', () => {
    it('async defaults to false', () => {
      expect(parse().async).toBe(false);
    });

    it('webhook_sign defaults to true', () => {
      expect(parse().webhook_sign).toBe(true);
    });

    it('parses webhook options', () => {
      const p = parse({
        async: 'true',
        webhook_url: 'https://hooks.example.com/cb',
        webhook_sign: 'false',
      });
      expect(p.async).toBe(true);
      expect(p.webhook_url).toBe('https://hooks.example.com/cb');
      expect(p.webhook_sign).toBe(false);
    });
  });

  // ── OpenAI Vision ──────────────────────────────────────────────

  describe('openai vision params', () => {
    it('all optional by default', () => {
      const p = parse();
      expect(p.openai_api_key).toBeUndefined();
      expect(p.vision_prompt).toBeUndefined();
      expect(p.vision_max_tokens).toBeUndefined();
    });

    it('parses vision params', () => {
      const p = parse({
        openai_api_key: 'sk-test',
        vision_prompt: 'Describe the page',
        vision_max_tokens: '500',
      });
      expect(p.openai_api_key).toBe('sk-test');
      expect(p.vision_prompt).toBe('Describe the page');
      expect(p.vision_max_tokens).toBe(500);
    });
  });

  // ── Other ──────────────────────────────────────────────────────

  describe('other params', () => {
    it('attachment_name and external_identifier are optional', () => {
      expect(parse().attachment_name).toBeUndefined();
      expect(parse().external_identifier).toBeUndefined();
      expect(parse({ attachment_name: 'test.png' }).attachment_name).toBe('test.png');
      expect(parse({ external_identifier: 'req-123' }).external_identifier).toBe('req-123');
    });

    it('request_gpu_rendering defaults to false', () => {
      expect(parse().request_gpu_rendering).toBe(false);
    });

    it('include_shadow_dom defaults to false', () => {
      expect(parse().include_shadow_dom).toBe(false);
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────

  describe('edge cases', () => {
    it('ignores empty strings for optional params', () => {
      const p = parse({ selector: '', user_agent: '', scripts: '' });
      expect(p.selector).toBeUndefined();
      expect(p.user_agent).toBeUndefined();
      expect(p.scripts).toBeUndefined();
    });

    it('handles garbage numeric values gracefully', () => {
      const p = parse({ viewport_width: 'abc', image_quality: 'xyz', delay: 'NaN' });
      expect(p.viewport_width).toBe(DEFAULT_PARAMS.viewport_width);
      expect(p.image_quality).toBe(DEFAULT_PARAMS.image_quality);
      expect(p.delay).toBe(DEFAULT_PARAMS.delay);
    });

    it('time_zone is passthrough', () => {
      expect(parse({ time_zone: 'America/New_York' }).time_zone).toBe('America/New_York');
    });
  });
});
