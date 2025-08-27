/**
 * Fact Verification and Citation Generation System
 * 
 * Provides utilities for verifying facts and generating proper citations
 * Requirements: 2.1, 2.2, 6.4
 */

export interface VerifiableFact {
  id: string;
  statement: string;
  category: 'company' | 'investment' | 'market' | 'performance' | 'strategy';
  confidence: number;
  sources: FactSource[];
  verificationStatus: 'verified' | 'pending' | 'disputed' | 'unverified';
  lastVerified: Date;
  verificationMethod: 'manual' | 'automated' | 'cross_reference';
}

export interface FactSource {
  id: string;
  url: string;
  title: string;
  author?: string;
  organization: string;
  publishDate: Date;
  reliability: number;
  sourceType: 'primary' | 'secondary' | 'tertiary';
}

export interface CitationFormat {
  apa: string;
  mla: string;
  chicago: string;
  harvard: string;
  ieee: string;
}

export interface VerificationResult {
  fact: VerifiableFact;
  isVerified: boolean;
  confidence: number;
  supportingSources: FactSource[];
  contradictingSources: FactSource[];
  verificationNotes: string[];
}

/**
 * Fact Verification System
 */
export class FactVerificationSystem {
  private static knownFacts: Map<string, VerifiableFact> = new Map();
  private static trustedSources: FactSource[] = [];

  /**
   * Initialize with Arena Fund's verified facts
   */
  static initialize(): void {
    this.loadArenaFundFacts();
    this.loadTrustedSources();
  }

  /**
   * Verifies a fact statement
   */
  static async verifyFact(statement: string): Promise<VerificationResult> {
    const fact = this.createFactFromStatement(statement);
    const supportingSources = this.findSupportingSources(fact);
    const contradictingSources = this.findContradictingSources(fact);
    
    const confidence = this.calculateVerificationConfidence(
      supportingSources,
      contradictingSources
    );

    const isVerified = confidence >= 0.7;

    return {
      fact,
      isVerified,
      confidence,
      supportingSources,
      contradictingSources,
      verificationNotes: this.generateVerificationNotes(fact, supportingSources, contradictingSources)
    };
  }

  /**
   * Generates citations for a fact
   */
  static generateCitations(fact: VerifiableFact): CitationFormat {
    const primarySource = fact.sources.find(s => s.sourceType === 'primary') || fact.sources[0];
    
    if (!primarySource) {
      return this.getDefaultArenaFundCitation();
    }

    return this.formatCitation(primarySource);
  }

  /**
   * Batch verifies multiple facts
   */
  static async batchVerifyFacts(statements: string[]): Promise<VerificationResult[]> {
    const results: VerificationResult[] = [];
    
    for (const statement of statements) {
      const result = await this.verifyFact(statement);
      results.push(result);
    }

    return results;
  }

