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
}

/**
 * Message class for generating variable values with specific direction/style
 */
export class VariableGeneratorMessage extends BaseAIMessage {
  public readonly category = MESSAGE_CATEGORIES.VARIABLE_GENERATION;
  public readonly description = 'Generates creative variable values with specific style direction';

  public readonly systemMessage = `Du bist ein Experte für kreative Variable-Werte-Generierung für Prompt-Templates.

Deine Aufgabe ist es, für eine spezifische Variable in einem Template kreative, thematisch passende Werte zu generieren, die einer bestimmten Richtung/Stil folgen.

WICHTIGE REGELN:
- Generiere nur Werte für die angegebene Variable
- Berücksichtige den Kontext des gesamten Templates
- Folge der angegebenen Stil-Richtung genau
- Erstelle vielfältige, interessante Variationen
- Verwende einfache, verständliche Begriffe
- Vermeide bereits vorhandene Werte
- Halte die Werte thematisch konsistent

ANTWORT-FORMAT:
Antworte AUSSCHLIESSLICH mit folgendem JSON-Format ohne zusätzlichen Text, Markdown-Code-Blöcke oder Erklärungen:

{
  "values": ["wert1", "wert2", "wert3", ...]
}

Die Anzahl der Werte entspricht der angeforderten Menge. Jeder Wert sollte kreativ, passend und einzigartig sein.`;

  public buildUserMessage(input: VariableGeneratorInput): string {
    this.validateRequiredParams(input, ['templateContent', 'variableName', 'direction']);

    if (input.count < 1 || input.count > 50) {
      throw new Error('Count must be between 1 and 50');
    }

    const existingText = input.existingValues && input.existingValues.length > 0
      ? `\n\nVermeide diese bereits vorhandenen Werte: ${input.existingValues.join(', ')}`
      : '';

    return `Template-Kontext:
"""
${this.sanitizeText(input.templateContent)}
"""

Variable: {{${input.variableName}}}
Stil-Richtung: "${input.direction}"
Anzahl gewünschter Werte: ${input.count}${existingText}

Generiere ${input.count} kreative Werte für die Variable "{{${input.variableName}}}" die dem Stil "${input.direction}" entsprechen und thematisch zum Template passen.`;
  }
}