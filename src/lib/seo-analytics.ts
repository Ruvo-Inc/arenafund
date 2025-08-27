/**
 * SEO Analytics and Monitoring System
 * Handles Google Search Console integration, AI mention tracking, and performance monitoring
 */

export interface SEORankingData {
  keyword: string;
  currentRank: number;
  previousRank: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  lastChecked: Date;
  trend: 'up' | 'down' | 'stable';
  clickThroughRate: number;
  impressions: number;
  clicks: number;
}

export interface AIMentionData {
  source: 'chatgpt' | 'claude' | 'perplexity' | 'bard' | 'other';
  query: string;
  mentionContext: string;
  accuracy: number;
  timestamp: Date;
  citationIncluded: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevanceScore: number;
}

export interface SEOPerformanceMetrics {
  organicTraffic: number;
  averageRanking: number;
  totalKeywords: number;
  topRankingKeywords: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
    score: number;
  };
  backlinks: number;
  domainAuthority: number;
  lastUpdated: Date;
}

export interface PerformanceAlert {
  id: string;
  type: 'ranking_drop' | 'traffic_drop' | 'performance_issue' | 'ai_mention';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: Date;
  resolved: boolean;
}

export class SEOAnalyticsService {
  private apiKey: string;
  private siteUrl: string;

  constructor(apiKey: string, siteUrl: string) {
    this.apiKey = apiKey;
    this.siteUrl = siteUrl;
  }

