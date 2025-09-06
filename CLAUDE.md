# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prompt Bulk Tool is a webapp for creating and automating bulk prompt execution. It allows users to define prompt templates with placeholders, manage variable sets, generate prompts in bulk, and automate their execution through browser automation (Playwright) on platforms like ChatGPT, Claude, and Gemini.

## Architecture

### Monorepo Structure
The project uses npm workspaces with four main packages:

- **shared/**: TypeScript types and interfaces shared across all packages
- **backend/**: Express.js API server with JSON database (primary) and SQLite database (legacy)
- **frontend/**: Next.js React frontend (active)
- **automation/**: Playwright scripts for browser automation (active)

### Core Concepts

1. **Prompt Templates**: Text templates with `{{variable_name}}` placeholders
2. **Variable-Presets**: Reusable collections of variable values with metadata and AI-generated options
3. **Variables**: Legacy individual variable definitions (replaced by Variable-Presets)
4. **Generated Prompts**: Final prompts created by combining templates with variables
5. **Automation Sessions**: Browser automation runs that execute prompts on target platforms
6. **AI Integration**: Ollama-powered variable generation with intelligent suggestions

### Database Schema

JSON database (primary) with these main collections:
- `templates`: Template definitions with extracted variables
- `variablePresets`: Variable-Preset definitions with values, tags, and metadata
- `generatedPrompts`: Final prompts with execution status and results
- `automationTargets`: Platform configurations (ChatGPT, Claude, etc.)
- `automationSessions`: Execution sessions with progress tracking

Legacy SQLite database available at `database/prompt-bulk-tool.db`

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
Backend includes automatic database initialization and migrations on startup. The active JSON database is at `database/prompt-bulk-tool.json` with SQLite legacy support at `database/prompt-bulk-tool.db`.

## Key Implementation Details

### Variable Extraction
Templates are parsed to automatically extract `{{variable_name}}` placeholders using regex in `backend/src/utils/validation.ts:extractVariables()`.

### API Structure  
REST API follows this pattern:
- `/api/templates` - CRUD operations for prompt templates
- `/api/variable-presets` - Variable-Preset management with AI generation support
- `/api/variables` - Legacy variable management (replaced by Variable-Presets)
- `/api/generation` - Bulk prompt generation engine
- `/api/automation` - Browser automation controls  
- `/api/ai` - AI integration endpoints (generate-variable-values, test-connection)

### Browser Automation Targets
Predefined configurations for major AI platforms are seeded in the database with platform-specific CSS selectors and timing configurations.

### Error Handling
Centralized error handling with custom error types, SQLite constraint handling, and development vs production error responses in `backend/src/middleware/errorHandler.ts`.

## TypeScript Configuration

All packages use strict TypeScript. The shared package must be built before other packages since they import from `@prompt-bulk-tool/shared`.

Build order: `shared` → `backend` → `frontend` → `automation`

## Lessons Learned & Critical Issues

### Frontend-Backend API Strategy
- **Always use centralized API layer** (`frontend/src/lib/api.ts`) instead of direct fetch() calls for consistency and type safety
- **Maintain TypeScript type safety** with shared interfaces in `shared/src/types.ts` (e.g., `AIGenerateVariableValuesRequest`)
- **Use Next.js proxy routing** (`NEXT_PUBLIC_API_URL=/api`) instead of direct port connections to avoid CORS and routing issues

### Development Environment Stability  
- **Nodemon restart loops**: Fixed with `backend/nodemon.json` using 2-second delay to prevent server restarts during long-running AI requests
- **Dev script configuration**: `"dev": "concurrently \"tsc --watch\" \"npm run copy-sql\" \"nodemon\""` uses nodemon.json config
- **Root-level npm run dev**: Now works reliably with stable backend during AI operations

### AI Integration
- **AI API endpoints**: `/api/ai/generate-variable-values` and `/api/ai/test-connection`
- **Request parameters**: Requires templateContent, variableName, direction, count, and optional existingValues
- **Processing times**: Typically 1-3 seconds - server stability during requests is critical
- **Ollama integration**: Configured via backend services with proper error handling and logging

### Common Pitfalls Avoided
- **Direct fetch() calls**: Bypass centralized error handling, logging, and type safety
- **Hardcoded port URLs**: Cause proxy routing failures and CORS issues in development
- **Missing nodemon delay**: Causes server restarts during active AI request processing
- **API migration syntax errors**: Require careful review of bracket matching and import statements