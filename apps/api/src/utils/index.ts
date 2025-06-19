import { parse } from 'csv-parse/sync';
import type { DatasetCase } from '../types';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Parse CSV string to dataset cases
 */
export function parseCsvToDataset(csvString: string): DatasetCase[] {
  try {
    const records = parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return records.map((record: Record<string, string>) => {
      const adjRw = parseFloat(record['adj RW']);
      if (isNaN(adjRw)) {
        throw new ApiError('Invalid adj RW value in dataset', 400);
      }

      return {
        ...record,
        adjRw,
        caseId: record.case_id || record.id,
      } as DatasetCase;
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(`Error parsing CSV: ${String(error)}`, 400);
  }
}

/**
 * Prepare dataset summary for AI analysis
 */
export function prepareDatasetSummary(cases: DatasetCase[]): string {
  try {
    // Sort by adj RW descending and take top 15
    const topCases = cases
      .sort((a, b) => b.adjRw - a.adjRw)
      .slice(0, 15);

    let summary = 'HIGH-VALUE CASES ANALYSIS:\n';
    summary += '='.repeat(50) + '\n';

    topCases.forEach((case_, index) => {
      summary += `CASE ${case_.caseId || index + 1}: adj RW = ${case_.adjRw.toFixed(2)}\n`;
      summary += `  Primary Diagnosis: ${case_.pdx}\n`;

      // Collect secondary diagnoses
      const sdxCodes: string[] = [];
      for (let i = 1; i <= 15; i++) {
        const sdxValue = case_[`sdx${i}`];
        if (sdxValue && String(sdxValue).trim() !== '') {
          sdxCodes.push(String(sdxValue).trim());
        }
      }

      if (sdxCodes.length > 0) {
        summary += `  Secondary Diagnoses: ${sdxCodes.join(', ')}\n`;
      }

      summary += '-'.repeat(30) + '\n';
    });

    return summary;
  } catch (error) {
    throw new ApiError(`Error preparing dataset summary: ${String(error)}`, 500);
  }
}

/**
 * Validate file type
 */
export function validateFileType(filename: string): boolean {
  return filename.toLowerCase().endsWith('.csv');
}

/**
 * Extract JSON from AI response text
 */
export function extractJsonFromResponse(responseText: string): unknown {
  const jsonStart = responseText.indexOf('{');
  const jsonEnd = responseText.lastIndexOf('}') + 1;

  if (jsonStart === -1 || jsonEnd === 0) {
    throw new ApiError('Invalid JSON response from AI', 500);
  }

  const jsonText = responseText.slice(jsonStart, jsonEnd);

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new ApiError(`JSON parsing error: ${String(error)}`, 500);
  }
}

/**
 * Current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}