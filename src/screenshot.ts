import { chromium, type Browser, type Page, type BrowserContext, type Route } from 'playwright';
import sharp from 'sharp';
import type { ScreenshotParams, WaitUntilEvent } from './params.js';

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

// Map our wait_until values to Playwright's
function toPlaywrightWaitUntil(events: WaitUntilEvent[]): 'load' | 'domcontentloaded' | 'networkidle' | 'commit' {
  // Playwright page.goto accepts a single waitUntil value.
  // Priority: networkidle > load > domcontentloaded > commit
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

export async function takeScreenshot(params: ScreenshotParams): Promise<{ buffer: Buffer; metadata?: Record<string, unknown> }> {
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

  try {
    // Set up request blocking before navigation
    if (params.block_requests.length > 0 || params.block_resources.length > 0) {
      await page.route('**/*', (route: Route) => {
        const request = route.request();

        // Block by resource type
        if (params.block_resources.length > 0 && params.block_resources.includes(request.resourceType())) {
          return route.abort();
        }

        // Block by URL pattern
        if (params.block_requests.length > 0) {
          const url = request.url();
          for (const pattern of params.block_requests) {
            if (url.includes(pattern)) return route.abort();
          }
        }

        return route.continue();
      });
    }

    // Apply custom headers before navigation
    if (params.headers) {
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

    // Emulate media type
    if (params.media_type) {
      await page.emulateMedia({ media: params.media_type });
    }

    // Navigate to source
    const navigationTimeout = params.navigation_timeout * 1000;
    const waitUntil = toPlaywrightWaitUntil(params.wait_until);

    if (params.url) {
      const response = await page.goto(params.url, { waitUntil, timeout: navigationTimeout });
      if (!params.ignore_host_errors && response && !response.ok() && response.status() !== 304) {
        throw new Error(`Navigation failed with status ${response.status()}`);
      }
    } else if (params.html) {
      await page.setContent(params.html, { waitUntil, timeout: navigationTimeout });
    } else if (params.markdown) {
      await page.setContent(MARKDOWN_TEMPLATE(params.markdown), { waitUntil, timeout: navigationTimeout });
      // Wait for marked.js to render
      await page.waitForFunction(() => {
        const el = document.getElementById('content');
        return el && el.innerHTML.length > 0;
      }, { timeout: 5000 });
    }

    // Wait for a specific selector if requested
    if (params.wait_for_selector) {
      await page.waitForSelector(params.wait_for_selector, { timeout: navigationTimeout });
    }

    // Inject custom CSS
    if (params.styles) {
      await page.addStyleTag({ content: params.styles });
    }

    // Block cookie banners
    if (params.block_cookie_banners) {
      await hideCookieBanners(page);
    }

    // Block chat widgets
    if (params.block_chats) {
      await hideChatWidgets(page);
    }

    // Block trackers (inject after navigation to prevent tracking scripts from loading)
    // Note: for pre-navigation blocking, use block_resources: ['script'] or block_requests

    // Hide user-specified selectors
    if (params.hide_selectors && params.hide_selectors.length > 0) {
      await hideElements(page, params.hide_selectors);
    }

    // Execute custom JavaScript
    if (params.scripts) {
      await page.evaluate(params.scripts);
    }

    // Click element if requested
    if (params.click) {
      await page.click(params.click, { timeout: 3000 }).catch(() => {
        throw new Error(`Click target not found: ${params.click}`);
      });
    }

    // Wait for delay
    if (params.delay > 0) {
      await page.waitForTimeout(params.delay * 1000);
    }

    // Full page scroll to trigger lazy loading
    if (params.full_page && params.full_page_scroll) {
      await scrollFullPage(page, params.full_page_scroll_delay, params.full_page_max_height);
    }

    // Take screenshot
    let screenshot: Buffer;
    const metadata: Record<string, unknown> = {};

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

    if (params.response_type === 'json') {
      const img = sharp(screenshot);
      const meta = await img.metadata();
      metadata.width = meta.width;
      metadata.height = meta.height;
      metadata.format = params.format;
      metadata.size = screenshot.length;
    }

    return { buffer: screenshot, metadata: Object.keys(metadata).length > 0 ? metadata : undefined };
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
      throw new Error(`Element not found: ${params.selector}`);
    }
    rawPng = await element.screenshot(captureOptions);
  } else {
    rawPng = await page.screenshot(captureOptions);
  }

  // Convert to requested format via sharp
  if (params.format === 'png') {
    return rawPng;
  } else if (params.format === 'webp') {
    return sharp(rawPng).webp({ quality: params.image_quality }).toBuffer();
  } else if (params.format === 'jpeg') {
    return sharp(rawPng).jpeg({ quality: params.image_quality }).toBuffer();
  }
  return rawPng;
}

async function capturePdf(page: Page, params: ScreenshotParams): Promise<Buffer> {
  const margin = params.pdf_margin || '0';
  return page.pdf({
    format: params.pdf_paper_format as any,
    printBackground: params.pdf_print_background,
    landscape: params.pdf_landscape,
    margin: {
      top: params.pdf_margin_top || margin,
      right: params.pdf_margin_right || margin,
      bottom: params.pdf_margin_bottom || margin,
      left: params.pdf_margin_left || margin,
    },
  });
}

async function scrollFullPage(page: Page, scrollDelay: number, maxHeight?: number): Promise<void> {
  await page.evaluate(async ([delay, maxH]) => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const scrollStep = window.innerHeight;
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
  }, [scrollDelay, maxHeight ?? 0] as const);
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
  // Intercom
  '#intercom-container', '#intercom-frame', '.intercom-lightweight-app',
  // Crisp
  '.crisp-client',
  // Drift
  '#drift-widget-container', '#drift-frame-controller',
  // Zendesk
  '#launcher', '.zEWidget-launcher', '#webWidget',
  // HubSpot
  '#hubspot-messages-iframe-container',
  // Tawk.to
  '.widget-visible', '#tawk-widget-container',
  // LiveChat
  '#chat-widget-container',
  // Freshdesk/Freshchat
  '#freshworks-container',
  // Generic patterns
  '[class*="chat-widget"]', '[class*="chatWidget"]',
  '[id*="chat-widget"]', '[id*="chatWidget"]',
  '[class*="live-chat"]', '[class*="liveChat"]',
];

async function hideChatWidgets(page: Page): Promise<void> {
  await hideElements(page, CHAT_WIDGET_SELECTORS);
}
