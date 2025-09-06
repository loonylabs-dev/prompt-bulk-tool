import { BaseAIUseCase, AIResponse } from './base/base-ai.usecase';
import { VariableSuggestionsMessage, VariableSuggestionsInput } from '../messages/variable-suggestions/variable-suggestions.messages';
import { JSONParser } from '../utils/json-parser';

/**
 * Output interface for Variable Suggestions
 */
export interface VariableSuggestionsOutput {
  variablePresets: Record<string, string[]>;
  analysis: {
    detectedVariables: string[];
    templateTheme: string;
    suggestions: string;
  };
}

/**
 * Use Case for generating variable preset suggestions based on prompt templates
 */
export class VariableSuggestionsUseCase extends BaseAIUseCase<VariableSuggestionsInput, VariableSuggestionsOutput> {
  private messageHandler: VariableSuggestionsMessage;

  constructor() {
    super('VariableSuggestionsUseCase');
    this.messageHandler = new VariableSuggestionsMessage();
  }

  protected validateInput(input: VariableSuggestionsInput): { isValid: boolean; error?: string } {
    if (!input.templateContent || typeof input.templateContent !== 'string') {
      return { isValid: false, error: 'Template content is required and must be a string' };
    }

    if (input.templateContent.trim().length < 10) {
      return { isValid: false, error: 'Template content must be at least 10 characters long' };
    }

    // Check if template contains variable placeholders
    const hasVariables = /\{\{.*?\}\}/.test(input.templateContent);
    if (!hasVariables) {
      return { isValid: false, error: 'Template must contain at least one variable placeholder ({{variable_name}})' };
    }

    if (input.maxSuggestions && (input.maxSuggestions < 1 || input.maxSuggestions > 50)) {
      return { isValid: false, error: 'maxSuggestions must be between 1 and 50' };
    }

    return { isValid: true };
  }

  protected buildSystemMessage(input: VariableSuggestionsInput): string {
    return this.messageHandler.systemMessage;
  }

  protected buildUserMessage(input: VariableSuggestionsInput): string {
    return this.messageHandler.buildUserMessage(input);
  }

  protected async parseAIResponse(rawResponse: string, originalInput: VariableSuggestionsInput): Promise<VariableSuggestionsOutput> {
    const parseResult = JSONParser.parseWithRequiredFields<VariableSuggestionsOutput>(
      rawResponse,
      ['variablePresets', 'analysis']
    );

    if (!parseResult.success) {
      throw new Error(`Failed to parse AI response: ${parseResult.error}`);
    }

    if (!parseResult.data) {
      throw new Error('No data returned from AI response');
    }

    // Validate the structure
    const data = parseResult.data;

    if (!data.variablePresets || typeof data.variablePresets !== 'object') {
      throw new Error('Invalid variablePresets structure in AI response');
    }

    if (!data.analysis || typeof data.analysis !== 'object') {
      throw new Error('Invalid analysis structure in AI response');
    }

    // Ensure analysis has required fields
    if (!data.analysis.detectedVariables || !Array.isArray(data.analysis.detectedVariables)) {
      data.analysis.detectedVariables = [];
    }

    if (!data.analysis.templateTheme) {
      data.analysis.templateTheme = 'Unknown theme';
    }

    if (!data.analysis.suggestions) {
      data.analysis.suggestions = 'No suggestions provided';
    }

    // Clean and validate variable presets
    const cleanedPresets: Record<string, string[]> = {};
    for (const [variableName, values] of Object.entries(data.variablePresets)) {
      if (Array.isArray(values)) {
        cleanedPresets[variableName] = values
          .filter((value: any) => typeof value === 'string' && value.trim().length > 0)
          .map((value: string) => value.trim())
          .slice(0, originalInput.maxSuggestions || 20); // Apply max suggestions limit
      }
    }

    return {
      variablePresets: cleanedPresets,
      analysis: data.analysis
    };
  }

  /**
   * Extract variables from template content
   */
  private extractVariablesFromTemplate(templateContent: string): string[] {
    const matches = templateContent.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];

    return matches
      .map(match => match.replace(/[{}]/g, '').trim())
      .filter((value, index, array) => array.indexOf(value) === index); // Remove duplicates
  }

  /**
   * Sanitize input for logging (remove sensitive content if any)
   */
  protected sanitizeInputForLogging(input: VariableSuggestionsInput): any {
    return {
      templateName: input.templateName,
      templateLength: input.templateContent?.length,
      existingVariablesCount: input.existingVariables?.length || 0,
      maxSuggestions: input.maxSuggestions,
      hasVariables: /\{\{.*?\}\}/.test(input.templateContent || '')
    };
  }
}