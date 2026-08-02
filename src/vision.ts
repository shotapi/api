import type { ScreenshotParams } from './params.js';

interface VisionResult {
  result: string;
}

export async function analyzeWithVision(
  buffer: Buffer,
  params: ScreenshotParams,
): Promise<VisionResult> {
  if (!params.openai_api_key) {
    throw new Error('openai_api_key is required for vision analysis');
  }

  const prompt = params.vision_prompt || 'Describe this screenshot in detail.';
  const maxTokens = params.vision_max_tokens || 1024;
  const base64 = buffer.toString('base64');
  const mimeType = params.format === 'jpeg' ? 'image/jpeg'
    : params.format === 'webp' ? 'image/webp'
    : 'image/png';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.openai_api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${body}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return { result: data.choices[0]?.message?.content || '' };
}
