# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prompt Bulk Tool is a webapp for creating and automating bulk prompt execution. It allows users to define prompt templates with placeholders, manage variable sets, generate prompts in bulk, and automate their execution through browser automation (Playwright) on platforms like ChatGPT, Claude, and Gemini.

## Architecture

### Monorepo Structure
The project uses npm workspaces with four main packages:

- **shared/**: TypeScript types and interfaces shared across all packages
- **backend/**: Express.js API server with SQLite database  
- **frontend/**: Next.js React frontend (planned)
- **automation/**: Playwright scripts for browser automation (planned)

### Core Concepts

1. **Prompt Templates**: Text templates with `{{variable_name}}` placeholders
2. **Variables**: Defined values that can be substituted into templates
3. **Variable Sets**: Collections of variable values for bulk generation
4. **Generated Prompts**: Final prompts created by combining templates with variables
5. **Automation Sessions**: Browser automation runs that execute prompts on target platforms

### Database Schema

SQLite database with these main tables:
- `prompt_templates`: Template definitions with extracted variables
- `prompt_variables`: Variable definitions with types and possible values  
- `variable_sets`: Collections of variable value combinations
- `generated_prompts`: Final prompts with execution status and results
- `automation_targets`: Platform configurations (ChatGPT, Claude, etc.)
- `automation_sessions`: Execution sessions with progress tracking

## Development Commands

### Initial Setup
```bash
npm run setup  # Install dependencies and build shared package
```

### Development
```bash
npm run dev    # Start backend and frontend in watch mode
npm run build  # Build all packages (shared first, then backend/frontend)
npm start      # Start production backend server
```

### Per-Workspace Commands
```bash
npm run build -w shared     # Build shared types package first
npm run dev -w backend      # Backend development with watch mode  
npm run dev -w frontend     # Frontend development server
npm run type-check          # TypeScript checking across all workspaces
```

### Database Operations
Backend includes automatic database initialization and migrations on startup. The database file is created at `database/prompt-bulk-tool.db`.

## Key Implementation Details

### Variable Extraction
Templates are parsed to automatically extract `{{variable_name}}` placeholders using regex in `backend/src/utils/validation.ts:extractVariables()`.

### API Structure  
REST API follows this pattern:
- `/api/templates` - CRUD operations for prompt templates
- `/api/variables` - Variable management
- `/api/generation` - Bulk prompt generation engine
- `/api/automation` - Browser automation controls

### Browser Automation Targets
Predefined configurations for major AI platforms are seeded in the database with platform-specific CSS selectors and timing configurations.

### Error Handling
Centralized error handling with custom error types, SQLite constraint handling, and development vs production error responses in `backend/src/middleware/errorHandler.ts`.

## TypeScript Configuration

All packages use strict TypeScript. The shared package must be built before other packages since they import from `@prompt-bulk-tool/shared`.

Build order: `shared` → `backend` → `frontend` → `automation`