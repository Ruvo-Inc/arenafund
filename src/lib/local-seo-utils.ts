/**
 * Local and Industry-Specific SEO Utilities
 * Provides geographic and industry vertical targeting for enhanced SEO performance
 */

import { generateJSONLD } from './structured-data';

// Geographic targeting configuration
export interface GeographicTarget {
  city: string;
  state: string;
  country: string;
  region?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
}

// Industry vertical configuration
export interface IndustryVertical {
  name: string;
  keywords: string[];
  description: string;
  targetCompanies?: string[];
  useCases?: string[];
  challenges?: string[];
}

// Local business schema data
export interface LocalBusinessData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  };
  geo?: {
    '@type': 'GeoCoordinates';
    latitude: number;
    longitude: number;
  };
  areaServed?: Array<{
    '@type': 'State' | 'Country' | 'City';
    name: string;
  }>;
  serviceArea?: {
    '@type': 'GeoCircle';
    geoMidpoint: {
      '@type': 'GeoCoordinates';
      latitude: number;
      longitude: number;
    };
    geoRadius: string;
  };
}

// Industry-specific schema data
export interface IndustrySpecificData {
  '@context': string;
  '@type': 'FinancialService';
  name: string;
  description: string;
  serviceType: string[];
  areaServed: string[];
  hasOfferCatalog?: {
    '@type': 'OfferCatalog';
    name: string;
    itemListElement: Array<{
      '@type': 'Offer';
      itemOffered: {
        '@type': 'Service';
        name: string;
        description: string;
      };
    }>;
  };
  knowsAbout?: string[];
  expertise?: string[];
}

// Default geographic targets for Arena Fund
export const DEFAULT_GEOGRAPHIC_TARGETS: GeographicTarget[] = [
  {
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    region: 'Bay Area',
    coordinates: { latitude: 37.7749, longitude: -122.4194 },
    timezone: 'America/Los_Angeles'
  },
  {
    city: 'New York',
    state: 'New York', 
    country: 'United States',
    region: 'Northeast',
    coordinates: { latitude: 40.7128, longitude: -74.0060 },
    timezone: 'America/New_York'
  },
  {
    city: 'Austin',
    state: 'Texas',
    country: 'United States',
    region: 'Southwest',
    coordinates: { latitude: 30.2672, longitude: -97.7431 },
    timezone: 'America/Chicago'
  },
  {
    city: 'Boston',
    state: 'Massachusetts',
    country: 'United States',
    region: 'Northeast',
    coordinates: { latitude: 42.3601, longitude: -71.0589 },
    timezone: 'America/New_York'
  },
  {
    city: 'Seattle',
    state: 'Washington',
    country: 'United States',
    region: 'Pacific Northwest',
    coordinates: { latitude: 47.6062, longitude: -122.3321 },
    timezone: 'America/Los_Angeles'
  }
];

