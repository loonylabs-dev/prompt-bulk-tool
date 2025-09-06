import * as fs from 'fs';
import * as path from 'path';

export interface OllamaLogEntry {
  timestamp: string;
  sessionId: string;
  debugContext: string;
  type: 'request' | 'response' | 'error';
  model: string;
  baseUrl: string;
  requestData?: any;
  responseData?: any;
  errorData?: any;
  duration?: string;
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
}

export class OllamaLogger {
  private static readonly LOGS_DIR = path.join(process.cwd(), 'logs', 'ollama');
  private static readonly REQUEST_LOG = path.join(this.LOGS_DIR, 'requests.json');
  private static readonly RESPONSE_LOG = path.join(this.LOGS_DIR, 'responses.json');
  private static readonly ERROR_LOG = path.join(this.LOGS_DIR, 'errors.json');

  static {
    this.ensureLogsDirectory();
  }

  private static ensureLogsDirectory(): void {
    if (!fs.existsSync(this.LOGS_DIR)) {
      fs.mkdirSync(this.LOGS_DIR, { recursive: true });
    }
  }

  private static getLogFilePath(type: 'request' | 'response' | 'error'): string {
    switch (type) {
      case 'request':
        return this.REQUEST_LOG;
      case 'response':
        return this.RESPONSE_LOG;
      case 'error':
        return this.ERROR_LOG;
      default:
        return this.REQUEST_LOG;
    }
  }

  private static appendToLogFile(filePath: string, entry: OllamaLogEntry): void {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(filePath, logLine, 'utf8');
    } catch (error) {
      console.error('[OllamaLogger] Failed to write to log file:', error);
    }
  }

  static logRequest(data: {
    sessionId?: string;
    debugContext?: string;
    model: string;
    baseUrl: string;
    requestData: any;
    estimatedInputTokens?: number;
  }): void {
    const entry: OllamaLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: data.sessionId || 'unknown',
      debugContext: data.debugContext || 'unknown',
      type: 'request',
      model: data.model,
      baseUrl: data.baseUrl,
      requestData: {
        ...data.requestData,
        // Sanitize sensitive data
        messages: data.requestData.messages?.map((msg: any) => ({
          role: msg.role,
          content: msg.content ? `${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}` : msg.content
        }))
      },
      tokens: {
        input: data.estimatedInputTokens
      }
    };

    this.appendToLogFile(this.getLogFilePath('request'), entry);
  }

  static logResponse(data: {
    sessionId?: string;
    debugContext?: string;
    model: string;
    baseUrl: string;
    responseData: any;
    duration: string;
    tokensUsed?: {
      input?: number;
      output?: number;
      total?: number;
    };
  }): void {
    const entry: OllamaLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: data.sessionId || 'unknown',
      debugContext: data.debugContext || 'unknown',
      type: 'response',
      model: data.model,
      baseUrl: data.baseUrl,
      responseData: {
        ...data.responseData,
        // Truncate long responses for readability
        message: data.responseData.message ? {
          ...data.responseData.message,
          content: data.responseData.message.content?.length > 500 ? 
            `${data.responseData.message.content.substring(0, 500)}...` : 
            data.responseData.message.content
        } : data.responseData.message
      },
      duration: data.duration,
      tokens: data.tokensUsed
    };

    this.appendToLogFile(this.getLogFilePath('response'), entry);
  }

  static logError(data: {
    sessionId?: string;
    debugContext?: string;
    model: string;
    baseUrl: string;
    error: any;
    duration?: string;
    requestData?: any;
  }): void {
    const entry: OllamaLogEntry = {
      timestamp: new Date().toISOString(),
      sessionId: data.sessionId || 'unknown',
      debugContext: data.debugContext || 'unknown',
      type: 'error',
      model: data.model,
      baseUrl: data.baseUrl,
      errorData: {
        message: data.error.message || 'Unknown error',
        statusCode: data.error.response?.status || data.error.statusCode,
        statusText: data.error.response?.statusText || data.error.statusText,
        responseData: data.error.response?.data || data.error.data,
        stack: data.error.stack?.split('\n').slice(0, 5).join('\n') // First 5 lines of stack
      },
      duration: data.duration,
      requestData: data.requestData ? {
        ...data.requestData,
        // Sanitize for error logs too
        messages: data.requestData.messages?.map((msg: any) => ({
          role: msg.role,
          content: msg.content ? `${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}` : msg.content
        }))
      } : undefined
    };

    this.appendToLogFile(this.getLogFilePath('error'), entry);
  }

  /**
   * Get recent log entries (for debugging/monitoring)
   */
  static getRecentLogs(type: 'request' | 'response' | 'error', limit: number = 10): OllamaLogEntry[] {
    try {
      const filePath = this.getLogFilePath(type);
      if (!fs.existsSync(filePath)) {
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      const entries = lines
        .slice(-limit)
        .map(line => JSON.parse(line))
        .reverse(); // Most recent first

      return entries;
    } catch (error) {
      console.error('[OllamaLogger] Failed to read log file:', error);
      return [];
    }
  }

  /**
   * Clear old logs (optional cleanup utility)
   */
  static clearLogs(olderThanDays: number = 7): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      ['request', 'response', 'error'].forEach(type => {
        const filePath = this.getLogFilePath(type as any);
        if (!fs.existsSync(filePath)) return;

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        const recentLines = lines.filter(line => {
          try {
            const entry = JSON.parse(line);
            return new Date(entry.timestamp) > cutoffDate;
          } catch {
            return false; // Invalid JSON, remove
          }
        });

        fs.writeFileSync(filePath, recentLines.join('\n') + (recentLines.length > 0 ? '\n' : ''), 'utf8');
      });

      console.log(`[OllamaLogger] Cleared logs older than ${olderThanDays} days`);
    } catch (error) {
      console.error('[OllamaLogger] Failed to clear old logs:', error);
    }
  }
}