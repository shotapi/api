import { describe, it, expect, afterEach } from 'vitest';
import { generateApiKey, registerApiKey, validateApiKey, extractApiKey, getKeyUsage } from '../src/auth.js';
import { closeDb } from '../src/db.js';

// Use in-memory DB for tests
process.env.DB_PATH = ':memory:';

describe('Auth', () => {
  afterEach(() => {
    closeDb();
  });

  describe('generateApiKey', () => {
    it('generates key with sa_ prefix', () => {
      const key = generateApiKey();
      expect(key).toMatch(/^sa_[0-9a-f]{32}$/);
    });

    it('generates unique keys', () => {
      const keys = new Set(Array.from({ length: 100 }, () => generateApiKey()));
      expect(keys.size).toBe(100);
    });
  });

  describe('registerApiKey', () => {
    it('registers a new key', () => {
      const result = registerApiKey('test@example.com');
      expect(result.key).toMatch(/^sa_/);
      expect(result.email).toBe('test@example.com');
      expect(result.tier).toBe('free');
    });
  });

  describe('validateApiKey', () => {
    it('validates existing key', () => {
      const registered = registerApiKey('test@example.com');
      const validated = validateApiKey(registered.key);
      expect(validated).not.toBeNull();
      expect(validated!.email).toBe('test@example.com');
    });

    it('returns null for invalid key', () => {
      const result = validateApiKey('sa_nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('extractApiKey', () => {
    const mockHeaders = (headers: Record<string, string>) => ({
      get: (name: string) => headers[name.toLowerCase()],
    });

    it('extracts from access_key query param', () => {
      const key = extractApiKey({ access_key: 'sa_abc123' }, mockHeaders({}));
      expect(key).toBe('sa_abc123');
    });

    it('extracts from api_key query param', () => {
      const key = extractApiKey({ api_key: 'sa_abc123' }, mockHeaders({}));
      expect(key).toBe('sa_abc123');
    });

    it('extracts from Authorization header', () => {
      const key = extractApiKey({}, mockHeaders({ authorization: 'Bearer sa_abc123' }));
      expect(key).toBe('sa_abc123');
    });

    it('extracts from X-Api-Key header', () => {
      const key = extractApiKey({}, mockHeaders({ 'x-api-key': 'sa_abc123' }));
      expect(key).toBe('sa_abc123');
    });

    it('returns undefined when no key provided', () => {
      const key = extractApiKey({}, mockHeaders({}));
      expect(key).toBeUndefined();
    });

    it('prioritizes access_key over header', () => {
      const key = extractApiKey(
        { access_key: 'sa_query' },
        mockHeaders({ authorization: 'Bearer sa_header' })
      );
      expect(key).toBe('sa_query');
    });
  });

  describe('getKeyUsage', () => {
    it('returns usage for existing key', () => {
      const registered = registerApiKey('test@example.com');
      const usage = getKeyUsage(registered.key);
      expect(usage).not.toBeNull();
      expect(usage!.tier).toBe('free');
      expect(usage!.dailyLimit).toBe(100);
      expect(usage!.today).toBe(0);
    });

    it('returns null for non-existent key', () => {
      const usage = getKeyUsage('sa_nonexistent');
      expect(usage).toBeNull();
    });
  });
});
