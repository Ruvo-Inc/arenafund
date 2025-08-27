/**
 * AI Content System Usage Examples
 * Demonstrates how to use the AI-optimized content structure system
 */

import { aiContentSystem } from './ai-content-system';

/**
 * Example 1: Creating content from a template
 */
export function createInvestmentThesisExample() {
  const content = aiContentSystem.createContentFromTemplate(
    'investmentThesis',
    {
      'SPECIFIC FOCUS AREA': 'Enterprise AI Solutions',
      'SPECIFIC INVESTMENT AREA': 'B2B AI automation platforms',
      'SPECIFIC CRITERIA': 'proven revenue, enterprise customers, and scalable technology',
      'X': '50',
      'Y': '15',
      'stage': 'Series A and B',
      'Date': '2024'
    },
    { optimizeForAI: true }
  );
  
  return content;
}

/**
 * Example 2: Optimizing existing content
 */
export function optimizeExistingContentExample() {
  const existingContent = `
# Arena Fund Overview

Arena Fund is a venture capital firm that invests in artificial intelligence companies. 
We focus on enterprise solutions and have a portfolio of innovative startups.

Our team has experience in AI and machine learning. We provide capital and strategic guidance 
to help companies scale their operations.

Since our founding, we have made investments in various sectors including healthcare, 
finance, and enterprise software.
  `.trim();

  const sources = [
    'https://arenafund.com/about',
    'https://arenafund.com/portfolio'
  ];

  const result = aiContentSystem.optimizeContent(existingContent, sources);
  
  return {
    originalContent: existingContent,
    optimizedContent: result.formattedContent,
    readabilityScore: result.readabilityMetrics.overallScore,
    recommendations: result.recommendations,
    extractedFacts: result.optimizedContent.structuredFacts
  };
}

/**
 * Example 3: Creating a company profile
 */
export function createCompanyProfileExample() {
  const content = aiContentSystem.createContentFromTemplate(
    'companyProfile',
    {
      'COMPANY NAME': 'TechCorp AI',
      'stage': 'Series A',
      'industry': 'enterprise AI',
      'year': '2020',
      'Location': 'San Francisco, CA',
      'Number': '50',
      'Amount': '10M',
      'specific solution': 'automated document processing',
      'target market': 'Fortune 500 companies',
      'delivery method': 'cloud-based SaaS platform',
      'revenue model': 'subscription-based pricing',
      'amount': '2M',
      'Company': 'TechCorp AI',
      'round type': 'Series A',
      'date': 'March 2023',
      'Date': '2024'
    }
  );
  
  return content;
}

/**
 * Example 4: Analyzing content quality
 */
export function analyzeContentQualityExample() {
  const content = `
# AI Investment Trends

Maybe AI companies are getting more funding these days. There are various startups 
working on different things. Some of them might be successful.

We think that enterprise AI could be important. Several companies are doing well, 
but it's hard to say exactly how much they've raised.
  `.trim();

  const analysis = aiContentSystem.analyzeContent(content);
  
  return {
    readabilityScore: analysis.readabilityScore,
    optimizationLevel: analysis.aiOptimizationLevel,
    suggestions: analysis.suggestions,
    detailedReport: analysis.detailedReport
  };
}

/**
 * Example 5: Creating facts with citations
 */
export function createFactsWithCitationsExample() {
  const facts = [
    {
      statement: 'Arena Fund has invested in 25 enterprise AI companies since 2020',
      sources: ['https://arenafund.com/portfolio', 'https://arenafund.com/annual-report-2023']
    },
    {
      statement: 'The enterprise AI market is expected to reach $50 billion by 2025',
      sources: ['https://research.gartner.com/ai-market-forecast', 'https://mckinsey.com/ai-enterprise-report']
    },
    {
      statement: 'Arena Fund focuses on Series A and B investments ranging from $2M to $10M',
      sources: ['https://arenafund.com/investment-criteria']
    }
  ];

  const citedFacts = facts.map(fact => 
    aiContentSystem.createFactWithCitations(fact.statement, fact.sources)
  );

  return citedFacts.join('\n\n');
}

