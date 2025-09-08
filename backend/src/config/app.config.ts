import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface AppConfig {
  server: {
    port: number;
    environment: 'development' | 'production' | 'test';
  };
  ollama: {
    baseUrl: string;
    token: string;
    model: string;
  };
  database: {
    path: string;
  };
  api: {
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  logging: {
    level: string;
    filePath: string;
  };
  debug: {
    ollamaRequests: boolean;
  };
}

export const appConfig: AppConfig = {
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    environment: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  },
  ollama: {
    baseUrl: process.env.MODEL1_BASE_URL || 'http://model1.scribomate.ai',
    token: process.env.MODEL1_TOKEN || '',
    model: 'mistral-20k:latest',
  },
  database: {
    path: process.env.DATABASE_PATH || path.join(process.cwd(), 'database', 'prompt-bulk-tool.db'),
  },
  api: {
    rateLimitWindowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS || '60000', 10),
    rateLimitMaxRequests: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || path.join(process.cwd(), 'logs', 'app.log'),
  },
  debug: {
    ollamaRequests: process.env.DEBUG_OLLAMA_REQUESTS === 'true',
  },
};

/**
 * Configuration validation
 */
export function validateConfig(): void {
  const requiredEnvVars = ['MODEL1_TOKEN'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`);
    }
  }
  
  if (appConfig.server.port < 1 || appConfig.server.port > 65535) {
    throw new Error('Port must be between 1 and 65535');
  }
}

/**
 * Get Ollama configuration specifically
 */
export function getOllamaConfig() {
  return {
    baseUrl: appConfig.ollama.baseUrl,
    token: appConfig.ollama.token,
    model: appConfig.ollama.model
  };
}