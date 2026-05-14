import { chromium, type Browser, type Page, type BrowserContext, type Route } from 'playwright';
import sharp from 'sharp';
import type { ScreenshotParams, WaitUntilEvent, OutputFormat } from './params.js';

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

function toPlaywrightWaitUntil(events: WaitUntilEvent[]): 'load' | 'domcontentloaded' | 'networkidle' | 'commit' {
  if (events.includes('networkidle')) return 'networkidle';
  if (events.includes('load')) return 'load';
  if (events.includes('domcontentloaded')) return 'domcontentloaded';
  if (events.includes('commit')) return 'commit';
  return 'load';
}

const MARKDOWN_TEMPLATE = (md: string) => `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;padding:0 1rem;line-height:1.6}</style>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
</head><body><div id="content"></div>
<script>document.getElementById('content').innerHTML=marked.parse(${JSON.stringify(md)});<\/script>
</body></html>`;

export interface ScreenshotResult {
  buffer: Buffer;
  metadata?: Record<string, unknown>;
  httpStatusCode?: number;
  httpHeaders?: Record<string, string>;
}

export async function takeScreenshot(params: ScreenshotParams): Promise<ScreenshotResult> {
  const browser = await getBrowser();

  const contextOptions: Parameters<Browser['newContext']>[0] = {
    viewport: {
      width: params.viewport_width,
      height: params.viewport_height,
    },
    deviceScaleFactor: params.device_scale_factor,
    colorScheme: params.dark_mode ? 'dark' : 'light',
    isMobile: params.viewport_mobile,
    hasTouch: params.viewport_has_touch,
    bypassCSP: params.bypass_csp,
  };

  if (params.reduced_motion) {
    contextOptions.reducedMotion = 'reduce';
  }

  if (params.user_agent) {
    contextOptions.userAgent = params.user_agent;
  }

  if (params.geolocation_latitude !== undefined && params.geolocation_longitude !== undefined) {
    contextOptions.geolocation = {
      latitude: params.geolocation_latitude,
      longitude: params.geolocation_longitude,
      accuracy: params.geolocation_accuracy,
    };
    contextOptions.permissions = ['geolocation'];
  }

  if (params.time_zone) {
    contextOptions.timezoneId = params.time_zone;
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  let httpStatusCode: number | undefined;
  let httpHeaders: Record<string, string> | undefined;

  try {
    // Set up request blocking/tracking before navigation
    const failedRequestPatterns = params.fail_if_request_failed ? parseStringList(params.fail_if_request_failed) : [];

    if (params.block_requests.length > 0 || params.block_resources.length > 0 || failedRequestPatterns.length > 0) {
      await page.route('**/*', (route: Route) => {
        const request = route.request();

        if (params.block_resources.length > 0 && params.block_resources.includes(request.resourceType())) {
          return route.abort();
        }

        if (params.block_requests.length > 0) {
          const url = request.url();
          for (const pattern of params.block_requests) {
            if (url.includes(pattern)) return route.abort();
          }
        }

        return route.continue();
      });
    }

    // Apply authorization header
    if (params.authorization) {
      const authHeaders = params.headers ? { ...params.headers, Authorization: params.authorization } : { Authorization: params.authorization };
      await page.setExtraHTTPHeaders(authHeaders);
    } else if (params.headers) {
      await page.setExtraHTTPHeaders(params.headers);
    }

    // Apply custom cookies before navigation
    if (params.cookies && params.cookies.length > 0) {
      const targetUrl = params.url ? new URL(params.url) : null;
      const cookiesForPlaywright = params.cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain || targetUrl?.hostname || 'localhost',
        path: c.path || '/',
        ...(c.expires !== undefined && { expires: c.expires }),
        ...(c.httpOnly !== undefined && { httpOnly: c.httpOnly }),
        ...(c.secure !== undefined && { secure: c.secure }),
        ...(c.sameSite !== undefined && { sameSite: c.sameSite }),
      }));
      await context.addCookies(cookiesForPlaywright);
    }

    if (params.media_type) {
      await page.emulateMedia({ media: params.media_type });
    }

    // Navigate to source
    const navigationTimeout = params.navigation_timeout * 1000;
    const waitUntil = toPlaywrightWaitUntil(params.wait_until);

    if (params.url) {
      const response = await page.goto(params.url, { waitUntil, timeout: navigationTimeout });
      if (response) {
        httpStatusCode = response.status();
        httpHeaders = Object.fromEntries(
          Object.entries(response.headers()).map(([k, v]) => [k, v])
        );
        if (!params.ignore_host_errors && !response.ok() && response.status() !== 304) {
          throw new Error(`Navigation failed with status ${response.status()}`);
        }
      }
    } else if (params.html) {
      await page.setContent(params.html, { waitUntil, timeout: navigationTimeout });
    } else if (params.markdown) {
      await page.setContent(MARKDOWN_TEMPLATE(params.markdown), { waitUntil, timeout: navigationTimeout });
      await page.waitForFunction(() => {
        const el = document.getElementById('content');
        return el && el.innerHTML.length > 0;
      }, { timeout: 5000 });
    }

    // Check fail_if_request_failed patterns
    if (failedRequestPatterns.length > 0) {
      await checkFailedRequests(page, failedRequestPatterns);
    }

    // Wait for a specific selector
    if (params.wait_for_selector) {
      await page.waitForSelector(params.wait_for_selector, { timeout: navigationTimeout });
    }

    // Inject custom CSS
    if (params.styles) {
      await page.addStyleTag({ content: params.styles });
    }

    // Block cookie banners (either method)
    if (params.block_cookie_banners || params.block_banners_by_heuristics) {
      await hideCookieBanners(page);
    }

    if (params.block_chats) {
      await hideChatWidgets(page);
    }

    // Hide user-specified selectors
    if (params.hide_selectors && params.hide_selectors.length > 0) {
      await hideElements(page, params.hide_selectors);
    }

    // Execute custom JavaScript
    if (params.scripts) {
      await page.evaluate(params.scripts);
      if (params.scripts_wait_until) {
        const scriptWait = toPlaywrightWaitUntil(params.scripts_wait_until);
        if (scriptWait !== 'commit') {
          await page.waitForLoadState(scriptWait);
        }
      }
    }

    // Click element
    if (params.click) {
      try {
        await page.click(params.click, { timeout: 3000 });
      } catch {
        if (params.error_on_click_selector_not_found) {
          throw new Error(`Click target not found: ${params.click}`);
        }
      }
    }

    // Hover element
    if (params.hover) {
      try {
        await page.hover(params.hover, { timeout: 3000 });
      } catch {
        if (params.error_on_hover_selector_not_found) {
          throw new Error(`Hover target not found: ${params.hover}`);
        }
      }
    }

    // Scroll into view
    if (params.scroll_into_view) {
      await page.evaluate(([sel, adjust]) => {
        const el = document.querySelector(sel);
        if (el) {
          el.scrollIntoView({ block: 'start' });
          if (adjust) window.scrollBy(0, -adjust);
        }
      }, [params.scroll_into_view, params.scroll_into_view_adjust_top] as const);
    }

    // Wait for delay
    if (params.delay > 0) {
      await page.waitForTimeout(params.delay * 1000);
    }

    // Full page scroll to trigger lazy loading
    if (params.full_page && params.full_page_scroll) {
      await scrollFullPage(page, params.full_page_scroll_delay, params.full_page_max_height, params.full_page_scroll_by);
    }

    // Content validation
    if (params.fail_if_content_contains || params.fail_if_content_missing) {
      await validatePageContent(page, params.fail_if_content_contains, params.fail_if_content_missing);
    }

    // Collect metadata
    const metadata: Record<string, unknown> = {};
    await collectMetadata(page, params, metadata, httpStatusCode, httpHeaders);

    // Handle html/markdown output formats
    if (params.format === 'html' || params.format === 'markdown') {
      const content = await extractPageContent(page, params.format, params.include_shadow_dom);
      return { buffer: Buffer.from(content, 'utf-8'), metadata: Object.keys(metadata).length > 0 ? metadata : undefined, httpStatusCode, httpHeaders };
    }

    // Take screenshot
    let screenshot: Buffer;
    if (params.format === 'pdf') {
      screenshot = await capturePdf(page, params);
    } else {
      screenshot = await captureImage(page, params);
    }

    // Resize if requested
    if ((params.image_width || params.image_height) && params.format !== 'pdf') {
      screenshot = await sharp(screenshot)
        .resize(params.image_width, params.image_height, { fit: 'inside' })
        .toBuffer();
    }

    // Add image size metadata for JSON responses
    if (params.response_type === 'json' || params.metadata_image_size) {
      const img = sharp(screenshot);
      const meta = await img.metadata();
      metadata.width = meta.width;
      metadata.height = meta.height;
      metadata.format = params.format;
      metadata.size = screenshot.length;
    }

    return { buffer: screenshot, metadata: Object.keys(metadata).length > 0 ? metadata : undefined, httpStatusCode, httpHeaders };
  } finally {
    await context.close();
  }
}

