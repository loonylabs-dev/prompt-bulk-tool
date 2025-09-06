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

  public readonly systemMessage = `Du bist ein Experte für Prompt-Template-Analyse und Variable-Erstellung. Deine Aufgabe ist es, für gegebene Prompt-Templates sinnvolle Variable-Presets zu erstellen.

Analysiere den Template-Inhalt und erstelle Variable-Presets, die:
1. Die Platzhalter im Template ({{variable_name}}) berücksichtigen
2. Vielfältige und kreative Werte für jede Variable vorschlagen
3. Thematisch passend und kontextuell sinnvoll sind
4. Eine gute Mischung aus verschiedenen Optionen bieten

Antwort-Format:
Gib deine Antwort als JSON zurück mit folgendem Schema:
{
  "variablePresets": {
    "variable_name": [
      "wert1",
      "wert2", 
      "wert3"
    ]
  },
  "analysis": {
    "detectedVariables": ["variable1", "variable2"],
    "templateTheme": "Beschreibung des Template-Themas",
    "suggestions": "Begründung für die Auswahl der Werte"
  }
}

Wichtig:
- Erstelle für jede erkannte Variable mindestens 5-10 verschiedene Werte
- Die Werte sollen vielfältig, kreativ und praktisch nutzbar sein
- Berücksichtige den Kontext und das Thema des Templates
- Verwende nur deutsche oder englische Werte, je nach Template-Sprache`;

  public buildUserMessage(input: VariableSuggestionsInput): string {
    this.validateRequiredParams(input, ['templateContent']);

    const existingVarsText = input.existingVariables && input.existingVariables.length > 0
      ? `\n\nBereits vorhandene Variablen: ${input.existingVariables.join(', ')}`
      : '';

    const maxSuggestionsText = input.maxSuggestions
      ? `\n\nMaximale Anzahl Vorschläge pro Variable: ${input.maxSuggestions}`
      : '';

    const templateNameText = input.templateName
      ? `Template-Name: "${input.templateName}"\n\n`
      : '';

    return `${templateNameText}Analysiere diesen Prompt-Template und erstelle Variable-Presets:

Template-Inhalt:
"""
${this.sanitizeText(input.templateContent)}
"""${existingVarsText}${maxSuggestionsText}

Analysiere die Platzhalter {{variable_name}} im Template und erstelle für jede Variable eine Liste sinnvoller, vielfältiger Werte. Berücksichtige dabei das Thema und den Kontext des Templates.`;
  }
}