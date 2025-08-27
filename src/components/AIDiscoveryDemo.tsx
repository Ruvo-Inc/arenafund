'use client';

import React, { useState } from 'react';
import { AIDiscoveryIntegration, ComprehensiveAIOptimization } from '../lib/ai-discovery-integration';

/**
 * AI Discovery Optimization Demo Component
 * 
 * Demonstrates the AI discovery optimization tools in action
 */
export default function AIDiscoveryDemo() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [optimization, setOptimization] = useState<ComprehensiveAIOptimization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!content.trim() || !title.trim()) {
      setError('Please provide both title and content');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await AIDiscoveryIntegration.optimizeContent(
        content,
        title,
        {
          enableFactVerification: true,
          enableTrainingOptimization: true,
          enableKnowledgeBase: true,
          contentType: 'company_info',
          knowledgeCategory: 'company_overview'
        }
      );

      setOptimization(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeArenaFund = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await AIDiscoveryIntegration.optimizeArenaFundContent();
      if (results.length > 0) {
        setOptimization(results[0]); // Show first result
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          AI Discovery Optimization Demo
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Test the AI discovery optimization tools that structure content for AI model consumption,
          training data optimization, fact verification, and knowledge base creation.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Content Input</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter content title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter content to optimize for AI discovery..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleOptimize}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Optimizing...' : 'Optimize Content'}
            </button>

            <button
              onClick={handleOptimizeArenaFund}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Optimizing...' : 'Demo Arena Fund Content'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {optimization && (
        <div className="space-y-6">
          {/* Optimization Score */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Optimization Score</h2>
            <div className="flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${optimization.optimizationScore}%` }}
                ></div>
              </div>
              <span className="ml-4 text-lg font-semibold">
                {optimization.optimizationScore.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* AI-Structured Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">AI-Structured Content</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700">AI Readability Score:</h3>
                <p className="text-lg">{optimization.structuredContent.readabilityScore.toFixed(1)}/100</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Structured Facts:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {optimization.structuredContent.structuredFacts.map((fact, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">[{fact.category.toUpperCase()}]</span> {fact.statement}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-700">AI-Optimized Format:</h3>
                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                  {optimization.structuredContent.aiReadableFormat}
                </pre>
              </div>
            </div>
          </div>

          {/* Fact Verification */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Fact Verification Results</h2>
            <div className="space-y-3">
              {optimization.verificationResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      result.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className="text-sm text-gray-600">
                      Confidence: {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm font-medium">{result.fact.statement}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Category: {result.fact.category}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Training Data */}
          {optimization.trainingData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Training Data Optimization</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Quality Score:</h3>
                  <p className="text-lg">{optimization.trainingData.quality_score}/100</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700">Optimized Content:</h3>
                  <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
                    {optimization.trainingData.content}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700">Metadata:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Domain:</span> {optimization.trainingData.metadata.domain}
                    </div>
                    <div>
                      <span className="font-medium">Content Type:</span> {optimization.trainingData.metadata.content_type}
                    </div>
                    <div>
                      <span className="font-medium">Factual Accuracy:</span> {(optimization.trainingData.metadata.factual_accuracy * 100).toFixed(1)}%
                    </div>
                    <div>
                      <span className="font-medium">Keywords:</span> {optimization.trainingData.metadata.keywords.join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Entries */}
          {optimization.faqEntries.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Generated FAQ Entries</h2>
              <div className="space-y-4">
                {optimization.faqEntries.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-700 mb-2">{faq.answer}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Category: {faq.category}</span>
                      <span>Confidence: {(faq.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Training Examples */}
          {optimization.trainingExamples.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Training Q&A Examples</h2>
              <div className="space-y-4">
                {optimization.trainingExamples.map((example, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="mb-2">
                      <h3 className="font-medium text-gray-900">Q: {example.input}</h3>
                      <p className="text-gray-700 mt-1">A: {example.output}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Context: {example.context}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}