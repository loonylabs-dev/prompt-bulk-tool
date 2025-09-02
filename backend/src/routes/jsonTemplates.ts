import { Router, Request, Response } from 'express';
import { JsonDatabase } from '../database/jsonDatabase';
import { asyncHandler } from '../middleware/errorHandler';
import { validateTemplateCreate, validateTemplateUpdate, extractVariables } from '../utils/validation';
import { ApiResponse, PaginatedResponse } from '@prompt-bulk-tool/shared';

export function createJsonTemplateRoutes(db: JsonDatabase): Router {
  const router = Router();

  // GET /api/templates - Get all templates with pagination and filtering
  router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 50, 100);
    const category = req.query.category as string;
    const search = req.query.search as string;

    let templates = await db.getTemplates();
    
    // Apply filters
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    templates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Pagination
    const total = templates.length;
    const offset = (page - 1) * pageSize;
    const paginatedTemplates = templates.slice(offset, offset + pageSize);

    const result: PaginatedResponse<any> = {
      success: true,
      data: paginatedTemplates.map(t => ({
        ...t,
        createdAt: new Date(t.created_at),
        updatedAt: new Date(t.updated_at)
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

  // GET /api/templates/categories - Get template count by category
  router.get('/categories', asyncHandler(async (req: Request, res: Response) => {
    const templates = await db.getTemplates();
    const categories: Record<string, number> = {};
    
    templates.forEach(template => {
      const category = template.category || 'general';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    const response: ApiResponse = {
      success: true,
      data: categories
    };
    
    res.json(response);
  }));

  // GET /api/templates/:id - Get template by ID
  router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const template = await db.getTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...template,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      }
    };
    
    res.json(response);
  }));

  // GET /api/templates/:id/variables - Get variables for a template
  router.get('/:id/variables', asyncHandler(async (req: Request, res: Response) => {
    const template = await db.getTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    const variables = template.variables || extractVariables(template.content);
    
    const response: ApiResponse = {
      success: true,
      data: variables
    };
    
    res.json(response);
  }));

  // POST /api/templates - Create new template
  router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validateTemplateCreate(req.body);
    
    // Extract variables from content
    const variables = extractVariables(validatedData.content);
    
    const templateData = {
      ...validatedData,
      variables,
      tags: validatedData.tags || []
    };

    // Check for duplicate name
    const existingTemplates = await db.getTemplates();
    const duplicate = existingTemplates.find(t => t.name === templateData.name);
    if (duplicate) {
      return res.status(409).json({
        success: false,
        error: `Template with name "${templateData.name}" already exists`
      });
    }

    const template = await db.insertTemplate(templateData);
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...template,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      },
      message: 'Template created successfully'
    };
    
    res.status(201).json(response);
  }));

  // POST /api/templates/:id/duplicate - Duplicate template
  router.post('/:id/duplicate', asyncHandler(async (req: Request, res: Response) => {
    const original = await db.getTemplateById(req.params.id);
    
    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    const newName = req.body.name || `${original.name} (Copy)`;
    
    const duplicateData = {
      name: newName,
      description: original.description,
      content: original.content,
      category: original.category,
      tags: [...(original.tags || [])],
      variables: [...(original.variables || [])]
    };

    const template = await db.insertTemplate(duplicateData);
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...template,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      },
      message: 'Template duplicated successfully'
    };
    
    res.status(201).json(response);
  }));

  // PUT /api/templates/:id - Update template
  router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validateTemplateUpdate({ ...req.body, id: req.params.id });
    
    const updateData: any = { ...validatedData };
    delete updateData.id;
    
    // If content is updated, re-extract variables
    if (updateData.content) {
      updateData.variables = extractVariables(updateData.content);
    }
    
    const template = await db.updateTemplate(req.params.id, updateData);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...template,
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      },
      message: 'Template updated successfully'
    };
    
    res.json(response);
  }));

  // DELETE /api/templates/:id - Delete template
  router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const deleted = await db.deleteTemplate(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Template deleted successfully'
    };
    
    res.json(response);
  }));

  return router;
}