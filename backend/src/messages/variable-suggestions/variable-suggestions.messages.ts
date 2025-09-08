import { BaseAIMessage, MESSAGE_CATEGORIES } from '../base/base-messages';

/**
 * Input interface for Variable Suggestions
 */
export interface VariableSuggestionsInput {
  templateContent: string;
  templateName?: string;
  existingVariables?: string[];
  maxSuggestions?: number;
}

/**
 * Message class for generating variable preset suggestions
 */
export class VariableSuggestionsMessage extends BaseAIMessage {
  public readonly category = MESSAGE_CATEGORIES.VARIABLE_GENERATION;
  public readonly description = 'Generates variable preset suggestions for prompt templates';

  public readonly systemMessage = `You are an expert in prompt template analysis and variable creation. Your task is to create meaningful variable presets for given prompt templates.

Analyze the template content and create variable presets that:
1. Consider the placeholders in the template ({{variable_name}})
2. Suggest diverse and creative values for each variable
3. Are thematically appropriate and contextually meaningful
4. Provide a good mix of different options

Response Format:
Return your response as JSON with the following schema:
{
  "variablePresets": {
    "variable_name": [
      "value1",
      "value2", 
      "value3"
    ]
  },
  "analysis": {
    "detectedVariables": ["variable1", "variable2"],
    "templateTheme": "Description of the template theme",
    "suggestions": "Rationale for the selection of values"
  }
}

Important:
- Create at least 5-10 different values for each detected variable
- The values should be diverse, creative, and practically usable
- Consider the context and theme of the template
- Use English values primarily, with localization support when appropriate`;

  public buildUserMessage(input: VariableSuggestionsInput): string {
    this.validateRequiredParams(input, ['templateContent']);

    const existingVarsText = input.existingVariables && input.existingVariables.length > 0
      ? `\n\nExisting variables: ${input.existingVariables.join(', ')}`
      : '';

    const maxSuggestionsText = input.maxSuggestions
      ? `\n\nMaximum number of suggestions per variable: ${input.maxSuggestions}`
      : '';

    const templateNameText = input.templateName
      ? `Template Name: "${input.templateName}"\n\n`
      : '';

    return `${templateNameText}Analyze this prompt template and create variable presets:

Template Content:
"""
${this.sanitizeText(input.templateContent)}
"""${existingVarsText}${maxSuggestionsText}

Analyze the placeholders {{variable_name}} in the template and create a list of meaningful, diverse values for each variable. Consider the theme and context of the template.`;
  }
}