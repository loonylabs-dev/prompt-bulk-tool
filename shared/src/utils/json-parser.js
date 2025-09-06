"use strict";
/**
 * JSON Parser Utility
 * Robust JSON parsing with fallback strategies for AI responses
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONParser = void 0;
class JSONParser {
    static DEFAULT_OPTIONS = {
        allowMarkdownCodeBlocks: true,
        allowPartialJSON: false,
        strictMode: false,
        fallbackValue: null
    };
    /**
     * Main parsing method with comprehensive error handling
     */
    static parse(input, options = {}) {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        // Step 1: Clean the input
        let cleanedInput = this.cleanInput(input, opts);
        // Step 2: Try direct parsing
        const directResult = this.tryDirectParse(cleanedInput, opts);
        if (directResult.success) {
            return directResult;
        }
        // Step 3: Try additional cleaning strategies
        const strategies = [
            () => this.tryDirectParse(this.removeMarkdownCodeBlocks(cleanedInput), opts),
            () => this.tryDirectParse(this.extractJSONFromText(cleanedInput), opts),
            () => this.tryDirectParse(this.fixCommonJSONIssues(cleanedInput), opts)
        ];
        for (const strategy of strategies) {
            const result = strategy();
            if (result.success) {
                return { ...result, fallbackUsed: true };
            }
        }
        // Step 4: Return fallback result
        return {
            success: false,
            error: `Failed to parse JSON: ${directResult.error}`,
            fallbackUsed: true,
            data: opts.fallbackValue
        };
    }
    /**
     * Type-safe parsing with interface validation
     */
    static parseWithSchema(input, validator, options = {}) {
        const result = this.parse(input, options);
        if (!result.success || !result.data) {
            return result;
        }
        if (!validator(result.data)) {
            return {
                success: false,
                error: 'Parsed data does not match expected schema',
                fallbackUsed: result.fallbackUsed
            };
        }
        return result;
    }
    /**
     * Parse with required fields validation
     */
    static parseWithRequiredFields(input, requiredFields, options = {}) {
        const result = this.parse(input, options);
        if (!result.success || !result.data || typeof result.data !== 'object') {
            return result;
        }
        const data = result.data;
        const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);
        if (missingFields.length > 0) {
            return {
                success: false,
                error: `Missing required fields: ${missingFields.join(', ')}`,
                fallbackUsed: result.fallbackUsed
            };
        }
        return result;
    }
    /**
     * Clean input text before parsing
     */
    static cleanInput(input, options) {
        let cleaned = input.trim();
        // Remove common prefixes from AI responses
        cleaned = cleaned.replace(/^(Here's the JSON:?|JSON:?|Response:?)\s*/i, '');
        // Remove trailing punctuation that might interfere
        cleaned = cleaned.replace(/[.!?]+\s*$/, '');
        // Normalize line endings
        cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        return cleaned;
    }
    /**
     * Try direct JSON parsing
     */
    static tryDirectParse(input, options) {
        try {
            const data = JSON.parse(input);
            return {
                success: true,
                data,
                fallbackUsed: false
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Parse error',
                fallbackUsed: false
            };
        }
    }
    /**
     * Remove markdown code blocks
     */
    static removeMarkdownCodeBlocks(input) {
        // Remove ```json ``` blocks
        let cleaned = input.replace(/```json\s*([\s\S]*?)```/g, '$1');
        // Remove ``` ``` blocks
        cleaned = cleaned.replace(/```\s*([\s\S]*?)```/g, '$1');
        // Remove `json` inline code
        cleaned = cleaned.replace(/`json\s*(.*?)`/g, '$1');
        // Remove backticks around JSON
        cleaned = cleaned.replace(/^`+|`+$/g, '');
        return cleaned.trim();
    }
    /**
     * Extract JSON from mixed text content
     */
    static extractJSONFromText(input) {
        // Look for JSON object patterns
        const jsonObjectMatch = input.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
            return jsonObjectMatch[0];
        }
        // Look for JSON array patterns
        const jsonArrayMatch = input.match(/\[[\s\S]*\]/);
        if (jsonArrayMatch) {
            return jsonArrayMatch[0];
        }
        return input;
    }
    /**
     * Fix common JSON formatting issues
     */
    static fixCommonJSONIssues(input) {
        let fixed = input;
        // Fix trailing commas
        fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
        // Fix single quotes to double quotes
        fixed = fixed.replace(/'/g, '"');
        // Fix unquoted keys (basic cases)
        fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
        // Fix escaped quotes issues
        fixed = fixed.replace(/\\"/g, '"');
        return fixed;
    }
    /**
     * Utility method to validate JSON structure
     */
    static validateStructure(obj, expectedKeys) {
        if (!obj || typeof obj !== 'object') {
            return false;
        }
        return expectedKeys.every(key => key in obj);
    }
    /**
     * Utility method to extract nested JSON safely
     */
    static extractNested(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    /**
     * Helper to check if string contains valid JSON
     */
    static isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Helper to format JSON for pretty printing
     */
    static stringify(obj, indent = 2) {
        try {
            return JSON.stringify(obj, null, indent);
        }
        catch (error) {
            return `Error stringifying object: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
    }
}
exports.JSONParser = JSONParser;