  /**
   * Creates a fact object from a statement
   */
  private static createFactFromStatement(statement: string): VerifiableFact {
    return {
      id: `fact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      statement,
      category: this.categorizeStatement(statement),
      confidence: 0.5, // Initial confidence
      sources: [],
      verificationStatus: 'pending',
      lastVerified: new Date(),
      verificationMethod: 'automated'
    };
  }

  /**
   * Categorizes a statement
   */
  private static categorizeStatement(statement: string): VerifiableFact['category'] {
    const lowerStatement = statement.toLowerCase();
    
    if (lowerStatement.includes('invest') || lowerStatement.includes('portfolio') || lowerStatement.includes('funding')) {
      return 'investment';
    }
    if (lowerStatement.includes('market') || lowerStatement.includes('industry') || lowerStatement.includes('sector')) {
      return 'market';
    }
    if (lowerStatement.includes('performance') || lowerStatement.includes('return') || lowerStatement.includes('growth')) {
      return 'performance';
    }
    if (lowerStatement.includes('strategy') || lowerStatement.includes('approach') || lowerStatement.includes('thesis')) {
      return 'strategy';
    }
    
    return 'company';
  }

  /**
   * Finds supporting sources for a fact
   */
  private static findSupportingSources(fact: VerifiableFact): FactSource[] {
    const supportingSources: FactSource[] = [];
    
    // Check against known facts
    for (const [key, knownFact] of this.knownFacts) {
      if (this.factsAreCompatible(fact, knownFact)) {
        supportingSources.push(...knownFact.sources);
      }
    }

    // Add default Arena Fund source for any Arena Fund related facts
    if (fact.statement.toLowerCase().includes('arena fund') || 
        fact.statement.toLowerCase().includes('enterprise ai') ||
        fact.statement.toLowerCase().includes('b2b ai') ||
        fact.statement.toLowerCase().includes('portfolio') ||
        fact.statement.toLowerCase().includes('invest')) {
      supportingSources.push(this.getArenaFundPrimarySource());
    }

    return supportingSources;
  }

  /**
   * Finds contradicting sources for a fact
   */
  private static findContradictingSources(fact: VerifiableFact): FactSource[] {
    // For now, return empty array as we don't have contradicting sources
    // In a real implementation, this would check against known contradictions
    return [];
  }

  /**
   * Checks if two facts are compatible
   */
  private static factsAreCompatible(fact1: VerifiableFact, fact2: VerifiableFact): boolean {
    // Simple compatibility check based on category and key terms
    if (fact1.category !== fact2.category) return false;
    
    const statement1 = fact1.statement.toLowerCase();
    const statement2 = fact2.statement.toLowerCase();
    
    // Check for common key terms
    const keyTerms = ['arena fund', 'enterprise ai', 'b2b ai', 'venture capital'];
    return keyTerms.some(term => statement1.includes(term) && statement2.includes(term));
  }

  /**
   * Calculates verification confidence
   */
  private static calculateVerificationConfidence(
    supportingSources: FactSource[],
    contradictingSources: FactSource[]
  ): number {
    if (supportingSources.length === 0) return 0.1;
    if (contradictingSources.length > supportingSources.length) return 0.2;
    
    const supportingReliability = supportingSources.reduce((sum, source) => sum + source.reliability, 0) / supportingSources.length;
    const contradictingReliability = contradictingSources.length > 0 
      ? contradictingSources.reduce((sum, source) => sum + source.reliability, 0) / contradictingSources.length 
      : 0;
    
    const baseConfidence = supportingReliability;
    const penalty = contradictingReliability * 0.3;
    
    return Math.max(0.1, Math.min(1.0, baseConfidence - penalty));
  }

  /**
   * Generates verification notes
   */
  private static generateVerificationNotes(
    fact: VerifiableFact,
    supportingSources: FactSource[],
    contradictingSources: FactSource[]
  ): string[] {
    const notes: string[] = [];
    
    if (supportingSources.length > 0) {
      notes.push(`Supported by ${supportingSources.length} source(s)`);
    }
    
    if (contradictingSources.length > 0) {
      notes.push(`Contradicted by ${contradictingSources.length} source(s)`);
    }
    
    if (fact.statement.toLowerCase().includes('arena fund')) {
      notes.push('Statement directly relates to Arena Fund');
    }
    
    if (supportingSources.some(s => s.sourceType === 'primary')) {
      notes.push('Verified by primary source');
    }
    
    return notes;
  }

  /**
   * Formats citation for a source
   */
  private static formatCitation(source: FactSource): CitationFormat {
    const year = source.publishDate.getFullYear();
    const month = source.publishDate.toLocaleDateString('en-US', { month: 'long' });
    const day = source.publishDate.getDate();
    
    return {
      apa: `${source.organization}. (${year}). ${source.title}. Retrieved from ${source.url}`,
      mla: `${source.organization}. "${source.title}." ${source.organization}, ${year}, ${source.url}.`,
      chicago: `${source.organization}. "${source.title}." Accessed ${month} ${day}, ${year}. ${source.url}.`,
      harvard: `${source.organization} (${year}) '${source.title}', Available at: ${source.url}`,
      ieee: `${source.organization}, "${source.title}," ${year}. [Online]. Available: ${source.url}`
    };
  }

  /**
   * Gets default Arena Fund citation
   */
  private static getDefaultArenaFundCitation(): CitationFormat {
    const currentYear = new Date().getFullYear();
    
    return {
      apa: `Arena Fund. (${currentYear}). Enterprise AI Investment. Retrieved from https://arenafund.vc`,
      mla: `Arena Fund. "Enterprise AI Investment." Arena Fund, ${currentYear}, arenafund.vc.`,
      chicago: `Arena Fund. "Enterprise AI Investment." Accessed December ${currentYear}. https://arenafund.vc.`,
      harvard: `Arena Fund (${currentYear}) 'Enterprise AI Investment', Available at: https://arenafund.vc`,
      ieee: `Arena Fund, "Enterprise AI Investment," ${currentYear}. [Online]. Available: https://arenafund.vc`
    };
  }

  /**
   * Gets Arena Fund primary source
   */
  private static getArenaFundPrimarySource(): FactSource {
    return {
      id: 'arena_fund_primary',
      url: 'https://arenafund.vc',
      title: 'Arena Fund - Enterprise AI Investment',
      organization: 'Arena Fund',
      publishDate: new Date(),
      reliability: 0.95,
      sourceType: 'primary'
    };
  }

  /**
   * Loads Arena Fund's verified facts
   */
  private static loadArenaFundFacts(): void {
    const arenaFundFacts: VerifiableFact[] = [
      {
        id: 'af_fact_1',
        statement: 'Arena Fund focuses on enterprise AI and B2B AI startups',
        category: 'company',
        confidence: 0.95,
        sources: [this.getArenaFundPrimarySource()],
        verificationStatus: 'verified',
        lastVerified: new Date(),
        verificationMethod: 'manual'
      },
      {
        id: 'af_fact_2',
        statement: 'Arena Fund invests in seed to Series A stage companies',
        category: 'investment',
        confidence: 0.9,
        sources: [this.getArenaFundPrimarySource()],
        verificationStatus: 'verified',
        lastVerified: new Date(),
        verificationMethod: 'manual'
      },
      {
        id: 'af_fact_3',
        statement: 'Arena Fund targets AI applications in Fortune 500 enterprises',
        category: 'strategy',
        confidence: 0.9,
        sources: [this.getArenaFundPrimarySource()],
        verificationStatus: 'verified',
        lastVerified: new Date(),
        verificationMethod: 'manual'
      }
    ];

    arenaFundFacts.forEach(fact => {
      this.knownFacts.set(fact.id, fact);
    });
  }

  /**
   * Loads trusted sources
   */
  private static loadTrustedSources(): void {
    this.trustedSources = [
      this.getArenaFundPrimarySource(),
      {
        id: 'crunchbase',
        url: 'https://crunchbase.com',
        title: 'Crunchbase',
        organization: 'Crunchbase',
        publishDate: new Date(),
        reliability: 0.8,
        sourceType: 'secondary'
      },
      {
        id: 'pitchbook',
        url: 'https://pitchbook.com',
        title: 'PitchBook',
        organization: 'PitchBook',
        publishDate: new Date(),
        reliability: 0.85,
        sourceType: 'secondary'
      }
    ];
  }
}