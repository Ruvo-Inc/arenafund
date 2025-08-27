/**
 * Arena Fund Icon Showcase
 * 
 * Demonstrates all custom B2B AI icons with interactive examples
 * and usage documentation.
 */

'use client';

import React, { useState } from 'react';
import { colors } from '../../styles/design-tokens';
import {
  ArenaFundIcons,
  NeuralNetworkIcon,
  AIProcessingIcon,
  MachineLearningIcon,
  ValidationCheckIcon,
  DataValidationIcon,
  QualityAssuranceIcon,
  WorkflowIcon,
  ProcessAutomationIcon,
  EnterpriseIntegrationIcon,
  AnalyticsIcon,
  InsightsIcon,
  MetricsIcon,
  InvestmentIcon,
  PortfolioIcon,
  ROIIcon,
  SecurityIcon,
  ComplianceIcon,
  AuditIcon,
  CollaborationIcon,
  CommunicationIcon,
  FeedbackIcon,
  ProgressIcon,
  StatusIcon,
} from './Icons';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import Button from '../Button';

interface IconDemoProps {
  name: string;
  component: React.ComponentType<any>;
  description: string;
  category: string;
  useCases: string[];
}

const iconDemos: IconDemoProps[] = [
  // Neural Network & AI
  {
    name: 'NeuralNetworkIcon',
    component: NeuralNetworkIcon,
    description: 'Represents neural network architecture and deep learning concepts',
    category: 'AI & Machine Learning',
    useCases: ['AI model visualization', 'Deep learning features', 'Neural network diagrams']
  },
  {
    name: 'AIProcessingIcon',
    component: AIProcessingIcon,
    description: 'Shows AI processing and computational workflows',
    category: 'AI & Machine Learning',
    useCases: ['AI computation status', 'Processing indicators', 'Data flow visualization']
  },
  {
    name: 'MachineLearningIcon',
    component: MachineLearningIcon,
    description: 'Illustrates machine learning curves and predictive analytics',
    category: 'AI & Machine Learning',
    useCases: ['ML model performance', 'Learning curves', 'Predictive analytics']
  },
  
  // Validation
  {
    name: 'ValidationCheckIcon',
    component: ValidationCheckIcon,
    description: 'Security-focused validation with shield and checkmark',
    category: 'Validation & Quality',
    useCases: ['Data validation success', 'Security verification', 'Quality assurance']
  },
  {
    name: 'DataValidationIcon',
    component: DataValidationIcon,
    description: 'Data table validation with quality indicators',
    category: 'Validation & Quality',
    useCases: ['Data quality checks', 'Table validation', 'Data integrity']
  },
  {
    name: 'QualityAssuranceIcon',
    component: QualityAssuranceIcon,
    description: 'Quality badge with star rating system',
    category: 'Validation & Quality',
    useCases: ['Quality metrics', 'Certification badges', 'Excellence indicators']
  },
  
  // Enterprise Workflow
  {
    name: 'WorkflowIcon',
    component: WorkflowIcon,
    description: 'Business process flow with connected steps',
    category: 'Enterprise Workflow',
    useCases: ['Process visualization', 'Workflow management', 'Business processes']
  },
  {
    name: 'ProcessAutomationIcon',
    component: ProcessAutomationIcon,
    description: 'Automated processes with gear mechanisms',
    category: 'Enterprise Workflow',
    useCases: ['Automation features', 'Process optimization', 'Workflow automation']
  },
  {
    name: 'EnterpriseIntegrationIcon',
    component: EnterpriseIntegrationIcon,
    description: 'System integration hub with connected components',
    category: 'Enterprise Workflow',
    useCases: ['System integrations', 'API connections', 'Enterprise architecture']
  },
  
  // Business Intelligence
  {
    name: 'AnalyticsIcon',
    component: AnalyticsIcon,
    description: 'Data analytics with charts and trend lines',
    category: 'Business Intelligence',
    useCases: ['Analytics dashboards', 'Data visualization', 'Performance metrics']
  },
  {
    name: 'InsightsIcon',
    component: InsightsIcon,
    description: 'Business insights represented as illuminated data points',
    category: 'Business Intelligence',
    useCases: ['Business insights', 'Data discoveries', 'Intelligence reports']
  },
  {
    name: 'MetricsIcon',
    component: MetricsIcon,
    description: 'Dashboard with multiple metric cards and mini charts',
    category: 'Business Intelligence',
    useCases: ['KPI dashboards', 'Metric tracking', 'Performance monitoring']
  },
  
  // Investment & Finance
  {
    name: 'InvestmentIcon',
    component: InvestmentIcon,
    description: 'Investment growth chart with dollar indicators',
    category: 'Investment & Finance',
    useCases: ['Investment tracking', 'Portfolio growth', 'Financial performance']
  },
  {
    name: 'PortfolioIcon',
    component: PortfolioIcon,
    description: 'Investment portfolio with diversified segments',
    category: 'Investment & Finance',
    useCases: ['Portfolio management', 'Asset allocation', 'Investment diversity']
  },
  {
    name: 'ROIIcon',
    component: ROIIcon,
    description: 'Return on investment with circular progress and growth arrow',
    category: 'Investment & Finance',
    useCases: ['ROI tracking', 'Investment returns', 'Performance indicators']
  },
  
  // Security & Compliance
  {
    name: 'SecurityIcon',
    component: SecurityIcon,
    description: 'Security shield with lock and verification indicators',
    category: 'Security & Compliance',
    useCases: ['Security features', 'Data protection', 'Access control']
  },
  {
    name: 'ComplianceIcon',
    component: ComplianceIcon,
    description: 'Compliance document with checkmarks and certification seal',
    category: 'Security & Compliance',
    useCases: ['Regulatory compliance', 'Audit documentation', 'Certification status']
  },
  {
    name: 'AuditIcon',
    component: AuditIcon,
    description: 'Audit process with magnifying glass and finding indicators',
    category: 'Security & Compliance',
    useCases: ['Audit processes', 'Compliance reviews', 'Quality inspections']
  },
  
  // Communication & Collaboration
  {
    name: 'CollaborationIcon',
    component: CollaborationIcon,
    description: 'Team collaboration with connected people and shared workspace',
    category: 'Communication & Collaboration',
    useCases: ['Team collaboration', 'Shared workspaces', 'Group projects']
  },
  {
    name: 'CommunicationIcon',
    component: CommunicationIcon,
    description: 'Communication flow with speech bubbles and response indicators',
    category: 'Communication & Collaboration',
    useCases: ['Messaging features', 'Communication tools', 'Feedback systems']
  },
  {
    name: 'FeedbackIcon',
    component: FeedbackIcon,
    description: 'Feedback loop with rating system and continuous improvement',
    category: 'Communication & Collaboration',
    useCases: ['Feedback collection', 'Rating systems', 'Continuous improvement']
  },
  
  // Status & Progress
  {
    name: 'ProgressIcon',
    component: ProgressIcon,
    description: 'Progress tracking with percentage and completion indicators',
    category: 'Status & Progress',
    useCases: ['Progress tracking', 'Task completion', 'Project status']
  },
  {
    name: 'StatusIcon',
    component: StatusIcon,
    description: 'Status indicator with multiple states (success, warning, error, info, pending)',
    category: 'Status & Progress',
    useCases: ['Status indicators', 'Alert states', 'System health']
  },
];

