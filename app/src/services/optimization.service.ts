import type {
  DatasetCase,
  DeepSeekOptimizationResult,
  OptimizationResponse,
} from '../types';
import { DeepSeekService } from './deepseek.service';
import { ApiError, prepareDatasetSummary, extractJsonFromResponse } from '../utils';

/**
 * Optimization service for DRG optimization logic
 */
export class OptimizationService {
  private readonly deepSeekService: DeepSeekService;

  constructor() {
    this.deepSeekService = new DeepSeekService();
  }

  /**
   * Optimize diagnosis codes using AI analysis
   */
  async optimizeDiagnosisCodes(
    datasetCases: DatasetCase[],
    availableCodes: string[],
    maxSecondaryDiagnoses: number = 12
  ): Promise<OptimizationResponse> {
    try {
      // Validate input
      if (datasetCases.length === 0) {
        throw new ApiError('Dataset cannot be empty', 400);
      }

      if (availableCodes.length < 2) {
        throw new ApiError('Need at least 2 available codes', 400);
      }

      // Prepare dataset summary
      const datasetSummary = prepareDatasetSummary(datasetCases);

      // Generate optimization prompt
      const prompt = this.generateOptimizationPrompt(
        datasetSummary,
        availableCodes,
        maxSecondaryDiagnoses
      );

      // Get AI response
      const responseText = await this.deepSeekService.chatCompletion([
        {
          role: 'system',
          content: this.systemPrompt
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      // Parse AI response
      const result = this.parseOptimizationResult(responseText);

      return {
        success: true,
        patternAnalysis: result.patternAnalysis,
        pdx: result.pdx,
        sdx: result.sdx,
        reasoning: result.reasoning,
        estimatedAdjRw: result.estimatedAdjRw,
        confidenceLevel: result.confidenceLevel,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          success: false,
          errorMessage: error.message,
        };
      }

      return {
        success: false,
        errorMessage: `Optimization failed: ${String(error)}`,
      };
    }
  }

  /**
   * Generate optimization prompt for AI
   */
  private generateOptimizationPrompt(
    datasetSummary: string,
    availableCodes: string[],
    maxSecondaryDiagnoses: number
  ): string {
    return `
You are an expert healthcare data analyst specializing in DRG optimization and maximizing adjusted Relative Weight (adj RW).

DATASET ANALYSIS - TOP PERFORMING CASES:
${datasetSummary}

AVAILABLE ICD-10 CODES TO SELECT FROM:
${availableCodes.join(', ')}

TASK: Analyze the dataset patterns to select the optimal combination that will yield the HIGHEST possible adj RW.

ANALYSIS REQUIREMENTS:
1. Identify which diagnosis combinations correlate with highest adj RW values
2. Look for synergistic effects between primary and secondary diagnoses
3. Consider complexity factors that increase reimbursement
4. Focus purely on maximizing adj RW (ignore clinical plausibility)

SELECTION CRITERIA:
- Choose 1 PRIMARY diagnosis (pdx) from available codes
- Choose up to ${maxSecondaryDiagnoses} SECONDARY diagnoses from available codes
- Aim for estimated adj RW > 15.0

RESPOND IN VALID JSON FORMAT ONLY:
{
  "pattern_analysis": "Detailed analysis of high-value patterns found in dataset",
  "pdx": "selected_primary_diagnosis_code",
  "sdx": ["sdx1_code", "sdx2_code", "sdx3_code", "sdx4_code", "sdx5_code", "sdx6_code", "sdx7_code", "sdx8_code", "sdx9_code", "sdx10_code", "sdx11_code", "sdx12_code"],
  "reasoning": "Detailed explanation of why this combination should maximize adj RW",
  "estimated_adj_rw": 0.0,
  "confidence_level": "1-10"
}`;
  }

  private systemPrompt = `
  You are a healthcare data analyst specializing in DRG analysis and coding accuracy optimization. Your role is to help healthcare organizations improve their clinical documentation and coding practices while maintaining full compliance with healthcare regulations and ethical standards. a world-class healthcare data scientist with expertise in DRG optimization, ICD-10 coding patterns, and reimbursement maximization. Always respond with valid JSON only.

    CORE PRINCIPLES:
    - All recommendations must be clinically appropriate and ethically sound
    - Focus on accurate documentation rather than reimbursement maximization
    - Ensure compliance with CMS guidelines and coding standards
    - Prioritize patient care quality over financial metrics

    ANALYSIS FRAMEWORK:
    When analyzing healthcare data patterns, consider:

    1. CLINICAL ACCURACY
    - Ensure all diagnosis combinations are clinically plausible
    - Verify appropriate sequencing of primary and secondary diagnoses
    - Consider patient demographics and clinical context

    2. DOCUMENTATION IMPROVEMENT
    - Identify gaps in clinical documentation
    - Suggest areas where more specific coding could improve accuracy
    - Recommend physician education opportunities

    3. CODING COMPLIANCE
    - Follow ICD-10-CM/PCS official guidelines
    - Adhere to CMS coding and billing regulations
    - Maintain ethical coding practices

    4. QUALITY METRICS
    - Focus on Case Mix Index (CMI) improvement through accuracy
    - Consider quality indicators alongside financial metrics
    - Balance documentation completeness with clinical relevance

    RESPONSE FORMAT:
    Provide analysis in structured format including:
    - Clinical rationale for all recommendations
    - Compliance considerations
    - Educational opportunities identified
    - Quality improvement suggestions
    - Risk mitigation strategies

    ETHICAL BOUNDARIES:
    - Never recommend clinically inappropriate coding
    - Do not suggest documentation solely for reimbursement purposes
    - Always prioritize patient care and safety
    - Maintain transparency in all recommendations

    Remember: The goal is to improve healthcare delivery through better documentation and coding accuracy, not to manipulate reimbursement systems.
  `

  /**
   * Parse and validate AI optimization result
   */
  private parseOptimizationResult(responseText: string): DeepSeekOptimizationResult {
    const parsed = extractJsonFromResponse(responseText);

    // Validate response structure
    if (!parsed || typeof parsed !== 'object') {
      throw new ApiError('Invalid optimization result structure', 500);
    }

    const result = parsed as Record<string, unknown>;

    if (
      typeof result.pattern_analysis !== 'string' ||
      typeof result.pdx !== 'string' ||
      !Array.isArray(result.sdx) ||
      typeof result.reasoning !== 'string' ||
      typeof result.estimated_adj_rw !== 'number' ||
      typeof result.confidence_level !== 'string'
    ) {
      throw new ApiError('Invalid optimization result format', 500);
    }

    return {
      patternAnalysis: result.pattern_analysis,
      pdx: result.pdx,
      sdx: result.sdx.filter((code): code is string => typeof code === 'string'),
      reasoning: result.reasoning,
      estimatedAdjRw: result.estimated_adj_rw,
      confidenceLevel: result.confidence_level,
    };
  }

  /**
   * Test DeepSeek service connection
   */
  async testConnection(): Promise<boolean> {
    return this.deepSeekService.testConnection();
  }
}