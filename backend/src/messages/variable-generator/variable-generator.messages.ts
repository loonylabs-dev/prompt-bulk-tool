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

    // Build verbosity instruction based on the selected level
    const getVerbosityInstruction = (verbosity?: string): string => {
      switch (verbosity) {
        case 'title_only':
          return 'Generiere nur kurze Titel oder Namen (maximal 1-3 Wörter).';
        case 'short_concise':
          return 'Generiere kurze, prägnante Begriffe oder Phrasen (maximal 5-7 Wörter).';
        case 'one_sentence':
          return 'Generiere vollständige, aber knappe Sätze (maximal 15-20 Wörter).';
        default:
          return 'Generiere kurze, prägnante Begriffe oder Phrasen (maximal 5-7 Wörter).';
      }
    };

    const verbosityInstruction = getVerbosityInstruction(input.verbosity);

    return `Template-Kontext:
"""
${this.sanitizeText(input.templateContent)}
"""

Variable: {{${input.variableName}}}
Stil-Richtung: "${input.direction}"
Anzahl gewünschter Werte: ${input.count}
Ausführlichkeit: ${verbosityInstruction}${existingText}

Generiere ${input.count} kreative Werte für die Variable "{{${input.variableName}}}" die dem Stil "${input.direction}" entsprechen und thematisch zum Template passen. Beachte dabei die Ausführlichkeits-Vorgabe.`;
  }
}