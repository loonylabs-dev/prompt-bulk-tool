import { Router, Request, Response } from 'express';
import { JsonDatabase } from '../database/jsonDatabase';
import { asyncHandler } from '../middleware/errorHandler';
import { validateVariablePresetCreate, validateVariablePresetUpdate, extractTemplatePlaceholders } from '../utils/validation';
import { ApiResponse, PaginatedResponse } from '@prompt-bulk-tool/shared';

export function createVariablePresetRoutes(db: JsonDatabase): Router {
  const router = Router();

  // GET /api/variable-presets - Get all variable presets
  router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 50, 100);
    const tag = req.query.tag as string;
    const placeholder = req.query.placeholder as string;
    
    let presets = await db.getVariablePresets();
    
    // Filter by tag if provided
    if (tag) {
      presets = presets.filter(preset => 
        preset.tags && preset.tags.includes(tag)
      );
    }
    
    // Filter by placeholder if provided
    if (placeholder) {
      presets = presets.filter(preset => 
        preset.placeholder === placeholder
      );
    }
    
    const total = presets.length;
    const offset = (page - 1) * pageSize;
    const paginatedPresets = presets.slice(offset, offset + pageSize);

    const result: PaginatedResponse<any> = {
      success: true,
      data: paginatedPresets.map(preset => ({
        ...preset,
        createdAt: new Date(preset.created_at),
        updatedAt: new Date(preset.updated_at)
      })),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };

    res.json(result);
  }));

  // GET /api/variable-presets/placeholders/all - Get all template placeholders
  router.get('/placeholders/all', asyncHandler(async (req: Request, res: Response) => {
    const templates = await db.getTemplates();
    const placeholders = extractTemplatePlaceholders(templates);
    
    const response: ApiResponse = {
      success: true,
      data: placeholders
    };
    
    res.json(response);
  }));

  // GET /api/variable-presets/tags/all - Get all unique tags from presets
  router.get('/tags/all', asyncHandler(async (req: Request, res: Response) => {
    const presets = await db.getVariablePresets();
    const allTags = new Set<string>();
    
    presets.forEach(preset => {
      if (preset.tags && Array.isArray(preset.tags)) {
        preset.tags.forEach((tag: string) => allTags.add(tag));
      }
    });
    
    const response: ApiResponse = {
      success: true,
      data: Array.from(allTags).sort()
    };
    
    res.json(response);
  }));

  // GET /api/variable-presets/:id - Get single variable preset
  router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const preset = await db.getVariablePresetById(id);
    
    if (!preset) {
      return res.status(404).json({
        success: false,
        error: 'Variable preset not found'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...preset,
        createdAt: new Date(preset.created_at),
        updatedAt: new Date(preset.updated_at)
      }
    };
    
    res.json(response);
  }));

  // POST /api/variable-presets - Create new variable preset
  router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validateVariablePresetCreate(req.body);
    
    const preset = await db.insertVariablePreset(validatedData);
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...preset,
        createdAt: new Date(preset.created_at),
        updatedAt: new Date(preset.updated_at)
      },
      message: 'Variable preset created successfully'
    };
    
    res.status(201).json(response);
  }));

  // PUT /api/variable-presets/:id - Update variable preset
  router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // For updates, we only validate the fields that are provided
    const updateData: any = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.placeholder !== undefined) updateData.placeholder = req.body.placeholder;
    if (req.body.values !== undefined) updateData.values = req.body.values;
    if (req.body.tags !== undefined) updateData.tags = req.body.tags;
    
    try {
      const preset = await db.updateVariablePreset(id, updateData);
      
      const response: ApiResponse = {
        success: true,
        data: {
          ...preset,
          createdAt: new Date(preset.created_at),
          updatedAt: new Date(preset.updated_at)
        },
        message: 'Variable preset updated successfully'
      };
      
      res.json(response);
    } catch (error: any) {
      if (error.message === 'Variable preset not found') {
        return res.status(404).json({
          success: false,
          error: 'Variable preset not found'
        });
      }
      throw error;
    }
  }));

  // DELETE /api/variable-presets/:id - Delete variable preset
  router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      await db.deleteVariablePreset(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Variable preset deleted successfully'
      };
      
      res.json(response);
    } catch (error: any) {
      if (error.message === 'Variable preset not found') {
        return res.status(404).json({
          success: false,
          error: 'Variable preset not found'
        });
      }
      throw error;
    }
  }));

  // POST /api/variable-presets/:id/duplicate - Duplicate variable preset
  router.post('/:id/duplicate', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { includeValues = true } = req.body;
    
    try {
      const duplicatedPreset = await db.duplicateVariablePreset(id, includeValues);
      
      const response: ApiResponse = {
        success: true,
        data: {
          ...duplicatedPreset,
          createdAt: new Date(duplicatedPreset.created_at),
          updatedAt: new Date(duplicatedPreset.updated_at)
        },
        message: 'Variable preset duplicated successfully'
      };
      
      res.status(201).json(response);
    } catch (error: any) {
      if (error.message === 'Variable preset not found') {
        return res.status(404).json({
          success: false,
          error: 'Variable preset not found'
        });
      }
      throw error;
    }
  }));

  return router;
}