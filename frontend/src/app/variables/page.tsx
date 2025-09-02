'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Variable, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  ArrowLeft,
  Package,
  List,
  Hash,
  Type,
  ToggleLeft
} from 'lucide-react';

interface PromptVariable {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'array';
  default_value?: string;
  possible_values: string[];
  template_ids: string[];
  createdAt: string;
  updatedAt: string;
}

interface VariableSet {
  id: string;
  name: string;
  description: string;
  variables: Record<string, string[]>;
  template_ids: string[];
  createdAt: string;
  updatedAt: string;
}

export default function VariablesPage() {
  const [variables, setVariables] = useState<PromptVariable[]>([]);
  const [variableSets, setVariableSets] = useState<VariableSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [activeTab, setActiveTab] = useState<'variables' | 'sets'>('variables');

  // Fetch data
  useEffect(() => {
    fetchVariables();
    fetchVariableSets();
  }, []);

  const fetchVariables = async () => {
    try {
      const response = await fetch('/api/variables');
      if (response.ok) {
        const data = await response.json();
        setVariables(data.data);
      }
    } catch (error) {
      console.error('Error fetching variables:', error);
    } finally {
      setLoading(false);
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

  const deleteVariable = async (id: string) => {
    if (!confirm('Variable wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/variables/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setVariables(variables.filter(v => v.id !== id));
      }
    } catch (error) {
      console.error('Error deleting variable:', error);
    }
  };

  const deleteVariableSet = async (id: string) => {
    if (!confirm('Variable-Set wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/variables/sets/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setVariableSets(variableSets.filter(vs => vs.id !== id));
      }
    } catch (error) {
      console.error('Error deleting variable set:', error);
    }
  };

  // Filter variables
  const filteredVariables = variables.filter(variable => {
    const matchesSearch = variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         variable.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || variable.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'number': return <Hash className="w-4 h-4" />;
      case 'boolean': return <ToggleLeft className="w-4 h-4" />;
      case 'array': return <List className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800';
      case 'number': return 'bg-green-100 text-green-800';
      case 'boolean': return 'bg-purple-100 text-purple-800';
      case 'array': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Variable className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Variablen</h1>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/variables/sets/new" className="btn btn-outline btn-md">
                <Package className="w-4 h-4 mr-2" />
                Neues Variable-Set
              </Link>
              <Link href="/variables/new" className="btn btn-primary btn-md">
                <Plus className="w-4 h-4 mr-2" />
                Neue Variable
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('variables')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'variables'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Variable className="w-4 h-4 inline mr-2" />
                Einzelne Variablen ({variables.length})
              </button>
              <button
                onClick={() => setActiveTab('sets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sets'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Variable-Sets ({variableSets.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'variables' ? (
          <>
            {/* Search and Filters */}
            <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Variablen durchsuchen..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">Alle Typen</option>
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="array">Array</option>
                </select>
              </div>
            </div>

            {/* Variables Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">Variablen werden geladen...</p>
              </div>
            ) : filteredVariables.length === 0 ? (
              <div className="text-center py-12">
                <Variable className="mx-auto w-16 h-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {searchTerm || selectedType ? 'Keine Variablen gefunden' : 'Noch keine Variablen'}
                </h3>
                <p className="mt-2 text-gray-600">
                  {searchTerm || selectedType 
                    ? 'Versuche andere Suchbegriffe oder Filter'
                    : 'Erstelle deine erste Variable um anzufangen'
                  }
                </p>
                {!searchTerm && !selectedType && (
                  <Link href="/variables/new" className="mt-4 btn btn-primary btn-md">
                    <Plus className="w-4 h-4 mr-2" />
                    Erste Variable erstellen
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVariables.map((variable) => (
                  <div key={variable.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {variable.name}
                            </h3>
                            <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${getTypeColor(variable.type)}`}>
                              {getTypeIcon(variable.type)}
                              <span className="ml-1">{variable.type}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {variable.description}
                          </p>
                        </div>
                      </div>

                      {/* Possible Values */}
                      {variable.possible_values.length > 0 && (
                        <div className="mb-4">
                          <div className="text-xs text-gray-500 mb-2">
                            Mögliche Werte ({variable.possible_values.length}):
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {variable.possible_values.slice(0, 3).map((value, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                {value}
                              </span>
                            ))}
                            {variable.possible_values.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{variable.possible_values.length - 3} weitere
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Default Value */}
                      {variable.default_value && (
                        <div className="mb-4">
                          <div className="text-xs text-gray-500">Standard-Wert:</div>
                          <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">
                            {variable.default_value}
                          </div>
                        </div>
                      )}

                      {/* Used in Templates */}
                      <div className="mb-4 text-xs text-gray-500">
                        Verwendet in {variable.template_ids.length} Templates
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-500">
                          {new Date(variable.createdAt).toLocaleDateString('de-DE')}
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/variables/${variable.id}/edit`}
                            className="btn btn-ghost btn-xs"
                            title="Bearbeiten"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteVariable(variable.id)}
                            className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Variable Sets */}
            {variableSets.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto w-16 h-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Noch keine Variable-Sets
                </h3>
                <p className="mt-2 text-gray-600">
                  Variable-Sets ermöglichen es, mehrere Variablen mit Werten zu gruppieren
                </p>
                <Link href="/variables/sets/new" className="mt-4 btn btn-primary btn-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Erstes Variable-Set erstellen
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {variableSets.map((set) => (
                  <div key={set.id} className="card">
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {set.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {set.description}
                          </p>
                        </div>
                      </div>

                      {/* Variables in Set */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 mb-2">
                          Variablen ({Object.keys(set.variables).length}):
                        </div>
                        <div className="space-y-1">
                          {Object.entries(set.variables).slice(0, 3).map(([name, values]) => (
                            <div key={name} className="text-sm">
                              <span className="font-medium text-gray-700">{name}:</span>
                              <span className="ml-2 text-gray-600">
                                {Array.isArray(values) ? values.length : 0} Werte
                              </span>
                            </div>
                          ))}
                          {Object.keys(set.variables).length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{Object.keys(set.variables).length - 3} weitere Variablen
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Used in Templates */}
                      <div className="mb-4 text-xs text-gray-500">
                        Verwendet in {set.template_ids.length} Templates
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-500">
                          {new Date(set.createdAt).toLocaleDateString('de-DE')}
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            href={`/variables/sets/${set.id}/edit`}
                            className="btn btn-ghost btn-xs"
                            title="Bearbeiten"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteVariableSet(set.id)}
                            className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50"
                            title="Löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}