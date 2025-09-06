import { BaseAIUseCase, AIResponse } from './base/base-ai.usecase';
import { VariableGeneratorMessage, VariableGeneratorInput } from '../messages/variable-generator/variable-generator.messages';
import { JSONParser } from '../utils/json-parser';

/**
 * Output interface for Variable Generator
 */
export interface VariableGeneratorOutput {
  values: string[];
}

/**
 * Use Case for generating creative variable values with specific style direction
 */
export class VariableGeneratorUseCase extends BaseAIUseCase<VariableGeneratorInput, VariableGeneratorOutput> {
  private messageHandler: VariableGeneratorMessage;

  constructor() {
    super('VariableGeneratorUseCase');
    this.messageHandler = new VariableGeneratorMessage();
  }

  protected validateInput(input: VariableGeneratorInput): { isValid: boolean; error?: string } {
    if (!input.templateContent || typeof input.templateContent !== 'string') {
      return { isValid: false, error: 'Template content is required and must be a string' };
    }

    if (input.templateContent.trim().length < 10) {
      return { isValid: false, error: 'Template content must be at least 10 characters long' };
    }

    if (!input.variableName || typeof input.variableName !== 'string') {
      return { isValid: false, error: 'Variable name is required and must be a string' };
    }

    if (input.variableName.trim().length === 0) {
      return { isValid: false, error: 'Variable name cannot be empty' };
    }

    if (!input.direction || typeof input.direction !== 'string') {
      return { isValid: false, error: 'Direction is required and must be a string' };
    }

    if (input.direction.trim().length === 0) {
      return { isValid: false, error: 'Direction cannot be empty' };
    }

    if (!input.count || typeof input.count !== 'number') {
      return { isValid: false, error: 'Count is required and must be a number' };
    }

    if (input.count < 1 || input.count > 50) {
      return { isValid: false, error: 'Count must be between 1 and 50' };
    }

    // Check if the variable actually exists in the template
    const variablePattern = new RegExp(`\\{\\{\\s*${input.variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'i');
    if (!variablePattern.test(input.templateContent)) {
      return { isValid: false, error: `Variable "${input.variableName}" not found in template` };
    }

    return { isValid: true };
  }

  protected buildSystemMessage(input: VariableGeneratorInput): string {
    return this.messageHandler.systemMessage;
  }

  protected buildUserMessage(input: VariableGeneratorInput): string {
    return this.messageHandler.buildUserMessage(input);
  }

  protected async parseAIResponse(rawResponse: string, originalInput: VariableGeneratorInput): Promise<VariableGeneratorOutput> {
    const parseResult = JSONParser.parseWithRequiredFields<VariableGeneratorOutput>(
      rawResponse,
      ['values']
    );

    if (!parseResult.success) {
      throw new Error(`Failed to parse AI response: ${parseResult.error}`);
    }

    if (!parseResult.data) {
      throw new Error('No data returned from AI response');
    }

    const data = parseResult.data;

    // Validate values array
    if (!Array.isArray(data.values)) {
      throw new Error('Values must be an array');
    }

    if (data.values.length === 0) {
      throw new Error('No values generated');
    }

    // Clean and validate values
    const cleanedValues = data.values
      .filter((value: any) => typeof value === 'string' && value.trim().length > 0)
      .map((value: string) => value.trim())
      .filter((value, index, array) => array.indexOf(value) === index) // Remove duplicates
      .slice(0, originalInput.count); // Limit to requested count

    if (cleanedValues.length === 0) {
      throw new Error('No valid values generated');
    }

    // Filter out existing values if provided
    let finalValues = cleanedValues;
    if (originalInput.existingValues && originalInput.existingValues.length > 0) {
      const existingSet = new Set(originalInput.existingValues.map(v => v.toLowerCase().trim()));
      finalValues = cleanedValues.filter(value => !existingSet.has(value.toLowerCase().trim()));
    }

    return {
      values: finalValues
    };
  }

  /**
   * Sanitize input for logging (remove sensitive content if any)
   */
  protected sanitizeInputForLogging(input: VariableGeneratorInput): any {
    return {
      variableName: input.variableName,
      direction: input.direction,
      count: input.count,
      templateLength: input.templateContent?.length,
      existingValuesCount: input.existingValues?.length || 0,
      hasVariable: input.variableName ? new RegExp(`\\{\\{\\s*${input.variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'i').test(input.templateContent || '') : false
    };
  }
}