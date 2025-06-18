import type {
  DeepSeekMessage,
  DeepSeekResponse,
  DeepSeekOptimizationResult,
} from '../types';
import { env } from '../config';
import { ApiError, extractJsonFromResponse } from '../utils';

/**
 * DeepSeek API client service
 */
export class DeepSeekService {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = env.DEEPSEEK_API_KEY;
    this.baseUrl = env.DEEPSEEK_BASE_URL;
  }

  /**
   * Make chat completion request to DeepSeek API
   */
  async chatCompletion(
    messages: DeepSeekMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
    } = {}
  ): Promise<string> {
    const {
      model = 'deepseek-chat',
      temperature = 0.1,
      maxTokens = 4000,
      timeout = 120000,
    } = options;

    const url = `${this.baseUrl}/chat/completions`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `DeepSeek API Error: ${response.status} ${response.statusText}`,
          response.status
        );
      }

      const result: DeepSeekResponse = await response.json();

      if (!result.choices?.[0]?.message?.content) {
        throw new ApiError('Invalid response structure from DeepSeek API', 500);
      }

      return result.choices[0].message.content;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if ((error as Error).name === 'AbortError') {
        throw new ApiError('DeepSeek API request timeout', 408);
      }

      throw new ApiError(`DeepSeek API Error: ${String(error)}`, 500);
    }
  }

  /**
   * Test connection to DeepSeek API
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.chatCompletion(
        [{ role: 'user', content: 'Respond with "OK" only.' }],
        { timeout: 10000 }
      );
      return response.trim() === 'OK';
    } catch {
      return false;
    }
  }
}