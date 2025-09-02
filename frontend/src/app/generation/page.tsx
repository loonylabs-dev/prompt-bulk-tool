'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Copy
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  variables: string[];
}

interface VariableSet {
  id: string;
  name: string;
  description: string;
  variables: Record<string, string[]>;
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
  const [variableSets, setVariableSets] = useState<VariableSet[]>([]);
  const [generatedPrompts, setGeneratedPrompts] = useState<GeneratedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedVariableSetId, setSelectedVariableSetId] = useState('');
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [useCustomVariables, setUseCustomVariables] = useState(false);
  
  // Load data
  useEffect(() => {
    Promise.all([
      fetchTemplates(),
      fetchVariableSets(),
      fetchGeneratedPrompts()
    ]).finally(() => setLoading(false));
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchVariableSets = async () => {
    try {
      const response = await fetch('/api/variables/sets');
      if (response.ok) {
        const data = await response.json();
        setVariableSets(data.data);
      }
    } catch (error) {
      console.error('Error fetching variable sets:', error);
    }
  };

  const fetchGeneratedPrompts = async () => {
    try {
      const response = await fetch('/api/generation/prompts');
      if (response.ok) {
        const data = await response.json();
        setGeneratedPrompts(data.data.prompts);
      }
    } catch (error) {
      console.error('Error fetching generated prompts:', error);
    }
  };

  const generatePrompts = async () => {
    if (selectedTemplateIds.length === 0) {
      alert('Bitte wähle mindestens ein Template aus');
      return;
    }
    
    if (!useCustomVariables && !selectedVariableSetId) {
      alert('Bitte wähle ein Variable-Set aus oder verwende benutzerdefinierte Variablen');
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
        requestBody.variableSetId = selectedVariableSetId;
      }

      const response = await fetch('/api/generation/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`${data.data.totalCount} Prompts erfolgreich generiert!`);
        fetchGeneratedPrompts();
      } else {
        const error = await response.json();
        alert(`Fehler bei der Generierung: ${error.error}`);
      }
    } catch (error) {
      console.error('Error generating prompts:', error);
      alert('Fehler bei der Generierung');
    } finally {
      setGenerating(false);
    }
  };

  const deleteAllPrompts = async () => {
    if (!confirm('Alle generierten Prompts löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      const response = await fetch('/api/generation/prompts/all', {
        method: 'DELETE',
      });

      if (response.ok) {
        setGeneratedPrompts([]);
        alert('Alle Prompts gelöscht');
      }
    } catch (error) {
      console.error('Error deleting prompts:', error);
      alert('Fehler beim Löschen');
    }
  };

  const exportPrompts = async (format: 'json' | 'csv' | 'txt') => {
    try {
      const response = await fetch(`/api/generation/export?format=${format}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `generated-prompts.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting prompts:', error);
      alert('Fehler beim Export');
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
      // Could add toast notification here
    });
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
                      <span className="text-sm text-gray-900">Variable-Set verwenden</span>
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

                {/* Variable Set Selection */}
                {!useCustomVariables && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Variable-Set
                    </label>
                    {variableSets.length === 0 ? (
                      <div className="text-center py-4">
                        <Package className="mx-auto w-8 h-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-600">Keine Variable-Sets verfügbar</p>
                        <Link href="/variables/sets/new" className="mt-2 btn btn-primary btn-xs">
                          Variable-Set erstellen
                        </Link>
                      </div>
                    ) : (
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={selectedVariableSetId}
                        onChange={(e) => setSelectedVariableSetId(e.target.value)}
                      >
                        <option value="">Variable-Set auswählen...</option>
                        {variableSets.map((set) => (
                          <option key={set.id} value={set.id}>
                            {set.name} ({Object.keys(set.variables).length} Variablen)
                          </option>
                        ))}
                      </select>
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
                  disabled={generating || selectedTemplateIds.length === 0 || (!useCustomVariables && !selectedVariableSetId)}
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
                        onClick={deleteAllPrompts}
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
                              className="btn btn-ghost btn-xs"
                              title="In Zwischenablage kopieren"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          Variablen: {Object.entries(prompt.variables).map(([k, v]) => `${k}=${v}`).join(', ')}
                        </div>
                        
                        <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                          <div className="line-clamp-3">
                            {prompt.content}
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
    </div>
  );
}