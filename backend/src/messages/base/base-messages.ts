/**
 * Base Message Interface
 * Defines the structure for all AI messages in the system
 */
export interface BaseMessage {
  systemMessage: string;
  buildUserMessage(input: any): string;
  category: string;
  description: string;
  version: string;
}

/**
 * Abstract Base Message Class
 * Provides common functionality for all AI messages
 */
export abstract class BaseAIMessage implements BaseMessage {
  public abstract readonly systemMessage: string;
  public abstract readonly category: string;
  public abstract readonly description: string;
  public readonly version: string = '1.0.0';

  /**
   * Abstract method to build user message from input
   */
  public abstract buildUserMessage(input: any): string;

  /**
   * Helper method to apply template with parameters
   */
  protected applyTemplate(template: string, params: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }
    
    return result;
  }

  /**
   * Helper method to validate required parameters
   */
  protected validateRequiredParams(params: Record<string, any>, requiredKeys: string[]): void {
    const missingKeys = requiredKeys.filter(key => !params[key] || params[key] === '');
    
    if (missingKeys.length > 0) {
      throw new Error(`Missing required parameters: ${missingKeys.join(', ')}`);
    }
  }

  /**
   * Helper method to sanitize text input
   */
  protected sanitizeText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
  }

  /**
   * Helper method to format lists
   */
  protected formatList(items: string[], prefix: string = '- '): string {
    return items
      .filter(item => item && item.trim())
      .map(item => `${prefix}${item.trim()}`)
      .join('\n');
  }
}

/**
 * Message Categories for organization
 */
export const MESSAGE_CATEGORIES = {
  TEMPLATE_ANALYSIS: 'template-analysis',
  VARIABLE_GENERATION: 'variable-generation',
  CONTENT_PROCESSING: 'content-processing',
  VALIDATION: 'validation',
  OPTIMIZATION: 'optimization'
} as const;

export type MessageCategory = typeof MESSAGE_CATEGORIES[keyof typeof MESSAGE_CATEGORIES];

/**
 * Message Metadata Interface
 */
export interface MessageMetadata {
  category: MessageCategory;
  useCase: string;
  systemMessage: string;
  templates: string[];
  parameters: string[];
  description: string;
  version: string;
}

/**
 * Base Message Registry
 * Provides centralized access to all message types
 */
export class MessageRegistry {
  private static messages: Map<string, BaseAIMessage> = new Map();

  /**
   * Register a message type
   */
  static register(key: string, message: BaseAIMessage): void {
    this.messages.set(key, message);
  }

  /**
   * Get a message by key
   */
  static get(key: string): BaseAIMessage | null {
    return this.messages.get(key) || null;
  }

  /**
   * Get all registered message keys
   */
  static getKeys(): string[] {
    return Array.from(this.messages.keys());
  }

  /**
   * Get messages by category
   */
  static getByCategory(category: MessageCategory): BaseAIMessage[] {
    return Array.from(this.messages.values())
      .filter(message => message.category === category);
  }

  /**
   * Check if a message key exists
   */
  static exists(key: string): boolean {
    return this.messages.has(key);
  }

  /**
   * Get registry statistics
   */
  static getStats(): { total: number; categories: Record<string, number> } {
    const messages = Array.from(this.messages.values());
    const categories: Record<string, number> = {};

    messages.forEach(message => {
      categories[message.category] = (categories[message.category] || 0) + 1;
    });

    return {
      total: messages.length,
      categories
    };
  }
}