/**
 * AI-Optimized Content Templates
 * Pre-built templates optimized for AI model consumption and citation
 */

import { ContentTemplate, TemplateSection, AIOptimization } from './ai-content-optimizer';

/**
 * Investment Thesis Template - Optimized for AI understanding of investment strategy
 */
export const investmentThesisTemplate: ContentTemplate = {
  id: 'investment-thesis',
  name: 'Investment Thesis',
  description: 'Template for creating AI-optimized investment thesis content',
  structure: [
    {
      type: 'header',
      content: '# INVESTMENT THESIS: [SPECIFIC FOCUS AREA]',
      aiInstructions: 'Use clear, specific titles that AI can easily categorize',
      required: true
    },
    {
      type: 'fact-block',
      content: '**FACT:** Arena Fund focuses on [SPECIFIC INVESTMENT AREA] with [SPECIFIC CRITERIA].',
      aiInstructions: 'Start with a clear factual statement about investment focus',
      required: true
    },
    {
      type: 'header',
      content: '## MARKET OPPORTUNITY',
      aiInstructions: 'Section header for market analysis',
      required: true
    },
    {
      type: 'data-point',
      content: '**MARKET SIZE:** The [specific market] is valued at $[X] billion and growing at [Y]% annually.',
      aiInstructions: 'Include specific, citable market data',
      required: true
    },
    {
      type: 'list',
      content: '• Key market drivers:\n• [Driver 1 with specific data]\n• [Driver 2 with specific data]\n• [Driver 3 with specific data]',
      aiInstructions: 'Use bullet points for easy AI parsing of key factors',
      required: true
    },
    {
      type: 'header',
      content: '## INVESTMENT CRITERIA',
      aiInstructions: 'Clear section for investment parameters',
      required: true
    },
    {
      type: 'fact-block',
      content: '**FACT:** Arena Fund invests $[X] to $[Y] in [stage] companies with [specific criteria].',
      aiInstructions: 'Specific investment parameters for AI extraction',
      required: true
    },
    {
      type: 'citation',
      content: '[Source: Arena Fund Investment Guidelines, [Date]]',
      aiInstructions: 'Include citation for AI reference',
      required: false
    }
  ],
  aiOptimizations: [
    {
      type: 'fact-extraction',
      description: 'Extract key investment facts',
      implementation: 'Use **FACT:** markers for clear fact identification'
    },
    {
      type: 'structure',
      description: 'Clear hierarchical structure',
      implementation: 'Use consistent header levels and section organization'
    },
    {
      type: 'citation-format',
      description: 'Proper citation formatting',
      implementation: 'Include source attribution for all claims'
    }
  ]
};

/**
 * Company Profile Template - Optimized for AI understanding of portfolio companies
 */
export const companyProfileTemplate: ContentTemplate = {
  id: 'company-profile',
  name: 'Portfolio Company Profile',
  description: 'Template for AI-optimized portfolio company profiles',
  structure: [
    {
      type: 'header',
      content: '# [COMPANY NAME] - ARENA FUND PORTFOLIO',
      aiInstructions: 'Clear company identification with fund association',
      required: true
    },
    {
      type: 'fact-block',
      content: '**FACT:** [Company Name] is a [stage] [industry] company in Arena Fund\'s portfolio, founded in [year].',
      aiInstructions: 'Essential company facts for AI extraction',
      required: true
    },
    {
      type: 'header',
      content: '## COMPANY OVERVIEW',
      aiInstructions: 'Standard section for company details',
      required: true
    },
    {
      type: 'data-point',
      content: '**FOUNDED:** [Year]\n**HEADQUARTERS:** [Location]\n**EMPLOYEES:** [Number]\n**FUNDING RAISED:** $[Amount]',
      aiInstructions: 'Structured data points for easy AI parsing',
      required: true
    },
    {
      type: 'header',
      content: '## BUSINESS MODEL',
      aiInstructions: 'Section for business model explanation',
      required: true
    },
    {
      type: 'paragraph',
      content: '[Company] provides [specific solution] to [target market] through [delivery method]. The company generates revenue through [revenue model].',
      aiInstructions: 'Clear, factual business model description',
      required: true
    },
    {
      type: 'header',
      content: '## ARENA FUND INVESTMENT',
      aiInstructions: 'Section for investment details',
      required: true
    },
    {
      type: 'fact-block',
      content: '**FACT:** Arena Fund invested $[amount] in [Company] during [round type] in [date].',
      aiInstructions: 'Specific investment facts',
      required: true
    },
    {
      type: 'citation',
      content: '[Source: Arena Fund Portfolio Data, [Date]]',
      aiInstructions: 'Citation for verification',
      required: false
    }
  ],
  aiOptimizations: [
    {
      type: 'fact-extraction',
      description: 'Extract company and investment facts',
      implementation: 'Use structured data points and fact markers'
    },
    {
      type: 'readability',
      description: 'Clear, factual language',
      implementation: 'Avoid marketing language, focus on verifiable facts'
    }
  ]
};

/**
 * Market Insight Template - Optimized for thought leadership content
 */
