import { BaseAIMessage, MESSAGE_CATEGORIES } from '../base/base-messages';

/**
 * Input interface for Variable Value Generation
 */
export interface VariableGeneratorInput {
  templateContent: string;
  variableName: string;
  direction: string;
  count: number;
  existingValues?: string[];
  verbosity?: string;
}

/**
 * Message class for generating variable values with specific direction/style
 */
export class VariableGeneratorMessage extends BaseAIMessage {
  public readonly category = MESSAGE_CATEGORIES.VARIABLE_GENERATION;
  public readonly description = 'Generates creative variable values with specific style direction';

  public readonly systemMessage = `You are an expert in creative variable value generation for prompt templates.

Your task is to generate creative, thematically appropriate values for a specific variable in a template that follow a certain direction/style.

IMPORTANT RULES:
- Generate values only for the specified variable
- Consider the context of the entire template
- Follow the specified style direction precisely
- Create diverse, interesting variations
- Use simple, understandable terms
- Avoid already existing values
- Keep the values thematically consistent

RESPONSE FORMAT:
Respond EXCLUSIVELY with the following JSON format without additional text, markdown code blocks, or explanations:

{
  "values": ["value1", "value2", "value3", ...]
}

The number of values should match the requested quantity. Each value should be creative, appropriate, and unique.`;

  public buildUserMessage(input: VariableGeneratorInput): string {
    this.validateRequiredParams(input, ['templateContent', 'variableName', 'direction']);

    if (input.count < 1 || input.count > 50) {
      throw new Error('Count must be between 1 and 50');
    }

    const existingText = input.existingValues && input.existingValues.length > 0
      ? `\n\nAvoid these existing values: ${input.existingValues.join(', ')}`
      : '';

    // Build verbosity instruction based on the selected level
    const getVerbosityInstruction = (verbosity?: string): string => {
      switch (verbosity) {
        case 'title_only':
          return 'Generate only short titles or names (maximum 1-3 words).';
        case 'short_concise':
          return 'Generate short, concise terms or phrases (maximum 5-7 words).';
        case 'one_sentence':
          return 'Generate complete but concise sentences (maximum 15-20 words).';
        default:
          return 'Generate short, concise terms or phrases (maximum 5-7 words).';
      }
    };

    const verbosityInstruction = getVerbosityInstruction(input.verbosity);

    return `Template Context:
"""
${this.sanitizeText(input.templateContent)}
"""

Variable: {{${input.variableName}}}
Style Direction: "${input.direction}"
Number of desired values: ${input.count}
Verbosity: ${verbosityInstruction}${existingText}

Generate ${input.count} creative values for the variable "{{${input.variableName}}}" that match the style "${input.direction}" and fit thematically with the template. Consider the verbosity requirements.`;
  }
}