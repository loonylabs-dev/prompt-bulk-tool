import axios from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  PromptTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  PromptVariable,
  CreateVariableRequest,
  UpdateVariableRequest,
  VariableSet,
  CreateVariableSetRequest,
  VariablePreset,
  CreateVariablePresetRequest,
  UpdateVariablePresetRequest,
  GeneratedPrompt,
  GenerationRequest,
  GenerationResponse,
  AIGenerateVariableValuesRequest,
  AIGenerateVariableValuesResponse,
  AIConnectionTestResponse,
  AIApiResponse
} from '@prompt-bulk-tool/shared';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response?.status === 401) {
      // Handle authentication error
      console.error('Unauthorized access');
    } else if (error.response?.status === 500) {
      console.error('Server error');
    }
    
    return Promise.reject(error);
  }
);

// Template API
export const templateApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<PromptTemplate>> => {
    const { data } = await api.get('/templates', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<PromptTemplate>> => {
    const { data } = await api.get(`/templates/${id}`);
    return data;
  },

  create: async (template: CreateTemplateRequest): Promise<ApiResponse<PromptTemplate>> => {
    const { data } = await api.post('/templates', template);
    return data;
  },

  update: async (id: string, template: Partial<CreateTemplateRequest>): Promise<ApiResponse<PromptTemplate>> => {
    const { data } = await api.put(`/templates/${id}`, template);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/templates/${id}`);
    return data;
  },

  duplicate: async (id: string, name?: string): Promise<ApiResponse<PromptTemplate>> => {
    const { data } = await api.post(`/templates/${id}/duplicate`, { name });
    return data;
  },

  getCategories: async (): Promise<ApiResponse<Record<string, number>>> => {
    const { data } = await api.get('/templates/categories');
    return data;
  },

  getVariables: async (id: string): Promise<ApiResponse<string[]>> => {
    const { data } = await api.get(`/templates/${id}/variables`);
    return data;
  },
};

// Variable API
export const variableApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    search?: string;
  }): Promise<PaginatedResponse<PromptVariable>> => {
    const { data } = await api.get('/variables', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<PromptVariable>> => {
    const { data } = await api.get(`/variables/${id}`);
    return data;
  },

  create: async (variable: CreateVariableRequest): Promise<ApiResponse<PromptVariable>> => {
    const { data } = await api.post('/variables', variable);
    return data;
  },

  update: async (id: string, variable: Partial<CreateVariableRequest>): Promise<ApiResponse<PromptVariable>> => {
    const { data } = await api.put(`/variables/${id}`, variable);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/variables/${id}`);
    return data;
  },
};

// Variable Preset API  
export const variablePresetApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    tags?: string[];
  }): Promise<PaginatedResponse<VariablePreset>> => {
    const { data } = await api.get('/variable-presets', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<VariablePreset>> => {
    const { data } = await api.get(`/variable-presets/${id}`);
    return data;
  },

  create: async (preset: CreateVariablePresetRequest): Promise<ApiResponse<VariablePreset>> => {
    const { data } = await api.post('/variable-presets', preset);
    return data;
  },

  update: async (id: string, preset: Partial<CreateVariablePresetRequest>): Promise<ApiResponse<VariablePreset>> => {
    const { data } = await api.put(`/variable-presets/${id}`, preset);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/variable-presets/${id}`);
    return data;
  },

  duplicate: async (id: string, name?: string): Promise<ApiResponse<VariablePreset>> => {
    const { data } = await api.post(`/variable-presets/${id}/duplicate`, { name });
    return data;
  },

  getTags: async (): Promise<ApiResponse<string[]>> => {
    const { data } = await api.get('/variable-presets/tags/all');
    return data;
  },

  getPlaceholders: async (): Promise<ApiResponse<any[]>> => {
    const { data } = await api.get('/variable-presets/placeholders/all');
    return data;
  },
};

// Variable Set API
export const variableSetApi = {
  getAll: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PaginatedResponse<VariableSet>> => {
    const { data } = await api.get('/variables/sets', { params });
    return data;
  },

  getById: async (id: string): Promise<ApiResponse<VariableSet>> => {
    const { data } = await api.get(`/variables/sets/${id}`);
    return data;
  },

  create: async (variableSet: CreateVariableSetRequest): Promise<ApiResponse<VariableSet>> => {
    const { data } = await api.post('/variables/sets', variableSet);
    return data;
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/variables/sets/${id}`);
    return data;
  },
};

// Generation API
export const generationApi = {
  generate: async (request: GenerationRequest): Promise<ApiResponse<GenerationResponse>> => {
    const { data } = await api.post('/generation/generate', request);
    return data;
  },

  getPrompts: async (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    templateId?: string;
  }): Promise<ApiResponse<GenerationResponse>> => {
    const { data } = await api.get('/generation/prompts', { params });
    return data;
  },

  getPrompt: async (id: string): Promise<ApiResponse<GeneratedPrompt>> => {
    const { data } = await api.get(`/generation/prompts/${id}`);
    return data;
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'executing' | 'completed' | 'failed',
    result?: string,
    error?: string
  ): Promise<ApiResponse<GeneratedPrompt>> => {
    const { data } = await api.put(`/generation/prompts/${id}/status`, {
      status,
      result,
      error,
    });
    return data;
  },

  deletePrompts: async (ids: string[]): Promise<ApiResponse<void>> => {
    const { data } = await api.delete('/generation/prompts', { data: { ids } });
    return data;
  },

  deleteAllPrompts: async (): Promise<ApiResponse<void>> => {
    const { data } = await api.delete('/generation/prompts/all');
    return data;
  },

  exportPrompts: async (format: 'json' | 'csv' | 'txt' = 'json'): Promise<Blob> => {
    const response = await api.get('/generation/export', {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  },
};

// AI API
export const aiApi = {
  generateVariableValues: async (request: AIGenerateVariableValuesRequest): Promise<AIApiResponse<AIGenerateVariableValuesResponse>> => {
    const { data } = await api.post('/ai/generate-variable-values', request);
    return data;
  },

  testConnection: async (): Promise<AIApiResponse<AIConnectionTestResponse>> => {
    const { data } = await api.get('/ai/test-connection');
    return data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string; environment: string }> => {
    const { data } = await api.get('/health');
    return data;
  },
};

export default api;