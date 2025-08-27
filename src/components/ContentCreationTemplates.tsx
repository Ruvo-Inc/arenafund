'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { 
  ContentTemplate, 
  Content, 
  contentManagementSystem,
  ContentScore,
  OptimizationSuggestion 
} from '../lib/content-management';

interface ContentCreationTemplatesProps {
  onContentCreated?: (content: Content) => void;
}

export const ContentCreationTemplates: React.FC<ContentCreationTemplatesProps> = ({
  onContentCreated
}) => {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ContentTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'Arena Fund Team',
    category: 'insights',
    tags: [] as string[]
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const availableTemplates = contentManagementSystem.getAllTemplates();
    setTemplates(availableTemplates);
  };

  const handleTemplateSelect = (template: ContentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: '',
      content: generateTemplateContent(template),
      author: 'Arena Fund Team',
      category: template.type === 'article' ? 'insights' : 'portfolio',
      tags: [...template.seoDefaults.keywords]
    });
  };

  const generateTemplateContent = (template: ContentTemplate): string => {
    let content = '';
    
    template.structure.sections.forEach(section => {
      content += `\n## ${section.name}\n\n`;
      
      switch (section.type) {
        case 'text':
          content += `[Write your ${section.name.toLowerCase()} here. This section is ${section.required ? 'required' : 'optional'} and has high SEO weight.]\n\n`;
          break;
        case 'list':
          content += `- Key point 1\n- Key point 2\n- Key point 3\n\n`;
          break;
        case 'data':
          content += `**Key Statistics:**\n- Metric 1: [Value]\n- Metric 2: [Value]\n- Metric 3: [Value]\n\n`;
          break;
        case 'quote':
          content += `> "[Insert relevant quote here]"\n> — Source\n\n`;
          break;
        case 'faq':
          content += `**Q: [Question]**\nA: [Answer]\n\n**Q: [Question]**\nA: [Answer]\n\n`;
          break;
        default:
          content += `[Content for ${section.name}]\n\n`;
      }
    });

    return content;
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    handleInputChange('tags', tags);
  };

  const handleCreateContent = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);
    setError(null);

    try {
      const content = await contentManagementSystem.createContent(
        selectedTemplate.id,
        formData
      );

      onContentCreated?.(content);
      
      // Reset form
      setSelectedTemplate(null);
      setFormData({
        title: '',
        content: '',
        author: 'Arena Fund Team',
        category: 'insights',
        tags: []
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setIsCreating(false);
    }
  };

  if (!selectedTemplate) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Content Template
          </h2>
          <p className="text-gray-600">
            Select a template to create optimized content with built-in SEO and AI optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(template => (
            <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                    {template.type}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Structure</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {template.structure.sections.map(section => (
                      <li key={section.id} className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          section.required ? 'bg-red-400' : 'bg-gray-300'
                        }`} />
                        {section.name}
                        {section.aiOptimized && (
                          <span className="ml-2 text-xs text-green-600">AI Optimized</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">SEO Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.seoDefaults.keywords.slice(0, 3).map(keyword => (
                      <span key={keyword} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">AI Optimization</h4>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {template.aiOptimization.factExtraction && (
                      <span className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1" />
                        Fact Extraction
                      </span>
                    )}
                    {template.aiOptimization.citationGeneration && (
                      <span className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1" />
                        Citations
                      </span>
                    )}
                    {template.aiOptimization.readabilityOptimization && (
                      <span className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1" />
                        Readability
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleTemplateSelect(template)}
                className="w-full"
                variant="primary"
              >
                Use This Template
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create Content: {selectedTemplate.name}
          </h2>
          <p className="text-gray-600">
            Fill in the details below. The template includes built-in SEO and AI optimization.
          </p>
        </div>
        <Button
          onClick={() => setSelectedTemplate(null)}
          variant="outline"
        >
          Change Template
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter compelling title with target keywords"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 30-60 characters for optimal SEO
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <Input
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="insights">Insights</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="news">News</option>
                  <option value="research">Research</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="Enter tags separated by commas"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default keywords from template: {selectedTemplate.seoDefaults.keywords.join(', ')}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
            
            <div>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Write your content here..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Template structure is pre-filled. Customize as needed while maintaining SEO optimization.
              </p>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Guide</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Required Sections</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedTemplate.structure.sections
                    .filter(section => section.required)
                    .map(section => (
                      <li key={section.id} className="flex items-center">
                        <span className="w-2 h-2 bg-red-400 rounded-full mr-2" />
                        {section.name}
                      </li>
                    ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">SEO Optimization</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Target keywords included</li>
                  <li>• Meta tags auto-generated</li>
                  <li>• Internal linking rules applied</li>
                  <li>• Structured data markup</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">AI Optimization</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedTemplate.aiOptimization.factExtraction && (
                    <li>• Automatic fact extraction</li>
                  )}
                  {selectedTemplate.aiOptimization.citationGeneration && (
                    <li>• Citation generation</li>
                  )}
                  {selectedTemplate.aiOptimization.readabilityOptimization && (
                    <li>• Readability optimization</li>
                  )}
                  {selectedTemplate.aiOptimization.structuredDataEnhancement && (
                    <li>• Enhanced structured data</li>
                  )}
                </ul>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleCreateContent}
              disabled={!formData.title || !formData.content || isCreating}
              className="w-full"
              variant="primary"
            >
              {isCreating ? 'Creating Content...' : 'Create Content'}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Content will be created in draft status and can be optimized before publishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};