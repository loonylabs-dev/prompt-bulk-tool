'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Search, ChevronDown, Tag, Plus, X } from 'lucide-react';
import { variablePresetApi } from '../../../lib/api';

interface TemplatePlaceholder {
  name: string;
  usedInTemplates: number;
  templateIds: string[];
  templateNames: string[];
}

export default function CreateVariablePresetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [placeholders, setPlaceholders] = useState<TemplatePlaceholder[]>([]);
  const [showPlaceholderDropdown, setShowPlaceholderDropdown] = useState(false);
  const [placeholderSearch, setPlaceholderSearch] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    placeholder: '',
    values: '',
    tags: [] as string[]
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');

  // Fetch available placeholders
  useEffect(() => {
    fetchPlaceholders();
  }, []);

  const fetchPlaceholders = async () => {
    try {
      const response = await variablePresetApi.getPlaceholders();
      
      if (response.success) {
        setPlaceholders(response.data);
      }
    } catch (err) {
      console.error('Error fetching placeholders:', err);
    }
  };

  const filteredPlaceholders = placeholders.filter(placeholder =>
    placeholder.name.toLowerCase().includes(placeholderSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Beschreibung ist erforderlich';
    }
    
    if (!formData.placeholder.trim()) {
      newErrors.placeholder = 'Platzhalter ist erforderlich';
    }
    
    if (!formData.values.trim()) {
      newErrors.values = 'Werte sind erforderlich';
    } else {
      const valueList = formData.values.split(';').map(v => v.trim()).filter(v => v.length > 0);
      if (valueList.length === 0) {
        newErrors.values = 'Mindestens ein Wert ist erforderlich';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      
      const response = await variablePresetApi.create(formData);

      if (response.success) {
        router.push('/variable-presets');
      } else {
        setErrors({ general: response.error || 'Fehler beim Erstellen des Variable-Presets' });
      }
    } catch (err) {
      setErrors({ general: 'Fehler beim Verbinden mit dem Server' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectPlaceholder = (placeholder: TemplatePlaceholder) => {
    handleInputChange('placeholder', placeholder.name);
    setShowPlaceholderDropdown(false);
    setPlaceholderSearch('');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // Parse and display values preview
  const getValuesPreview = () => {
    if (!formData.values.trim()) return [];
    return formData.values.split(';').map(v => v.trim()).filter(v => v.length > 0);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href="/variable-presets"
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Variable-Preset erstellen</h1>
            <p className="mt-1 text-gray-600">
              Erstellen Sie ein neues wiederverwendbares Variable-Preset
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-sm border rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Grundinformationen</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="z.B. Dragon Types, Product Styles..."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung *
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Beschreiben Sie, wofür dieses Variable-Preset verwendet wird..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Platzhalter & Werte</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Placeholder Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template-Platzhalter * {placeholders.length > 0 && `(${placeholders.length} verfügbar)`}
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPlaceholderDropdown(!showPlaceholderDropdown)}
                  className={`w-full px-3 py-2 border rounded-lg text-left focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.placeholder ? 'border-red-300' : 'border-gray-300'
                  } ${formData.placeholder ? 'bg-white' : 'bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={formData.placeholder ? 'text-gray-900' : 'text-gray-500'}>
                      {formData.placeholder ? `{{${formData.placeholder}}}` : 'Platzhalter aus Templates auswählen...'}
                    </span>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>

                {showPlaceholderDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-3 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Platzhalter suchen..."
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          value={placeholderSearch}
                          onChange={(e) => setPlaceholderSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredPlaceholders.length > 0 ? (
                        filteredPlaceholders.map((placeholder) => (
                          <button
                            key={placeholder.name}
                            type="button"
                            onClick={() => selectPlaceholder(placeholder)}
                            className="w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {'{{'}{placeholder.name}{'}}'}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Verwendet in {placeholder.usedInTemplates} Template{placeholder.usedInTemplates !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center text-gray-500">
                          {placeholders.length === 0 
                            ? 'Keine Templates mit Platzhaltern gefunden'
                            : 'Keine passenden Platzhalter gefunden'
                          }
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {errors.placeholder && <p className="mt-1 text-sm text-red-600">{errors.placeholder}</p>}
              
              {/* Manual input option */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowPlaceholderDropdown(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Oder manuell eingeben:
                </button>
                <input
                  type="text"
                  value={formData.placeholder}
                  onChange={(e) => handleInputChange('placeholder', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Platzhalter-Name ohne {{}}"
                />
              </div>
            </div>

            {/* Values */}
            <div>
              <label htmlFor="values" className="block text-sm font-medium text-gray-700 mb-2">
                Werte * (durch Semikolon getrennt)
              </label>
              <textarea
                id="values"
                rows={4}
                value={formData.values}
                onChange={(e) => handleInputChange('values', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.values ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Wert1;Wert2;Wert mit Komma, hier;Noch ein Wert"
              />
              {errors.values && <p className="mt-1 text-sm text-red-600">{errors.values}</p>}
              
              <p className="mt-1 text-sm text-gray-500">
                Verwenden Sie Semikolons (;) zur Trennung von Werten. Kommas innerhalb der Werte sind erlaubt.
              </p>

              {/* Values Preview */}
              {formData.values.trim() && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Vorschau ({getValuesPreview().length} Werte):
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {getValuesPreview().map((value, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-700"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Organisation</h2>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            
            {/* Add Tag Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Neuen Tag hinzufügen..."
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary-600 hover:text-primary-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.general}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <Link
            href="/variable-presets"
            className="btn btn-outline btn-md"
          >
            Abbrechen
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-md"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Wird erstellt...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Variable-Preset erstellen
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}