  /**
   * Fetch ranking data from Google Search Console
   */
  async fetchSearchConsoleData(
    startDate: string,
    endDate: string,
    dimensions: string[] = ['query', 'page']
  ): Promise<SEORankingData[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate,
            endDate,
            dimensions,
            rowLimit: 1000,
            startRow: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Search Console API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformSearchConsoleData(data.rows || []);
    } catch (error) {
      console.error('Error fetching Search Console data:', error);
      throw error;
    }
  }

  /**
   * Transform Search Console API response to SEORankingData format
   */
  private transformSearchConsoleData(rows: any[]): SEORankingData[] {
    return rows.map((row, index) => ({
      keyword: row.keys[0] || '',
      currentRank: row.position || 0,
      previousRank: row.position || 0, // Will be updated with historical data
      searchVolume: row.impressions || 0,
      difficulty: this.calculateKeywordDifficulty(row.keys[0]),
      url: row.keys[1] || '',
      lastChecked: new Date(),
      trend: 'stable' as const,
      clickThroughRate: row.clicks / row.impressions || 0,
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
    }));
  }

  /**
   * Calculate keyword difficulty score (simplified implementation)
   */
  private calculateKeywordDifficulty(keyword: string): number {
    // Simple heuristic based on keyword length and common terms
    const length = keyword.split(' ').length;
    const hasCompetitiveTerms = /venture|capital|investment|fund/i.test(keyword);
    
    let difficulty = 50; // Base difficulty
    
    if (length === 1) difficulty += 30; // Single words are harder
    if (length > 4) difficulty -= 20; // Long-tail keywords are easier
    if (hasCompetitiveTerms) difficulty += 25; // Competitive industry terms
    
    return Math.max(0, Math.min(100, difficulty));
  }

  /**
   * Monitor AI mentions across platforms
   */
  async monitorAIMentions(queries: string[]): Promise<AIMentionData[]> {
    const mentions: AIMentionData[] = [];
    
    for (const query of queries) {
      try {
        // Simulate AI platform monitoring (in real implementation, this would integrate with actual APIs)
        const mockMentions = await this.simulateAIMentionCheck(query);
        mentions.push(...mockMentions);
      } catch (error) {
        console.error(`Error monitoring AI mentions for query: ${query}`, error);
      }
    }
    
    return mentions;
  }

  /**
   * Simulate AI mention checking (placeholder for real implementation)
   */
  private async simulateAIMentionCheck(query: string): Promise<AIMentionData[]> {
    // In a real implementation, this would integrate with AI platform APIs
    // For now, we'll return mock data for demonstration
    return [
      {
        source: 'chatgpt',
        query,
        mentionContext: `Arena Fund is mentioned as a leading AI venture capital firm...`,
        accuracy: 0.95,
        timestamp: new Date(),
        citationIncluded: true,
        sentiment: 'positive',
        relevanceScore: 0.88,
      },
    ];
  }

  /**
   * Get comprehensive SEO performance metrics
   */
  async getPerformanceMetrics(): Promise<SEOPerformanceMetrics> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const rankingData = await this.fetchSearchConsoleData(startDate, endDate);
      
      const totalClicks = rankingData.reduce((sum, item) => sum + item.clicks, 0);
      const averageRanking = rankingData.reduce((sum, item) => sum + item.currentRank, 0) / rankingData.length;
      const topRankingKeywords = rankingData.filter(item => item.currentRank <= 10).length;

      return {
        organicTraffic: totalClicks,
        averageRanking: Math.round(averageRanking * 10) / 10,
        totalKeywords: rankingData.length,
        topRankingKeywords,
        coreWebVitals: await this.getCoreWebVitals(),
        backlinks: await this.getBacklinkCount(),
        domainAuthority: await this.getDomainAuthority(),
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }

  /**
   * Get Core Web Vitals data
   */
  private async getCoreWebVitals(): Promise<SEOPerformanceMetrics['coreWebVitals']> {
    // In a real implementation, this would integrate with PageSpeed Insights API
    return {
      lcp: 2.1,
      fid: 45,
      cls: 0.08,
      score: 92,
    };
  }

  /**
   * Get backlink count (placeholder)
   */
  private async getBacklinkCount(): Promise<number> {
    // In a real implementation, this would integrate with backlink analysis tools
    return 150;
  }

  /**
   * Get domain authority score (placeholder)
   */
  private async getDomainAuthority(): Promise<number> {
    // In a real implementation, this would integrate with SEO tools like Moz
    return 45;
  }

  /**
   * Generate performance alerts based on thresholds
   */
  async generateAlerts(
    currentMetrics: SEOPerformanceMetrics,
    previousMetrics?: SEOPerformanceMetrics
  ): Promise<PerformanceAlert[]> {
    const alerts: PerformanceAlert[] = [];

    if (previousMetrics) {
      // Traffic drop alert
      const trafficChange = (currentMetrics.organicTraffic - previousMetrics.organicTraffic) / previousMetrics.organicTraffic;
      if (trafficChange < -0.2) {
        alerts.push({
          id: `traffic_drop_${Date.now()}`,
          type: 'traffic_drop',
          severity: trafficChange < -0.5 ? 'critical' : 'high',
          message: `Organic traffic dropped by ${Math.abs(trafficChange * 100).toFixed(1)}%`,
          data: { current: currentMetrics.organicTraffic, previous: previousMetrics.organicTraffic },
          timestamp: new Date(),
          resolved: false,
        });
      }

      // Ranking drop alert
      const rankingChange = currentMetrics.averageRanking - previousMetrics.averageRanking;
      if (rankingChange > 5) {
        alerts.push({
          id: `ranking_drop_${Date.now()}`,
          type: 'ranking_drop',
          severity: rankingChange > 10 ? 'high' : 'medium',
          message: `Average ranking dropped by ${rankingChange.toFixed(1)} positions`,
          data: { current: currentMetrics.averageRanking, previous: previousMetrics.averageRanking },
          timestamp: new Date(),
          resolved: false,
        });
      }
    }

    // Core Web Vitals alert
    if (currentMetrics.coreWebVitals.score < 80) {
      alerts.push({
        id: `performance_issue_${Date.now()}`,
        type: 'performance_issue',
        severity: currentMetrics.coreWebVitals.score < 60 ? 'high' : 'medium',
        message: `Core Web Vitals score is ${currentMetrics.coreWebVitals.score}`,
        data: currentMetrics.coreWebVitals,
        timestamp: new Date(),
        resolved: false,
      });
    }

    return alerts;
  }
}

// Create and export default instance
export const seoAnalytics = new SEOAnalyticsService(
  process.env.GOOGLE_SEARCH_CONSOLE_API_KEY || '',
  process.env.NEXT_PUBLIC_SITE_URL || 'https://arenafund.vc'
);