// Industry verticals for AI venture capital
export const AI_INDUSTRY_VERTICALS: IndustryVertical[] = [
  {
    name: 'Enterprise AI Software',
    keywords: [
      'enterprise AI software',
      'business AI solutions',
      'corporate AI platforms',
      'AI for enterprises',
      'B2B AI software'
    ],
    description: 'AI-powered software solutions designed for enterprise customers and Fortune 500 companies',
    targetCompanies: ['Fortune 500', 'Enterprise', 'Large Corporations'],
    useCases: ['Process Automation', 'Decision Support', 'Predictive Analytics', 'Customer Intelligence'],
    challenges: ['Integration Complexity', 'Data Privacy', 'Scalability', 'ROI Measurement']
  },
  {
    name: 'AI-Powered Analytics',
    keywords: [
      'AI analytics platform',
      'predictive analytics AI',
      'business intelligence AI',
      'data analytics AI',
      'AI-driven insights'
    ],
    description: 'Advanced analytics platforms leveraging AI for business intelligence and predictive insights',
    targetCompanies: ['Data-Driven Enterprises', 'Financial Services', 'Healthcare Organizations'],
    useCases: ['Predictive Modeling', 'Customer Segmentation', 'Risk Assessment', 'Performance Optimization'],
    challenges: ['Data Quality', 'Model Accuracy', 'Real-time Processing', 'Regulatory Compliance']
  },
  {
    name: 'AI Customer Experience',
    keywords: [
      'AI customer service',
      'conversational AI',
      'AI chatbots enterprise',
      'customer experience AI',
      'AI support platforms'
    ],
    description: 'AI solutions that enhance customer experience through intelligent automation and personalization',
    targetCompanies: ['Retail', 'E-commerce', 'Financial Services', 'Telecommunications'],
    useCases: ['Customer Support', 'Personalization', 'Recommendation Engines', 'Voice Assistants'],
    challenges: ['Natural Language Understanding', 'Context Awareness', 'Multi-channel Integration', 'Customer Privacy']
  },
  {
    name: 'AI Operations & DevOps',
    keywords: [
      'AIOps platform',
      'AI DevOps tools',
      'intelligent operations',
      'AI monitoring',
      'automated operations AI'
    ],
    description: 'AI-driven operations and DevOps tools for intelligent infrastructure management and automation',
    targetCompanies: ['Technology Companies', 'Cloud Providers', 'Enterprise IT Departments'],
    useCases: ['Anomaly Detection', 'Predictive Maintenance', 'Auto-scaling', 'Incident Response'],
    challenges: ['Alert Fatigue', 'False Positives', 'Integration Complexity', 'Skills Gap']
  },
  {
    name: 'AI Security & Compliance',
    keywords: [
      'AI cybersecurity',
      'AI security platform',
      'intelligent security',
      'AI threat detection',
      'compliance AI'
    ],
    description: 'AI-powered security solutions for threat detection, prevention, and compliance management',
    targetCompanies: ['Financial Services', 'Healthcare', 'Government', 'Critical Infrastructure'],
    useCases: ['Threat Detection', 'Fraud Prevention', 'Compliance Monitoring', 'Risk Assessment'],
    challenges: ['Adversarial Attacks', 'False Positives', 'Regulatory Requirements', 'Privacy Protection']
  }
];

/**
 * Generate local business structured data for Arena Fund
 */
export function generateLocalBusinessSchema(location?: GeographicTarget): string {
  const primaryLocation = location || DEFAULT_GEOGRAPHIC_TARGETS[0];
  
  const localBusinessData: LocalBusinessData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'Arena Fund',
    description: 'Buyer-validated venture capital fund specializing in B2B AI startups with Fortune 500 enterprise validation',
    url: 'https://arenafund.vc',
    email: 'contact@arenafund.vc',
    address: {
      '@type': 'PostalAddress',
      addressLocality: primaryLocation.city,
      addressRegion: primaryLocation.state,
      addressCountry: primaryLocation.country
    },
    areaServed: DEFAULT_GEOGRAPHIC_TARGETS.map(target => ({
      '@type': 'State' as const,
      name: `${target.city}, ${target.state}`
    }))
  };

  if (primaryLocation.coordinates) {
    localBusinessData.geo = {
      '@type': 'GeoCoordinates',
      latitude: primaryLocation.coordinates.latitude,
      longitude: primaryLocation.coordinates.longitude
    };
  }

  return generateJSONLD(localBusinessData);
}

/**
 * Generate industry-specific structured data
 */
