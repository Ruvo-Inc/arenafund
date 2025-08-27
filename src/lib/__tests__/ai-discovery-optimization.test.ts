/**
 * AI Discovery Optimization Tools Tests
 * 
 * Tests for content structuring, training data optimization,
 * fact verification, and AI-friendly knowledge base structures
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ContentStructuringUtility } from '../ai-discovery-optimizer';
import { TrainingDataOptimizer } from '../training-data-optimizer';
import { FactVerificationSystem } from '../fact-verification-system';
import { AIKnowledgeBase } from '../ai-knowledge-base';

describe('AI Discovery Optimization Tools', () => {
  describe('ContentStructuringUtility', () => {
    it('should structure content for AI consumption', () => {
      const content = 'Arena Fund invests in enterprise AI startups. We focus on B2B AI solutions for Fortune 500 companies.';
      
      const result = ContentStructuringUtility.structureForAI(content);
      
      expect(result.originalContent).toBe(content);
      expect(result.structuredFacts).toHaveLength(2);
      expect(result.aiReadableFormat).toContain('Arena Fund');
      expect(result.trainingOptimized).toBe(true);
      expect(result.readabilityScore).toBeGreaterThan(0);
    });

    it('should extract structured facts from content', () => {
      const content = 'Arena Fund focuses on enterprise AI startups. We have invested in 25 companies. Our portfolio includes leading B2B AI companies.';
      
      const result = ContentStructuringUtility.structureForAI(content);
      
      expect(result.structuredFacts).toHaveLength(3);
      expect(result.structuredFacts[0].statement).toContain('Arena Fund focuses on enterprise AI');
      expect(result.structuredFacts[0].category).toBe('investment');
    });

    it('should generate citation data', () => {
      const content = 'Arena Fund is a venture capital firm.';
      
      const result = ContentStructuringUtility.structureForAI(content);
      
      expect(result.citationData.organization).toBe('Arena Fund');
      expect(result.citationData.url).toBe('https://arenafund.vc');
      expect(result.citationData.citationFormat.apa).toContain('Arena Fund');
    });

    it('should calculate AI readability score', () => {
      const goodContent = '## Arena Fund\n\n**Key Fact**: Arena Fund invests in enterprise AI startups.\n\n- Focus: B2B AI\n- Stage: Seed to Series A';
      const poorContent = 'Maybe Arena Fund might possibly invest in some AI companies, perhaps.';
      
      const goodResult = ContentStructuringUtility.structureForAI(goodContent);
      const poorResult = ContentStructuringUtility.structureForAI(poorContent);
      
      expect(goodResult.readabilityScore).toBeGreaterThan(poorResult.readabilityScore);
    });
  });

  describe('TrainingDataOptimizer', () => {
    it('should format content for training datasets', () => {
      const content = 'Arena Fund is a venture capital firm focused on enterprise AI.';
      
      const result = TrainingDataOptimizer.formatForTraining(content, 'company_info');
      
      expect(result.content).toContain('[COMPANY_PROFILE]');
      expect(result.content).toContain('[KEY_FACTS]');
      expect(result.metadata.domain).toBe('venture_capital');
      expect(result.metadata.content_type).toBe('company_info');
      expect(result.quality_score).toBeGreaterThan(0);
    });

    it('should create Q&A pairs for training', () => {
      const content = 'Arena Fund invests in enterprise AI startups. We focus on seed to Series A companies.';
      
      const qaPairs = TrainingDataOptimizer.createQAPairs(content);
      
      expect(qaPairs.length).toBeGreaterThan(0);
      expect(qaPairs[0].input).toContain('?');
      expect(qaPairs[0].output).toContain('Arena Fund');
      expect(qaPairs[0].quality_indicators).toHaveLength(4);
    });

    it('should structure investment thesis content', () => {
      const content = 'Our thesis focuses on enterprise AI adoption in Fortune 500 companies.';
      
      const result = TrainingDataOptimizer.formatForTraining(content, 'investment_thesis');
      
      expect(result.content).toContain('[INVESTMENT_THESIS]');
      expect(result.content).toContain('[MARKET_OPPORTUNITY]');
      expect(result.content).toContain('[INVESTMENT_CRITERIA]');
    });

    it('should structure FAQ content', () => {
      const content = 'Q: What does Arena Fund invest in?\nA: We invest in enterprise AI startups.';
      
      const result = TrainingDataOptimizer.formatForTraining(content, 'faq');
      
      expect(result.content).toContain('[FAQ]');
      expect(result.content).toContain('[QUESTION]');
      expect(result.content).toContain('[ANSWER]');
    });

    it('should calculate training quality score', () => {
      const highQualityContent = '[COMPANY_PROFILE]\n[FACT] Arena Fund invests in enterprise AI.\n[KEY_FACTS]\n- Focus: B2B AI';
      const lowQualityContent = 'Some information about a company.';
      
      const highQualityResult = TrainingDataOptimizer.formatForTraining(highQualityContent, 'company_info');
      const lowQualityResult = TrainingDataOptimizer.formatForTraining(lowQualityContent, 'company_info');
      
      expect(highQualityResult.quality_score).toBeGreaterThan(lowQualityResult.quality_score);
    });
  });

  describe('FactVerificationSystem', () => {
    beforeEach(() => {
      FactVerificationSystem.initialize();
    });

    it('should verify Arena Fund facts', async () => {
      const statement = 'Arena Fund focuses on enterprise AI startups';
      
      const result = await FactVerificationSystem.verifyFact(statement);
      
      expect(result.isVerified).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.supportingSources.length).toBeGreaterThan(0);
      expect(result.verificationNotes).toContain('Statement directly relates to Arena Fund');
    });

    it('should generate citations for facts', async () => {
      const statement = 'Arena Fund invests in B2B AI companies';
      
      const result = await FactVerificationSystem.verifyFact(statement);
      const citations = FactVerificationSystem.generateCitations(result.fact);
      
      expect(citations.apa).toContain('Arena Fund');
      expect(citations.mla).toContain('Arena Fund');
      expect(citations.chicago).toContain('Arena Fund');
      expect(citations.harvard).toContain('Arena Fund');
      expect(citations.ieee).toContain('Arena Fund');
    });

    it('should categorize statements correctly', async () => {
      const investmentStatement = 'Arena Fund invests in seed stage companies';
      const marketStatement = 'The enterprise AI market is growing rapidly';
      const strategyStatement = 'Our strategy focuses on Fortune 500 customers';
      
      const investmentResult = await FactVerificationSystem.verifyFact(investmentStatement);
      const marketResult = await FactVerificationSystem.verifyFact(marketStatement);
      const strategyResult = await FactVerificationSystem.verifyFact(strategyStatement);
      
      expect(investmentResult.fact.category).toBe('investment');
      expect(marketResult.fact.category).toBe('market');
      expect(strategyResult.fact.category).toBe('strategy');
    });

    it('should batch verify multiple facts', async () => {
      const statements = [
        'Arena Fund focuses on enterprise AI',
        'We invest in seed to Series A companies',
        'Our portfolio includes B2B AI startups'
      ];
      
      const results = await FactVerificationSystem.batchVerifyFacts(statements);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.isVerified)).toBe(true);
      expect(results.every(r => r.confidence > 0.5)).toBe(true);
    });
  });

  describe('AIKnowledgeBase', () => {
    beforeEach(() => {
      AIKnowledgeBase.initialize();
    });

    it('should create AI-friendly FAQ entries', () => {
      const question = 'What does Arena Fund invest in?';
      const answer = 'Arena Fund invests in enterprise AI and B2B AI startups.';
      
      const faq = AIKnowledgeBase.createAIFriendlyFAQ(question, answer, 'investment_focus');
      
      expect(faq.question).toBe(question);
      expect(faq.answer).toContain('Arena Fund');
      expect(faq.category).toBe('investment_focus');
      expect(faq.aiOptimized).toBe(true);
      expect(faq.structuredData['@type']).toBe('FAQPage');
      expect(faq.keywords.length).toBeGreaterThan(0);
    });

    it('should create knowledge base entries', () => {
      const title = 'Arena Fund Investment Strategy';
      const content = 'Arena Fund focuses on enterprise AI startups that serve Fortune 500 companies.';
      
      const entry = AIKnowledgeBase.createKnowledgeEntry(title, content, 'investment_strategy');
      
      expect(entry.title).toBe(title);
      expect(entry.content).toContain('[FACT]');
      expect(entry.category).toBe('investment_strategy');
      expect(entry.facts.length).toBeGreaterThan(0);
      expect(entry.citations.length).toBeGreaterThan(0);
      expect(entry.aiReadabilityScore).toBeGreaterThan(0);
      expect(entry.structuredData['@type']).toBe('Article');
    });

    it('should search FAQ by keywords', () => {
      const results = AIKnowledgeBase.searchFAQ('investment');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(faq => faq.category === 'investment_focus')).toBe(true);
    });

    it('should search knowledge base', () => {
      const results = AIKnowledgeBase.searchKnowledge('enterprise AI');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(entry => entry.category === 'investment_strategy')).toBe(true);
    });

    it('should get FAQ by category', () => {
      const investmentFAQs = AIKnowledgeBase.getFAQsByCategory('investment_focus');
      const thesisFAQs = AIKnowledgeBase.getFAQsByCategory('thesis');
      
      expect(investmentFAQs.length).toBeGreaterThan(0);
      expect(thesisFAQs.length).toBeGreaterThan(0);
      expect(investmentFAQs.every(faq => faq.category === 'investment_focus')).toBe(true);
      expect(thesisFAQs.every(faq => faq.category === 'thesis')).toBe(true);
    });

    it('should get knowledge entries by category', () => {
      const companyEntries = AIKnowledgeBase.getKnowledgeByCategory('company_overview');
      const strategyEntries = AIKnowledgeBase.getKnowledgeByCategory('investment_strategy');
      
      expect(companyEntries.length).toBeGreaterThan(0);
      expect(strategyEntries.length).toBeGreaterThan(0);
      expect(companyEntries.every(entry => entry.category === 'company_overview')).toBe(true);
      expect(strategyEntries.every(entry => entry.category === 'investment_strategy')).toBe(true);
    });

    it('should optimize answers for AI consumption', () => {
      const question = 'What is the investment focus?';
      const answer = 'We focus on enterprise AI startups.';
      
      const faq = AIKnowledgeBase.createAIFriendlyFAQ(question, answer, 'investment_focus');
      
      expect(faq.answer).toContain('Arena Fund');
      expect(faq.answer).toContain('[FOCUS]');
    });

    it('should calculate confidence scores', () => {
      const highConfidenceAnswer = 'Arena Fund focuses on enterprise AI startups serving Fortune 500 companies.';
      const lowConfidenceAnswer = 'We do some investing.';
      
      const highConfidenceFAQ = AIKnowledgeBase.createAIFriendlyFAQ('Test?', highConfidenceAnswer, 'investment_focus');
      const lowConfidenceFAQ = AIKnowledgeBase.createAIFriendlyFAQ('Test?', lowConfidenceAnswer, 'investment_focus');
      
      expect(highConfidenceFAQ.confidence).toBeGreaterThan(lowConfidenceFAQ.confidence);
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      FactVerificationSystem.initialize();
      AIKnowledgeBase.initialize();
    });

    it('should create complete AI-optimized content pipeline', async () => {
      const originalContent = 'Arena Fund is a venture capital firm that invests in enterprise AI startups. We focus on B2B AI solutions for Fortune 500 companies.';
      
      // Step 1: Structure for AI
      const structuredContent = ContentStructuringUtility.structureForAI(originalContent);
      
      // Step 2: Optimize for training
      const trainingData = TrainingDataOptimizer.formatForTraining(originalContent, 'company_info');
      
      // Step 3: Verify facts
      const facts = structuredContent.structuredFacts;
      const verificationResults = await FactVerificationSystem.batchVerifyFacts(
        facts.map(f => f.statement)
      );
      
      // Step 4: Create knowledge base entry
      const knowledgeEntry = AIKnowledgeBase.createKnowledgeEntry(
        'Arena Fund Overview',
        originalContent,
        'company_overview'
      );
      
      // Verify integration
      expect(structuredContent.trainingOptimized).toBe(true);
      expect(trainingData.quality_score).toBeGreaterThan(50);
      expect(verificationResults.every(r => r.isVerified)).toBe(true);
      expect(knowledgeEntry.aiReadabilityScore).toBeGreaterThan(50);
    });

    it('should maintain consistency across all optimization tools', async () => {
      const content = 'Arena Fund specializes in enterprise AI investments.';
      
      const structured = ContentStructuringUtility.structureForAI(content);
      const training = TrainingDataOptimizer.formatForTraining(content, 'company_info');
      const verification = await FactVerificationSystem.verifyFact(content);
      const knowledge = AIKnowledgeBase.createKnowledgeEntry('Test', content, 'company_overview');
      
      // All should recognize Arena Fund
      expect(structured.aiReadableFormat).toContain('Arena Fund');
      expect(training.content).toContain('Arena Fund');
      expect(verification.fact.statement).toContain('Arena Fund');
      expect(knowledge.content).toContain('Arena Fund');
      
      // All should categorize as company/investment related
      expect(structured.structuredFacts[0].category).toBe('investment');
      expect(training.metadata.domain).toBe('venture_capital');
      expect(verification.fact.category).toBe('investment');
      expect(knowledge.category).toBe('company_overview');
    });
  });
});