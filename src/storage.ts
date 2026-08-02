import { S3Client, PutObjectCommand, type StorageClass, type ObjectCannedACL } from '@aws-sdk/client-s3';
import type { ScreenshotParams } from './params.js';
import crypto from 'crypto';

interface UploadResult {
  location: string;
}

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  tiff: 'image/tiff',
  avif: 'image/avif',
  heif: 'image/heif',
  pdf: 'application/pdf',
  html: 'text/html',
  markdown: 'text/markdown',
};

function buildObjectKey(params: ScreenshotParams): string {
  const hash = crypto.createHash('sha256')
    .update(params.url || params.html || params.markdown || '')
    .update(JSON.stringify({ format: params.format, viewport_width: params.viewport_width, viewport_height: params.viewport_height }))
    .digest('hex')
    .slice(0, 16);

  const ext = params.format === 'jpeg' ? 'jpg' : params.format;
  const filename = `${hash}.${ext}`;

  if (params.storage_path) {
    const path = params.storage_path.replace(/\/+$/, '');
    return `${path}/${filename}`;
  }
  return filename;
}

export async function uploadToStorage(
  buffer: Buffer,
  params: ScreenshotParams,
): Promise<UploadResult> {
  if (!params.storage_bucket) {
    throw new Error('storage_bucket is required when store=true');
  }
  if (!params.storage_access_key_id || !params.storage_secret_access_key) {
    throw new Error('storage_access_key_id and storage_secret_access_key are required when store=true');
  }

  const client = new S3Client({
    endpoint: params.storage_endpoint || undefined,
    region: 'auto',
    credentials: {
      accessKeyId: params.storage_access_key_id,
      secretAccessKey: params.storage_secret_access_key,
    },
    forcePathStyle: true,
  });

  const key = buildObjectKey(params);
  const contentType = CONTENT_TYPES[params.format] || 'application/octet-stream';

  await client.send(new PutObjectCommand({
    Bucket: params.storage_bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    StorageClass: (params.storage_class?.toUpperCase().replace(/-/g, '_') || undefined) as StorageClass | undefined,
    ACL: (params.storage_acl || undefined) as ObjectCannedACL | undefined,
  }));

  const endpoint = params.storage_endpoint?.replace(/\/+$/, '') || `https://${params.storage_bucket}.s3.amazonaws.com`;
  const location = endpoint.includes(params.storage_bucket)
    ? `${endpoint}/${key}`
    : `${endpoint}/${params.storage_bucket}/${key}`;

  client.destroy();

  return { location };
}