// ── Capture helpers ────────────────────────────────────────────────

async function captureImage(page: Page, params: ScreenshotParams): Promise<Buffer> {
  const captureOptions: Parameters<Page['screenshot']>[0] = {
    type: 'png',
    fullPage: params.full_page,
    omitBackground: params.omit_background,
  };

  if (params.clip_x !== undefined && params.clip_y !== undefined &&
      params.clip_width !== undefined && params.clip_height !== undefined) {
    captureOptions.clip = {
      x: params.clip_x,
      y: params.clip_y,
      width: params.clip_width,
      height: params.clip_height,
    };
  }

  let rawPng: Buffer;
  if (params.selector) {
    const element = await page.$(params.selector);
    if (!element) {
      if (params.error_on_selector_not_found) {
        throw new Error(`Element not found: ${params.selector}`);
      }
      rawPng = await page.screenshot(captureOptions);
    } else {
      if (params.selector_scroll_into_view) {
        await element.scrollIntoViewIfNeeded();
      }
      if (params.selector_algorithm === 'clip') {
        const box = await element.boundingBox();
        if (box) {
          captureOptions.clip = { x: box.x, y: box.y, width: box.width, height: box.height };
          rawPng = await page.screenshot(captureOptions);
        } else {
          rawPng = await element.screenshot(captureOptions);
        }
      } else {
        rawPng = await element.screenshot(captureOptions);
      }
    }
  } else {
    rawPng = await page.screenshot(captureOptions);
  }

  return convertFormat(rawPng, params.format, params.image_quality);
}

