import { describe, it, expect } from 'vitest';
import { layout } from '../src/pages/layout.js';
import { landingPage } from '../src/pages/landing.js';
import { docsPage } from '../src/pages/docs.js';

describe('Pages', () => {
  describe('layout', () => {
    it('wraps content with HTML structure', () => {
      const html = layout({
        title: 'Test Page',
        description: 'Test description',
        path: '/test',
        content: '<p>Hello</p>',
      });
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<title>Test Page</title>');
      expect(html).toContain('<meta name="description" content="Test description">');
      expect(html).toContain('<link rel="canonical" href="https://shotapi.io/test">');
      expect(html).toContain('<p>Hello</p>');
      expect(html).toContain('tailwindcss');
    });

    it('includes Open Graph tags', () => {
      const html = layout({
        title: 'OG Test',
        description: 'OG desc',
        path: '/',
        content: '',
      });
      expect(html).toContain('og:title');
      expect(html).toContain('og:description');
      expect(html).toContain('og:image');
    });

    it('includes navigation', () => {
      const html = layout({ title: '', description: '', path: '/', content: '' });
      expect(html).toContain('ShotAPI');
      expect(html).toContain('/docs');
      expect(html).toContain('/pricing');
    });

    it('includes footer', () => {
      const html = layout({ title: '', description: '', path: '/', content: '' });
      expect(html).toContain('Documentation');
      expect(html).toContain('vs ScreenshotOne');
    });
  });

  describe('landingPage', () => {
    it('renders hero section', () => {
      const html = landingPage();
      expect(html).toContain('Screenshot');
      expect(html).toContain('API');
    });

    it('renders code examples', () => {
      const html = landingPage();
      expect(html).toContain('curl');
    });

    it('renders pricing table', () => {
      const html = landingPage();
      expect(html).toContain('Free');
      expect(html).toContain('Starter');
      expect(html).toContain('Pro');
      expect(html).toContain('$9');
      expect(html).toContain('$29');
    });

    it('renders FAQ', () => {
      const html = landingPage();
      expect(html).toContain('<details');
    });
  });

  describe('docsPage', () => {
    it('renders parameter documentation', () => {
      const html = docsPage();
      expect(html).toContain('url');
      expect(html).toContain('format');
      expect(html).toContain('viewport_width');
    });

    it('renders authentication section', () => {
      const html = docsPage();
      expect(html).toContain('access_key');
      expect(html).toContain('Authorization');
    });

    it('renders code examples', () => {
      const html = docsPage();
      expect(html).toContain('curl');
      expect(html).toContain('fetch');
    });
  });
});
