import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@aws-sdk/client-s3', () => {
  const sendMock = vi.fn().mockResolvedValue({});
  const destroyMock = vi.fn();
  return {
    S3Client: vi.fn().mockImplementation(() => ({
      send: sendMock,
      destroy: destroyMock,
    })),
    PutObjectCommand: vi.fn().mockImplementation((input) => input),
    __mocks: { sendMock, destroyMock },
  };
});

import { uploadToStorage } from '../src/storage.js';
import { DEFAULT_PARAMS, type ScreenshotParams } from '../src/params.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const { sendMock, destroyMock } = (await import('@aws-sdk/client-s3') as any).__mocks;

function makeParams(overrides: Partial<ScreenshotParams> = {}): ScreenshotParams {
  return {
    ...DEFAULT_PARAMS,
    url: 'https://example.com',
    store: true,
    storage_bucket: 'test-bucket',
    storage_access_key_id: 'AKID',
    storage_secret_access_key: 'SECRET',
    ...overrides,
  };
}

describe('uploadToStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sendMock.mockResolvedValue({});
  });

  it('uploads buffer to S3 with correct params', async () => {
    const buffer = Buffer.from('fake-png');
    const params = makeParams();
    const result = await uploadToStorage(buffer, params);

    expect(S3Client).toHaveBeenCalledWith(expect.objectContaining({
      region: 'auto',
      credentials: { accessKeyId: 'AKID', secretAccessKey: 'SECRET' },
      forcePathStyle: true,
    }));

    expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
      Bucket: 'test-bucket',
      Body: buffer,
      ContentType: 'image/png',
    }));

    expect(sendMock).toHaveBeenCalledOnce();
    expect(destroyMock).toHaveBeenCalledOnce();
    expect(result.location).toContain('test-bucket');
    expect(result.location).toMatch(/\.png$/);
  });

  it('uses custom endpoint for R2/compatible stores', async () => {
    const params = makeParams({
      storage_endpoint: 'https://abc123.r2.cloudflarestorage.com',
    });
    await uploadToStorage(Buffer.from('x'), params);

    expect(S3Client).toHaveBeenCalledWith(expect.objectContaining({
      endpoint: 'https://abc123.r2.cloudflarestorage.com',
    }));
  });

  it('builds key with storage_path prefix', async () => {
    const params = makeParams({ storage_path: 'screenshots/2026' });
    const result = await uploadToStorage(Buffer.from('x'), params);

    expect(result.location).toMatch(/screenshots\/2026\/.+\.png$/);
  });

  it('uses jpg extension for jpeg format', async () => {
    const params = makeParams({ format: 'jpeg' });
    const result = await uploadToStorage(Buffer.from('x'), params);

    expect(result.location).toMatch(/\.jpg$/);
    expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
      ContentType: 'image/jpeg',
    }));
  });

  it('passes storage_class and storage_acl', async () => {
    const params = makeParams({
      storage_class: 'standard_ia',
      storage_acl: 'public-read',
    });
    await uploadToStorage(Buffer.from('x'), params);

    expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
      StorageClass: 'STANDARD_IA',
      ACL: 'public-read',
    }));
  });

  it('throws if storage_bucket is missing', async () => {
    const params = makeParams({ storage_bucket: undefined });
    await expect(uploadToStorage(Buffer.from('x'), params)).rejects.toThrow('storage_bucket is required');
  });

  it('throws if credentials are missing', async () => {
    const params = makeParams({ storage_access_key_id: undefined });
    await expect(uploadToStorage(Buffer.from('x'), params)).rejects.toThrow('storage_access_key_id and storage_secret_access_key are required');
  });

  it('generates deterministic keys for same input', async () => {
    const params = makeParams();
    const r1 = await uploadToStorage(Buffer.from('x'), params);
    const r2 = await uploadToStorage(Buffer.from('x'), params);
    expect(r1.location).toBe(r2.location);
  });

  it('generates different keys for different URLs', async () => {
    const r1 = await uploadToStorage(Buffer.from('x'), makeParams({ url: 'https://a.com' }));
    const r2 = await uploadToStorage(Buffer.from('x'), makeParams({ url: 'https://b.com' }));
    expect(r1.location).not.toBe(r2.location);
  });

  it('handles PDF format', async () => {
    const params = makeParams({ format: 'pdf' });
    const result = await uploadToStorage(Buffer.from('x'), params);

    expect(result.location).toMatch(/\.pdf$/);
    expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
      ContentType: 'application/pdf',
    }));
  });

  it('builds location URL correctly for custom endpoint with bucket in path', async () => {
    const params = makeParams({
      storage_endpoint: 'https://abc.r2.cloudflarestorage.com',
    });
    const result = await uploadToStorage(Buffer.from('x'), params);
    expect(result.location).toMatch(/^https:\/\/abc\.r2\.cloudflarestorage\.com\/test-bucket\//);
  });

  it('builds location URL correctly for default S3 endpoint', async () => {
    const params = makeParams();
    const result = await uploadToStorage(Buffer.from('x'), params);
    expect(result.location).toMatch(/^https:\/\/test-bucket\.s3\.amazonaws\.com\//);
  });
});
