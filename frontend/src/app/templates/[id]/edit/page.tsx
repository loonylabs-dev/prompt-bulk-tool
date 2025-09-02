'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  Eye,
  Variable,
  Tag as TagIcon,
  Info,
  Loader2
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  createdAt: string;
  updatedAt: string;
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: 'general',
    tags: [] as string[],
  });
  const [currentTag, setCurrentTag] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [extractedVariables, setExtractedVariables] = useState<string[]>([]);

  // Fetch template data
  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      if (response.ok) {
        const data = await response.json();
        const templateData = data.data;
        setTemplate(templateData);
        setFormData({
          name: templateData.name,
          description: templateData.description,
          content: templateData.content,
          category: templateData.category,
          tags: templateData.tags || [],
        });
        setExtractedVariables(templateData.variables || []);
      } else if (response.status === 404) {
        router.push('/templates');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      router.push('/templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract variables from content
  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      const variableName = match[1].trim();
      if (variableName && !variables.includes(variableName)) {
        variables.push(variableName);
      }
    }
    
    return variables;
  };

  // Update extracted variables when content changes
  const handleContentChange = (content: string) => {
    setFormData({ ...formData, content });
    setExtractedVariables(extractVariables(content));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/templates');
      } else {
        const error = await response.json();
        alert(`Fehler beim Speichern des Templates: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Fehler beim Speichern des Templates');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto w-8 h-8 animate-spin text-primary-600" />
          <p className="mt-4 text-gray-600">Template wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Template nicht gefunden.</p>
          <Link href="/templates" className="mt-4 btn btn-primary btn-md">
            Zurück zu Templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/templates" className="btn btn-ghost btn-sm">
                <ArrowLeft className="w-4 h-4" />
                Zurück zu Templates
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Template bearbeiten</h1>
                <p className="text-sm text-gray-600">{template.name}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`btn btn-outline btn-md ${previewMode ? 'btn-active' : ''}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Vorschau
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Grundinformationen
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="z.B. Produktbeschreibung erstellen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="general">Allgemein</option>
                    <option value="marketing">Marketing</option>
                    <option value="content">Content</option>
                    <option value="development">Development</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Kurze Beschreibung was dieses Template macht..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Template Content */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Template Inhalt
                </h2>
                <div className="flex items-center text-sm text-gray-600">
                  <Info className="w-4 h-4 mr-1" />
                  Verwende {'{{variable_name}}'} für Platzhalter
                </div>
              </div>

              {previewMode ? (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px]">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Vorschau:</h3>
                  <div className="whitespace-pre-wrap text-sm text-gray-900">
                    {formData.content || 'Template-Inhalt wird hier angezeigt...'}
                  </div>
                </div>
              ) : (
                <textarea
                  required
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  placeholder={`Beispiel:\n\nErstelle eine {{style}} Produktbeschreibung für {{product}}.\n\nDie Beschreibung soll {{tone}} sein und {{features}} hervorheben.\n\nZielgruppe: {{audience}}`}
                  value={formData.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                />
              )}

              {/* Extracted Variables */}
              {extractedVariables.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Variable className="w-4 h-4 text-blue-600 mr-2" />
                    <h3 className="text-sm font-medium text-blue-900">
                      Erkannte Variablen ({extractedVariables.length})
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extractedVariables.map((variable) => (
                      <span
                        key={variable}
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="card">
            <div className="card-body">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tags (optional)
              </h2>
              
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tag hinzufügen..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-outline btn-md"
                >
                  <TagIcon className="w-4 h-4" />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <Link href="/templates" className="btn btn-outline btn-lg">
              Abbrechen
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Speichere...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Änderungen speichern
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}