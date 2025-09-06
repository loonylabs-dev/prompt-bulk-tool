'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Tag, Edit2, Trash2, Filter, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmDialog, AlertDialog } from '../../components/Dialog';

interface VariablePreset {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  values: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: VariablePreset[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function VariablePresetsPage() {
  const [presets, setPresets] = useState<VariablePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [duplicateDialog, setDuplicateDialog] = useState<{ show: boolean; presetId: string | null }>({ show: false, presetId: null });
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean; presetId: string | null; presetName: string }>({ show: false, presetId: null, presetName: '' });
  const [alertDialog, setAlertDialog] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' | 'info' }>({ show: false, title: '', message: '', type: 'info' });

  // Fetch presets
  useEffect(() => {
    fetchPresets();
    fetchAllTags();
  }, []);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/variable-presets');
      const data: ApiResponse = await response.json();
      
      if (data.success) {
        setPresets(data.data);
      } else {
        setError('Failed to load variable presets');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    try {
      const response = await fetch('/api/variable-presets/tags/all');
      const data = await response.json();
      
      if (data.success) {
        setAllTags(data.data);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ show: true, presetId: id, presetName: name });
  };

  const deletePreset = async () => {
    if (!deleteDialog.presetId) return;

    try {
      const response = await fetch(`/api/variable-presets/${deleteDialog.presetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPresets();
        toast.success('Variable-Preset gelöscht!');
      } else {
        setAlertDialog({
          show: true,
          title: 'Fehler',
          message: 'Fehler beim Löschen des Variable-Presets',
          type: 'error'
        });
      }
    } catch (err) {
      setAlertDialog({
        show: true,
        title: 'Fehler',
        message: 'Fehler beim Löschen des Variable-Presets',
        type: 'error'
      });
    } finally {
      setDeleteDialog({ show: false, presetId: null, presetName: '' });
    }
  };

  const handleDuplicateClick = (id: string) => {
    setDuplicateDialog({ show: true, presetId: id });
  };

  const duplicatePreset = async (includeValues: boolean) => {
    if (!duplicateDialog.presetId) return;

    try {
      const response = await fetch(`/api/variable-presets/${duplicateDialog.presetId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ includeValues }),
      });

      if (response.ok) {
        await fetchPresets(); // Refresh the list
        toast.success('Variable-Preset dupliziert!', {
          icon: '📋',
        });
      } else {
        toast.error('Fehler beim Duplizieren');
      }
    } catch (err) {
      toast.error('Fehler beim Duplizieren');
      console.error('Error duplicating preset:', err);
    } finally {
      setDuplicateDialog({ show: false, presetId: null });
    }
  };

  // Filter presets
  const filteredPresets = presets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.placeholder.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => preset.tags.includes(tag));

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const getValueCount = (values: string) => {
    return values.split(';').filter(v => v.trim().length > 0).length;
  };

  const getValuePreview = (values: string) => {
    const valueList = values.split(';').filter(v => v.trim().length > 0);
    const preview = valueList.slice(0, 3).join(', ');
    return valueList.length > 3 ? `${preview}...` : preview;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Variable-Presets</h1>
          <p className="mt-2 text-gray-600">
            Verwalten Sie wiederverwendbare Variable-Presets für Ihre Templates
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/variable-presets/create"
            className="btn btn-primary btn-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neues Preset
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 bg-white p-6 rounded-lg shadow-sm border">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Nach Name, Beschreibung oder Platzhalter suchen..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div>
            <div className="flex items-center mb-3">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Nach Tags filtern:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTags.includes(tag)
                      ? 'bg-primary-100 text-primary-800 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Alle Filter entfernen
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchPresets}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      {/* Results Summary */}
      <div className="mb-6 text-sm text-gray-600">
        {filteredPresets.length} von {presets.length} Variable-Presets
        {(searchTerm || selectedTags.length > 0) && ' (gefiltert)'}
      </div>

      {/* Empty State */}
      {filteredPresets.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <Tag className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {presets.length === 0 ? 'Keine Variable-Presets vorhanden' : 'Keine Ergebnisse gefunden'}
          </h3>
          <p className="text-gray-600 mb-6">
            {presets.length === 0 
              ? 'Erstellen Sie Ihr erstes Variable-Preset, um loszulegen.'
              : 'Versuchen Sie, Ihre Suchkriterien zu ändern.'
            }
          </p>
          {presets.length === 0 && (
            <Link
              href="/variable-presets/create"
              className="btn btn-primary btn-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Erstes Preset erstellen
            </Link>
          )}
        </div>
      )}

      {/* Presets Grid */}
      {filteredPresets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => (
            <div key={preset.id} className="card group hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {preset.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {preset.description}
                    </p>
                  </div>
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/variable-presets/${preset.id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDuplicateClick(preset.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplizieren"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(preset.id, preset.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Placeholder */}
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platzhalter
                    </span>
                    <div className="mt-1 px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                      {'{{'}{preset.placeholder}{'}}'}
                    </div>
                  </div>

                  {/* Values Preview */}
                  <div>
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Werte ({getValueCount(preset.values)})
                    </span>
                    <p className="mt-1 text-sm text-gray-700">
                      {getValuePreview(preset.values)}
                    </p>
                  </div>

                  {/* Tags */}
                  {preset.tags.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tags
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {preset.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Erstellt: {new Date(preset.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Duplicate Dialog */}
      {duplicateDialog.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Variable-Preset duplizieren
            </h3>
            
            <p className="text-gray-600 mb-6">
              Sollen die aktuellen Werte in das duplizierte Preset übernommen werden?
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => duplicatePreset(true)}
                className="flex-1 btn btn-primary btn-md"
              >
                Mit Werten duplizieren
              </button>
              <button
                onClick={() => duplicatePreset(false)}
                className="flex-1 btn btn-secondary btn-md"
              >
                Nur Struktur duplizieren
              </button>
              <button
                onClick={() => setDuplicateDialog({ show: false, presetId: null })}
                className="btn btn-ghost btn-md"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, presetId: null, presetName: '' })}
        onConfirm={deletePreset}
        title="Variable-Preset löschen"
        message={`Sind Sie sicher, dass Sie das Variable-Preset "${deleteDialog.presetName}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`}
        confirmText="Löschen"
        confirmVariant="danger"
        cancelText="Abbrechen"
      />

      {/* Alert Dialog */}
      <AlertDialog
        show={alertDialog.show}
        onClose={() => setAlertDialog({ show: false, title: '', message: '', type: 'info' })}
        title={alertDialog.title}
        message={alertDialog.message}
        type={alertDialog.type}
        buttonText="OK"
      />
    </div>
  );
}