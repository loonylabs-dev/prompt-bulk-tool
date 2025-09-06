import express from 'express';
import { VariableGeneratorUseCase } from '../usecases/variable-generator.usecase';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * POST /api/ai/generate-variable-values
 * Generate creative variable values with specific style direction
 */
router.post('/generate-variable-values', async (req, res) => {
  try {
    const { templateContent, variableName, direction, count, existingValues, verbosity } = req.body;

    // Validate required fields
    if (!templateContent || typeof templateContent !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Template content is required and must be a string'
      });
    }

    if (!variableName || typeof variableName !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Variable name is required and must be a string'
      });
    }

    if (!direction || typeof direction !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Direction is required and must be a string'
      });
    }

    if (!count || typeof count !== 'number' || count < 1 || count > 50) {
      return res.status(400).json({
        success: false,
        error: 'Count must be a number between 1 and 50'
      });
    }

    // Optional existingValues validation
    if (existingValues && !Array.isArray(existingValues)) {
      return res.status(400).json({
        success: false,
        error: 'Existing values must be an array if provided'
      });
    }

    // Optional verbosity validation
    if (verbosity && typeof verbosity !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Verbosity must be a string if provided'
      });
    }

    const validVerbosityLevels = ['title_only', 'short_concise', 'one_sentence'];
    if (verbosity && !validVerbosityLevels.includes(verbosity)) {
      return res.status(400).json({
        success: false,
        error: `Verbosity must be one of: ${validVerbosityLevels.join(', ')}`
      });
    }

    const input = {
      templateContent,
      variableName,
      direction,
      count,
      existingValues: existingValues || [],
      verbosity: verbosity || 'short_concise' // Default verbosity
    };

    logger.info('Generating variable values', {
      context: 'VariableGeneratorAPI',
      metadata: {
        variableName,
        direction,
        count,
        templateLength: templateContent.length,
        existingValuesCount: existingValues?.length || 0
      }
    });

    // Execute the use case
    const variableGenerator = new VariableGeneratorUseCase();
    const result = await variableGenerator.execute(input, {
      debugContext: 'API-Variable-Generator'
    });

    if (!result.success) {
      logger.error('Variable generation failed', {
        context: 'VariableGeneratorAPI',
        metadata: {
          error: result.error,
          variableName,
          direction
        }
      });

      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate variable values'
      });
    }

    logger.info('Variable values generated successfully', {
      context: 'VariableGeneratorAPI',
      metadata: {
        variableName,
        direction,
        generatedCount: result.data?.values.length || 0,
        processingTime: result.processingTime
      }
    });

    res.json({
      success: true,
      data: {
        values: result.data?.values || [],
        variableName,
        direction,
        count: result.data?.values.length || 0
      },
      processingTime: result.processingTime,
      tokensUsed: result.tokens_used
    });

  } catch (error) {
    logger.error('Variable generation API error', {
      context: 'VariableGeneratorAPI',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    });

    res.status(500).json({
      success: false,
      error: 'Internal server error while generating variable values'
    });
  }
});

/**
 * GET /api/ai/test-connection
 * Test Ollama connection
 */
router.get('/test-connection', async (req, res) => {
  try {
    const variableGenerator = new VariableGeneratorUseCase();
    // Access the ollama service through the use case for testing
    const isConnected = await (variableGenerator as any).ollamaService.testConnection();

    res.json({
      success: true,
      connected: isConnected,
      message: isConnected ? 'Ollama connection successful' : 'Ollama connection failed'
    });

  } catch (error) {
    logger.error('Ollama connection test failed', {
      context: 'VariableGeneratorAPI',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    res.status(500).json({
      success: false,
      connected: false,
      error: 'Failed to test Ollama connection'
    });
  }
});

export default router;