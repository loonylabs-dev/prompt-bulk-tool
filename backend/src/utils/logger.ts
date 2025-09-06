/**
 * Simple console-based logger utility
 */

interface LogLevel {
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  DEBUG: 'debug';
}

interface LogMetadata {
  context?: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logLevel: string;

  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  private formatMessage(level: string, message: string, data?: LogMetadata): string {
    const timestamp = new Date().toISOString();
    const context = data?.context || 'App';
    
    let logMessage = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
    
    if (data?.metadata && Object.keys(data.metadata).length > 0) {
      logMessage += ` | ${JSON.stringify(data.metadata)}`;
    }
    
    return logMessage;
  }

  info(message: string, data?: LogMetadata): void {
    const logMessage = this.formatMessage('info', message, data);
    console.log(logMessage);
  }

  warn(message: string, data?: LogMetadata): void {
    const logMessage = this.formatMessage('warn', message, data);
    console.warn(logMessage);
  }

  error(message: string, data?: LogMetadata): void {
    const logMessage = this.formatMessage('error', message, data);
    console.error(logMessage);
  }

  debug(message: string, data?: LogMetadata): void {
    if (this.logLevel === 'debug') {
      const logMessage = this.formatMessage('debug', message, data);
      console.log(logMessage);
    }
  }
}

// Export a singleton instance
export const logger = new Logger();