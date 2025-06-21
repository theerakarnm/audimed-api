import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { Context } from 'hono';
import { cors } from 'hono/cors'
import { readFile } from 'fs/promises';

import {
  optimizationRequestSchema,
  fileUploadSchema,
  adjRwRequestSchema,
  type OptimizationRequestInput,
  type FileUploadInput,
  type AdjRwRequestInput,
} from '../schemas';
import type { OptimizationResponse, HealthCheckResponse, AdjRwResult } from '../types';
import { OptimizationService } from '../services/optimization.service';
import {
  ApiError,
  parseCsvToDataset,
  validateFileType,
  getCurrentTimestamp,
} from '../utils';
import { API_CONFIG, CORS_CONFIG } from '../config';

const app = new Hono();
const optimizationService = new OptimizationService();

/**
 * Health check endpoint
 */
app.get('/', (c: Context) => {
  return c.json({
    message: API_CONFIG.title,
    status: 'active',
    version: API_CONFIG.version,
  });
});

/**
 * Detailed health check including DeepSeek API
 */
app.get('/health', async (c: Context) => {
  try {
    const deepseekConnected = await optimizationService.testConnection();

    const response: HealthCheckResponse = {
      apiStatus: 'healthy',
      deepseekStatus: deepseekConnected ? 'connected' : 'disconnected',
      timestamp: getCurrentTimestamp(),
    };

    return c.json(response);
  } catch (error) {
    const response: HealthCheckResponse = {
      apiStatus: 'healthy',
      deepseekStatus: 'error',
      error: String(error),
      timestamp: getCurrentTimestamp(),
    };

    return c.json(response);
  }
});

/**
 * Optimize ICD-10 diagnosis codes for maximum adj RW
 */
app.post(
  '/optimize',
  zValidator('json', optimizationRequestSchema),
  async (c) => {
    try {
      const request = c.req.valid('json')

      const datasetPath = '/Users/jametirakarn/Desktop/Theerakarnm/ACC_NIA/predict_factor/apps/api/src/asset/dataset.csv';
      let csvString: string;
      try {
        csvString = await readFile(datasetPath, 'utf8');
      } catch (err) {
        throw new ApiError(`Failed to read dataset file at ${datasetPath}`, 500);
      }
      // Parse CSV data
      const datasetCases = parseCsvToDataset(csvString);

      // Validate required columns exist
      if (datasetCases.length === 0) {
        throw new ApiError('Dataset cannot be empty', 400);
      }

      const firstCase = datasetCases[0];
      if (typeof firstCase.adjRw !== 'number' || !firstCase.pdx) {
        throw new ApiError(
          'Missing required columns: adj RW and pdx are required',
          400
        );
      }

      // Run optimization
      const result = await optimizationService.optimizeDiagnosisCodes(
        datasetCases,
        request.availableCodes,
        request.maxSecondaryDiagnoses
      );

      return c.json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        const response: OptimizationResponse = {
          success: false,
          errorMessage: error.message,
        };
        return c.json(response, 500);
      }

      const response: OptimizationResponse = {
        success: false,
        errorMessage: `Optimization failed: ${String(error)}`,
      };
      return c.json(response, 500);
    }
  }
);

/**
 * Optimize using uploaded CSV file
 */
app.post(
  '/optimize-file',
  zValidator('form', fileUploadSchema),
  async (c) => {
    try {
      const { availableCodes } = c.req.valid('form') as FileUploadInput;

      // Get uploaded file
      const body = await c.req.parseBody();
      const file = body.file as File;

      if (!file) {
        throw new ApiError('File is required', 400);
      }

      // Validate file type
      if (!validateFileType(file.name)) {
        throw new ApiError('File must be a CSV', 400);
      }

      // Read file contents
      const csvString = await file.text();

      // Parse available codes
      const codesArray = availableCodes
        .split(',')
        .map((code) => code.trim())
        .filter((code) => code.length > 0);

      if (codesArray.length < 2) {
        throw new ApiError('Need at least 2 available codes', 400);
      }

      // Parse CSV data
      const datasetCases = parseCsvToDataset(csvString);

      // Run optimization
      const result = await optimizationService.optimizeDiagnosisCodes(
        datasetCases,
        codesArray
      );

      return c.json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        const response: OptimizationResponse = {
          success: false,
          errorMessage: error.message,
        };
        return c.json(response, 500);
      }

      const response: OptimizationResponse = {
        success: false,
        errorMessage: `File optimization failed: ${String(error)}`,
      };
      return c.json(response, 500);
    }
  }
);

/**
 * Evaluate a provided diagnosis code combination
 */
app.post(
  '/adjrw',
  zValidator('json', adjRwRequestSchema),
  async (c) => {
    try {
      const { pdx, sdx } = c.req.valid('json') as AdjRwRequestInput;

      const result: AdjRwResult = await optimizationService.evaluateDiagnosisCodes(pdx, sdx);

      return c.json(result);
    } catch (error) {
      if (error instanceof ApiError) {
        return c.json({ error: error.message }, 500);
      }

      return c.json({ error: `Adj RW evaluation failed: ${String(error)}` }, 500);
    }
  }
);

/**
 * Get example request format
 */
app.get('/example-request', (c: Context) => {
  return c.json({
    exampleRequest: {
      availableCodes: [
        'J150',
        'J180',
        'J156',
        'J960',
        'J969',
        'D638',
        'N179',
        'E871',
        'E876',
        'C56',
        'I829',
        'E834',
        'J47',
        'I500',
        'E43',
        'I214',
        'C794',
        'C795',
        'I632',
        'N390',
      ],
      datasetCsv:
        'case_id,adj RW,pdx,sdx1,sdx2\n001,23.33,J150,J960,D638\n002,12.31,J180,J969,N179',
      maxSecondaryDiagnoses: 12,
    },
    curlExample: `
curl -X POST "http://localhost:8000/optimize" \\
     -H "Content-Type: application/json" \\
     -d '{
       "availableCodes": ["J150", "J180", "J960", "D638"],
       "datasetCsv": "case_id,adj RW,pdx,sdx1\\n001,23.33,J150,J960"
     }'`,
  });
});

export default app;