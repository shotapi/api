import { chromium, type Browser, type Page } from 'playwright';
import sharp from 'sharp';
import type { ScreenshotParams } from './params.js';

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

export async function takeScreenshot(params: ScreenshotParams): Promise<Buffer> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    viewport: {
      width: params.viewport_width,
      height: params.viewport_height,
    },
    deviceScaleFactor: params.device_scale_factor,
    colorScheme: params.dark_mode ? 'dark' : 'light',
  });

  const page = await context.newPage();

  try {
    // Apply custom headers before navigation
    if (params.headers) {
      await page.setExtraHTTPHeaders(params.headers);
    }

    // Apply custom cookies before navigation
    if (params.cookies && params.cookies.length > 0) {
      const targetUrl = new URL(params.url);
      const cookiesForPlaywright = params.cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain || targetUrl.hostname,
        path: c.path || '/',
        ...(c.expires !== undefined && { expires: c.expires }),
        ...(c.httpOnly !== undefined && { httpOnly: c.httpOnly }),
        ...(c.secure !== undefined && { secure: c.secure }),
        ...(c.sameSite !== undefined && { sameSite: c.sameSite }),
      }));
      await context.addCookies(cookiesForPlaywright);
    }

    // Navigate to URL
    await page.goto(params.url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    // Block cookie banners if requested
    if (params.block_cookie_banners) {
      await hideCookieBanners(page);
    }

    // Hide user-specified selectors
    if (params.hide_selectors && params.hide_selectors.length > 0) {
      await page.evaluate((selectors) => {
        for (const sel of selectors) {
          try {
            document.querySelectorAll(sel).forEach((el) => {
              (el as HTMLElement).style.setProperty('display', 'none', 'important');
            });
          } catch {
            // skip invalid selectors
          }
        }
      }, params.hide_selectors);
    }

    // Wait for delay if specified
    if (params.delay > 0) {
      await page.waitForTimeout(params.delay * 1000);
    }

    // Take screenshot
    let screenshot: Buffer;

    if (params.format === 'pdf') {
      screenshot = await page.pdf({
        format: 'A4',
        printBackground: true,
      });
    } else {
      // Always capture as PNG from Playwright (lossless source)
      const captureOptions: Parameters<Page['screenshot']>[0] = {
        type: 'png',
        fullPage: params.full_page,
      };

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
        screenshot = rawPng;
      } else if (params.format === 'webp') {
        screenshot = await sharp(rawPng).webp({ quality: params.image_quality }).toBuffer();
      } else if (params.format === 'jpeg') {
        screenshot = await sharp(rawPng).jpeg({ quality: params.image_quality }).toBuffer();
      } else {
        screenshot = rawPng;
      }
    }

    return screenshot;
  } finally {
    await context.close();
  }
}

// Common cookie consent banner selectors
const COOKIE_BANNER_SELECTORS = [
  // CookieBot
  '#CybotCookiebotDialog',
  '#CybotCookiebotDialogBodyUnderlay',
  // OneTrust
  '#onetrust-consent-sdk',
  '#onetrust-banner-sdk',
  '.onetrust-pc-dark-filter',
  // CookieYes
  '.cky-consent-container',
  '#cookie-law-info-bar',
  // Osano
  '.osano-cm-window',
  '.osano-cm-dialog',
  // Quantcast / TrustArc
  '.qc-cmp2-container',
  '#truste-consent-track',
  '#truste-consent-content',
  '#consent-bump',
  // Complianz
  '#cmplz-cookiebanner-container',
  '.cmplz-cookiebanner',
  // Cookie Notice / Cookie Law Info (WP plugins)
  '#cookie-notice',
  '#cookie-law-info-bar',
  '.cookie-notice-container',
  // Termly
  '#termly-code-snippet-support',
  '.t-consentPrompt',
  // GDPR Cookie Compliance (WP)
  '#moove_gdpr_cookie_info_bar',
  // Iubenda
  '#iubenda-cs-banner',
  // Klaro
  '.klaro',
  // Usercentrics
  '#usercentrics-root',
  // Didomi
  '#didomi-host',
  '#didomi-popup',
  // Sourcepoint
  '.sp_message_container',
  'div[id^="sp_message_container"]',
  // LiveRamp / FairAdChoice
  '.fides-overlay',
  '#fides-banner',
  // Generic patterns
  '[class*="cookie-banner"]',
  '[class*="cookie-consent"]',
  '[class*="cookieBanner"]',
  '[class*="cookieConsent"]',
  '[id*="cookie-banner"]',
  '[id*="cookie-consent"]',
  '[id*="cookieBanner"]',
  '[id*="cookieConsent"]',
  '[class*="gdpr"]',
  '[id*="gdpr"]',
  '[class*="cc-window"]',
  '.cc-banner',
  '#cc-main',
  // EU cookie compliance
  '#sliding-popup',
  '.eu-cookie-compliance-banner',
  // Common generic
  '[aria-label="Cookie consent"]',
  '[aria-label="Cookie banner"]',
  '[aria-label="cookie consent"]',
  '[data-testid="cookie-banner"]',
  '[data-testid="cookie-consent"]',
];

async function hideCookieBanners(page: Page): Promise<void> {
  await page.evaluate((selectors) => {
    for (const sel of selectors) {
      try {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.setProperty('display', 'none', 'important');
        });
      } catch {
        // skip invalid selectors
      }
    }
    // Also remove any overlay/backdrop that blocks the page
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
