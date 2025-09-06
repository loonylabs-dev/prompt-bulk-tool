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
import { ConfirmDialog, AlertDialog } from '../../components/Dialog';
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
  generatedAt: string;
}

export default function GenerationPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [variablePresets, setVariablePresets] = useState<VariablePreset[]>([]);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedVariablePresetIds, setSelectedVariablePresetIds] = useState<string[]>([]);
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [useCustomVariables, setUseCustomVariables] = useState(false);
  
  // Variable Preset Dropdown state
  const [showVariablePresetDropdown, setShowVariablePresetDropdown] = useState(false);
  const [variablePresetSearch, setVariablePresetSearch] = useState('');
  
  // Dialog state
  const [alertDialog, setAlertDialog] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({ show: false, title: '', message: '', type: 'info' });
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; title: string; message: string; onConfirm: () => void }>({ show: false, title: '', message: '', onConfirm: () => {} });
  
  // Load data
  useEffect(() => {
    Promise.all([
      fetchTemplates(),
      fetchVariablePresets(),
      fetchGeneratedPrompts()
    ]).finally(() => setLoading(false));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showVariablePresetDropdown) {
        const target = event.target as Element;
        if (!target.closest('.variable-preset-dropdown')) {
          setShowVariablePresetDropdown(false);
        }
      }
    };

    if (showVariablePresetDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showVariablePresetDropdown]);

  const fetchTemplates = async () => {
    try {
      const response = await templateApi.getAll();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchVariablePresets = async () => {
    try {
      const response = await variablePresetApi.getAll();
      if (response.success) {
        setVariablePresets(response.data);
      }
    } catch (error) {
      console.error('Error fetching variable presets:', error);
    }
  };

  const fetchGeneratedPrompts = async () => {
    try {
      const response = await generationApi.getPrompts();
      if (response.success) {
        setGeneratedPrompts(response.data.prompts);
      }
    } catch (error) {
      console.error('Error fetching generated prompts:', error);
    }
  };

  const generatePrompts = async () => {
    if (selectedTemplateIds.length === 0) {
      setAlertDialog({
        show: true,
        title: 'Template erforderlich',
        message: 'Bitte wähle mindestens ein Template aus',
        type: 'info'
      });
      return;
    }
    
    if (!useCustomVariables && selectedVariablePresetIds.length === 0) {
      setAlertDialog({
        show: true,
        title: 'Variablen erforderlich',
        message: 'Bitte wähle mindestens ein Variable-Preset aus oder verwende benutzerdefinierte Variablen',
        type: 'info'
      });
      return;
    }

    setGenerating(true);

    try {
      const requestBody: any = {
        templateIds: selectedTemplateIds,
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
          title: 'Erfolgreich generiert',
          message: `${response.data.totalCount} Prompts erfolgreich generiert!`,
          type: 'success'
        });
        fetchGeneratedPrompts();
      } else {
        setAlertDialog({
          show: true,
          title: 'Generierungsfehler',
          message: `Fehler bei der Generierung: ${response.error}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error generating prompts:', error);
      setAlertDialog({
        show: true,
        title: 'Generierungsfehler',
        message: 'Fehler bei der Generierung',
        type: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteAllClick = () => {
    setConfirmDialog({
      show: true,
      title: 'Alle Prompts löschen',
      message: 'Alle generierten Prompts löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      onConfirm: deleteAllPrompts
    });
  };

  const deleteAllPrompts = async () => {
    try {
      const response = await generationApi.deleteAllPrompts();

      if (response.success) {
        setGeneratedPrompts([]);
        toast.success('Alle Prompts gelöscht!');
      }
    } catch (error) {
      console.error('Error deleting prompts:', error);
      setAlertDialog({
        show: true,
        title: 'Löschfehler',
        message: 'Fehler beim Löschen',
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
        title: 'Exportfehler',
        message: 'Fehler beim Export',
        type: 'error'
      });
    }
  };

  // Get all required variables from selected templates
  const getAllRequiredVariables = () => {
    const variables = new Set<string>();
    selectedTemplateIds.forEach(templateId => {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        template.variables.forEach(variable => variables.add(variable));
      }
    });
    return Array.from(variables);
  };

  const handleCustomVariableChange = (variable: string, value: string) => {
    setCustomVariables({
      ...customVariables,
      [variable]: value
    });
  };

  // Filter variable presets for search
  const filteredVariablePresets = variablePresets.filter(preset =>
    preset.name.toLowerCase().includes(variablePresetSearch.toLowerCase()) ||
    preset.description.toLowerCase().includes(variablePresetSearch.toLowerCase()) ||
    preset.placeholder.toLowerCase().includes(variablePresetSearch.toLowerCase())
  );

  // Get selected variable presets for details display
  const selectedVariablePresets = variablePresets.filter(preset => 
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
      toast.success('Prompt kopiert!');
    }).catch(() => {
      toast.error('Fehler beim Kopieren');
    });
  };

  const deletePrompt = async (promptId: string) => {
    try {
      const response = await generationApi.deletePrompts([promptId]);
      
      if (response.success) {
        setGeneratedPrompts(prev => prev.filter(p => p.id !== promptId));
        toast.success('Prompt gelöscht!', {
          icon: '🗑️',
        });
      } else {
        toast.error('Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const renderHighlightedPrompt = (content: string, variables: Record<string, string>) => {
    let highlightedContent = content;
    
    // Sortiere Variablen nach Länge (längste zuerst), um Überschneidungen zu vermeiden
    const sortedVariables = Object.entries(variables).sort((a, b) => b[1].length - a[1].length);
    
    // Ersetze jede Variable mit einer markierten Version
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
          <p className="mt-4 text-gray-600">Lade Daten...</p>
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
                Zurück
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Prompt-Generierung</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Konfiguration
                </h2>

                {/* Template Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Templates auswählen *
                  </label>
                  {templates.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="mx-auto w-12 h-12 text-gray-300" />
                      <p className="mt-4 text-gray-600">Keine Templates verfügbar</p>
                      <Link href="/templates/new" className="mt-2 btn btn-primary btn-sm">
                        Template erstellen
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {templates.map((template) => (
                        <label key={template.id} className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={selectedTemplateIds.includes(template.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTemplateIds([...selectedTemplateIds, template.id]);
                              } else {
                                setSelectedTemplateIds(selectedTemplateIds.filter(id => id !== template.id));
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {template.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {template.variables.length} Variablen: {template.variables.join(', ')}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variable Source Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Variablen-Quelle *
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
                      <span className="text-sm text-gray-900">Variable-Presets verwenden</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="variableSource"
                        className="text-primary-600 focus:ring-primary-500"
                        checked={useCustomVariables}
                        onChange={() => setUseCustomVariables(true)}
                      />
                      <span className="text-sm text-gray-900">Benutzerdefinierte Variablen</span>
                    </label>
                  </div>
                </div>

                {/* Variable Preset Selection */}
                {!useCustomVariables && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variable-Presets {selectedVariablePresetIds.length > 0 && `(${selectedVariablePresetIds.length} ausgewählt)`}
                    </label>
                    {variablePresets.length === 0 ? (
                      <div className="text-center py-4">
                        <Package className="mx-auto w-8 h-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-600">Keine Variable-Presets verfügbar</p>
                        <Link href="/variable-presets/create" className="mt-2 btn btn-primary btn-xs">
                          Variable-Preset erstellen
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
                                  ? 'Variable-Presets auswählen...' 
                                  : `${selectedVariablePresetIds.length} Preset${selectedVariablePresetIds.length > 1 ? 's' : ''} ausgewählt`}
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
                                    placeholder="Variable-Presets suchen..."
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
                                          <div className="text-xs text-gray-600">
                                            {preset.description}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            <code className="bg-gray-100 px-1 rounded">{'{{' + preset.placeholder + '}}'}</code>
                                            {' • '}{preset.values.split(';').length} Werte
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-6 text-center text-gray-500">
                                    Keine passenden Variable-Presets gefunden
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Selected Presets Details */}
                        {selectedVariablePresets.length > 0 && (
                          <div className="mt-4 space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">Ausgewählte Variable-Presets:</h4>
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
                                      Platzhalter: <code className="bg-white px-1 rounded border">{'{{' + preset.placeholder + '}}'}</code>
                                    </div>
                                    <div className="text-xs text-gray-700">
                                      <strong>Werte ({preset.values.split(';').length}):</strong>
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
                                            +{preset.values.split(';').length - 6} weitere
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
                                    title="Entfernen"
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
                      Benutzerdefinierte Variablen
                    </label>
                    {getAllRequiredVariables().length === 0 ? (
                      <p className="text-sm text-gray-600">
                        Wähle zuerst Templates aus um die benötigten Variablen zu sehen.
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
                              placeholder="Werte kommagetrennt eingeben: Wert1, Wert2, Wert3"
                              value={customVariables[variable] || ''}
                              onChange={(e) => handleCustomVariableChange(variable, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={generatePrompts}
                  disabled={generating || selectedTemplateIds.length === 0 || (!useCustomVariables && selectedVariablePresetIds.length === 0)}
                  className="w-full btn btn-primary btn-lg"
                >
                  {generating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generiere Prompts...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Prompts generieren
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Generated Prompts */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Generierte Prompts ({generatedPrompts.length})
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
                        onClick={handleDeleteAllClick}
                        className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {generatedPrompts.length === 0 ? (
                  <div className="text-center py-12">
                    <Zap className="mx-auto w-16 h-16 text-gray-300" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                      Noch keine Prompts generiert
                    </h3>
                    <p className="mt-2 text-gray-600">
                      Konfiguriere die Einstellungen links und starte die Generierung
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedPrompts.map((prompt) => (
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
                              title="In Zwischenablage kopieren"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deletePrompt(prompt.id)}
                              className="btn btn-ghost btn-xs hover:bg-red-100"
                              title="Prompt löschen"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          Variablen: {Object.entries(prompt.variables).map(([k, v]) => `${k}=${v}`).join(', ')}
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
        confirmText="Löschen"
        confirmVariant="danger"
        cancelText="Abbrechen"
      />
    </div>
  );
}