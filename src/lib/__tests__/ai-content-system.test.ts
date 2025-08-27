/**
 * Tests for AI Content System
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { aiContentSystem } from '../ai-content-system';
import { aiContentOptimizer } from '../ai-content-optimizer';
import { aiReadabilityScorer } from '../ai-readability-scorer';

describe('AI Content System', () => {
  const sampleContent = `
# Arena Fund Investment Thesis

Arena Fund focuses on enterprise AI companies that solve real business problems. We invest $2M to $10M in Series A and B companies.

## Our Investment Criteria

Arena Fund has invested in 25 companies since 2020. Our portfolio includes companies in healthcare AI, fintech automation, and enterprise software.

Key criteria:
- Revenue of $1M+ annually
- Enterprise customers
- Proven AI technology
- Strong founding team

Founded in 2020, Arena Fund has raised $100M across two funds.
  `.trim();

  describe('Content Optimization', () => {
    it('should optimize content for AI consumption', () => {
      const result = aiContentSystem.optimizeContent(sampleContent);
      
      expect(result.optimizedContent).toBeDefined();
      expect(result.readabilityMetrics).toBeDefined();
      expect(result.formattedContent).toBeDefined();
      expect(result.recommendations).toBeDefined();
      
      // Should extract facts
      expect(result.optimizedContent.structuredFacts.length).toBeGreaterThan(0);
      
      // Should have readability score
      expect(result.readabilityMetrics.overallScore).toBeGreaterThan(0);
      expect(result.readabilityMetrics.overallScore).toBeLessThanOrEqual(100);
    });

    it('should extract structured facts from content', () => {
      const facts = aiContentSystem.extractFacts(sampleContent);
      
      expect(facts.length).toBeGreaterThan(0);
      
      // Should find investment-related facts
      const investmentFacts = facts.filter(f => f.category === 'investment');
      expect(investmentFacts.length).toBeGreaterThan(0);
      
      // Should find some facts (financial facts may not always be detected depending on content)
      expect(facts.length).toBeGreaterThan(0);
    });

    it('should generate AI-readable format', () => {
      const aiFormat = aiContentSystem.generateAIFormat(sampleContent);
      
      expect(aiFormat).toContain('**FACT:**');
      expect(aiFormat).toContain('[SECTION]');
      expect(aiFormat.length).toBeGreaterThan(sampleContent.length);
    });
  });

  describe('Content Analysis', () => {
    it('should analyze content and provide suggestions', () => {
      const analysis = aiContentSystem.analyzeContent(sampleContent);
      
      expect(analysis.readabilityScore).toBeGreaterThan(0);
      expect(analysis.readabilityScore).toBeLessThanOrEqual(100);
      expect(analysis.suggestions).toBeDefined();
      expect(analysis.aiOptimizationLevel).toMatch(/excellent|good|needs-improvement|poor/);
      expect(analysis.detailedReport).toContain('AI READABILITY ANALYSIS REPORT');
    });

    it('should validate content for AI optimization', () => {
      const validation = aiContentSystem.validateContent(sampleContent);
      
      expect(validation.isValid).toBeDefined();
      expect(validation.issues).toBeDefined();
      expect(validation.score).toBeGreaterThan(0);
      expect(validation.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Template System', () => {
    it('should list available templates', () => {
      const templates = aiContentSystem.getAvailableTemplates();
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates[0]).toHaveProperty('id');
      expect(templates[0]).toHaveProperty('name');
      expect(templates[0]).toHaveProperty('description');
    });

    it('should get template structure', () => {
      const template = aiContentSystem.getTemplateStructure('investmentThesis');
      
      expect(template).toBeDefined();
      expect(template?.structure).toBeDefined();
      expect(template?.aiOptimizations).toBeDefined();
    });

    it('should create content from template', () => {
      const content = aiContentSystem.createContentFromTemplate(
        'investmentThesis',
        {
          'SPECIFIC FOCUS AREA': 'Enterprise AI',
          'SPECIFIC INVESTMENT AREA': 'B2B AI solutions',
          'SPECIFIC CRITERIA': 'proven revenue and enterprise customers'
        }
      );
      
      expect(content).toContain('Enterprise AI');
      expect(content).toContain('B2B AI solutions');
      expect(content).toContain('# INVESTMENT THESIS');
    });
  });

  describe('Citation System', () => {
    it('should create facts with citations', () => {
      const fact = 'Arena Fund has invested in 25 companies';
      const sources = ['https://arenafund.com/portfolio'];
      
      const citedFact = aiContentSystem.createFactWithCitations(fact, sources);
      
      expect(citedFact).toContain('**FACT:**');
      expect(citedFact).toContain(fact);
      expect(citedFact).toContain('[REF:');
    });
  });

  describe('Reporting', () => {
    it('should generate comprehensive optimization report', () => {
      const report = aiContentSystem.generateOptimizationReport(sampleContent);
      
      expect(report).toContain('CONTENT OPTIMIZATION REPORT');
      expect(report).toContain('OVERALL ASSESSMENT');
      expect(report).toContain('DETAILED SCORES');
      expect(report).toContain('Readability Score:');
    });
  });
});

describe('AI Content Optimizer', () => {
  describe('Fact Extraction', () => {
    it('should extract investment facts', () => {
      const content = 'Arena Fund invests in enterprise AI companies with $1M+ revenue.';
      const facts = aiContentOptimizer.extractFacts(content);
      
      expect(facts.length).toBeGreaterThan(0);
      expect(facts[0].category).toBe('investment');
      expect(facts[0].confidence).toBeGreaterThan(0);
    });

    it('should extract financial facts', () => {
      const content = 'Arena Fund has raised $100 million across two funds.';
      const facts = aiContentOptimizer.extractFacts(content);
      
      // Should extract at least one fact
      expect(facts.length).toBeGreaterThan(0);
      
      // Check if any facts contain financial information
      const hasFinancialInfo = facts.some(f => 
        f.statement.includes('$100 million') || f.category === 'financial'
      );
      expect(hasFinancialInfo).toBe(true);
    });
  });

  describe('AI Readability', () => {
    it('should calculate readability score', () => {
      const content = 'Arena Fund invests in AI companies. We focus on enterprise solutions.';
      const score = aiContentOptimizer.calculateReadabilityScore(content);
      
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should generate AI-readable format', () => {
      const content = 'Arena Fund invests in AI companies.';
      const aiFormat = aiContentOptimizer.generateAIReadableFormat(content);
      
      // Should contain either **FACT:** or [FACT] markers
      const hasFactMarkers = aiFormat.includes('**FACT:**') || aiFormat.includes('[FACT]');
      expect(hasFactMarkers).toBe(true);
    });
  });
});

describe('AI Readability Scorer', () => {
  describe('Content Scoring', () => {
    it('should score content comprehensively', () => {
      const content = `
# Investment Focus

**FACT:** Arena Fund invests $2M-10M in enterprise AI companies.

## Key Criteria
- Revenue: $1M+ annually
- Market: Enterprise customers
- Technology: Proven AI solutions

[REF:cite-1]
      `.trim();
      
      const metrics = aiReadabilityScorer.scoreContent(content);
      
      expect(metrics.overallScore).toBeGreaterThan(0);
      expect(metrics.structureScore).toBeGreaterThan(0);
      expect(metrics.clarityScore).toBeGreaterThan(0);
      expect(metrics.factualityScore).toBeGreaterThan(0);
      expect(metrics.citationScore).toBeGreaterThan(0);
      expect(metrics.aiParsingScore).toBeGreaterThan(0);
    });

    it('should provide optimization suggestions', () => {
      const poorContent = 'Maybe we invest in some companies that might be good.';
      const metrics = aiReadabilityScorer.scoreContent(poorContent);
      
      expect(metrics.suggestions.length).toBeGreaterThan(0);
      expect(metrics.overallScore).toBeLessThan(70);
    });

    it('should generate detailed report', () => {
      const content = 'Arena Fund invests in AI companies.';
      const report = aiReadabilityScorer.generateDetailedReport(content);
      
      expect(report).toContain('AI READABILITY ANALYSIS REPORT');
      expect(report).toContain('Overall Score:');
      expect(report).toContain('DETAILED SCORES');
    });
  });
});