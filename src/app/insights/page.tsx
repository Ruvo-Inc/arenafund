import type { Metadata } from 'next';
import { generateArenaFundPageSEO } from '@/lib/seo-integration';
import { SEOOptimizedPage } from '@/components/SEOOptimizedPage';
import { AIOptimizedContent } from '@/components/AIOptimizedContent';
import InsightsPageClient from './InsightsPageClient';

// Generate SEO metadata for the insights page
const { metadata } = generateArenaFundPageSEO('insights');
export { metadata };

export default function InsightsPage() {
  return (
    <SEOOptimizedPage
      title="Arena Insights | AI & Enterprise Research"
      description="Proof-driven perspectives on AI, enterprise, and venture capital. Research on Fortune 500 buyer psychology and enterprise AI adoption."
      url="/insights"
      keywords={['AI insights', 'enterprise AI research', 'Fortune 500 buyer psychology', 'venture capital analysis']}
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Insights', url: '/insights' },
      ]}
    >
      <AIOptimizedContent enableFactMarkers enableCitations>
        <InsightsPageClient />
      </AIOptimizedContent>
    </SEOOptimizedPage>
  );
}