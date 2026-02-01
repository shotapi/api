import { chromium, type Browser, type Page } from 'playwright';
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
    // Navigate to URL
    await page.goto(params.url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

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
      const options: Parameters<Page['screenshot']>[0] = {
        type: params.format === 'jpeg' ? 'jpeg' : params.format === 'webp' ? 'png' : params.format,
        fullPage: params.full_page,
      };

      // Add quality for jpeg/webp
      if (params.format === 'jpeg') {
        options.quality = params.image_quality;
      }

      // Capture specific element if selector provided
      if (params.selector) {
        const element = await page.$(params.selector);
        if (!element) {
          throw new Error(`Element not found: ${params.selector}`);
        }
        screenshot = await element.screenshot(options);
      } else {
        screenshot = await page.screenshot(options);
      }
    }

    return screenshot;
  } finally {
    await context.close();
  }
}