export function generateIndustrySpecificSchema(vertical: IndustryVertical): string {
  const industryData: IndustrySpecificData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: `Arena Fund - ${vertical.name} Investment`,
    description: `Specialized venture capital investment in ${vertical.description.toLowerCase()}`,
    serviceType: [
      'Venture Capital',
      'Startup Funding',
      'AI Investment',
      vertical.name
    ],
    areaServed: DEFAULT_GEOGRAPHIC_TARGETS.map(target => 
      `${target.city}, ${target.state}, ${target.country}`
    ),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${vertical.name} Investment Services`,
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Seed Funding',
            description: `Seed stage investment for ${vertical.name.toLowerCase()} startups`
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Series A Funding',
            description: `Series A investment for scaling ${vertical.name.toLowerCase()} companies`
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Buyer Validation',
            description: 'Fortune 500 buyer validation and enterprise customer introduction'
          }
        }
      ]
    },
    knowsAbout: vertical.keywords,
    expertise: vertical.useCases
  };

  return generateJSONLD(industryData);
}

/**
 * Generate location-based keywords for content optimization
 */
export function generateLocationKeywords(baseKeywords: string[], locations: GeographicTarget[]): string[] {
  const locationKeywords: string[] = [];
  
  locations.forEach(location => {
    baseKeywords.forEach(keyword => {
      // City-specific keywords
      locationKeywords.push(`${keyword} ${location.city}`);
      locationKeywords.push(`${keyword} in ${location.city}`);
      locationKeywords.push(`${location.city} ${keyword}`);
      
      // State-specific keywords
      locationKeywords.push(`${keyword} ${location.state}`);
      locationKeywords.push(`${keyword} in ${location.state}`);
      
      // Region-specific keywords (if available)
      if (location.region) {
        locationKeywords.push(`${keyword} ${location.region}`);
        locationKeywords.push(`${keyword} in ${location.region}`);
      }
    });
  });
  
  return [...new Set(locationKeywords)];
}

/**
 * Generate industry-specific keywords for content optimization
 */
export function generateIndustryKeywords(verticals: IndustryVertical[]): string[] {
  const industryKeywords: string[] = [];
  
  verticals.forEach(vertical => {
    // Add base vertical keywords
    industryKeywords.push(...vertical.keywords);
    
    // Add use case specific keywords
    if (vertical.useCases) {
      vertical.useCases.forEach(useCase => {
        industryKeywords.push(`${useCase.toLowerCase()} AI`);
        industryKeywords.push(`AI for ${useCase.toLowerCase()}`);
        industryKeywords.push(`${useCase.toLowerCase()} automation`);
      });
    }
    
    // Add target company specific keywords
    if (vertical.targetCompanies) {
      vertical.targetCompanies.forEach(company => {
        industryKeywords.push(`AI for ${company.toLowerCase()}`);
        industryKeywords.push(`${company.toLowerCase()} AI solutions`);
      });
    }
  });
  
  return [...new Set(industryKeywords)];
}

/**
 * Optimize content for local SEO
 */
export function optimizeContentForLocation(
  content: string,
  targetLocation: GeographicTarget,
  baseKeywords: string[]
): {
  optimizedContent: string;
  addedKeywords: string[];
  suggestions: string[];
} {
  const locationKeywords = generateLocationKeywords(baseKeywords, [targetLocation]);
  const addedKeywords: string[] = [];
  const suggestions: string[] = [];
  
  let optimizedContent = content;
  
  // Check if location is already mentioned
  const locationMentioned = content.toLowerCase().includes(targetLocation.city.toLowerCase()) ||
                           content.toLowerCase().includes(targetLocation.state.toLowerCase());
  
  if (!locationMentioned) {
    suggestions.push(`Consider mentioning ${targetLocation.city}, ${targetLocation.state} in the content`);
    suggestions.push(`Add location-specific examples or case studies from ${targetLocation.region || targetLocation.city}`);
  }
  
  // Suggest location-specific keywords that could be naturally integrated
  const naturalKeywords = locationKeywords.filter(keyword => 
    keyword.length < 50 && !keyword.includes(' in ')
  ).slice(0, 5);
  
  naturalKeywords.forEach(keyword => {
    if (!content.toLowerCase().includes(keyword.toLowerCase())) {
      suggestions.push(`Consider incorporating the keyword: "${keyword}"`);
    }
  });
  
  return {
    optimizedContent,
    addedKeywords,
    suggestions
  };
}

/**
 * Optimize content for industry vertical
 */
export function optimizeContentForIndustry(
  content: string,
  vertical: IndustryVertical
): {
  optimizedContent: string;
  addedKeywords: string[];
  suggestions: string[];
} {
  const addedKeywords: string[] = [];
  const suggestions: string[] = [];
  
  let optimizedContent = content;
  
  // Check keyword coverage
  const usedKeywords = vertical.keywords.filter(keyword =>
    content.toLowerCase().includes(keyword.toLowerCase())
  );
  
  const missingKeywords = vertical.keywords.filter(keyword =>
    !content.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (missingKeywords.length > 0) {
    suggestions.push(`Consider incorporating these industry keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  
  // Check use case coverage
  if (vertical.useCases) {
    const mentionedUseCases = vertical.useCases.filter(useCase =>
      content.toLowerCase().includes(useCase.toLowerCase())
    );
    
    if (mentionedUseCases.length === 0) {
      suggestions.push(`Consider mentioning specific use cases: ${vertical.useCases.slice(0, 2).join(', ')}`);
    }
  }
  
  // Check challenge coverage
  if (vertical.challenges) {
    const mentionedChallenges = vertical.challenges.filter(challenge =>
      content.toLowerCase().includes(challenge.toLowerCase())
    );
    
    if (mentionedChallenges.length === 0) {
      suggestions.push(`Consider addressing industry challenges: ${vertical.challenges.slice(0, 2).join(', ')}`);
    }
  }
  
  return {
    optimizedContent,
    addedKeywords,
    suggestions
  };
}

