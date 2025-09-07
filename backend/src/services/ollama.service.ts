import axios from 'axios';
import { appConfig } from '../config/app.config';
import { logger } from '../utils/logger';
import { OllamaMarkdownLogger, OllamaLogSession } from '../utils/ollama-logger';

export interface OllamaResponse {
  message: {
    content: string;
  };
  sessionId?: string;
}

export interface OllamaRequestOptions {
  authToken?: string;
  model?: string;
  temperature?: number;
  baseUrl?: string;
  sessionId?: string;
  debugContext?: string;
}

export interface TokenUsage {
  used: number;
  estimated: boolean;
}

export class OllamaService {
  private readonly defaultOptions: OllamaRequestOptions = {
    authToken: appConfig.ollama.token,
    model: appConfig.ollama.model,
    temperature: 0.8,
    baseUrl: appConfig.ollama.baseUrl,
  };

  /**
   * Sends a request to the Ollama API with System Message
   * @param userPrompt User input
   * @param systemMessage System message for AI behavior
   * @param options Optional configuration
   * @returns API response or null on error
   */
  public async callOllamaApiWithSystemMessage(
    userPrompt: string,
    systemMessage: string,
    options: OllamaRequestOptions = {}
  ): Promise<{ response: OllamaResponse; tokensUsed: TokenUsage } | null> {
    const {
      authToken = this.defaultOptions.authToken,
      model = this.defaultOptions.model,
      temperature = this.defaultOptions.temperature,
      baseUrl = this.defaultOptions.baseUrl,
      sessionId = this.generateSessionId(),
      debugContext = 'PromptBulkTool',
    } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const data: any = {
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      stream: false,
    };
    
    if (sessionId) {
      data.session_id = sessionId;
    }

    const fullPrompt = `System: ${systemMessage}\n\nUser: ${userPrompt}`;
    const estimatedTokens = Math.ceil((systemMessage.length + userPrompt.length) / 4);

    if (appConfig.debug.ollamaRequests) {
      logger.debug('Ollama API Request', {
        context: 'OllamaService',
        metadata: {
          model,
          baseUrl,
          sessionId,
          debugContext,
          estimatedInputTokens: estimatedTokens,
          hasAuthToken: !!authToken
        },
      });
    }

    // Create new logging session
    const logSession = OllamaMarkdownLogger.createSession(
      debugContext ?? 'Unknown-Use-Case',
      model ?? 'unknown',
      baseUrl ?? 'unknown',
      sessionId
    );
    
    // Log request with detailed data
    logSession.logRequest(data, systemMessage, userPrompt);

    const requestStartTime = Date.now();

    try {
      const response = await axios.post(`${baseUrl}/api/chat`, data, {
        headers,
        timeout: 90000, // 90 second timeout
      });

      const requestDuration = Date.now() - requestStartTime;

      if (response && response.status === 200) {
        const aiResponse = response.data as OllamaResponse;
        aiResponse.sessionId = sessionId;

        // Estimate token usage
        const responseTokens = Math.ceil(aiResponse.message.content.length / 4);
        const totalTokens = estimatedTokens + responseTokens;

        if (appConfig.debug.ollamaRequests) {
          logger.debug('Ollama API Response', {
            context: 'OllamaService',
            metadata: {
              sessionId,
              debugContext,
              responseTime: `${requestDuration}ms`,
              estimatedTokens: totalTokens,
              responseLength: aiResponse.message.content.length,
            },
          });
        }

        // Log successful response
        logSession.logResponse(aiResponse, {
          input: estimatedTokens,
          output: responseTokens,
          total: totalTokens
        });

        return {
          response: aiResponse,
          tokensUsed: {
            used: totalTokens,
            estimated: true,
          },
        };
      } else {
        const errorMessage = `HTTP ${response?.status}: ${JSON.stringify(response?.data || {})}`;
        
        logger.error('Ollama API Error', {
          context: 'OllamaService',
          metadata: {
            status: response?.status || 'unknown',
            data: response?.data || {},
            sessionId,
            debugContext,
          },
        });
        return null;
      }
    } catch (error: unknown) {
      const requestDuration = Date.now() - requestStartTime;
      let errorMessage = 'Unknown error';
      let errorDetails: Record<string, any> = {};

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Handle Axios errors
      if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError === true) {
        const axiosError = error as any;

        if (axiosError.response) {
          errorDetails = {
            statusCode: axiosError.response.status,
            statusText: axiosError.response.statusText,
            data: axiosError.response.data,
          };

          // Handle Session ID error (fallback without session_id)
          if (axiosError.response.status === 400 && 
              typeof axiosError.response.data === 'object' &&
              axiosError.response.data?.error?.includes('session_id')) {
            
            logger.warn('Session ID not supported - Retry without session_id', {
              context: 'OllamaService',
              metadata: { sessionId, debugContext },
            });

            try {
              const retryData = { ...data };
              delete retryData.session_id;

              const retryResponse = await axios.post(`${baseUrl}/api/chat`, retryData, { headers });
              
              if (retryResponse && retryResponse.status === 200) {
                const aiResponse = retryResponse.data as OllamaResponse;
                aiResponse.sessionId = sessionId;

                const responseTokens = Math.ceil(aiResponse.message.content.length / 4);
                const totalTokens = estimatedTokens + responseTokens;

                const retryDuration = Date.now() - requestStartTime;
                
                logger.info('Retry successful', {
                  context: 'OllamaService',
                  metadata: { sessionId, debugContext, responseTime: `${retryDuration}ms` },
                });

                // Log successful retry response (update use case to indicate retry)
                const retryLogSession = OllamaMarkdownLogger.createSession(
                  `${debugContext ?? 'Unknown-Use-Case'}-Retry`,
                  model ?? 'unknown',
                  baseUrl ?? 'unknown',
                  sessionId
                );
                retryLogSession.logRequest(retryData, systemMessage, userPrompt);
                retryLogSession.logResponse(aiResponse, {
                  input: estimatedTokens,
                  output: responseTokens,
                  total: totalTokens
                });

                return {
                  response: aiResponse,
                  tokensUsed: {
                    used: totalTokens,
                    estimated: true,
                  },
                };
              }
            } catch (retryError) {
              logger.error('Retry failed', {
                context: 'OllamaService',
                metadata: { 
                  sessionId, 
                  debugContext,
                  retryError: retryError instanceof Error ? retryError.message : 'Unknown retry error',
                },
              });
            }
          }
        }
      }

      logger.error('Ollama API Request failed', {
        context: 'OllamaService',
        metadata: {
          error: errorMessage,
          details: errorDetails,
          sessionId,
          debugContext,
          requestDuration: `${requestDuration}ms`,
        },
      });

      // Log error
      logSession.logError(error);

      return null;
    }
  }

  /**
   * Sends a request to the Ollama API with default system message
   * @param prompt User input
   * @param options Optional configuration
   * @returns API response or null on error
   */
  public async callOllamaApi(
    prompt: string,
    options: OllamaRequestOptions = {}
  ): Promise<{ response: OllamaResponse; tokensUsed: TokenUsage } | null> {
    const defaultSystemMessage = 'You are a helpful assistant that provides clear and precise answers.';
    return this.callOllamaApiWithSystemMessage(prompt, defaultSystemMessage, options);
  }

  /**
   * Estimates the number of tokens for a given text
   * @param text The text to estimate
   * @returns Estimated number of tokens
   */
  public estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Checks if the token limit is reached
   * @param currentTokens Current token count
   * @param additionalTokens Additional tokens
   * @returns Warning or null
   */
  public checkTokenLimit(currentTokens: number, additionalTokens: number): string | null {
    const totalTokens = currentTokens + additionalTokens;
    const maxTokens = 20000; // Default limit for MODEL3
    const warningThreshold = 16000;
    
    if (totalTokens > maxTokens) {
      return `Token limit exceeded: ${totalTokens}/${maxTokens}`;
    }
    
    if (totalTokens > warningThreshold) {
      return `Token warning: ${totalTokens}/${maxTokens} (${Math.round((totalTokens / maxTokens) * 100)}%)`;
    }
    
    return null;
  }

  /**
   * Generates a session ID
   * @returns UUID-like session ID
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Tests the connection to the Ollama API
   * @returns Promise<boolean> - true if successful
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.callOllamaApi('Test', {
        debugContext: 'Connection-Test',
      });
      
      const success = result !== null;
      
      if (success) {
        logger.info('Ollama connection test successful', {
          context: 'OllamaService'
        });
      } else {
        logger.error('Ollama connection test failed', {
          context: 'OllamaService'
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Ollama connection test failed', {
        context: 'OllamaService',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
      return false;
    }
  }
}