async function convertFormat(rawPng: Buffer, format: OutputFormat, quality: number): Promise<Buffer> {
  switch (format) {
    case 'png':
      return rawPng;
    case 'webp':
      return sharp(rawPng).webp({ quality }).toBuffer();
    case 'jpeg':
      return sharp(rawPng).jpeg({ quality }).toBuffer();
    case 'gif':
      return sharp(rawPng).gif().toBuffer();
    case 'tiff':
      return sharp(rawPng).tiff({ quality }).toBuffer();
    case 'avif':
      return sharp(rawPng).avif({ quality }).toBuffer();
    case 'heif':
      return sharp(rawPng).heif({ quality }).toBuffer();
    default:
      return rawPng;
  }
}

async function capturePdf(page: Page, params: ScreenshotParams): Promise<Buffer> {
  const margin = params.pdf_margin || '0';
  const pdfOptions: Parameters<Page['pdf']>[0] = {
    format: params.pdf_paper_format as any,
    printBackground: params.pdf_print_background,
    landscape: params.pdf_landscape,
    margin: {
      top: params.pdf_margin_top || margin,
      right: params.pdf_margin_right || margin,
      bottom: params.pdf_margin_bottom || margin,
      left: params.pdf_margin_left || margin,
    },
  };

  if (params.pdf_fit_one_page) {
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    pdfOptions.width = `${dimensions.width}px`;
    pdfOptions.height = `${dimensions.height}px`;
    pdfOptions.format = undefined;
  }

  return page.pdf(pdfOptions);
}

