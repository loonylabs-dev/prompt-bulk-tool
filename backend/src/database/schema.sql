-- Prompt Templates Table
CREATE TABLE IF NOT EXISTS prompt_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT DEFAULT '[]', -- JSON array of tags
  variables TEXT DEFAULT '[]', -- JSON array of variable names extracted from content
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Variables Table
CREATE TABLE IF NOT EXISTS prompt_variables (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'boolean', 'array')),
  default_value TEXT,
  possible_values TEXT DEFAULT '[]', -- JSON array of possible values
  template_ids TEXT DEFAULT '[]', -- JSON array of template IDs using this variable
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Variable Sets Table
CREATE TABLE IF NOT EXISTS variable_sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  variables TEXT NOT NULL DEFAULT '{}', -- JSON object: {variableName: [values]}
  template_ids TEXT DEFAULT '[]', -- JSON array of template IDs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Generated Prompts Table
CREATE TABLE IF NOT EXISTS generated_prompts (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  template_name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT NOT NULL DEFAULT '{}', -- JSON object with variable assignments
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  result TEXT,
  error TEXT,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (template_id) REFERENCES prompt_templates (id) ON DELETE CASCADE
);

-- Automation Targets Table
CREATE TABLE IF NOT EXISTS automation_targets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('chatgpt', 'claude', 'gemini', 'custom')),
  url TEXT NOT NULL,
  selectors TEXT NOT NULL DEFAULT '{}', -- JSON object with CSS selectors
  config TEXT NOT NULL DEFAULT '{}', -- JSON object with automation config
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Automation Sessions Table
CREATE TABLE IF NOT EXISTS automation_sessions (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL,
  prompt_ids TEXT NOT NULL DEFAULT '[]', -- JSON array of prompt IDs
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed')),
  current_prompt_index INTEGER DEFAULT 0,
  results TEXT DEFAULT '[]', -- JSON array of automation results
  config TEXT DEFAULT '{}', -- JSON object with session config
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (target_id) REFERENCES automation_targets (id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON prompt_templates(created_at);
CREATE INDEX IF NOT EXISTS idx_variables_type ON prompt_variables(type);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_template_id ON generated_prompts(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_status ON generated_prompts(status);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_generated_at ON generated_prompts(generated_at);
CREATE INDEX IF NOT EXISTS idx_automation_sessions_target_id ON automation_sessions(target_id);
CREATE INDEX IF NOT EXISTS idx_automation_sessions_status ON automation_sessions(status);

-- Triggers to update updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_prompt_templates_updated_at 
  AFTER UPDATE ON prompt_templates
  BEGIN
    UPDATE prompt_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_prompt_variables_updated_at 
  AFTER UPDATE ON prompt_variables
  BEGIN
    UPDATE prompt_variables SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_variable_sets_updated_at 
  AFTER UPDATE ON variable_sets
  BEGIN
    UPDATE variable_sets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_automation_targets_updated_at 
  AFTER UPDATE ON automation_targets
  BEGIN
    UPDATE automation_targets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;