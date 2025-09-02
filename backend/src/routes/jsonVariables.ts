import { Router, Request, Response } from 'express';
import { JsonDatabase } from '../database/jsonDatabase';
import { asyncHandler } from '../middleware/errorHandler';
import { validateVariableCreate, validateVariableUpdate } from '../utils/validation';
import { ApiResponse, PaginatedResponse } from '@prompt-bulk-tool/shared';

export function createJsonVariableRoutes(db: JsonDatabase): Router {
  const router = Router();

  // GET /api/variables - Get all variables
  router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize as string) || 50, 100);
    
    const variables = await db.getVariables();
    const total = variables.length;
    const offset = (page - 1) * pageSize;
    const paginatedVariables = variables.slice(offset, offset + pageSize);

    const result: PaginatedResponse<any> = {
      success: true,
      data: paginatedVariables.map(v => ({
        ...v,
        createdAt: new Date(v.created_at),
        updatedAt: new Date(v.updated_at)
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

  // POST /api/variables - Create new variable
  router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const validatedData = validateVariableCreate(req.body);
    
    const variable = await db.insertVariable({
      ...validatedData,
      template_ids: []
    });
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...variable,
        createdAt: new Date(variable.created_at),
        updatedAt: new Date(variable.updated_at)
      },
      message: 'Variable created successfully'
    };
    
    res.status(201).json(response);
  }));

  // Variable Sets
  router.get('/sets', asyncHandler(async (req: Request, res: Response) => {
    const variableSets = await db.getVariableSets();
    
    const response: ApiResponse = {
      success: true,
      data: variableSets.map(vs => ({
        ...vs,
        createdAt: new Date(vs.created_at),
        updatedAt: new Date(vs.updated_at)
      }))
    };
    
    res.json(response);
  }));

  router.post('/sets', asyncHandler(async (req: Request, res: Response) => {
    const { name, description, variables, templateIds } = req.body;
    
    if (!name || !description || !variables) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and variables are required'
      });
    }
    
    const variableSet = await db.insertVariableSet({
      name,
      description,
      variables,
      template_ids: templateIds || []
    });
    
    const response: ApiResponse = {
      success: true,
      data: {
        ...variableSet,
        createdAt: new Date(variableSet.created_at),
        updatedAt: new Date(variableSet.updated_at)
      },
      message: 'Variable set created successfully'
    };
    
    res.status(201).json(response);
  }));

  return router;
}