/**
 * Example 6: Comprehensive content optimization workflow
 */
export function comprehensiveOptimizationWorkflow() {
  // Step 1: Create initial content from template
  const initialContent = aiContentSystem.createContentFromTemplate(
    'marketInsight',
    {
      'INSIGHT TITLE': 'Enterprise AI Adoption Accelerates in 2024',
      'topic': 'enterprise AI adoption rates',
      'data source/methodology': 'survey of 500 Fortune 1000 companies',
      'time period': 'Q1-Q3 2024',
      'Specific finding with data': 'Enterprise AI adoption increased 45% year-over-year',
      'Research method': 'Quantitative survey and qualitative interviews',
      'Number': '500 companies',
      'Dates': 'January - September 2024',
      'Percentage': '95%',
      'specific action/strategy': 'increased focus on AI infrastructure investments',
      'target audience': 'enterprise technology leaders',
      'Date': '2024',
      'List of sources': 'Fortune 1000 survey data, McKinsey AI Report 2024, Gartner Enterprise AI Forecast'
    }
  );

  // Step 2: Optimize the content
  const sources = [
    'https://arenafund.com/research/enterprise-ai-2024',
    'https://mckinsey.com/ai-report-2024',
    'https://gartner.com/enterprise-ai-forecast'
  ];

  const optimizationResult = aiContentSystem.optimizeContent(initialContent, sources);

  // Step 3: Generate comprehensive report
  const report = aiContentSystem.generateOptimizationReport(initialContent, sources);

  return {
    initialContent,
    optimizedContent: optimizationResult.formattedContent,
    readabilityMetrics: optimizationResult.readabilityMetrics,
    extractedFacts: optimizationResult.optimizedContent.structuredFacts,
    recommendations: optimizationResult.recommendations,
    comprehensiveReport: report
  };
}

/**
 * Example 7: Validation workflow
 */
export function contentValidationWorkflow() {
  const contents = [
    {
      name: 'Good Content',
      content: `
# Arena Fund Investment Strategy

**FACT:** Arena Fund invests $2M to $10M in Series A and B enterprise AI companies.

## Market Focus

**DATA:** The enterprise AI market reached $15.7 billion in 2023 and is growing at 35% annually.

### Investment Criteria

• Revenue: $1M+ annually
• Market: Enterprise customers (Fortune 500)
• Technology: Proven AI solutions with measurable ROI
• Team: Experienced founders with domain expertise

[REF:cite-1] Arena Fund Portfolio Analysis, 2024
      `.trim()
    },
    {
      name: 'Poor Content',
      content: `
We maybe invest in some AI companies that might be good. There are various opportunities 
in the market and we think some of them could be successful. Our team has experience 
and we provide capital to startups.
      `.trim()
    }
  ];

  const validationResults = contents.map(({ name, content }) => {
    const validation = aiContentSystem.validateContent(content);
    const analysis = aiContentSystem.analyzeContent(content);
    
    return {
      name,
      isValid: validation.isValid,
      score: validation.score,
      issues: validation.issues,
      optimizationLevel: analysis.aiOptimizationLevel,
      suggestions: analysis.suggestions.slice(0, 3) // Top 3 suggestions
    };
  });

  return validationResults;
}

// Export all examples for easy testing
export const examples = {
  createInvestmentThesis: createInvestmentThesisExample,
  optimizeExistingContent: optimizeExistingContentExample,
  createCompanyProfile: createCompanyProfileExample,
  analyzeContentQuality: analyzeContentQualityExample,
  createFactsWithCitations: createFactsWithCitationsExample,
  comprehensiveOptimization: comprehensiveOptimizationWorkflow,
  contentValidation: contentValidationWorkflow
};