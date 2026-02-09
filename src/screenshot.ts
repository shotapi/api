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
