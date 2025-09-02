// Template Types
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: string[];
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  id: string;
}

// Variable Types
export interface PromptVariable {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'array';
  defaultValue?: string;
  possibleValues: string[];
  templateIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVariableRequest {
  name: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'array';
  defaultValue?: string;
  possibleValues: string[];
}

export interface UpdateVariableRequest extends Partial<CreateVariableRequest> {
  id: string;
}

// Variable Preset Types
export interface VariablePreset {
  id: string;
  name: string;
  description: string;
  tags: string[];
  placeholder: string;        // Template placeholder (e.g., "dragon description")
  values: string;             // Semicolon-separated values
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVariablePresetRequest {
  name: string;
  description: string;
  tags: string[];
  placeholder: string;
  values: string;
}

export interface UpdateVariablePresetRequest extends Partial<CreateVariablePresetRequest> {
  id: string;
}

// Template Placeholder Types
export interface TemplatePlaceholder {
  name: string;
  usedInTemplates: number;
  templateIds: string[];
  templateNames: string[];
}

// Variable Set Types (DEPRECATED - will be replaced by Variable Presets)
export interface VariableSet {
  id: string;
  name: string;
  description: string;
  variables: Record<string, string[]>;
  templateIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVariableSetRequest {
  name: string;
  description: string;
  variables: Record<string, string[]>;
  templateIds: string[];
}

// Generated Prompt Types
export interface GeneratedPrompt {
  id: string;
  templateId: string;
  templateName: string;
  content: string;
  variables: Record<string, string>;
  generatedAt: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export interface GenerationRequest {
  templateIds: string[];
  variablePresetIds?: string[];
  customVariables?: Record<string, string[]>;
}

export interface GenerationResponse {
  prompts: GeneratedPrompt[];
  totalCount: number;
}

// Automation Types
export interface AutomationTarget {
  id: string;
  name: string;
  type: 'chatgpt' | 'claude' | 'gemini' | 'custom';
  url: string;
  selectors: {
    input: string;
    submit: string;
    response: string;
    newChat?: string;
  };
  config: {
    delayBetweenPrompts: number;
    maxRetries: number;
    waitForResponse: number;
    useNewChatPerPrompt: boolean;
  };
}

export interface AutomationSession {
  id: string;
  targetId: string;
  promptIds: string[];
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  currentPromptIndex: number;
  results: AutomationResult[];
  startedAt: Date;
  completedAt?: Date;
  config: {
    batchSize: number;
    pauseBetweenBatches: number;
  };
}

export interface AutomationResult {
  promptId: string;
  status: 'pending' | 'success' | 'failed' | 'skipped';
  response?: string;
  error?: string;
  timestamp: Date;
  duration: number;
}

export interface StartAutomationRequest {
  targetId: string;
  promptIds: string[];
  config?: {
    batchSize?: number;
    pauseBetweenBatches?: number;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Database Types
export interface DatabaseConfig {
  filename: string;
  options?: {
    verbose?: boolean;
    fileMustExist?: boolean;
  };
}

// Export/Import Types
export interface ExportData {
  templates: PromptTemplate[];
  variables: PromptVariable[];
  variableSets: VariableSet[];
  variablePresets: VariablePreset[];
  automationTargets: AutomationTarget[];
  exportedAt: Date;
  version: string;
}

export interface ImportResult {
  templatesImported: number;
  variablesImported: number;
  variableSetsImported: number;
  variablePresetsImported: number;
  automationTargetsImported: number;
  errors: string[];
}