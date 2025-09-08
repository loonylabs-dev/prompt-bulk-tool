import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface DatabaseData {
  templates: any[];
  variablePresets: any[];
  generatedPrompts: any[];
  automationTargets: any[];
  automationSessions: any[];
}

export class JsonDatabase {
  private static instance: JsonDatabase;
  private dbPath: string;
  private data: DatabaseData = {
    templates: [],
    variablePresets: [],
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
      
      // Migration: Remove old fields and ensure new fields exist
      let needsSave = false;
      
      // Remove old variables and variableSets fields
      if ((this.data as any).variables) {
        delete (this.data as any).variables;
        needsSave = true;
      }
      if ((this.data as any).variableSets) {
        delete (this.data as any).variableSets;
        needsSave = true;
      }
      
      // Ensure variablePresets field exists
      if (!this.data.variablePresets) {
        this.data.variablePresets = [];
        needsSave = true;
      }
      
      if (needsSave) {
        await this.save();
      }
      
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
      variablePresets: [],
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

  public async deleteGeneratedPrompt(id: string): Promise<boolean> {
    const index = this.data.generatedPrompts.findIndex(p => p.id === id);
    if (index === -1) {
      return false;
    }
    this.data.generatedPrompts.splice(index, 1);
    await this.save();
    return true;
  }

  public async deleteAllGeneratedPrompts(): Promise<number> {
    const count = this.data.generatedPrompts.length;
    this.data.generatedPrompts = [];
    await this.save();
    return count;
  }

  // Variable Preset operations
  public async insertVariablePreset(preset: any): Promise<any> {
    preset.id = uuidv4();
    preset.created_at = new Date().toISOString();
    preset.updated_at = new Date().toISOString();
    
    this.data.variablePresets.push(preset);
    await this.save();
    return preset;
  }

  public async getVariablePresets(): Promise<any[]> {
    return this.data.variablePresets;
  }

  public async getVariablePresetById(id: string): Promise<any | null> {
    return this.data.variablePresets.find(vp => vp.id === id) || null;
  }

  public async updateVariablePreset(id: string, updates: any): Promise<any> {
    const index = this.data.variablePresets.findIndex(vp => vp.id === id);
    if (index === -1) {
      throw new Error('Variable preset not found');
    }

    const preset = this.data.variablePresets[index];
    this.data.variablePresets[index] = {
      ...preset,
      ...updates,
      id: preset.id, // Keep original ID
      created_at: preset.created_at, // Keep original creation time
      updated_at: new Date().toISOString()
    };

    await this.save();
    return this.data.variablePresets[index];
  }

  public async deleteVariablePreset(id: string): Promise<void> {
    const index = this.data.variablePresets.findIndex(vp => vp.id === id);
    if (index === -1) {
      throw new Error('Variable preset not found');
    }

    this.data.variablePresets.splice(index, 1);
    await this.save();
  }

  public async duplicateVariablePreset(id: string, includeValues: boolean = true): Promise<any> {
    const originalPreset = this.data.variablePresets.find(vp => vp.id === id);
    if (!originalPreset) {
      throw new Error('Variable preset not found');
    }

    const duplicatedPreset = {
      id: uuidv4(),
      name: `${originalPreset.name} COPY`,
      description: originalPreset.description,
      placeholder: originalPreset.placeholder,
      values: includeValues ? originalPreset.values : '',
      tags: originalPreset.tags ? [...originalPreset.tags] : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.variablePresets.push(duplicatedPreset);
    await this.save();
    
    return duplicatedPreset;
  }

  // Automation targets
  public async getAutomationTargets(): Promise<any[]> {
    return this.data.automationTargets;
  }

  public getDatabase(): JsonDatabase {
    return this;
  }
}