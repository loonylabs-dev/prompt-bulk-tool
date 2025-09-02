import { CreateTemplateRequest, UpdateTemplateRequest, CreateVariableRequest, UpdateVariableRequest } from '@prompt-bulk-tool/shared';
import { createError } from '../middleware/errorHandler';

export const validateTemplateCreate = (data: any): CreateTemplateRequest => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required and must be a string');
  }

  if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
    errors.push('Content is required and must be a non-empty string');
  }

  if (data.category && typeof data.category !== 'string') {
    errors.push('Category must be a string');
  }

  if (data.tags && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  if (errors.length > 0) {
    throw createError(400, `Validation failed: ${errors.join(', ')}`, 'VALIDATION_ERROR');
  }

  return {
    name: data.name.trim(),
    description: data.description.trim(),
    content: data.content.trim(),
    category: data.category?.trim() || 'general',
    tags: Array.isArray(data.tags) ? data.tags.filter((tag: any) => typeof tag === 'string') : []
  };
};

export const validateTemplateUpdate = (data: any): UpdateTemplateRequest => {
  const errors: string[] = [];

  if (!data.id || typeof data.id !== 'string') {
    errors.push('ID is required and must be a string');
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    }
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (data.content !== undefined) {
    if (typeof data.content !== 'string' || data.content.trim().length === 0) {
      errors.push('Content must be a non-empty string');
    }
  }

  if (data.category !== undefined && typeof data.category !== 'string') {
    errors.push('Category must be a string');
  }

  if (data.tags !== undefined && !Array.isArray(data.tags)) {
    errors.push('Tags must be an array');
  }

  if (errors.length > 0) {
    throw createError(400, `Validation failed: ${errors.join(', ')}`, 'VALIDATION_ERROR');
  }

  const result: UpdateTemplateRequest = {
    id: data.id
  };

  if (data.name !== undefined) result.name = data.name.trim();
  if (data.description !== undefined) result.description = data.description.trim();
  if (data.content !== undefined) result.content = data.content.trim();
  if (data.category !== undefined) result.category = data.category.trim();
  if (data.tags !== undefined) result.tags = data.tags.filter((tag: any) => typeof tag === 'string');

  return result;
};

export const validateVariableCreate = (data: any): CreateVariableRequest => {
  const errors: string[] = [];
  const validTypes = ['text', 'number', 'boolean', 'array'];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.description || typeof data.description !== 'string') {
    errors.push('Description is required and must be a string');
  }

  if (!data.type || !validTypes.includes(data.type)) {
    errors.push(`Type is required and must be one of: ${validTypes.join(', ')}`);
  }

  if (data.possibleValues && !Array.isArray(data.possibleValues)) {
    errors.push('possibleValues must be an array');
  }

  if (errors.length > 0) {
    throw createError(400, `Validation failed: ${errors.join(', ')}`, 'VALIDATION_ERROR');
  }

  return {
    name: data.name.trim(),
    description: data.description.trim(),
    type: data.type,
    defaultValue: data.defaultValue || undefined,
    possibleValues: Array.isArray(data.possibleValues) ? data.possibleValues.filter((val: any) => typeof val === 'string') : []
  };
};

export const validateVariableUpdate = (data: any): UpdateVariableRequest => {
  const errors: string[] = [];
  const validTypes = ['text', 'number', 'boolean', 'array'];

  if (!data.id || typeof data.id !== 'string') {
    errors.push('ID is required and must be a string');
  }

  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    }
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('Description must be a string');
  }

  if (data.type !== undefined && !validTypes.includes(data.type)) {
    errors.push(`Type must be one of: ${validTypes.join(', ')}`);
  }

  if (data.possibleValues !== undefined && !Array.isArray(data.possibleValues)) {
    errors.push('possibleValues must be an array');
  }

  if (errors.length > 0) {
    throw createError(400, `Validation failed: ${errors.join(', ')}`, 'VALIDATION_ERROR');
  }

  const result: UpdateVariableRequest = {
    id: data.id
  };

  if (data.name !== undefined) result.name = data.name.trim();
  if (data.description !== undefined) result.description = data.description.trim();
  if (data.type !== undefined) result.type = data.type;
  if (data.defaultValue !== undefined) result.defaultValue = data.defaultValue;
  if (data.possibleValues !== undefined) {
    result.possibleValues = data.possibleValues.filter((val: any) => typeof val === 'string');
  }

  return result;
};

export const extractVariables = (content: string): string[] => {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = variableRegex.exec(content)) !== null) {
    const variableName = match[1].trim();
    if (variableName && !variables.includes(variableName)) {
      variables.push(variableName);
    }
  }

  return variables;
};

export const validateGenerationRequest = (data: any) => {
  const errors: string[] = [];

  if (!data.templateIds || !Array.isArray(data.templateIds) || data.templateIds.length === 0) {
    errors.push('templateIds is required and must be a non-empty array');
  }

  if (data.variableSetId && typeof data.variableSetId !== 'string') {
    errors.push('variableSetId must be a string');
  }

  if (data.customVariables && typeof data.customVariables !== 'object') {
    errors.push('customVariables must be an object');
  }

  if (!data.variableSetId && !data.customVariables) {
    errors.push('Either variableSetId or customVariables must be provided');
  }

  if (errors.length > 0) {
    throw createError(400, `Validation failed: ${errors.join(', ')}`, 'VALIDATION_ERROR');
  }

  return data;
};