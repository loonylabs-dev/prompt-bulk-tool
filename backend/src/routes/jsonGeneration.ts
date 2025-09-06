import { Router, Request, Response } from 'express';
import { JsonDatabase } from '../database/jsonDatabase';
import { asyncHandler } from '../middleware/errorHandler';
import { validateGenerationRequest } from '../utils/validation';
import { ApiResponse } from '@prompt-bulk-tool/shared';
import { v4 as uuidv4 } from 'uuid';

function generateVariableCombinations(variableNames: string[], variableData: Record<string, string[]>): Record<string, string>[] {
  if (variableNames.length === 0) return [{}];

  const result: Record<string, string>[] = [];
  
  const generateRecursive = (index: number, currentCombination: Record<string, string>) => {
    if (index === variableNames.length) {
      result.push({ ...currentCombination });
      return;
    }

    const variableName = variableNames[index];
    const values = variableData[variableName] || [];

    for (const value of values) {
      currentCombination[variableName] = value;
      generateRecursive(index + 1, currentCombination);
    }
  };

  generateRecursive(0, {});
  return result;
}

function substituteVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  
  for (const [varName, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}

export function createJsonGenerationRoutes(db: JsonDatabase): Router {
  const router = Router();

  // POST /api/generation/generate - Generate prompts from templates and variables
  router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
    const validatedRequest = validateGenerationRequest(req.body);
    
    // Get templates
    const templates = [];
    for (const templateId of validatedRequest.templateIds) {
      const template = await db.getTemplateById(templateId);
      if (template) {
        templates.push(template);
      }
    }

    if (templates.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid templates found'
      });
    }

    // Get variables - either from variable presets or custom variables
    let variableData: Record<string, string[]>;
    
    if (validatedRequest.variablePresetIds && validatedRequest.variablePresetIds.length > 0) {
      variableData = {};
      
      // Load all Variable-Presets and parse their values
      for (const presetId of validatedRequest.variablePresetIds) {
        const preset = await db.getVariablePresetById(presetId);
        if (!preset) {
          return res.status(404).json({
            success: false,
            error: `Variable preset with ID ${presetId} not found`
          });
        }
        
        // Parse semicolon-separated values
        const values = preset.values.split(';')
          .map((v: string) => v.trim())
          .filter((v: string) => v.length > 0);
          
        if (values.length === 0) {
          return res.status(400).json({
            success: false,
            error: `Variable preset "${preset.name}" has no valid values`
          });
        }
        
        variableData[preset.placeholder] = values;
      }
    } else if (validatedRequest.customVariables) {
      variableData = validatedRequest.customVariables;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either variablePresetIds or customVariables must be provided'
      });
    }

    // Generate all combinations
    const generatedPrompts = [];
    
    for (const template of templates) {
      // Check if template has all required variables
      const templateVariables = template.variables || [];
      const missingVariables = templateVariables.filter(
        (varName: string) => !variableData[varName] || variableData[varName].length === 0
      );

      if (missingVariables.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Template "${template.name}" requires variables that are not provided: ${missingVariables.join(', ')}`
        });
      }

      // Generate cartesian product of all variable combinations for this template
      const combinations = generateVariableCombinations(templateVariables, variableData);
      
      for (const variableAssignment of combinations) {
        const promptContent = substituteVariables(template.content, variableAssignment);
        
        const generatedPrompt = {
          id: uuidv4(),
          templateId: template.id,
          templateName: template.name,
          content: promptContent,
          variables: variableAssignment,
          generatedAt: new Date(),
          status: 'pending'
        };

        generatedPrompts.push(generatedPrompt);
      }
    }

    // Save generated prompts to database
    await db.insertGeneratedPrompts(generatedPrompts);

    const result = {
      prompts: generatedPrompts,
      totalCount: generatedPrompts.length
    };

    const response: ApiResponse = {
      success: true,
      data: result,
      message: `Generated ${result.totalCount} prompts successfully`
    };
    
    res.status(201).json(response);
  }));

  // GET /api/generation/prompts - Get generated prompts
  router.get('/prompts', asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 50, 100);
    
    let prompts = await db.getGeneratedPrompts();
    
    // Sort by generation date (newest first)
    prompts.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());

    const total = prompts.length;
    const offset = (page - 1) * pageSize;
    const paginatedPrompts = prompts.slice(offset, offset + pageSize);

    const result = {
      prompts: paginatedPrompts.map(p => ({
        ...p,
        generatedAt: new Date(p.generated_at)
      })),
      totalCount: total
    };
    
    const response: ApiResponse = {
      success: true,
      data: result
    };
    
    res.json(response);
  }));

  // DELETE /api/generation/prompts - Delete multiple prompts by IDs
  router.delete('/prompts', asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'ids array is required and must not be empty'
      });
    }
    
    let deletedCount = 0;
    for (const id of ids) {
      const deleted = await db.deleteGeneratedPrompt(id);
      if (deleted) deletedCount++;
    }
    
    const response: ApiResponse = {
      success: true,
      message: `Deleted ${deletedCount} of ${ids.length} prompts successfully`
    };
    
    res.json(response);
  }));

  // DELETE /api/generation/prompts/all - Delete all generated prompts
  // IMPORTANT: This route must come BEFORE /prompts/:id
  router.delete('/prompts/all', asyncHandler(async (req: Request, res: Response) => {
    const deletedCount = await db.deleteAllGeneratedPrompts();
    
    const response: ApiResponse = {
      success: true,
      message: `Deleted ${deletedCount} prompts successfully`
    };
    
    res.json(response);
  }));

  // DELETE /api/generation/prompts/:id - Delete a single generated prompt
  router.delete('/prompts/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const deleted = await db.deleteGeneratedPrompt(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Prompt deleted successfully'
    };
    
    res.json(response);
  }));

  // GET /api/generation/export - Export generated prompts
  router.get('/export', asyncHandler(async (req: Request, res: Response) => {
    const format = (req.query.format as string) || 'json';
    const validFormats = ['json', 'csv', 'txt'];
    
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        success: false,
        error: `Format must be one of: ${validFormats.join(', ')}`
      });
    }

    const prompts = await db.getGeneratedPrompts();

    let exportData: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'json':
        exportData = JSON.stringify(prompts, null, 2);
        contentType = 'application/json';
        filename = 'generated-prompts.json';
        break;
      
      case 'csv':
        const headers = ['ID', 'Template Name', 'Content', 'Variables', 'Status', 'Generated At'];
        const csvRows = [headers.join(',')];
        
        prompts.forEach(prompt => {
          const row = [
            prompt.id,
            `"${prompt.templateName.replace(/"/g, '""')}"`,
            `"${prompt.content.replace(/"/g, '""')}"`,
            `"${JSON.stringify(prompt.variables).replace(/"/g, '""')}"`,
            prompt.status,
            prompt.generated_at
          ];
          csvRows.push(row.join(','));
        });
        
        exportData = csvRows.join('\n');
        contentType = 'text/csv';
        filename = 'generated-prompts.csv';
        break;
      
      case 'txt':
        exportData = prompts.map((prompt, index) => 
          `--- Prompt ${index + 1} ---\n` +
          `Template: ${prompt.templateName}\n` +
          `Status: ${prompt.status}\n` +
          `Variables: ${JSON.stringify(prompt.variables)}\n` +
          `Content:\n${prompt.content}\n`
        ).join('\n\n');
        contentType = 'text/plain';
        filename = 'generated-prompts.txt';
        break;
      
      default:
        throw new Error('Invalid format');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
  }));

  return router;
}