const categories = Array.from(new Set(iconDemos.map(icon => icon.category)));

export const IconShowcase: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<number>(24);
  const [selectedColor, setSelectedColor] = useState<string>(colors.gray[600]);

  const filteredIcons = selectedCategory === 'All' 
    ? iconDemos 
    : iconDemos.filter(icon => icon.category === selectedCategory);

  const colorOptions = [
    { name: 'Primary', value: colors.gray[600] },
    { name: 'Secondary', value: colors.gray[400] },
    { name: 'Success', value: colors.success[500] },
    { name: 'Warning', value: colors.warning[500] },
    { name: 'Error', value: colors.error[500] },
    { name: 'Info', value: colors.blue[500] },
          { name: 'Navy', value: colors.navy[600] },
  ];

  const sizeOptions = [16, 20, 24, 32, 48, 64];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Arena Fund Icon Library</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Custom SVG icons designed specifically for B2B AI concepts, enterprise workflows, 
          and financial applications. All icons are scalable, accessible, and consistent 
          with Arena Fund's visual identity.
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Customization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Size Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size: {selectedSize}px
              </label>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map(size => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Control */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color.value ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Icon Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIcons.map((iconDemo) => {
          const IconComponent = iconDemo.component;
          
          return (
            <Card key={iconDemo.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  {/* Icon Display */}
                  <div className="flex justify-center items-center h-20">
                    <IconComponent 
                      size={selectedSize} 
                      color={selectedColor}
                      aria-label={iconDemo.description}
                    />
                  </div>
                  
                  {/* Icon Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900">{iconDemo.name}</h3>
                    <p className="text-sm text-gray-600">{iconDemo.description}</p>
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                      {iconDemo.category}
                    </div>
                  </div>
                  
                  {/* Use Cases */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Use Cases
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {iconDemo.useCases.map((useCase, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Code Example */}
                  <details className="text-left">
                    <summary className="text-xs font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                      Show Code
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
{`import { ${iconDemo.name} } from '@/components/ui';

<${iconDemo.name} 
  size={${selectedSize}} 
  color="${selectedColor}"
  aria-label="${iconDemo.description}"
/>`}
                    </pre>
                  </details>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Icon Special Demo */}
      <Card>
        <CardHeader>
          <CardTitle>StatusIcon Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(['success', 'warning', 'error', 'info', 'pending'] as const).map(status => (
              <div key={status} className="text-center space-y-2">
                <div className="flex justify-center">
                  <StatusIcon status={status} size={selectedSize} />
                </div>
                <div className="text-sm font-medium capitalize">{status}</div>
                <pre className="text-xs bg-gray-100 p-2 rounded">
{`<StatusIcon 
  status="${status}" 
  size={${selectedSize}} 
/>`}
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Accessibility</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Always provide meaningful aria-label attributes</li>
                <li>• Use aria-hidden="true" for decorative icons</li>
                <li>• Ensure sufficient color contrast (4.5:1 minimum)</li>
                <li>• Don't rely solely on color to convey information</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Practices</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use consistent sizing within interface sections</li>
                <li>• Align icons with text baselines when inline</li>
                <li>• Choose appropriate icons for context</li>
                <li>• Test icons at different sizes and backgrounds</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Import Examples</h3>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto">
{`// Import individual icons
import { NeuralNetworkIcon, ValidationCheckIcon } from '@/components/ui';

// Import all icons as a collection
import { ArenaFundIcons } from '@/components/ui';

// Use with custom props
<NeuralNetworkIcon 
  size={32} 
  color="#1e3a8a" 
  className="mr-2"
  aria-label="Neural network processing"
/>

// Access from collection
<ArenaFundIcons.AnalyticsIcon size={24} />`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IconShowcase;