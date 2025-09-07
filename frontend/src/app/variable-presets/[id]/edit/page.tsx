'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Search, ChevronDown, Tag, Plus, X, Trash2, Wand2 } from 'lucide-react';
import { ConfirmDialog } from '../../../../components/Dialog';
import toast from 'react-hot-toast';
import { aiApi, variablePresetApi } from '../../../../lib/api';
import { VerbosityLevel } from '@prompt-bulk-tool/shared/dist/types';

interface VariablePreset {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  values: string;
  tags: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface TemplatePlaceholder {
  name: string;
  usedInTemplates: number;
  templateIds: string[];
  templateNames: string[];
}

export default function EditVariablePresetPage() {
  const router = useRouter();
  const params = useParams();
  const presetId = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean; presetName: string }>({ show: false, presetName: '' });

  // Fetch preset data and placeholders
  useEffect(() => {
    if (presetId) {
      fetchPreset();
      fetchPlaceholders();
    }
  }, [presetId]);

  const fetchPreset = async () => {
    try {
      setInitialLoading(true);
      const response = await variablePresetApi.getById(presetId);
      
      if (!response.success || !response.data) {
        router.push('/variable-presets');
        return;
      }

      const preset: VariablePreset = response.data;
        setFormData({
          name: preset.name,
          description: preset.description,
          placeholder: preset.placeholder,
          values: preset.values,
          tags: preset.tags
        });
    } catch (err) {
      setErrors({ general: 'Error loading Variable Preset' });
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchPlaceholders = async () => {
    try {
      const response = await variablePresetApi.getPlaceholders();
      if (response.success && response.data) {
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
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.placeholder.trim()) {
      newErrors.placeholder = 'Placeholder is required';
    }
    
    if (!formData.values.trim()) {
      newErrors.values = 'Values are required';
    } else {
      const valueList = formData.values.split(';').map(v => v.trim()).filter(v => v.length > 0);
      if (valueList.length === 0) {
        newErrors.values = 'At least one value is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      
      const response = await variablePresetApi.update(presetId, formData);

      if (response.success) {
        toast.success('Variable Preset saved successfully!');
        router.push('/variable-presets');
      } else {
        setErrors({ general: response.error || 'Error updating Variable Preset' });
      }
    } catch (err) {
      setErrors({ general: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialog({ show: true, presetName: formData.name || 'Variable Preset' });
  };

  const handleDelete = async () => {
    try {
      const response = await variablePresetApi.delete(presetId);

      if (response.success) {
        toast.success('Variable Preset deleted!');
        router.push('/variable-presets');
      } else {
        setErrors({ general: 'Error deleting Variable Preset' });
      }
    } catch (err) {
      setErrors({ general: 'Fehler beim Löschen des Variable-Presets' });
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

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Link
              href="/variable-presets"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Variable Preset</h1>
              <p className="mt-1 text-gray-600">
                Modify the settings for this Variable Preset
              </p>
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={handleDeleteClick}
            className="btn btn-danger btn-md"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-sm border rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
          
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
                placeholder="e.g. Dragon Types, Product Styles..."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe what this Variable Preset is used for..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm border rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Placeholder & Values</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Placeholder Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Placeholder * {placeholders.length > 0 && `(${placeholders.length} available)`}
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
                      {formData.placeholder ? `{{${formData.placeholder}}}` : 'Select placeholder from templates...'}
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
                          placeholder="Search placeholders..."
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
                                  Used in {placeholder.usedInTemplates} Template{placeholder.usedInTemplates !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center text-gray-500">
                          {placeholders.length === 0 
                            ? 'No templates with placeholders found'
                            : 'No matching placeholders found'
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
                  Or edit manually:
                </button>
                <input
                  type="text"
                  value={formData.placeholder}
                  onChange={(e) => handleInputChange('placeholder', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Placeholder name without {{}}"
                />
              </div>
            </div>

            {/* Values */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="values" className="text-sm font-medium text-gray-700">
                  Values * (semicolon separated)
                </label>
                <button
                  type="button"
                  onClick={() => setShowGenerationDialog(true)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-md transition-colors"
                  title="AI-assisted value generation"
                >
                  <Wand2 className="w-4 h-4" />
                  Generate
                </button>
              </div>
              <textarea
                id="values"
                rows={4}
                value={formData.values}
                onChange={(e) => handleInputChange('values', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.values ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Value1;Value2;Value with comma, here;Another value"
              />
              {errors.values && <p className="mt-1 text-sm text-red-600">{errors.values}</p>}
              
              <p className="mt-1 text-sm text-gray-500">
                Use semicolons (;) to separate values. Commas within values are allowed.
              </p>

              {/* Values Preview */}
              {formData.values.trim() && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Preview ({getValuesPreview().length} values):
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
          <h2 className="text-lg font-medium text-gray-900 mb-6">Organization</h2>
          
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
                placeholder="Add new tag..."
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
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-md"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Generation Dialog */}
      {showGenerationDialog && (
        <GenerationDialog
          templateContent="" // Will be fetched based on placeholder
          variableName={formData.placeholder}
          onGenerate={(values) => {
            const existingValues = formData.values ? formData.values.split(';').map(v => v.trim()).filter(v => v) : [];
            const newValues = [...existingValues, ...values];
            handleInputChange('values', newValues.join(';'));
            setShowGenerationDialog(false);
          }}
          onClose={() => setShowGenerationDialog(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={deleteDialog.show}
        onClose={() => setDeleteDialog({ show: false, presetName: '' })}
        onConfirm={() => {
          handleDelete();
          setDeleteDialog({ show: false, presetName: '' });
        }}
        title="Delete Variable Preset"
        message={`Are you sure you want to delete the Variable Preset "${deleteDialog.presetName}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        cancelText="Cancel"
      />
    </div>
  );
}

interface GenerationDialogProps {
  templateContent: string;
  variableName: string;
  onGenerate: (values: string[]) => void;
  onClose: () => void;
}

function GenerationDialog({ templateContent, variableName, onGenerate, onClose }: GenerationDialogProps) {
  const [direction, setDirection] = useState('');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verbosity, setVerbosity] = useState<VerbosityLevel>(VerbosityLevel.SHORT_CONCISE);

  const handleGenerate = async () => {
    if (!direction.trim()) {
      setError('Please specify a direction/style');
      return;
    }

    if (!variableName.trim()) {
      setError('No placeholder selected');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // For now, use a dummy template - in real implementation, 
      // we'd fetch the actual template content that uses this variable
      const dummyTemplate = `Generate a {{${variableName}}} for the story.`;

      const response = await aiApi.generateVariableValues({
        templateContent: dummyTemplate,
        variableName,
        direction,
        count,
        verbosity
      });

      if (response.success && response.data?.values) {
        onGenerate(response.data.values);
      } else {
        throw new Error(response.error || 'No values generated');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Generate Values
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                {variableName ? `{{${variableName}}}` : 'No placeholder selected'}
              </div>
            </div>

            <div>
              <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-1">
                Direction/Style *
              </label>
              <input
                type="text"
                id="direction"
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder='e.g. "small and funny", "epic and heroic"'
              />
              <p className="mt-1 text-xs text-gray-500">
                Describe the desired style or direction for the generated values
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verbosity
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVerbosity(VerbosityLevel.TITLE_ONLY)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    verbosity === VerbosityLevel.TITLE_ONLY
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Title Only
                </button>
                <button
                  type="button"
                  onClick={() => setVerbosity(VerbosityLevel.SHORT_CONCISE)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    verbosity === VerbosityLevel.SHORT_CONCISE
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Short & Concise
                </button>
                <button
                  type="button"
                  onClick={() => setVerbosity(VerbosityLevel.ONE_SENTENCE)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                    verbosity === VerbosityLevel.ONE_SENTENCE
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  1 Sentence
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Determines how verbose the generated values should be
              </p>
            </div>

            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Results
              </label>
              <select
                id="count"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={5}>5 Values</option>
                <option value={10}>10 Values</option>
                <option value={15}>15 Values</option>
                <option value={20}>20 Values</option>
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="btn btn-outline btn-md"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || !direction.trim() || !variableName}
              className="btn btn-primary btn-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}