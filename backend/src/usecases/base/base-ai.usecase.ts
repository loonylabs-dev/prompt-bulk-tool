import { OllamaService } from '../../services/ollama.service';
import { logger } from '../../utils/logger';

/**
 * Standard AI Response Interface
 */
export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  processingTime: number;
  tokens_used?: number;
  debug_context?: string;
}

/**
 * AI Request Context Interface
 */
export interface AIRequestContext {
  debugContext?: string;
  maxRetries?: number;
  timeout?: number;
  requiresJSONResponse?: boolean;
}

/**
 * Abstract Base AI UseCase
 * All AI interactions should extend this class
 */
export abstract class BaseAIUseCase<TInput, TOutput> {
  protected ollamaService: OllamaService;
  protected useCaseName: string;

  constructor(useCaseName: string) {
    this.ollamaService = new OllamaService();
    this.useCaseName = useCaseName;
  }

  /**
   * Main execution method - implements the common AI interaction pattern
   */
  public async execute(input: TInput, context?: AIRequestContext): Promise<AIResponse<TOutput>> {
    const startTime = Date.now();
    
    logger.info(`Starting AI UseCase: ${this.useCaseName}`, {
      context: this.useCaseName,
      metadata: {
        input: this.sanitizeInputForLogging(input),
        debugContext: context?.debugContext
      }
    });

    try {
      // 1. Validate input
      const validationResult = this.validateInput(input);
      if (!validationResult.isValid) {
        return this.createErrorResponse(validationResult.error || 'Invalid input', startTime);
      }

      // 2. Build system message
      const systemMessage = this.buildSystemMessage(input);

      // 3. Build user message
      const userMessage = this.buildUserMessage(input);

      // 4. Call AI service
      const aiResult = await this.ollamaService.callOllamaApiWithSystemMessage(
        userMessage,
        systemMessage,
        {
          debugContext: context?.debugContext || this.useCaseName
        }
      );

      // 5. Process AI response
      if (!aiResult?.response?.message?.content) {
        return this.createErrorResponse('No content in AI response', startTime);
      }

      // 6. Parse and validate response
      const parsedOutput = await this.parseAIResponse(aiResult.response.message.content, input);
      
      const processingTime = Date.now() - startTime;

      logger.info(`AI UseCase completed: ${this.useCaseName}`, {
        context: this.useCaseName,
        metadata: {
          processingTime,
          success: true,
          tokens_used: typeof aiResult.tokensUsed === 'object' ? (aiResult.tokensUsed.used || 0) : (aiResult.tokensUsed || 0)
        }
      });

      return {
        success: true,
        data: parsedOutput,
        processingTime,
        tokens_used: typeof aiResult.tokensUsed === 'object' ? (aiResult.tokensUsed.used || 0) : (aiResult.tokensUsed || 0),
        debug_context: context?.debugContext
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error(`AI UseCase failed: ${this.useCaseName}`, {
        context: this.useCaseName,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          processingTime,
          input: this.sanitizeInputForLogging(input)
        }
      });

      return this.createErrorResponse(
        error instanceof Error ? error.message : 'Unknown error occurred',
        startTime
      );
    }
  }

  /**
   * Abstract methods to be implemented by concrete use cases
   */
  protected abstract validateInput(input: TInput): { isValid: boolean; error?: string };
  protected abstract buildSystemMessage(input: TInput): string;
  protected abstract buildUserMessage(input: TInput): string;
  protected abstract parseAIResponse(rawResponse: string, originalInput: TInput): Promise<TOutput>;

  /**
   * Optional method for input sanitization in logs
   */
  protected sanitizeInputForLogging(input: TInput): any {
    // Default implementation - can be overridden for sensitive data
    return input;
  }

  /**
   * Helper method to create error responses
   */
  protected createErrorResponse(error: string, startTime: number): AIResponse<TOutput> {
    return {
      success: false,
      error,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Helper method for JSON response parsing with fallback
   */
  protected parseJSONResponse<T>(rawResponse: string, fallbackData?: T): T | null {
    try {
      // Clean JSON response (remove markdown code blocks)
      let cleanedContent = rawResponse.trim();
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      logger.warn(`JSON parse error in ${this.useCaseName}`, {
        context: this.useCaseName,
        metadata: {
          error: parseError instanceof Error ? parseError.message : 'Parse error',
          rawResponse: rawResponse.substring(0, 200) + '...'
        }
      });
      
      return fallbackData || null;
    }
  }

  /**
   * Helper method for simple text response validation
   */
  protected validateTextResponse(response: string, minLength: number = 10): boolean {
    return typeof response === 'string' && response.trim().length >= minLength;
  }

  /**
   * Helper method to apply templates with parameters
   */
  protected applyTemplate(templateFn: (params: any) => string, params: any): string {
    try {
      return templateFn(params);
    } catch (error) {
      logger.error(`Template application failed in ${this.useCaseName}`, {
        context: this.useCaseName,
        metadata: {
          error: error instanceof Error ? error.message : 'Template error',
          params: this.sanitizeInputForLogging(params)
        }
      });
      throw new Error(`Template application failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}