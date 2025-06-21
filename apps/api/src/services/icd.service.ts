import { DeepSeekService } from './deepseek.service';
import { db } from '../utils/db';
import { icd10, icd9 } from '../utils/db/schema';
import { inArray } from 'drizzle-orm';
import { extractJsonFromResponse, ApiError } from '../utils';
import type { CodeDescription, IcdSuggestionResponse } from '../types';

export class IcdService {
  private readonly deepSeekService = new DeepSeekService();

  async suggestCodes(diagnosis: string): Promise<IcdSuggestionResponse> {
    const prompt = `Given the patient diagnosis "${diagnosis}", suggest the most relevant ICD-10 and ICD-9 codes. ` +
      `Respond ONLY with JSON in the format {"icd10": ["code1"], "icd9": ["codeA"]}`;

    const responseText = await this.deepSeekService.chatCompletion([
      { role: 'system', content: 'You are a medical coding assistant. Always reply with valid JSON.' },
      { role: 'user', content: prompt },
    ]);

    const parsed = extractJsonFromResponse(responseText);
    if (!parsed || typeof parsed !== 'object') {
      throw new ApiError('Invalid response from DeepSeek', 500);
    }

    const result = parsed as { icd10?: string[]; icd9?: string[] };
    const icd10Codes = Array.isArray(result.icd10) ? result.icd10 : [];
    const icd9Codes = Array.isArray(result.icd9) ? result.icd9 : [];

    const icd10Records = icd10Codes.length
      ? await db
          .select({ code: icd10.code, description: icd10.description })
          .from(icd10)
          .where(inArray(icd10.code, icd10Codes))
      : [];

    const icd9Records = icd9Codes.length
      ? await db
          .select({ code: icd9.code, description: icd9.description })
          .from(icd9)
          .where(inArray(icd9.code, icd9Codes))
      : [];

    return {
      icd10: icd10Records as CodeDescription[],
      icd9: icd9Records as CodeDescription[],
    };
  }
}
