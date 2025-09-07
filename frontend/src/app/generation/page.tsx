'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Zap, 
  ArrowLeft,
  FileText,
  Variable,
  Package,
  Download,
  Trash2,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Copy,
  ChevronDown,
  Search
} from 'lucide-react';
import { ConfirmDialog, AlertDialog, MultiChoiceDialog, MultiChoiceDialogButton } from '../../components/Dialog';
import { templateApi, variablePresetApi, generationApi } from '../../lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  variables: string[];
}

interface VariablePreset {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  values: string;
  tags: string[];
}

interface GeneratedPrompt {
  id: string;
  templateId: string;
  templateName: string;
  content: string;
  variables: Record<string, string>;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  generatedAt: string | Date;
}

export default function GenerationPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [variablePresets, setVariablePresets] = useState<VariablePreset[]>([]);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(''); // Changed to single selection
  const [selectedVariablePresetIds, setSelectedVariablePresetIds] = useState<string[]>([]);
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [useCustomVariables, setUseCustomVariables] = useState(false);
  const [wrapVariableValues, setWrapVariableValues] = useState(false); // New option for wrapping values
  const [addGenderSuffixes, setAddGenderSuffixes] = useState(false); // New option for gender suffixes
  
  // Variable Preset Dropdown state
  const [showVariablePresetDropdown, setShowVariablePresetDropdown] = useState(false);
  const [variablePresetSearch, setVariablePresetSearch] = useState('');

  // Template Dropdown state
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  
  // Dialog state
  const [alertDialog, setAlertDialog] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({ show: false, title: '', message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void }>({ show: false, title: '', message: '', onConfirm: () => {} });
  const [multiChoiceDialog, setMultiChoiceDialog] = useState<{ show: boolean; title: string; message: string; buttons: MultiChoiceDialogButton[] }>({ show: false, title: '', message: '', buttons: [] });
  
  // Load data
  useEffect(() => {
    Promise.all([
      fetchTemplates(),
      fetchVariablePresets(),
      fetchGeneratedPrompts()
    ]).finally(() => setLoading(false));
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showVariablePresetDropdown && !target.closest('.variable-preset-dropdown')) {
        setShowVariablePresetDropdown(false);
      }
      if (showTemplateDropdown && !target.closest('.template-dropdown')) {
        setShowTemplateDropdown(false);
      }
    };

    if (showVariablePresetDropdown || showTemplateDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showVariablePresetDropdown, showTemplateDropdown]);

  const fetchTemplates = async () => {
    try {
      const response = await templateApi.getAll();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchVariablePresets = async () => {
    try {
      const response = await variablePresetApi.getAll();
      if (response.success && response.data) {
        setVariablePresets(response.data);
      }
    } catch (error) {
      console.error('Error fetching variable presets:', error);
    }
  };

  const fetchGeneratedPrompts = async () => {
    try {
      const response = await generationApi.getPrompts();
      if (response.success && response.data) {
        setGeneratedPrompts(response.data.prompts);
      }
    } catch (error) {
      console.error('Error fetching generated prompts:', error);
    }
  };

  const generatePrompts = async () => {
    if (!selectedTemplateId) {
      setAlertDialog({
        show: true,
        title: 'Template Required',
        message: 'Please select a template',
        type: 'info'
      });
      return;
    }
    
    if (!useCustomVariables && selectedVariablePresetIds.length === 0) {
      setAlertDialog({
        show: true,
        title: 'Variables Required',
        message: 'Please select at least one variable preset or use custom variables',
        type: 'info'
      });
      return;
    }

    setGenerating(true);

    try {
      const requestBody: any = {
        templateIds: [selectedTemplateId], // Single template as array
        wrapVariableValues, // Add the wrapping option
        addGenderSuffixes, // Add the gender suffixes option
      };

      if (useCustomVariables) {
        // Convert custom variables to the expected format
        const variablesArray: Record<string, string[]> = {};
        Object.entries(customVariables).forEach(([key, value]) => {
          variablesArray[key] = value.split(',').map(v => v.trim()).filter(Boolean);
        });
        requestBody.customVariables = variablesArray;
      } else {
        requestBody.variablePresetIds = selectedVariablePresetIds;
      }

      const response = await generationApi.generate(requestBody);

      if (response.success) {
        setAlertDialog({
          show: true,
          title: 'Successfully Generated',
          message: `${response.data?.totalCount || 0} prompts successfully generated!`,
          type: 'success'
        });
        fetchGeneratedPrompts();
      } else {
        setAlertDialog({
          show: true,
          title: 'Generation Error',
          message: `Error during generation: ${response.error}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error generating prompts:', error);
      setAlertDialog({
        show: true,
        title: 'Generation Error',
        message: 'Error during generation',
        type: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteClick = () => {
    const totalPromptCount = generatedPrompts.length;
    const templatePromptCount = displayedPrompts.length;
    const templateName = selectedTemplate?.name || 'Template';

    if (selectedTemplateId) {
      // Template selected - 3 Button Dialog
      setMultiChoiceDialog({
        show: true,
        title: 'Delete Prompts',
        message: 'Which prompts would you like to delete?',
        buttons: [
          {
            text: `Only ${templateName} (${templatePromptCount})`,
            onClick: deleteTemplatePrompts,
            variant: 'primary'
          },
          {
            text: `All Prompts (${totalPromptCount})`,
            onClick: deleteAllPrompts,
            variant: 'danger'
          },
          {
            text: 'Cancel',
            onClick: () => {},
            variant: 'ghost'
          }
        ]
      });
    } else {
      // No template - 2 Button Dialog  
      setMultiChoiceDialog({
        show: true,
        title: 'Delete Prompts',
        message: 'Delete all generated prompts? This action cannot be undone.',
        buttons: [
          {
            text: `All Prompts (${totalPromptCount})`,
            onClick: deleteAllPrompts,
            variant: 'danger'
          },
          {
            text: 'Cancel',
            onClick: () => {},
            variant: 'ghost'
          }
        ]
      });
    }
  };

  const deleteAllPrompts = async () => {
    try {
      const response = await generationApi.deleteAllPrompts();

      if (response.success) {
        setGeneratedPrompts([]);
        toast.success('All prompts deleted!');
      }
    } catch (error) {
      console.error('Error deleting prompts:', error);
      setAlertDialog({
        show: true,
        title: 'Deletion Error',
        message: 'Error during deletion',
        type: 'error'
      });
    }
  };

  const deleteTemplatePrompts = async () => {
    if (!selectedTemplateId) return;
    
    try {
      const templatePromptIds = displayedPrompts.map(p => p.id);
      const response = await generationApi.deletePrompts(templatePromptIds);

      if (response.success) {
        // Remove deleted prompts from state
        setGeneratedPrompts(prev => prev.filter(p => p.templateId !== selectedTemplateId));
        const templateName = selectedTemplate?.name || 'Template';
        toast.success(`${templateName} prompts deleted!`);
      }
    } catch (error) {
      console.error('Error deleting template prompts:', error);
      setAlertDialog({
        show: true,
        title: 'Deletion Error',
        message: 'Error deleting template prompts',
        type: 'error'
      });
    }
  };

  const exportPrompts = async (format: 'json' | 'csv' | 'txt') => {
    try {
      const blob = await generationApi.exportPrompts(format);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `generated-prompts.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting prompts:', error);
      setAlertDialog({
        show: true,
        title: 'Export Error',
        message: 'Error during export',
        type: 'error'
      });
    }
  };

  // Get all required variables from selected template
  const getAllRequiredVariables = () => {
    if (!selectedTemplateId) return [];
    const template = templates.find(t => t.id === selectedTemplateId);
    return template ? template.variables : [];
  };

  const handleCustomVariableChange = (variable: string, value: string) => {
    setCustomVariables({
      ...customVariables,
      [variable]: value
    });
  };

  // Template helpers
  const getTemplatePromptCount = (templateId: string) => {
    return generatedPrompts.filter(p => p.templateId === templateId).length;
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
    t.description.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || null;

  // Prompts to display (filtered by selected template)
  const displayedPrompts = selectedTemplateId
    ? generatedPrompts.filter(p => p.templateId === selectedTemplateId)
    : generatedPrompts;

  // Get relevant variable presets based on selected template
  const getRelevantVariablePresets = () => {
    if (!selectedTemplateId) return [];
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return [];
    
    // Filter presets that match any of the template's variables
    return variablePresets.filter(preset => 
      template.variables.includes(preset.placeholder)
    );
  };

  // Filter variable presets for search (only from relevant presets)
  const filteredVariablePresets = getRelevantVariablePresets().filter(preset =>
    preset.name.toLowerCase().includes(variablePresetSearch.toLowerCase()) ||
    preset.description.toLowerCase().includes(variablePresetSearch.toLowerCase()) ||
    preset.placeholder.toLowerCase().includes(variablePresetSearch.toLowerCase())
  );

  // Get selected variable presets for details display (only from relevant ones)
  const selectedVariablePresets = getRelevantVariablePresets().filter(preset => 
    selectedVariablePresetIds.includes(preset.id)
  );

  // Toggle preset selection
  const toggleVariablePreset = (presetId: string) => {
    if (selectedVariablePresetIds.includes(presetId)) {
      setSelectedVariablePresetIds(selectedVariablePresetIds.filter(id => id !== presetId));
    } else {
      setSelectedVariablePresetIds([...selectedVariablePresetIds, presetId]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'executing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const copyPromptToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('Prompt copied!');
    }).catch(() => {
      toast.error('Error copying');
    });
  };

  const deletePrompt = async (promptId: string) => {
    try {
      const response = await generationApi.deletePrompts([promptId]);
      
      if (response.success) {
        setGeneratedPrompts(prev => prev.filter(p => p.id !== promptId));
        toast.success('Prompt deleted!', {
          icon: '🗑️',
        });
      } else {
        toast.error('Error deleting');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Error deleting');
    }
  };

  const renderHighlightedPrompt = (content: string, variables: Record<string, string>) => {
    let highlightedContent = content;
    
    // Sort variables by length (longest first) to avoid overlaps
    const sortedVariables = Object.entries(variables).sort((a, b) => b[1].length - a[1].length);
    
    // Replace each variable with a highlighted version
    sortedVariables.forEach(([key, value]) => {
      // Escape special characters for regex
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedValue, 'g');
      highlightedContent = highlightedContent.replace(regex, `<mark class="bg-blue-200 text-blue-900 px-1 rounded font-semibold">${value}</mark>`);
    });
    
    return <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="btn btn-ghost btn-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Prompt Generation</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Configuration */}
          <div className="space-y-6 lg:col-span-2">
            <div className="card">
              <div className="card-body">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Configuration
                </h2>

                {/* Template Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Template *
                  </label>
                  {templates.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="mx-auto w-12 h-12 text-gray-300" />
                      <p className="mt-4 text-gray-600">No templates available</p>
                      <Link href="/templates/new" className="mt-2 btn btn-primary btn-sm">
                        Create Template
                      </Link>
                    </div>
                  ) : (
                    <div className="relative template-dropdown">
                      <button
                        type="button"
                        onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            {selectedTemplate
                              ? `${selectedTemplate.name} (${getTemplatePromptCount(selectedTemplate.id)})`
                              : 'Select template...'}
                          </span>
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>

                      {showTemplateDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                          {/* Search */}
                          <div className="p-3 border-b border-gray-200">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="text"
                                placeholder="Search templates..."
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                value={templateSearch}
                                onChange={(e) => setTemplateSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          {/* Template List */}
                          <div className="max-h-60 overflow-y-auto">
                            {filteredTemplates.length > 0 ? (
                              filteredTemplates.map((t) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTemplateId(t.id);
                                    setSelectedVariablePresetIds([]);
                                    setShowTemplateDropdown(false);
                                    setTemplateSearch('');
                                  }}
                                  className="w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="text-sm font-medium text-gray-900">
                                    {t.name} ({getTemplatePromptCount(t.id)})
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {t.variables.length} variables: {t.variables.join(', ')}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-6 text-center text-gray-500">
                                No matching templates found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Variable Source Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Variable Source *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="variableSource"
                        className="text-primary-600 focus:ring-primary-500"
                        checked={!useCustomVariables}
                        onChange={() => setUseCustomVariables(false)}
                      />
                      <span className="text-sm text-gray-900">Use Variable Presets</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="variableSource"
                        className="text-primary-600 focus:ring-primary-500"
                        checked={useCustomVariables}
                        onChange={() => setUseCustomVariables(true)}
                      />
                      <span className="text-sm text-gray-900">Custom Variables</span>
                    </label>
                  </div>
                </div>

                {/* Variable Preset Selection */}
                {!useCustomVariables && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variable Presets {selectedVariablePresetIds.length > 0 && `(${selectedVariablePresetIds.length} selected)`}
                    </label>
                    {!selectedTemplateId ? (
                      <div className="text-center py-4">
                        <FileText className="mx-auto w-8 h-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-600">Select a template first</p>
                      </div>
                    ) : getRelevantVariablePresets().length === 0 ? (
                      <div className="text-center py-4">
                        <Package className="mx-auto w-8 h-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-600">No matching Variable Presets available for this template</p>
                        <Link href="/variable-presets/create" className="mt-2 btn btn-primary btn-xs">
                          Create Variable Preset
                        </Link>
                      </div>
                    ) : (
                      <>
                        {/* Lookup Dropdown */}
                        <div className="relative variable-preset-dropdown">
                          <button
                            type="button"
                            onClick={() => setShowVariablePresetDropdown(!showVariablePresetDropdown)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">
                                {selectedVariablePresetIds.length === 0 
                                  ? 'Select Variable Presets...' 
                                  : `${selectedVariablePresetIds.length} preset${selectedVariablePresetIds.length > 1 ? 's' : ''} selected`}
                              </span>
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            </div>
                          </button>

                          {showVariablePresetDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                              {/* Search */}
                              <div className="p-3 border-b border-gray-200">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                  <input
                                    type="text"
                                    placeholder="Search Variable Presets..."
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    value={variablePresetSearch}
                                    onChange={(e) => setVariablePresetSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </div>
                              {/* Preset List */}
                              <div className="max-h-60 overflow-y-auto">
                                {filteredVariablePresets.length > 0 ? (
                                  filteredVariablePresets.map((preset) => (
                                    <button
                                      key={preset.id}
                                      type="button"
                                      onClick={() => toggleVariablePreset(preset.id)}
                                      className="w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="flex items-start space-x-3">
                                        <input
                                          type="checkbox"
                                          className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                          checked={selectedVariablePresetIds.includes(preset.id)}
                                          onChange={() => {}} // Handled by parent button click
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900">
                                            {preset.name}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            <code className="bg-gray-100 px-1 rounded">{'{{' + preset.placeholder + '}}'}</code>
                                            {' • '}{preset.values.split(';').length} values
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-6 text-center text-gray-500">
                                    No matching Variable Presets found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Selected Presets Details */}
                        {selectedVariablePresets.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Selected Variable Presets:</h4>
                            {selectedVariablePresets.map((preset) => (
                              <div key={preset.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900">
                                      {preset.name}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2">
                                      {preset.description}
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">
                                      Placeholder: <code className="bg-white px-1 rounded border">{'{{' + preset.placeholder + '}}'}</code>
                                    </div>
                                    <div className="text-xs text-gray-700">
                                      <strong>Values ({preset.values.split(';').length}):</strong>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {preset.values.split(';').slice(0, 6).map((value, index) => (
                                          <span
                                            key={index}
                                            className="inline-block px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                                          >
                                            {value.trim()}
                                          </span>
                                        ))}
                                        {preset.values.split(';').length > 6 && (
                                          <span className="inline-block px-2 py-1 bg-gray-200 border border-gray-300 rounded text-xs text-gray-600">
                                            +{preset.values.split(';').length - 6} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {preset.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {preset.tags.map((tag) => (
                                          <span
                                            key={tag}
                                            className="inline-block px-1.5 py-0.5 bg-primary-100 text-primary-700 text-xs rounded"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => toggleVariablePreset(preset.id)}
                                    className="ml-2 text-gray-400 hover:text-red-600"
                                    title="Remove"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Custom Variables */}
                {useCustomVariables && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Variables
                    </label>
                    {getAllRequiredVariables().length === 0 ? (
                      <p className="text-sm text-gray-600">
                        Select a template first to see the required variables.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {getAllRequiredVariables().map((variable) => (
                          <div key={variable}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {variable}
                            </label>
                            <input
                              type="text"
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="Enter comma-separated values: Value1, Value2, Value3"
                              value={customVariables[variable] || ''}
                              onChange={(e) => handleCustomVariableChange(variable, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Variable Value Options */}
                {(selectedTemplateId && ((!useCustomVariables && selectedVariablePresetIds.length > 0) || (useCustomVariables && getAllRequiredVariables().length > 0))) && (
                  <div className="mb-6 space-y-4">
                    {/* Wrap Variable Values Option */}
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={wrapVariableValues}
                          onChange={(e) => setWrapVariableValues(e.target.checked)}
                        />
                        <span className="text-sm text-gray-900">
                          Wrap variable values with square brackets
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Example: "Value" becomes "[Value]" in the generated prompt
                      </p>
                    </div>

                    {/* Gender Suffixes Option */}
                    <div>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={addGenderSuffixes}
                          onChange={(e) => setAddGenderSuffixes(e.target.checked)}
                        />
                        <span className="text-sm text-gray-900">
                          Add gender suffixes (, female / , male)
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1 ml-6">
                        Generates additional variants with ", female" and ", male" for each value
                      </p>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={generatePrompts}
                  disabled={generating || !selectedTemplateId || (!useCustomVariables && selectedVariablePresetIds.length === 0)}
                  className="w-full btn btn-primary btn-lg"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Prompts...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Prompts
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Prompts */}
          <div className="space-y-6 lg:col-span-3">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Generated Prompts ({displayedPrompts.length})
                  </h2>
                  {generatedPrompts.length > 0 && (
                    <div className="flex space-x-2">
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-outline btn-sm">
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                          <li><button onClick={() => exportPrompts('json')}>JSON Export</button></li>
                          <li><button onClick={() => exportPrompts('csv')}>CSV Export</button></li>
                          <li><button onClick={() => exportPrompts('txt')}>TXT Export</button></li>
                        </ul>
                      </div>
                      <button
                        onClick={handleDeleteClick}
                        className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {displayedPrompts.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="mx-auto w-16 h-16 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      {selectedTemplateId ? 'No prompts for this template' : 'No prompts generated yet'}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {selectedTemplateId ? 'Select other templates or generate new prompts' : 'Configure the settings on the left and start generation'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                    {displayedPrompts.map((prompt) => (
                      <div key={prompt.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(prompt.status)}
                            <span className="text-sm font-medium text-gray-900">
                              {prompt.templateName}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => copyPromptToClipboard(prompt.content)}
                              className="btn btn-ghost btn-xs hover:bg-blue-100"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePrompt(prompt.id)}
                              className="btn btn-ghost btn-xs hover:bg-red-100"
                              title="Delete prompt"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          Variables: {Object.entries(prompt.variables).map(([k, v]) => `${k}=${v}`).join(', ')}
                        </div>
                        
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                          <div className="line-clamp-3">
                            {renderHighlightedPrompt(prompt.content, prompt.variables)}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          {new Date(prompt.generatedAt).toLocaleString('de-DE')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        show={alertDialog.show}
        onClose={() => setAlertDialog({ show: false, title: '', message: '', type: 'info' })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        buttonText="OK"
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        show={confirmDialog.show}
        onClose={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} })}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ show: false, title: '', message: '', onConfirm: () => {} });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        confirmVariant="danger"
        cancelText="Cancel"
      />

      {/* Multi Choice Dialog */}
      <MultiChoiceDialog
        show={multiChoiceDialog.show}
        onClose={() => setMultiChoiceDialog({ show: false, title: '', message: '', buttons: [] })}
        title={multiChoiceDialog.title}
        message={multiChoiceDialog.message}
        buttons={multiChoiceDialog.buttons}
      />
    </div>
  );
}