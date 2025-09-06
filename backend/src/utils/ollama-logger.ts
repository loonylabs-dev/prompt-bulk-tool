import * as fs from 'fs';
import * as path from 'path';

export interface OllamaLogData {
  // Request Information
  requestTimestamp: string;
  responseTimestamp?: string;
  model: string;
  baseUrl: string;
  useCase: string;
  sessionId?: string;
  
  // Request Data
  clientRequestBody: any;
  systemMessage?: string;
  userMessage?: string;
  completeRequestData: any;
  
  // Response Data
  responseData?: any;
  
  // Error Data
  errorData?: any;
  
  // Metadata
  duration?: string;
  tokens?: {
    input?: number;
    output?: number;
    total?: number;
  };
}

export class OllamaMarkdownLogger {
  private static readonly LOGS_DIR = path.join(process.cwd(), 'logs', 'ollama', 'requests');

  static {
    this.ensureLogsDirectory();
  }

  private static ensureLogsDirectory(): void {
    if (!fs.existsSync(this.LOGS_DIR)) {
      fs.mkdirSync(this.LOGS_DIR, { recursive: true });
    }
  }

  /**
   * Creates a complete markdown log file with request and response data combined
   */
  static logRequestResponse(logData: OllamaLogData): string {
    try {
      const timestamp = logData.requestTimestamp.replace(/[:.]/g, '-');
      const useCase = this.sanitizeFilename(logData.useCase);
      const filename = `${timestamp}_${useCase}.md`;
      const filePath = path.join(this.LOGS_DIR, filename);
      
      const markdownContent = this.generateMarkdownContent(logData);
      
      fs.writeFileSync(filePath, markdownContent, 'utf8');
      
      return filePath;
    } catch (error) {
      console.error('[OllamaMarkdownLogger] Failed to write log file:', error);
      return '';
    }
  }

  /**
   * Generates the markdown content following the scribomate pattern
   */
  private static generateMarkdownContent(logData: OllamaLogData): string {
    const sections: string[] = [];
    
    // Header
    sections.push('# Ollama Request & Response Log\n');
    
    // Request Information
    sections.push('## Request Information');
    sections.push(`- **Request Timestamp**: ${logData.requestTimestamp}`);
    if (logData.responseTimestamp) {
      sections.push(`- **Response Timestamp**: ${logData.responseTimestamp}`);
    }
    sections.push(`- **Model**: ${logData.model}`);
    sections.push(`- **Base URL**: ${logData.baseUrl}`);
    sections.push(`- **Use Case**: ${logData.useCase}`);
    if (logData.sessionId) {
      sections.push(`- **Session ID**: ${logData.sessionId}`);
    }
    sections.push('');
    
    // Client Request Body
    if (logData.clientRequestBody) {
      sections.push('## Client Request Body');
      sections.push('```json');
      sections.push(JSON.stringify(logData.clientRequestBody, null, 2));
      sections.push('```\n');
    }
    
    // System Message
    if (logData.systemMessage) {
      sections.push('## System Message');
      sections.push('```');
      sections.push(logData.systemMessage);
      sections.push('```\n');
    }
    
    // User Message  
    if (logData.userMessage) {
      sections.push('## User Message');
      sections.push('```');
      sections.push(logData.userMessage);
      sections.push('```\n');
    }
    
    // Complete Request Data
    sections.push('## Complete Request Data');
    sections.push('```json');
    sections.push(JSON.stringify(logData.completeRequestData, null, 2));
    sections.push('```\n\n');
    
    // Response
    if (logData.responseData) {
      sections.push('## Response');
      sections.push('```');
      if (typeof logData.responseData === 'string') {
        sections.push(logData.responseData);
      } else if (logData.responseData.message?.content) {
        sections.push(logData.responseData.message.content);
      } else {
        sections.push(JSON.stringify(logData.responseData, null, 2));
      }
      sections.push('```\n');
      
      // Token Usage
      if (logData.tokens) {
        sections.push('## Token Usage');
        if (logData.tokens.input) sections.push(`- **Input Tokens**: ${logData.tokens.input}`);
        if (logData.tokens.output) sections.push(`- **Output Tokens**: ${logData.tokens.output}`);
        if (logData.tokens.total) sections.push(`- **Total Tokens**: ${logData.tokens.total}`);
        if (logData.duration) sections.push(`- **Duration**: ${logData.duration}`);
        sections.push('');
      }
    }
    
    // Error
    if (logData.errorData) {
      sections.push('## Error');
      sections.push('```json');
      sections.push(JSON.stringify(logData.errorData, null, 2));
      sections.push('```\n');
    }
    
    // Footer
    sections.push('---');
    sections.push(`*Generated on ${new Date().toISOString()}*`);
    
    return sections.join('\n');
  }
  
