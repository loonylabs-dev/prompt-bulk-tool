# Prompt Bulk Tool

A comprehensive web application for creating and managing bulk prompt generation. Create templates with variables, manage reusable variable sets, and generate hundreds of prompts efficiently with AI-powered suggestions and multiple export formats.

---

## 🏷️ Tech Stack & Features

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](#-quick-start)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#️-architecture)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](#️-architecture)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-000000?style=for-the-badge&logo=express&logoColor=white)](#️-architecture)
[![Ollama Ready](https://img.shields.io/badge/Ollama-Ready-FF6B35?style=for-the-badge&logo=llama&logoColor=white)](#-features)
[![REST API](https://img.shields.io/badge/REST-API-FF6B35?style=for-the-badge&logo=fastapi&logoColor=white)](#-api-documentation)
[![AI Powered](https://img.shields.io/badge/AI-Powered-9F40FF?style=for-the-badge&logo=openai&logoColor=white)](#-features)

---

<details>
<summary>📋 Table of Contents</summary>

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [📖 Usage Guide](#-usage-guide)
- [🔄 Detailed Workflows](#-detailed-workflows)
- [🔧 API Documentation](#-api-documentation)
- [⚙️ Development](#️-development)
- [🔧 Configuration](#-configuration)
- [🚨 Troubleshooting](#-troubleshooting)
- [🤝 Contributing](#-contributing)

</details>

---

## 🎯 Overview

The Prompt Bulk Tool streamlines AI prompt workflows by allowing users to:

- **Create Templates**: Design prompt templates with `{{variable_name}}` placeholders
- **Manage Variables**: Define reusable variable collections with AI-powered generation
- **Generate Bulk Prompts**: Automatically create all combinations of templates and variables
- **AI-Powered Generation**: Generate variable values using Ollama integration
- **Export Results**: Export prompts and results in multiple formats (JSON, CSV, TXT)

Perfect for content creators, researchers, marketers, and developers who need to process large amounts of prompts systematically.

## ✨ Features

### 🎯 Core Functionality
- **Template Management**: Create, edit, and organize prompt templates
- **Variable Presets**: Manage reusable variable collections with descriptions and tags
- **Bulk Generation**: Generate all combinations of templates and variables
- **Smart Variable Extraction**: Automatically detect variables in templates
- **Export Options**: Multiple export formats with customizable options

### 🤖 AI Integration
- **AI-Powered Variable Generation**: Generate variable values using Ollama integration
- **Intelligent Suggestions**: Get contextual variable recommendations
- **Template Analysis**: AI-assisted template optimization and variable detection

### 🔧 Automation
- **Browser Automation**: Execute prompts on ChatGPT, Claude, Gemini, and custom platforms
- **Session Management**: Track execution progress and results
- **Export & Integration**: Multiple export formats for seamless workflow integration

<details>
<summary>💡 Advanced Features</summary>

- **Variable Value Wrapping**: Optional bracket wrapping for generated values
- **Gender Suffixes**: Automatic generation of gendered variants
- **Batch Processing**: Efficient handling of large prompt sets
- **Real-time Progress**: Live updates during generation and automation

</details>

## 🏗️ Architecture

<details>
<summary>📦 Monorepo Structure</summary>

```
prompt-bulk-tool/
├── shared/          # TypeScript types and utilities shared across packages
├── backend/         # Express.js API server with JSON database
├── frontend/        # Next.js React application
└── automation/      # Browser automation scripts (experimental)
```

</details>

<details>
<summary>🛠️ Technology Stack</summary>

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: JSON-based with automatic migrations (SQLite legacy support)
- **AI Integration**: Ollama middleware for robust AI backends
- **AI Integration**: Ollama API for variable generation

</details>

<details>
<summary>🧠 Core Concepts</summary>

1. **Templates**: Text templates containing `{{variable_name}}` placeholders
2. **Variable Presets**: Reusable collections of variable values with metadata
3. **Generated Prompts**: Final prompts created by combining templates with variables
4. **Export Options**: Multiple formats for integration and processing
5. **Automation Targets**: Platform-specific configurations (ChatGPT, Claude, etc.)

</details>

## 🚀 Quick Start

<details>
<summary>📋 Prerequisites</summary>

- Node.js 18+ and npm
- (Optional) Ollama server for AI features

</details>

### Installation

1. **Clone and Setup**
```bash
git clone https://github.com/loonylabs-dev/prompt-bulk-tool.git
cd prompt-bulk-tool
npm run setup  # Installs dependencies and builds shared package
```

<details>
<summary>⚙️ Environment Configuration</summary>

2. **Environment Configuration**
```bash
# Copy environment examples
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your settings
```

</details>

3. **Start Development Server**
```bash
npm run dev  # Starts both backend and frontend in watch mode
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## 📖 Usage Guide

### 1. Create Templates

1. Navigate to **Templates** in the main menu
2. Click **Create Template**
3. Fill in template details:
   - **Name**: Descriptive template name
   - **Description**: Purpose and usage notes
   - **Content**: Your prompt with `{{variable_name}}` placeholders
   - **Category**: Organization category
   - **Tags**: Search and filtering tags

**Example Template:**
```
Create a product description for {{product_type}} targeting {{audience}} 
with a {{tone}} tone. Focus on {{key_features}} and include {{call_to_action}}.
```

### 2. Create Variable Presets

1. Go to **Variable Presets**
2. Click **Create Variable Preset**
3. Configure your variables:
   - **Name**: Preset name
   - **Description**: Usage description
   - **Placeholder**: Variable name (e.g., "product_type")
   - **Values**: Semicolon-separated values
   - **Tags**: Organization tags

**Example Variable Preset:**
- **Name**: "Product Types"
- **Placeholder**: "product_type"
- **Values**: "smartphone;laptop;tablet;smartwatch;headphones"

### 3. Generate Prompts

1. Navigate to **Prompt Generation**
2. **Select Template**: Choose your template
3. **Choose Variables**: Select relevant Variable Presets or use custom variables
4. **Configure Options**:
   - **Wrap Values**: Add brackets around variable values
   - **Gender Suffixes**: Generate male/female variants
5. Click **Generate Prompts**

### 4. Export Results

1. From the Generated Prompts section
2. Click **Export** dropdown
3. Choose format:
   - **JSON**: Structured data with metadata
   - **CSV**: Spreadsheet-compatible format
   - **TXT**: Plain text prompts

### 5. Export and Integration

Export your generated prompts in multiple formats (JSON, CSV, TXT) for integration with other tools and workflows. Future versions will include browser automation capabilities.

## 🔄 Detailed Workflows

<details>
<summary>📈 Workflow 1: Content Marketing Campaign</summary>

**Scenario**: Create product descriptions for an e-commerce store

1. **Create Product Description Template**:
   ```
   Write a compelling product description for {{product_type}} that appeals to {{target_audience}}.
   
   Key features: {{key_features}}
   Price range: {{price_range}}
   Brand positioning: {{brand_tone}}
   
   Include a strong call-to-action focused on {{main_benefit}}.
   ```

2. **Set up Variable Presets**:
   - **product_type**: "smartphone;laptop;wireless headphones;smartwatch;tablet"
   - **target_audience**: "tech enthusiasts;business professionals;students;gamers"
   - **key_features**: "premium build quality;long battery life;fast performance;affordable price"
   - **price_range**: "budget-friendly;mid-range;premium;luxury"
   - **brand_tone**: "innovative;reliable;trendy;professional"
   - **main_benefit**: "convenience;performance;style;value"

3. **Generate and Export**: Creates 5×4×4×4×4×4 = 5,120 unique product descriptions

</details>

<details>
<summary>🎓 Workflow 2: Educational Content Creation</summary>

**Scenario**: Generate lesson plans for different subjects and grade levels

1. **Create Lesson Plan Template**:
   ```
   Create a {{lesson_duration}} lesson plan for {{subject}} targeting {{grade_level}} students.
   
   Topic: {{topic}}
   Learning objectives: {{learning_objectives}}
   Teaching method: {{teaching_method}}
   Assessment type: {{assessment_method}}
   
   Include engaging activities suitable for {{learning_style}} learners.
   ```

2. **Variable Presets Setup**:
   - **lesson_duration**: "30-minute;45-minute;60-minute;90-minute"
   - **subject**: "Mathematics;Science;English;History;Art"
   - **grade_level**: "elementary;middle school;high school"
   - **topic**: "fractions;photosynthesis;creative writing;world war;color theory"
   - **learning_objectives**: "understand concepts;apply knowledge;analyze information;create original work"
   - **teaching_method**: "lecture;hands-on activity;group discussion;individual research"
   - **assessment_method**: "quiz;project;presentation;written assignment"
   - **learning_style**: "visual;auditory;kinesthetic;reading/writing"

</details>

<details>
<summary>🔬 Workflow 3: Research Question Generation</summary>

**Scenario**: Generate research questions for academic studies

1. **Create Research Template**:
   ```
   Develop a research question investigating {{research_topic}} in the context of {{field_of_study}}.
   
   Focus area: {{focus_area}}
   Methodology: {{research_method}}
   Population: {{target_population}}
   Timeframe: {{study_timeframe}}
   
   The question should be {{question_complexity}} and suitable for {{academic_level}}.
   ```

2. **AI-Powered Variable Generation**:
   - Use the AI generation feature to create contextual variables
   - Input base concepts and let AI generate related variations
   - Review and refine generated values for accuracy

</details>

<details>
<summary>⚙️ Advanced Features Usage</summary>

#### Variable Value Wrapping
Enable "Wrap variable values with square brackets" to generate:
```
Original: "Create a description for smartphone targeting students"
Wrapped: "Create a description for [smartphone] targeting [students]"
```
**Use cases**: 
- Template debugging
- Highlighting variable substitutions
- Integration with systems that expect bracketed values

#### Gender Suffixes
Enable "Add gender suffixes" to automatically generate variants:
```
Original variable "doctor" becomes:
- "doctor"
- "doctor, female"  
- "doctor, male"
```
**Use cases**:
- Inclusive content generation
- A/B testing gendered messaging
- Demographic-specific campaigns

#### Custom Variables vs. Variable Presets

**Use Custom Variables when**:
- One-time prompt generation
- Testing new variable combinations
- Simple, few-value variables

**Use Variable Presets when**:
- Reusable variable sets
- Complex variable relationships  
- Organized, tagged variable management
- AI-generated variable values

</details>

<details>
<summary>📤 Export and Integration</summary>

#### Export Formats

1. **JSON Export**:
   - Full metadata preservation
   - Programmatic processing
   - API integration ready
   ```json
   {
     "prompts": [
       {
         "id": "prompt-123",
         "content": "Generated prompt text...",
         "variables": {"product_type": "smartphone"},
         "templateName": "Product Description",
         "generatedAt": "2024-01-15T10:30:00Z"
       }
     ]
   }
   ```

2. **CSV Export**:
   - Spreadsheet compatibility
   - Data analysis ready
   - Columns: ID, Content, Variables, Template, Date

3. **TXT Export**:
   - Plain text format
   - Direct copy-paste usage
   - One prompt per line

#### Integration Workflows

**Content Management Systems**:
1. Generate prompts in bulk
2. Export as CSV
3. Import into CMS using batch upload
4. Schedule content publication

**AI Platform Processing**:
1. Generate and export prompts
2. Use automation tools (future feature) or manual processing
3. Collect and analyze responses
4. Iterate based on performance data

</details>

<details>
<summary>⚡ Performance Optimization</summary>

#### Large-Scale Generation
- **Batch Size**: Generate in chunks of 500-1000 prompts
- **Memory Management**: Use export feature frequently
- **Variable Optimization**: Remove unnecessary variable combinations
- **Template Efficiency**: Use fewer, more targeted templates

#### Organization Best Practices
- **Naming Convention**: Use descriptive template and preset names
- **Tagging Strategy**: Consistent tag taxonomy for easy filtering
- **Description Standards**: Clear, searchable descriptions
- **Category Usage**: Logical categorization for navigation

</details>

## 🔧 API Documentation

<details>
<summary>📚 Templates API</summary>

#### `GET /api/templates`
List all templates with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `search` (string): Search in name/description

**Response:**
```json
{
  "data": [
    {
      "id": "template-123",
      "name": "Product Description",
      "description": "Template for product descriptions",
      "content": "Create a description for {{product}}...",
      "category": "Marketing",
      "tags": ["product", "marketing"],
      "variables": ["product", "tone"],
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

#### `POST /api/templates`
Create a new template.

**Request Body:**
```json
{
  "name": "Template Name",
  "description": "Template description",
  "content": "Template content with {{variables}}",
  "category": "Category",
  "tags": ["tag1", "tag2"]
}
```

#### `GET /api/templates/:id`
Get a specific template by ID.

#### `PUT /api/templates/:id`
Update a template.

#### `DELETE /api/templates/:id`
Delete a template.

</details>

<details>
<summary>📚 Variable Presets API</summary>

#### `GET /api/variable-presets`
List all variable presets with pagination.

#### `POST /api/variable-presets`
Create a new variable preset.

**Request Body:**
```json
{
  "name": "Product Types",
  "description": "Common product categories",
  "placeholder": "product_type",
  "values": ["smartphone", "laptop", "tablet"],
  "tags": ["products", "ecommerce"]
}
```

#### `GET /api/variable-presets/:id`
Get a specific variable preset.

#### `PUT /api/variable-presets/:id`
Update a variable preset.

#### `DELETE /api/variable-presets/:id`
Delete a variable preset.

</details>

<details>
<summary>📚 Generation API</summary>

#### `POST /api/generation/generate`
Generate prompts from templates and variables.

**Request Body:**
```json
{
  "templateIds": ["template-1", "template-2"],
  "variablePresetIds": ["preset-1", "preset-2"],
  "customVariables": {
    "variable_name": ["value1", "value2"]
  },
  "options": {
    "wrapValues": false,
    "addGenderSuffixes": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generatedCount": 24,
    "prompts": [
      {
        "id": "prompt-123",
        "content": "Generated prompt content...",
        "templateId": "template-1",
        "variables": {
          "product_type": "smartphone",
          "audience": "tech enthusiasts"
        },
        "generatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

#### `POST /api/generation/export`
Export generated prompts.

**Request Body:**
```json
{
  "format": "json|csv|txt",
  "promptIds": ["prompt-1", "prompt-2"]
}
```

</details>

<details>
<summary>📚 AI Integration API</summary>

#### `POST /api/ai/generate-variable-values`
Generate variable values using AI.

**Request Body:**
```json
{
  "templateContent": "Template with {{variable}}",
  "variableName": "variable",
  "direction": "creative|professional|technical",
  "count": 10,
  "existingValues": ["value1", "value2"]
}
```

#### `POST /api/ai/test-connection`
Test AI service connection.

</details>

## ⚙️ Development

<details>
<summary>🛠️ Development Commands</summary>

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

</details>

<details>
<summary>🔧 Key Implementation Details</summary>

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

</details>

<details>
<summary>📝 TypeScript Configuration</summary>

All packages use strict TypeScript. The shared package must be built before other packages since they import from `@prompt-bulk-tool/shared`.

Build order: `shared` → `backend` → `frontend` → `automation`

</details>

<details>
<summary>💡 Lessons Learned & Critical Issues</summary>

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

</details>

## 🔧 Configuration

<details>
<summary>⚙️ Environment Variables</summary>

### Backend Configuration (`.env`)
```bash
# Server Settings
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# AI Integration (Ollama)
MODEL1_BASE_URL=http://your-ollama-server.com
MODEL1_TOKEN=your_api_token_here

# Database
DATABASE_PATH=./database/prompt-bulk-tool.json

# Debugging
DEBUG_OLLAMA_REQUESTS=false
LOG_LEVEL=info
```

### Frontend Configuration (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://localhost:3001
NODE_ENV=development
```

</details>

<details>
<summary>🤖 AI Integration Setup</summary>

### Ollama Configuration
1. Install and run Ollama server
2. Configure `MODEL1_BASE_URL` and `MODEL1_TOKEN`
3. Ensure network connectivity between backend and Ollama server
4. Test connection using `/api/ai/test-connection` endpoint

### Supported Models
- `mistral-20k:latest` (default)
- Custom models can be configured in `backend/src/config/app.config.ts`

</details>

<details>
<summary>🗄️ Database Configuration</summary>

### JSON Database (Primary)
- **Location**: `database/prompt-bulk-tool.json`
- **Auto-initialization**: Creates database on first run
- **Migrations**: Automatic schema updates
- **Cross-platform**: Works on all operating systems

### Database Initialization
The application automatically creates the JSON database on first startup with:
- Basic automation targets for popular AI platforms (ChatGPT, Gemini)  
- Empty collections ready for templates, variables, and generated prompts
- Default configuration settings optimized for general use

Database files are excluded from version control to ensure clean installations.

</details>

## 🚨 Troubleshooting

<details>
<summary>🔧 Installation Issues</summary>

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3001  # Backend port
lsof -i :3000  # Frontend port

# Kill the process
kill -9 <PID>
```

### Missing Dependencies
```bash
# Clean install
npm run clean
npm install
npm run setup
```

### Permission Issues
```bash
# Fix npm permissions (Unix/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

</details>

<details>
<summary>⚠️ Runtime Errors</summary>

### Database Connection Failed
1. Check if `database/` directory exists
2. Verify file permissions
3. Check disk space
4. Review logs in `logs/` directory

### AI Generation Not Working
1. Verify Ollama server is running
2. Check `MODEL1_BASE_URL` and `MODEL1_TOKEN` configuration
3. Test connection via `/api/ai/test-connection`
4. Review API logs for detailed errors

### Frontend Build Errors
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `npm install`
3. Check TypeScript errors: `npm run type-check`

</details>

<details>
<summary>🚨 Performance Issues</summary>

### Slow Generation
- **Reduce variable combinations**: Fewer variables = faster generation
- **Use batch processing**: Generate in smaller chunks
- **Optimize templates**: Remove unnecessary complexity

### Memory Issues
- **Export regularly**: Don't accumulate thousands of prompts in memory
- **Restart services**: Periodically restart backend during large operations
- **Monitor system resources**: Check available RAM and disk space

### Database Performance
- **Regular cleanup**: Remove old generated prompts
- **Optimize queries**: Use filtering and pagination
- **Consider migration**: Switch to SQLite for large datasets

</details>

<details>
<summary>🔄 Migration and Updates</summary>

### Updating from Previous Versions
1. Backup current database
2. Run `npm run setup` to install new dependencies
3. Start application - automatic migrations will run
4. Verify data integrity after migration

### Data Export/Import
- Export all data via API endpoints before major updates
- Use JSON format for complete data preservation
- Restore from backup if migration fails

</details>

## 🤝 Contributing

We welcome contributions! Here's how to get started:

<details>
<summary>🛠️ Development Setup</summary>

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/loonylabs-dev/prompt-bulk-tool.git
   cd prompt-bulk-tool
   ```
3. **Install dependencies**:
   ```bash
   npm run setup
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Start development**:
   ```bash
   npm run dev
   ```

</details>

<details>
<summary>📋 Contributing Guidelines</summary>

### Code Standards
- Use TypeScript for all new code
- Follow existing code style and conventions
- Add proper JSDoc comments for functions
- Include tests for new features
- Update documentation as needed

### Commit Messages
Follow conventional commits format:
```
feat: add new variable generation feature
fix: resolve database connection issue
docs: update API documentation
test: add tests for template validation
```

### Pull Request Process
1. Ensure all tests pass
2. Update documentation
3. Add changelog entry
4. Request review from maintainers
5. Address feedback promptly

</details>

<details>
<summary>🐛 Bug Reports</summary>

When reporting bugs, please include:
- **Environment**: OS, Node.js version, npm version
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Logs**: Any error messages or console output
- **Screenshots**: If applicable

</details>

<details>
<summary>💡 Feature Requests</summary>

For feature requests, please provide:
- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other approaches you've thought about
- **Use cases**: Specific scenarios where this would be helpful

</details>

---

<div align="center">

**[⭐ Star this repository](https://github.com/loonylabs-dev/prompt-bulk-tool)** if you find it helpful!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/loonylabs-dev/prompt-bulk-tool)](https://github.com/loonylabs-dev/prompt-bulk-tool/issues)
[![GitHub forks](https://img.shields.io/github/forks/loonylabs-dev/prompt-bulk-tool)](https://github.com/loonylabs-dev/prompt-bulk-tool/network)
[![GitHub stars](https://img.shields.io/github/stars/loonylabs-dev/prompt-bulk-tool)](https://github.com/loonylabs-dev/prompt-bulk-tool/stargazers)

Made with ❤️ for the AI community

</div>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - AI model integration
- [Next.js](https://nextjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

### 🔗 Related Projects

- [Ollama Middleware](https://github.com/loonylabs-dev/ollama-middleware) - TypeScript library for robust AI backends with Ollama integration
- [Ollama Proxy](https://github.com/loonylabs-dev/ollama-proxy) - Secure proxy server providing OpenAI-compatible API for Ollama models
- [Ollama](https://ollama.ai/) - Local AI model runtime and inference server
- [Next.js](https://nextjs.org/) - Frontend framework