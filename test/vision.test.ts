import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeWithVision } from '../src/vision.js';
import { DEFAULT_PARAMS, type ScreenshotParams } from '../src/params.js';

function makeParams(overrides: Partial<ScreenshotParams> = {}): ScreenshotParams {
  return {
    ...DEFAULT_PARAMS,
    url: 'https://example.com',
    openai_api_key: 'sk-test-key',
    ...overrides,
  };
}

describe('analyzeWithVision', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends correct request to OpenAI API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: 'A screenshot of example.com' } }],
      }), { status: 200 }),
    );

    const result = await analyzeWithVision(Buffer.from('png-data'), makeParams());

    expect(result.result).toBe('A screenshot of example.com');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer sk-test-key',
        }),
      }),
    );

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as any).body);
    expect(body.model).toBe('gpt-4o-mini');
    expect(body.messages[0].content).toHaveLength(2);
    expect(body.messages[0].content[0].type).toBe('text');
    expect(body.messages[0].content[1].type).toBe('image_url');
  });

  it('uses custom vision_prompt', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: 'Custom analysis' } }],
      }), { status: 200 }),
    );

    const result = await analyzeWithVision(
      Buffer.from('x'),
      makeParams({ vision_prompt: 'Extract all text from this image' }),
    );

    expect(result.result).toBe('Custom analysis');
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as any).body);
    expect(body.messages[0].content[0].text).toBe('Extract all text from this image');
  });

  it('uses custom vision_max_tokens', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: 'ok' } }],
      }), { status: 200 }),
    );

    await analyzeWithVision(Buffer.from('x'), makeParams({ vision_max_tokens: 500 }));
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as any).body);
    expect(body.max_tokens).toBe(500);
  });

  it('throws on OpenAI API error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Unauthorized', { status: 401 }),
    );

    await expect(analyzeWithVision(Buffer.from('x'), makeParams()))
      .rejects.toThrow('OpenAI API error (401)');
  });

  it('throws if openai_api_key is missing', async () => {
    await expect(analyzeWithVision(Buffer.from('x'), makeParams({ openai_api_key: undefined })))
      .rejects.toThrow('openai_api_key is required');
  });

  it('sets correct mime type for jpeg format', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({
        choices: [{ message: { content: 'ok' } }],
      }), { status: 200 }),
    );

    await analyzeWithVision(Buffer.from('x'), makeParams({ format: 'jpeg' }));
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as any).body);
    expect(body.messages[0].content[1].image_url.url).toContain('data:image/jpeg;base64,');
  });
});