async function scrollFullPage(page: Page, scrollDelay: number, maxHeight?: number, scrollBy?: number): Promise<void> {
  await page.evaluate(async ([delay, maxH, step]) => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const scrollStep = step || window.innerHeight;
      const timer = setInterval(() => {
        window.scrollBy(0, scrollStep);
        totalHeight += scrollStep;
        const limit = maxH || document.body.scrollHeight;
        if (totalHeight >= limit) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, delay);
    });
  }, [scrollDelay, maxHeight ?? 0, scrollBy ?? 0] as const);
}

// ── Content validation ────────────────────────────────────────────

async function validatePageContent(page: Page, forbidden?: string, required?: string): Promise<void> {
  const text = await page.evaluate(() => document.body.innerText);
  if (forbidden) {
    for (const pattern of parseStringList(forbidden)) {
      if (text.includes(pattern)) {
        throw new Error(`Page contains forbidden content: "${pattern}"`);
      }
    }
  }
  if (required) {
    for (const pattern of parseStringList(required)) {
      if (!text.includes(pattern)) {
        throw new Error(`Page missing required content: "${pattern}"`);
      }
    }
  }
}

async function checkFailedRequests(page: Page, _patterns: string[]): Promise<void> {
  // Request failure tracking is best done via response event listeners.
  // For now, we accept the param for API compatibility.
}

// ── Content extraction ────────────────────────────────────────────

async function extractPageContent(page: Page, format: 'html' | 'markdown', includeShadowDom: boolean): Promise<string> {
  if (format === 'html') {
    if (includeShadowDom) {
      return page.evaluate(() => {
        function getShadowContent(el: Element): string {
          let html = el.outerHTML;
          if (el.shadowRoot) {
            html = html.replace('</'+el.tagName.toLowerCase()+'>', el.shadowRoot.innerHTML + '</'+el.tagName.toLowerCase()+'>');
          }
          return html;
        }
        return getShadowContent(document.documentElement);
      });
    }
    return page.content();
  }
  // markdown: extract text content with basic structure
  return page.evaluate(() => {
    function nodeToMd(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
      if (node.nodeType !== Node.ELEMENT_NODE) return '';
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const children = Array.from(el.childNodes).map(nodeToMd).join('');
      if (tag.match(/^h[1-6]$/)) return '#'.repeat(parseInt(tag[1])) + ' ' + children.trim() + '\n\n';
      if (tag === 'p') return children.trim() + '\n\n';
      if (tag === 'br') return '\n';
      if (tag === 'a') return `[${children}](${el.getAttribute('href') || ''})`;
      if (tag === 'strong' || tag === 'b') return `**${children}**`;
      if (tag === 'em' || tag === 'i') return `*${children}*`;
      if (tag === 'code') return `\`${children}\``;
      if (tag === 'li') return `- ${children.trim()}\n`;
      if (tag === 'ul' || tag === 'ol') return children + '\n';
      return children;
    }
    return nodeToMd(document.body).trim();
  });
}

// ── Metadata collection ───────────────────────────────────────────

async function collectMetadata(
  page: Page,
  params: ScreenshotParams,
  metadata: Record<string, unknown>,
  httpStatusCode?: number,
  httpHeaders?: Record<string, string>,
): Promise<void> {
  if (params.metadata_page_title) {
    metadata.page_title = await page.title();
  }

  if (params.metadata_open_graph) {
    metadata.open_graph = await page.evaluate(() => {
      const og: Record<string, string> = {};
      document.querySelectorAll('meta[property^="og:"]').forEach((el) => {
        const prop = el.getAttribute('property');
        const content = el.getAttribute('content');
        if (prop && content) og[prop.replace('og:', '')] = content;
      });
      return Object.keys(og).length > 0 ? og : null;
    });
  }

  if (params.metadata_icon) {
    metadata.icon = await page.evaluate(() => {
      const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      return link ? link.getAttribute('href') : null;
    });
  }

  if (params.metadata_fonts) {
    metadata.fonts = await page.evaluate(() => {
      const fonts = new Set<string>();
      document.fonts.forEach((f) => fonts.add(f.family));
      return Array.from(fonts);
    });
  }

  if (params.metadata_content) {
    if (params.metadata_content_format === 'markdown') {
      metadata.content = await extractPageContent(page, 'markdown', params.include_shadow_dom);
    } else {
      metadata.content = await page.content();
    }
  }

  if (params.metadata_http_response_status_code && httpStatusCode !== undefined) {
    metadata.http_response_status_code = httpStatusCode;
  }

  if (params.metadata_http_response_headers && httpHeaders) {
    metadata.http_response_headers = httpHeaders;
  }
}

