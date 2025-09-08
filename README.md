# Prompt Bulk Tool

A comprehensive web application for creating and automating bulk prompt execution across AI platforms. Create templates with variables, manage reusable variable sets, generate prompts in bulk, and automate their execution through browser automation on platforms like ChatGPT, Claude, and Gemini.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

The Prompt Bulk Tool streamlines AI prompt workflows by allowing users to:

- **Create Templates**: Design prompt templates with `{{variable_name}}` placeholders
- **Manage Variables**: Define reusable variable collections with AI-powered generation
- **Generate Bulk Prompts**: Automatically create all combinations of templates and variables
- **Automate Execution**: Run browser automation to execute prompts on AI platforms
- **Export Results**: Export prompts and results in multiple formats (JSON, CSV, TXT)

Perfect for content creators, researchers, marketers, and developers who need to process large amounts of prompts systematically.

## Features

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
- **Platform Configuration**: Predefined and customizable automation targets

### 💡 Advanced Features
- **Variable Value Wrapping**: Optional bracket wrapping for generated values
- **Gender Suffixes**: Automatic generation of gendered variants
- **Batch Processing**: Efficient handling of large prompt sets
- **Real-time Progress**: Live updates during generation and automation

## Architecture

### Monorepo Structure
```
prompt-bulk-tool/
├── shared/          # TypeScript types and utilities shared across packages
├── backend/         # Express.js API server with JSON database
├── frontend/        # Next.js React application
└── automation/      # Playwright browser automation scripts
```

### Technology Stack
- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: JSON-based with automatic migrations (SQLite legacy support)
- **Automation**: Playwright for cross-browser automation
- **AI Integration**: Ollama API for variable generation

### Core Concepts

1. **Templates**: Text templates containing `{{variable_name}}` placeholders
2. **Variable Presets**: Reusable collections of variable values with metadata
3. **Generated Prompts**: Final prompts created by combining templates with variables
4. **Automation Sessions**: Browser automation runs executing prompts on platforms
5. **Automation Targets**: Platform-specific configurations (ChatGPT, Claude, etc.)

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) Ollama server for AI features

### Installation

1. **Clone and Setup**
```bash
git clone [your-repo-url]
cd prompt-bulk-tool
npm run setup  # Installs dependencies and builds shared package
```

2. **Environment Configuration**
```bash
# Copy environment examples
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your settings
```

3. **Start Development Server**
```bash
npm run dev  # Starts both backend and frontend in watch mode
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## Usage Guide

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

### 5. Browser Automation (Coming Soon)

Execute generated prompts automatically on AI platforms with progress tracking and result collection.

## Detailed Usage Workflows

### Workflow 1: Content Marketing Campaign

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

### Workflow 2: Educational Content Creation

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

### Workflow 3: Research Question Generation

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

### Advanced Features Usage

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

### Export and Integration

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

### Performance Optimization

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

## API Documentation

### Templates API
```bash
GET    /api/templates          # List all templates
POST   /api/templates          # Create new template
GET    /api/templates/:id      # Get specific template
PUT    /api/templates/:id      # Update template
DELETE /api/templates/:id      # Delete template
```

### Variable Presets API
```bash
GET    /api/variable-presets           # List all variable presets
POST   /api/variable-presets           # Create new variable preset
GET    /api/variable-presets/:id       # Get specific preset
PUT    /api/variable-presets/:id       # Update preset
DELETE /api/variable-presets/:id       # Delete preset
```

### Prompt Generation API
```bash
POST   /api/generation/generate        # Generate prompts
GET    /api/generation/prompts         # List generated prompts
DELETE /api/generation/prompts         # Delete prompts
GET    /api/generation/export          # Export prompts
```

### AI Integration API
```bash
POST   /api/ai/generate-variable-values    # Generate variable values
GET    /api/ai/test-connection             # Test AI connection
```

### Example API Usage

**Generate Prompts:**
```bash
curl -X POST http://localhost:3001/api/generation/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateIds": ["template-id"],
    "variablePresetIds": ["preset-id-1", "preset-id-2"],
    "wrapVariableValues": true,
    "addGenderSuffixes": false
  }'
```

## Development

### Project Commands
```bash
# Setup project
npm run setup                   # Install deps and build shared package

# Development
npm run dev                     # Start backend and frontend
npm run dev -w backend          # Backend only
npm run dev -w frontend         # Frontend only

# Building
npm run build                   # Build all packages
npm run build -w shared         # Build shared types first (required)

# Type Checking
npm run type-check              # Check TypeScript across all packages
```

### Database

- **Primary**: JSON database at `database/prompt-bulk-tool.json`
- **Legacy**: SQLite database at `database/prompt-bulk-tool.db`
- **Migrations**: Automatic on server startup
- **Backup**: JSON format allows easy version control and backup

### Testing

```bash
# Run tests (when implemented)
npm test                        # All packages
npm test -w backend             # Backend only
npm test -w frontend            # Frontend only
```

## Configuration

### Environment Variables

**Backend (.env):**
```env
# Server
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

**Frontend (.env.local):**
```env
# API Configuration
NEXT_PUBLIC_API_URL=/api
BACKEND_URL=http://localhost:3001
NODE_ENV=development
```

### AI Integration Setup

1. **Install Ollama** (optional for AI features)
2. **Configure endpoint** in `backend/.env`
3. **Test connection** via `/api/ai/test-connection`

## Troubleshooting

### Common Issues

**Frontend/Backend Connection:**
- Ensure backend is running on port 3001
- Check CORS settings in backend configuration
- Verify proxy settings in Next.js config

**AI Integration:**
- Verify Ollama server is accessible
- Check API token and endpoint configuration
- Test connection via health check endpoint

**Database Issues:**
- Ensure write permissions in `database/` directory
- Check JSON database format validity
- Review migration logs on startup

**Build Issues:**
- Build `shared` package first: `npm run build -w shared`
- Clear node_modules and reinstall if needed
- Check TypeScript configuration compatibility

### Debug Mode

Enable detailed logging:
```env
LOG_LEVEL=debug
DEBUG_OLLAMA_REQUESTS=true
```

### Performance Tips

- Use Variable Presets for frequently used variable sets
- Generate prompts in smaller batches for large datasets
- Monitor memory usage during bulk operations
- Use export features to avoid browser memory limits

## Contributing

### Development Workflow

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow project configuration
- **Formatting**: Prettier for consistent formatting
- **Testing**: Add tests for new features
- **Documentation**: Update README and API docs

### Build Order

Always build in this order:
1. `shared` (types and utilities)
2. `backend` (API server)
3. `frontend` (React application)
4. `automation` (browser scripts)

---

**License**: MIT  
**Repository**: [Add your repository URL]  
**Issues**: [Add your issues URL]  
**Documentation**: [Add documentation URL]

For questions, issues, or contributions, please visit our GitHub repository or open an issue.