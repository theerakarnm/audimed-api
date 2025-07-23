import { DeepSeekService } from './deepseek.service';
import { db } from '../utils/db';
import { icd10, icd9 } from '../utils/db/schema';
import { inArray, sql } from 'drizzle-orm';
import { extractJsonFromResponse, ApiError } from '../utils';
import type { CodeDescription, IcdSuggestionResponse } from '../types';

export class IcdService {
  private readonly deepSeekService = new DeepSeekService();

  async suggestCodes(diagnosis: string): Promise<IcdSuggestionResponse> {
    // 1. Get ICD-10 codes first
    const icd10Prompt = `Given the patient diagnosis "${diagnosis}", suggest the most relevant ICD-10 codes. Respond ONLY with JSON in the format {"icd10": ["code1", "code2", ...]}. Suggest at least 10 codes without dots (.).`;

    const icd10ResponseText = await this.deepSeekService.chatCompletion([
      { role: 'system', content: 'You are a medical coding assistant. Always reply with valid JSON.' },
      { role: 'user', content: icd10Prompt },
    ], {
      response_format: 'json_object'
    });

    console.log({ icd10ResponseText });

    const parsedIcd10 = extractJsonFromResponse(icd10ResponseText);
    if (!parsedIcd10 || typeof parsedIcd10 !== 'object') {
      throw new ApiError('Invalid response from DeepSeek for ICD-10 codes', 500);
    }

    const icd10Result = parsedIcd10 as { icd10?: string[] };
    const icd10Codes = Array.isArray(icd10Result.icd10) ? icd10Result.icd10 : [];

    if (icd10Codes.length === 0) {
      return { icd10: [] };
    }

    // 3. Fetch details from DB
    const icd10Records = await db
      .select({ code: icd10.code, description: icd10.description, category: sql`'icd10' as category` })
      .from(icd10)
      .where(inArray(icd10.code, icd10Codes));

    return {
      icd10: icd10Records as CodeDescription[],
    };
  }

  async suggestCodesIcd9(icd10Codes: string[]): Promise<CodeDescription[]> {
    if (!icd10Codes || icd10Codes.length === 0) {
      throw new ApiError('No ICD-10 codes provided', 400);
    }

    const icd9Prompt = `Given the following ICD-10 diagnosis codes: ${icd10Codes.join(', ')}, recommend the most relevant ICD-9-CM procedure codes that would commonly be performed or indicated for patients with these diagnoses. Consider typical treatment procedures, interventions, and management approaches for conditions like acute myocardial infarction, chronic kidney disease stages, heart failure, dialysis dependence, hypertension, and diabetes. Respond ONLY with JSON in the format {"icd9": ["codeA", "codeB", ...]}. Suggest up to 10 procedure codes without dots or decimal points.`;

    console.log('ICD-9 Prompt:', icd9Prompt);

    const icd9ResponseText = await this.deepSeekService.chatCompletion([
      { role: 'system', content: 'You are a medical coding assistant. Always reply with valid JSON.' },
      { role: 'user', content: icd9Prompt },
    ], {
      response_format: 'json_object'
    });


    console.log(icd9ResponseText);


    const parsedIcd9 = extractJsonFromResponse(icd9ResponseText);
    let icd9Codes: string[] = [];
    if (parsedIcd9 && typeof parsedIcd9 === 'object') {
      const icd9Result = parsedIcd9 as { icd9?: string[] };
      icd9Codes = Array.isArray(icd9Result.icd9) ? icd9Result.icd9 : [];
    }

    const icd9Records = icd9Codes.length
      ? await db
        .select({ code: icd9.code, description: icd9.description, category: sql`'icd9' as category` })
        .from(icd9)
        .where(inArray(icd9.code, icd9Codes))
      : [];

    return icd9Records as CodeDescription[];
  }

  async getIcd10Codes({ codes }: {
    codes: string[],
  }) {
    if (!codes || codes.length === 0) {
      throw new ApiError('No ICD-10 codes provided', 400);
    }

    const records = await db
      .select({ code: icd10.code, description: icd10.description })
      .from(icd10)
      .where(inArray(icd10.code, codes));

    return records as CodeDescription[];
  }
}