  /**
   * Sanitizes filename to be filesystem-safe
   */
  private static sanitizeFilename(useCase: string): string {
    return useCase
      .replace(/[^a-zA-Z0-9\-_]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
  
  /**
   * Creates a session tracker for multi-step logging
   */
  static createSession(useCase: string, model: string, baseUrl: string, sessionId?: string): OllamaLogSession {
    return new OllamaLogSession(useCase, model, baseUrl, sessionId);
  }
  
  /**
   * Get recent log files (for debugging/monitoring)
   */
  static getRecentLogs(limit: number = 10): string[] {
    try {
      if (!fs.existsSync(this.LOGS_DIR)) {
        return [];
      }
      
      const files = fs.readdirSync(this.LOGS_DIR)
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          name: file,
          path: path.join(this.LOGS_DIR, file),
          mtime: fs.statSync(path.join(this.LOGS_DIR, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
        .slice(0, limit)
        .map(file => file.path);
        
      return files;
    } catch (error) {
      console.error('[OllamaMarkdownLogger] Failed to get recent logs:', error);
      return [];
    }
  }
  
  /**
   * Clear old logs (optional cleanup utility)
   */
  static clearLogs(olderThanDays: number = 7): void {
    try {
      if (!fs.existsSync(this.LOGS_DIR)) {
        return;
      }
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const files = fs.readdirSync(this.LOGS_DIR);
      let deletedCount = 0;
      
      files.forEach(file => {
        const filePath = path.join(this.LOGS_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
      
      console.log(`[OllamaMarkdownLogger] Deleted ${deletedCount} log files older than ${olderThanDays} days`);
    } catch (error) {
      console.error('[OllamaMarkdownLogger] Failed to clear old logs:', error);
    }
  }
}

/**
 * Session class for tracking multi-step conversations or operations
 */
export class OllamaLogSession {
  private logData: OllamaLogData;
  private requestStartTime: number = 0;
  
  constructor(useCase: string, model: string, baseUrl: string, sessionId?: string) {
    this.logData = {
      requestTimestamp: new Date().toISOString(),
      model,
      baseUrl,
      useCase,
      sessionId: sessionId || this.generateSessionId(),
      clientRequestBody: {},
      completeRequestData: {}
    };
  }
  
  /**
   * Log the request data
   */
  logRequest(requestData: any, systemMessage?: string, userMessage?: string): void {
    this.requestStartTime = Date.now();
    this.logData.clientRequestBody = requestData;
    this.logData.completeRequestData = requestData;
    this.logData.systemMessage = systemMessage;
    this.logData.userMessage = userMessage;
  }
  
  /**
   * Log the response data and create the markdown file
   */
  logResponse(responseData: any, tokensUsed?: { input?: number; output?: number; total?: number }): string {
    const duration = Date.now() - this.requestStartTime;
    
    this.logData.responseTimestamp = new Date().toISOString();
    this.logData.responseData = responseData;
    this.logData.duration = `${duration}ms`;
    this.logData.tokens = tokensUsed;
    
    return OllamaMarkdownLogger.logRequestResponse(this.logData);
  }
  
  /**
   * Log an error and create the markdown file
   */
  logError(error: any): string {
    const duration = Date.now() - this.requestStartTime;
    
    this.logData.responseTimestamp = new Date().toISOString();
    this.logData.duration = `${duration}ms`;
    this.logData.errorData = {
      message: error.message || 'Unknown error',
      statusCode: error.response?.status || error.statusCode,
      statusText: error.response?.statusText || error.statusText,
      responseData: error.response?.data || error.data,
      stack: error.stack?.split('\n').slice(0, 5).join('\n') // First 5 lines of stack
    };
    
    return OllamaMarkdownLogger.logRequestResponse(this.logData);
  }
  
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Backward compatibility exports (keep existing interface for now)
export const OllamaLogger = {
  logRequest: (data: any) => {
    // Legacy support - create a quick session and log
    const session = OllamaMarkdownLogger.createSession(
      data.debugContext || 'legacy-request',
      data.model || 'unknown',
      data.baseUrl || 'unknown',
      data.sessionId
    );
    session.logRequest(data.requestData, undefined, undefined);
  },
  
  logResponse: (data: any) => {
    // Legacy support - create a quick session and log
    const session = OllamaMarkdownLogger.createSession(
      data.debugContext || 'legacy-response', 
      data.model || 'unknown',
      data.baseUrl || 'unknown',
      data.sessionId
    );
    session.logResponse(data.responseData, data.tokensUsed);
  },
  
  logError: (data: any) => {
    // Legacy support - create a quick session and log
    const session = OllamaMarkdownLogger.createSession(
      data.debugContext || 'legacy-error',
      data.model || 'unknown', 
      data.baseUrl || 'unknown',
      data.sessionId
    );
    session.logError(data.error);
  },
  
  getRecentLogs: (type: string, limit: number = 10) => {
    // Legacy interface - return recent markdown logs
    return OllamaMarkdownLogger.getRecentLogs(limit);
  },
  
  clearLogs: (olderThanDays: number = 7) => {
    OllamaMarkdownLogger.clearLogs(olderThanDays);
  }
};