/**
 * Generate comprehensive local and industry SEO metadata
 */
export function generateLocalIndustrySEOData(config: {
  baseTitle: string;
  baseDescription: string;
  location?: GeographicTarget;
  vertical?: IndustryVertical;
  url: string;
}): {
  title: string;
  description: string;
  keywords: string[];
  structuredData: string[];
} {
  const { baseTitle, baseDescription, location, vertical, url } = config;
  
  let title = baseTitle;
  let description = baseDescription;
  const keywords: string[] = [];
  const structuredData: string[] = [];
  
  // Add location-specific optimization
  if (location) {
    if (!title.includes(location.city)) {
      title = `${baseTitle} | ${location.city}, ${location.state}`;
    }
    
    if (!description.includes(location.city)) {
      description = `${baseDescription} Serving ${location.city}, ${location.state} and surrounding areas.`;
    }
    
    keywords.push(...generateLocationKeywords(['venture capital', 'AI investment'], [location]));
    structuredData.push(generateLocalBusinessSchema(location));
  }
  
  // Add industry-specific optimization
  if (vertical) {
    if (!title.includes(vertical.name)) {
      // If title already has location (format: "Title | Location"), insert vertical
      if (title.includes(' | ') && location) {
        // Replace the location part to include vertical
        title = title.replace(` | ${location.city}, ${location.state}`, ` - ${vertical.name} | ${location.city}, ${location.state}`);
      } else if (title.includes(' | ')) {
        // Has some other format with |, try to insert before last |
        const lastPipeIndex = title.lastIndexOf(' | ');
        title = title.substring(0, lastPipeIndex) + ` - ${vertical.name}` + title.substring(lastPipeIndex);
      } else {
        title = `${title} - ${vertical.name}`;
      }
    }
    
    if (!description.includes(vertical.name.toLowerCase())) {
      description = `${description} Specializing in ${vertical.name.toLowerCase()} investments.`;
    }
    
    keywords.push(...vertical.keywords);
    structuredData.push(generateIndustrySpecificSchema(vertical));
  }
  
  return {
    title: title.length > 60 ? title.substring(0, 57) + '...' : title,
    description: description.length > 160 ? description.substring(0, 157) + '...' : description,
    keywords: [...new Set(keywords)],
    structuredData
  };
}