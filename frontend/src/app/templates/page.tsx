'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Copy,
  Tag,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { ConfirmDialog } from '../../components/Dialog';
import toast from 'react-hot-toast';
import { templateApi } from '../../lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [deleteDialog, setDeleteDialog] = useState<{ show: boolean; templateId: string | null; templateName: string }>({ show: false, templateId: null, templateName: '' });

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templateApi.getAll();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await templateApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteDialog({ show: true, templateId: id, templateName: name });
  };

  const deleteTemplate = async () => {
    if (!deleteDialog.templateId) return;
    
    try {
      const response = await templateApi.delete(deleteDialog.templateId);
      if (response.success) {
        setTemplates(templates.filter(t => t.id !== deleteDialog.templateId));
        fetchCategories();
        toast.success('Template deleted!');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Error deleting template');
    } finally {
      setDeleteDialog({ show: false, templateId: null, templateName: '' });
    }
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      const response = await templateApi.duplicate(template.id, `${template.name} (Copy)`);
      if (response.success) {
        fetchTemplates();
        fetchCategories();
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Templates</h1>
              </div>
            </div>
            <Link href="/templates/new" className="btn btn-primary btn-md">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.entries(categories).map(([category, count]) => (
                <option key={category} value={category}>
                  {category} ({count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto w-16 h-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm || selectedCategory ? 'No templates found' : 'No templates yet'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchTerm || selectedCategory 
                ? 'Try different search terms or filters'
                : 'Create your first template to get started'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <Link href="/templates/new" className="mt-4 btn btn-primary btn-md">
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                      {template.category}
                    </span>
                  </div>

                  {/* Variables */}
                  {template.variables.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">Variables:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable) => (
                          <span key={variable} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {variable}
                          </span>
                        ))}
                        {template.variables.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{template.variables.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="inline-flex items-center text-xs text-gray-600">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {template.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{template.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content Preview */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {template.content}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString('en-US')}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => duplicateTemplate(template)}
                        className="btn btn-ghost btn-xs"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/templates/${template.id}/edit`}
                        className="btn btn-ghost btn-xs"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(template.id, template.name)}
                        className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50"
                        title="Delete"
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

        {/* Stats */}
        {!loading && templates.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {templates.length}
                </div>
                <div className="text-sm text-gray-600">Templates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(categories).length}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {templates.reduce((sum, t) => sum + t.variables.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Variables</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {templates.reduce((sum, t) => sum + t.tags.length, 0)}
                </div>
                <div className="text-sm text-gray-600">Tags</div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          show={deleteDialog.show}
          onClose={() => setDeleteDialog({ show: false, templateId: null, templateName: '' })}
          onConfirm={deleteTemplate}
          title="Delete Template"
          message={`Are you sure you want to delete the template "${deleteDialog.templateName}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}