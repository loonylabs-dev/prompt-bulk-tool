import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface DatabaseData {
  templates: any[];
  variables: any[];
  variableSets: any[];
  generatedPrompts: any[];
  automationTargets: any[];
  automationSessions: any[];
}

export class JsonDatabase {
  private static instance: JsonDatabase;
  private dbPath: string;
  private data: DatabaseData = {
    templates: [],
    variables: [],
    variableSets: [],
    generatedPrompts: [],
    automationTargets: [],
    automationSessions: []
  };

  private constructor() {
    this.dbPath = path.join(__dirname, '../../../database/prompt-bulk-tool.json');
  }

  public static getInstance(): JsonDatabase {
    if (!JsonDatabase.instance) {
      JsonDatabase.instance = new JsonDatabase();
    }
    return JsonDatabase.instance;
  }

  public async connect(): Promise<void> {
    const dbDir = path.dirname(this.dbPath);
    
    try {
      await fs.mkdir(dbDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create database directory:', error);
    }

    try {
      const dataString = await fs.readFile(this.dbPath, 'utf-8');
      this.data = JSON.parse(dataString);
      console.log('JSON Database loaded successfully');
    } catch (error) {
      // File doesn't exist, create with default data
      await this.initializeDatabase();
      console.log('JSON Database initialized successfully');
    }
  }

  private async initializeDatabase(): Promise<void> {
    this.data = {
      templates: [],
      variables: [],
      variableSets: [],
      generatedPrompts: [],
      automationTargets: [
        {
          id: 'chatgpt-default',
          name: 'ChatGPT',
          type: 'chatgpt',
          url: 'https://chat.openai.com/',
          selectors: {
            input: '#prompt-textarea',
            submit: 'button[data-testid="send-button"]',
            response: '[data-message-author-role="assistant"] .markdown',
            newChat: 'nav a[href="/"]'
          },
          config: {
            delayBetweenPrompts: 5000,
            maxRetries: 3,
            waitForResponse: 30000,
            useNewChatPerPrompt: false
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'claude-default',
          name: 'Claude',
          type: 'claude',
          url: 'https://claude.ai/',
          selectors: {
            input: 'div[contenteditable="true"]',
            submit: 'button[aria-label="Send Message"]',
            response: '[data-is-streaming="false"] .font-claude-message',
            newChat: 'button[aria-label="Start new conversation"]'
          },
          config: {
            delayBetweenPrompts: 3000,
            maxRetries: 3,
            waitForResponse: 30000,
            useNewChatPerPrompt: false
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ],
      automationSessions: []
    };

    await this.save();
  }

  private async save(): Promise<void> {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save database:', error);
      throw error;
    }
  }

  // Template operations
  public async insertTemplate(template: any): Promise<any> {
    template.id = uuidv4();
    template.created_at = new Date().toISOString();
    template.updated_at = new Date().toISOString();
    
    this.data.templates.push(template);
    await this.save();
    return template;
  }

  public async getTemplates(): Promise<any[]> {
    return this.data.templates;
  }

  public async getTemplateById(id: string): Promise<any | null> {
    return this.data.templates.find(t => t.id === id) || null;
  }

  public async updateTemplate(id: string, updates: any): Promise<any | null> {
    const index = this.data.templates.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.data.templates[index] = {
      ...this.data.templates[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await this.save();
    return this.data.templates[index];
  }

  public async deleteTemplate(id: string): Promise<boolean> {
    const initialLength = this.data.templates.length;
    this.data.templates = this.data.templates.filter(t => t.id !== id);
    
    if (this.data.templates.length !== initialLength) {
      await this.save();
      return true;
    }
    return false;
  }

  // Variable operations
  public async insertVariable(variable: any): Promise<any> {
    variable.id = uuidv4();
    variable.created_at = new Date().toISOString();
    variable.updated_at = new Date().toISOString();
    
    this.data.variables.push(variable);
    await this.save();
    return variable;
  }

  public async getVariables(): Promise<any[]> {
    return this.data.variables;
  }

  public async getVariableById(id: string): Promise<any | null> {
    return this.data.variables.find(v => v.id === id) || null;
  }

  // Variable Set operations
  public async insertVariableSet(variableSet: any): Promise<any> {
    variableSet.id = uuidv4();
    variableSet.created_at = new Date().toISOString();
    variableSet.updated_at = new Date().toISOString();
    
    this.data.variableSets.push(variableSet);
    await this.save();
    return variableSet;
  }

  public async getVariableSets(): Promise<any[]> {
    return this.data.variableSets;
  }

  public async getVariableSetById(id: string): Promise<any | null> {
    return this.data.variableSets.find(vs => vs.id === id) || null;
  }

  // Generated Prompts operations
  public async insertGeneratedPrompts(prompts: any[]): Promise<void> {
    const promptsWithIds = prompts.map(prompt => ({
      ...prompt,
      id: prompt.id || uuidv4(),
      generated_at: prompt.generatedAt || new Date().toISOString()
    }));

    this.data.generatedPrompts.push(...promptsWithIds);
    await this.save();
  }

  public async getGeneratedPrompts(): Promise<any[]> {
    return this.data.generatedPrompts;
  }

  public async getGeneratedPromptById(id: string): Promise<any | null> {
    return this.data.generatedPrompts.find(p => p.id === id) || null;
  }

  public async updateGeneratedPromptStatus(id: string, status: string, result?: string, error?: string): Promise<any | null> {
    const index = this.data.generatedPrompts.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.data.generatedPrompts[index] = {
      ...this.data.generatedPrompts[index],
      status,
      result: result || this.data.generatedPrompts[index].result,
      error: error || this.data.generatedPrompts[index].error
    };

    await this.save();
    return this.data.generatedPrompts[index];
  }

  public async deleteGeneratedPrompts(ids: string[]): Promise<void> {
    this.data.generatedPrompts = this.data.generatedPrompts.filter(p => !ids.includes(p.id));
    await this.save();
  }

  public async deleteAllGeneratedPrompts(): Promise<number> {
    const count = this.data.generatedPrompts.length;
    this.data.generatedPrompts = [];
    await this.save();
    return count;
  }

  // Automation targets
  public async getAutomationTargets(): Promise<any[]> {
    return this.data.automationTargets;
  }

  public getDatabase(): JsonDatabase {
    return this;
  }
}