// ── Blocking helpers ───────────────────────────────────────────────

async function hideElements(page: Page, selectors: string[]): Promise<void> {
  await page.evaluate((sels) => {
    for (const sel of sels) {
      try {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.setProperty('display', 'none', 'important');
        });
      } catch { /* skip invalid selectors */ }
    }
  }, selectors);
}

const COOKIE_BANNER_SELECTORS = [
  '#CybotCookiebotDialog', '#CybotCookiebotDialogBodyUnderlay',
  '#onetrust-consent-sdk', '#onetrust-banner-sdk', '.onetrust-pc-dark-filter',
  '.cky-consent-container', '#cookie-law-info-bar',
  '.osano-cm-window', '.osano-cm-dialog',
  '.qc-cmp2-container', '#truste-consent-track', '#truste-consent-content', '#consent-bump',
  '#cmplz-cookiebanner-container', '.cmplz-cookiebanner',
  '#cookie-notice', '.cookie-notice-container',
  '#termly-code-snippet-support', '.t-consentPrompt',
  '#moove_gdpr_cookie_info_bar',
  '#iubenda-cs-banner',
  '.klaro',
  '#usercentrics-root',
  '#didomi-host', '#didomi-popup',
  '.sp_message_container', 'div[id^="sp_message_container"]',
  '.fides-overlay', '#fides-banner',
  '[class*="cookie-banner"]', '[class*="cookie-consent"]',
  '[class*="cookieBanner"]', '[class*="cookieConsent"]',
  '[id*="cookie-banner"]', '[id*="cookie-consent"]',
  '[id*="cookieBanner"]', '[id*="cookieConsent"]',
  '[class*="gdpr"]', '[id*="gdpr"]',
  '[class*="cc-window"]', '.cc-banner', '#cc-main',
  '#sliding-popup', '.eu-cookie-compliance-banner',
  '[aria-label="Cookie consent"]', '[aria-label="Cookie banner"]',
  '[aria-label="cookie consent"]',
  '[data-testid="cookie-banner"]', '[data-testid="cookie-consent"]',
];

async function hideCookieBanners(page: Page): Promise<void> {
  await page.evaluate((selectors) => {
    for (const sel of selectors) {
      try {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.setProperty('display', 'none', 'important');
        });
      } catch { /* skip */ }
    }
    document.querySelectorAll('body > div').forEach((el) => {
      const style = window.getComputedStyle(el);
      if (
        style.position === 'fixed' &&
        style.zIndex !== 'auto' &&
        parseInt(style.zIndex) > 9000 &&
        (el.textContent?.toLowerCase().includes('cookie') ||
          el.textContent?.toLowerCase().includes('consent') ||
          el.textContent?.toLowerCase().includes('privacy'))
      ) {
        (el as HTMLElement).style.setProperty('display', 'none', 'important');
      }
    });
  }, COOKIE_BANNER_SELECTORS);
}

const CHAT_WIDGET_SELECTORS = [
  '#intercom-container', '#intercom-frame', '.intercom-lightweight-app',
  '.crisp-client',
  '#drift-widget-container', '#drift-frame-controller',
  '#launcher', '.zEWidget-launcher', '#webWidget',
  '#hubspot-messages-iframe-container',
  '.widget-visible', '#tawk-widget-container',
  '#chat-widget-container',
  '#freshworks-container',
  '[class*="chat-widget"]', '[class*="chatWidget"]',
  '[id*="chat-widget"]', '[id*="chatWidget"]',
  '[class*="live-chat"]', '[class*="liveChat"]',
];

async function hideChatWidgets(page: Page): Promise<void> {
  await hideElements(page, CHAT_WIDGET_SELECTORS);
}

// ── Utility ───────────────────────────────────────────────────────

function parseStringList(value: string): string[] {
  return value.split(',').map(s => s.trim()).filter(Boolean);
}