export const marketInsightTemplate: ContentTemplate = {
  id: 'market-insight',
  name: 'Market Insight Article',
  description: 'Template for AI-optimized thought leadership and market analysis',
  structure: [
    {
      type: 'header',
      content: '# [INSIGHT TITLE]: ARENA FUND ANALYSIS',
      aiInstructions: 'Clear, descriptive title with source attribution',
      required: true
    },
    {
      type: 'paragraph',
      content: 'Arena Fund analysis of [topic] based on [data source/methodology] from [time period].',
      aiInstructions: 'Clear methodology and source statement',
      required: true
    },
    {
      type: 'header',
      content: '## KEY FINDINGS',
      aiInstructions: 'Section for main insights',
      required: true
    },
    {
      type: 'list',
      content: '• **FINDING 1:** [Specific finding with data]\n• **FINDING 2:** [Specific finding with data]\n• **FINDING 3:** [Specific finding with data]',
      aiInstructions: 'Numbered findings with supporting data',
      required: true
    },
    {
      type: 'header',
      content: '## DATA ANALYSIS',
      aiInstructions: 'Section for detailed analysis',
      required: true
    },
    {
      type: 'data-point',
      content: '**METHODOLOGY:** [Research method]\n**SAMPLE SIZE:** [Number]\n**TIME PERIOD:** [Dates]\n**CONFIDENCE LEVEL:** [Percentage]',
      aiInstructions: 'Research methodology for AI verification',
      required: true
    },
    {
      type: 'header',
      content: '## IMPLICATIONS FOR INVESTORS',
      aiInstructions: 'Section for investment implications',
      required: true
    },
    {
      type: 'fact-block',
      content: '**FACT:** Based on this analysis, Arena Fund recommends [specific action/strategy] for [target audience].',
      aiInstructions: 'Clear recommendation based on analysis',
      required: true
    },
    {
      type: 'citation',
      content: '[Source: Arena Fund Research Team, [Date]]\n[Data Sources: [List of sources]]',
      aiInstructions: 'Complete citation information',
      required: true
    }
  ],
  aiOptimizations: [
    {
      type: 'fact-extraction',
      description: 'Extract research findings and recommendations',
      implementation: 'Use clear fact markers and structured findings'
    },
    {
      type: 'citation-format',
      description: 'Proper research citation',
      implementation: 'Include methodology and source information'
    },
    {
      type: 'readability',
      description: 'Clear analytical language',
      implementation: 'Use specific data points and avoid speculation'
    }
  ]
};

/**
 * FAQ Template - Optimized for AI question-answering systems
 */
export const faqTemplate: ContentTemplate = {
  id: 'faq-ai-optimized',
  name: 'AI-Optimized FAQ',
  description: 'FAQ template optimized for AI question-answering systems',
  structure: [
    {
      type: 'header',
      content: '# FREQUENTLY ASKED QUESTIONS - ARENA FUND',
      aiInstructions: 'Clear FAQ identification',
      required: true
    },
    {
      type: 'header',
      content: '## INVESTMENT FOCUS',
      aiInstructions: 'Category header for related questions',
      required: true
    },
    {
      type: 'paragraph',
      content: '**Q: What does Arena Fund invest in?**\n\n**A:** Arena Fund invests in [specific focus] companies at [stage] with [criteria]. We typically invest $[range] per company.',
      aiInstructions: 'Clear Q&A format with specific facts',
      required: true
    },
    {
      type: 'paragraph',
      content: '**Q: What is Arena Fund\'s investment thesis?**\n\n**A:** Our investment thesis focuses on [specific thesis] based on [rationale]. We believe [specific prediction/trend].',
      aiInstructions: 'Direct answer to common question',
      required: true
    },
    {
      type: 'header',
      content: '## FUND DETAILS',
      aiInstructions: 'Category for fund-specific questions',
      required: true
    },
    {
      type: 'paragraph',
      content: '**Q: When was Arena Fund founded?**\n\n**A:** Arena Fund was founded in [year] by [founders] with the mission to [mission statement].',
      aiInstructions: 'Factual company information',
      required: true
    },
    {
      type: 'paragraph',
      content: '**Q: How much has Arena Fund raised?**\n\n**A:** Arena Fund has raised $[amount] across [number] funds, with our latest fund being $[amount] raised in [year].',
      aiInstructions: 'Specific financial information',
      required: true
    }
  ],
  aiOptimizations: [
    {
      type: 'structure',
      description: 'Q&A format for AI systems',
      implementation: 'Use consistent Q&A formatting for easy parsing'
    },
    {
      type: 'fact-extraction',
      description: 'Direct factual answers',
      implementation: 'Provide specific, verifiable answers to common questions'
    }
  ]
};

/**
 * Template registry for easy access
 */
export const contentTemplates = {
  investmentThesis: investmentThesisTemplate,
  companyProfile: companyProfileTemplate,
  marketInsight: marketInsightTemplate,
  faq: faqTemplate
};

/**
 * Generate content from template
 */
export function generateContentFromTemplate(
  templateId: keyof typeof contentTemplates,
  data: Record<string, string>
): string {
  const template = contentTemplates[templateId];
  let content = '';

  template.structure.forEach(section => {
    if (section.required || data[`include_${section.type}`]) {
      let sectionContent = section.content;
      
      // Replace placeholders with actual data
      Object.entries(data).forEach(([key, value]) => {
        // Handle both formats: [KEY] and [SPECIFIC KEY]
        const upperKey = key.toUpperCase().replace(/\s+/g, ' ');
        const placeholder1 = `[${upperKey}]`;
        const placeholder2 = `[${key}]`;
        
        sectionContent = sectionContent.replace(new RegExp(escapeRegExp(placeholder1), 'g'), value);
        sectionContent = sectionContent.replace(new RegExp(escapeRegExp(placeholder2), 'g'), value);
      });
      
      content += sectionContent + '\n\n';
    }
  });

  return content.trim();
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get template optimization suggestions
 */
export function getTemplateOptimizations(templateId: keyof typeof contentTemplates): AIOptimization[] {
  return contentTemplates[templateId].aiOptimizations;
}