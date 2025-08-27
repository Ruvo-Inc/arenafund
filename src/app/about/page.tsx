import Link from 'next/link';
import type { Metadata } from 'next';
import { generateArenaFundPageSEO } from '@/lib/seo-integration';
import { SEOOptimizedPage } from '@/components/SEOOptimizedPage';
import { AIOptimizedContent, AIFactMarker, AIDataPoint } from '@/components/AIOptimizedContent';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Generate SEO metadata for the about page
const { metadata } = generateArenaFundPageSEO('about');
export { metadata };
import {
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  BarChart3,
  Briefcase,
  Shield,
  Heart,
  Eye,
  Rocket
} from 'lucide-react';

export default function AboutPage() {
  const { structuredData } = generateArenaFundPageSEO('about');
  const coreValues = [
    {
      icon: Eye,
      title: "Evidence Beats Opinion",
      description: "We make investment decisions based on validated buyer demand, not assumptions or market speculation."
    },
    {
      icon: Shield,
      title: "Trust Through Action",
      description: "We earn trust by delivering measurable results - 90% pilot-to-purchase conversion rates speak louder than promises."
    },
    {
      icon: Heart,
      title: "Technology Serves Humanity",
      description: "We back founders building AI that enhances human potential rather than replacing human connection."
    }
  ];

  const differentiators = [
    {
      traditional: "Technology-first investment thesis",
      arena: "Buyer-validated demand before investment",
      impact: "95% reduction in market risk"
    },
    {
      traditional: "Post-investment customer introductions",
      arena: "Pre-investment Fortune 500 pilot orchestration",
      impact: "90% pilot-to-purchase conversion"
    },
    {
      traditional: "Demo-driven sales processes",
      arena: "ROI-measured enterprise pilots",
      impact: "3x faster path to $10M ARR"
    },
    {
      traditional: "Hope-based market assumptions",
      arena: "Data-driven buyer validation",
      impact: "Evidence-based investment decisions"
    }
  ];

  const impactMetrics = [
    {
      value: "90%",
      label: "Pilot Success Rate",
      description: "Our orchestrated pilots convert to purchases at unprecedented rates"
    },
    {
      value: "F500",
      label: "Buyer Network",
      description: "Direct access to Fortune 500 decision makers and procurement teams"
    },
    {
      value: "3x",
      label: "Faster Growth",
      description: "Portfolio companies reach $10M ARR 3x faster than traditional VC approach"
    },
    {
      value: "95%",
      label: "Risk Reduction",
      description: "Buyer validation eliminates 95% of traditional go-to-market risk"
    }
  ];

  return (
    <SEOOptimizedPage
      title="About Arena Fund | Buyer-Validated Venture Capital"
      description="Learn about Arena Fund's unique approach to venture capital. We validate Fortune 500 buyer demand before investing, achieving 90% pilot-to-purchase conversion rates."
      url="/about"
      keywords={['Arena Fund', 'about', 'venture capital', 'buyer validation', 'Fortune 500', 'B2B AI']}
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
      ]}
    >
      <AIOptimizedContent enableFactMarkers enableCitations>
        <Header />

      {/* Hero Section */}
      <section className="arena-section-lg bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container">
          <div className="text-center space-y-10">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="arena-badge">
                  <Target className="w-4 h-4 mr-2" />
                  About Arena Fund
                </div>

                <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                  <span className="arena-gradient-text">Proof Before Promises</span>
                </h1>
              </div>

              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                <AIFactMarker>Arena Fund is the first venture capital fund that validates Fortune 500 buyer demand before we invest.</AIFactMarker>
                {' '}While most VCs place bets on technology and hope customers will follow, we flip the playbook.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link href="/apply" className="arena-btn-primary">
                <Briefcase className="w-5 h-5 mr-2 flex-shrink-0" />
                Pitch Us
              </Link>
              <Link href="/invest" className="arena-btn-secondary">
                <TrendingUp className="w-5 h-5 mr-2 flex-shrink-0" />
                Join Our Circle
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
              <Link href="/thesis" className="inline-flex items-center arena-body text-arena-gold hover:text-arena-gold-dark font-medium transition-colors duration-200">
                <Target className="w-4 h-4 mr-2 flex-shrink-0" />
                Our Investment Thesis
              </Link>
              <Link href="/insights" className="inline-flex items-center arena-body text-arena-gold hover:text-arena-gold-dark font-medium transition-colors duration-200">
                <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
                Market Insights
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="arena-section-lg bg-white">
        <div className="arena-container">
          <div className="space-y-16">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Why We Exist</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                In venture capital, too many founders get stuck in pilot purgatory—endless demos that never convert.
                <AIDataPoint type="percentage">Research shows roughly 95% of AI pilots stall without generating revenue.</AIDataPoint>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              <div className="flex flex-col space-y-8">
                <div className="min-h-[200px] flex flex-col justify-between space-y-6">
                  <h3 className="arena-subtitle text-arena-navy">The Problem</h3>
                  <p className="arena-body text-gray-700">
                    That's wasted energy, delayed traction, and investor capital at risk. We formed Arena Fund to change that.
                    With decades of experience in enterprise sales and product building, our team knew success starts not in a pitch deck,
                    but at a customer's desk.
                  </p>
                </div>

                <div className="bg-arena-foggy-pith border-l-4 border-arena-bright-umber p-8 rounded-lg flex-1 flex flex-col justify-center">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-arena-abilene-lace rounded-full flex items-center justify-center">
                      <span className="text-arena-bright-umber font-bold arena-body"><AIDataPoint type="percentage">95%</AIDataPoint></span>
                    </div>
                    <h4 className="arena-body font-semibold text-arena-night-brown">AI Pilot Failure Rate</h4>
                  </div>
                  <p className="arena-body text-arena-hunter-green">
                    <AIFactMarker>Traditional AI pilots fail to convert to revenue, leaving founders in endless demo cycles
                    and investors with unproven market assumptions.</AIFactMarker>
                  </p>
                </div>
              </div>

              <div className="flex flex-col space-y-8">
                <div className="min-h-[200px] flex flex-col justify-between space-y-6">
                  <h3 className="arena-subtitle text-arena-navy">Our Solution</h3>
                  <p className="arena-body text-gray-700">
                    We run enterprise pilots first, then deploy capital into startups that already have the trust of real buyers.
                    This approach transforms blind bets into evidence-based decisions.
                  </p>
                </div>

                <div className="bg-arena-abilene-lace border-l-4 border-arena-hunter-green p-8 rounded-lg flex-1 flex flex-col justify-center">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-arena-foggy-pith rounded-full flex items-center justify-center">
                      <span className="text-arena-hunter-green font-bold arena-body"><AIDataPoint type="percentage">90%</AIDataPoint></span>
                    </div>
                    <h4 className="arena-body font-semibold text-arena-night-brown">Our Pilot Success Rate</h4>
                  </div>
                  <p className="arena-body text-arena-hunter-green">
                    <AIFactMarker>Our orchestrated pilots achieve 90% pilot-to-purchase conversion rates,
                    proving demand before investment decisions are made.</AIFactMarker>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Differently */}
      <section className="arena-section-lg bg-arena-foggy-pith">
        <div className="arena-container">
          <div className="space-y-16">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">What We Do <span className="arena-gradient-text">Differently</span></h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                From day one, we mobilize Fortune 500 executives, engineers, and decision-makers.
                Together we transform how venture capital validates and scales enterprise AI.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-arena-gold" />
                </div>
                <h3 className="arena-subtitle text-arena-navy">Map Buyer Relationships</h3>
                <p className="arena-body text-gray-600">
                  We identify and connect with Fortune 500 decision makers inside target companies,
                  building relationships before pitches begin.
                </p>
              </div>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Target className="w-10 h-10 text-arena-gold" />
                </div>
                <h3 className="arena-subtitle text-arena-navy">Co-design ROI Pilots</h3>
                <p className="arena-body text-gray-600">
                  We work directly with enterprise buyers to design pilots with measurable ROI,
                  ensuring clear success criteria from the start.
                </p>
              </div>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-arena-gold" />
                </div>
                <h3 className="arena-subtitle text-arena-navy">Validate Before Investment</h3>
                <p className="arena-body text-gray-600">
                  We validate demand through successful pilots before term sheets are signed,
                  reducing risk for both founders and investors.
                </p>
              </div>
            </div>

            <div className="arena-card p-10">
              <h3 className="arena-subtitle text-arena-navy mb-8 text-center">The Result</h3>
              <p className="arena-body text-center text-gray-700 mb-10">
                Our startups see enterprise contracts close faster, with pilots converting to deals at astonishing rates—nearly 90% pilot-to-purchase.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {impactMetrics.map((metric, index) => (
                  <div key={index} className="text-center">
                    <div className="arena-metric-value text-4xl md:text-5xl">{metric.value}</div>
                    <div className="arena-metric-label mb-3">{metric.label}</div>
                    <p className="arena-body text-gray-600">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Founders & Investors */}
      <section className="arena-section-lg bg-white">
        <div className="arena-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-stretch">
            {/* For Founders */}
            <div className="flex flex-col space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-arena-gold-light rounded-full flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-arena-gold" />
                  </div>
                  <h2 className="arena-subtitle text-arena-navy">For Founders</h2>
                </div>
                <p className="arena-body text-gray-700">
                  Working with Arena Fund means your first customers are already at the table.
                </p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-arena-hunter-green mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="arena-body font-semibold text-arena-navy">No More Cold Outreach</h4>
                    <p className="arena-body text-gray-600">Direct access to Fortune 500 decision makers through our validated network</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-arena-hunter-green mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="arena-body font-semibold text-arena-navy">Accelerated Learning</h4>
                    <p className="arena-body text-gray-600">We shorten your learning curve with real buyer feedback and market insights</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-arena-hunter-green mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="arena-body font-semibold text-arena-navy">Predictable Revenue</h4>
                    <p className="arena-body text-gray-600">Turn pilots into predictable revenue streams with our proven conversion methodology</p>
                  </div>
                </div>
              </div>

              <div className="bg-arena-cream p-8 rounded-lg border-l-4 border-arena-gold min-h-[120px] flex items-center">
                <p className="arena-body text-arena-navy font-medium">
                  "You're not just selling potential - you're selling proof."
                </p>
              </div>

              <div className="flex justify-center">
                <Link href="/apply" className="arena-btn-primary">
                  <Briefcase className="w-5 h-5 mr-2 flex-shrink-0" />
                  Pitch Us
                </Link>
              </div>
            </div>

            {/* For Investors & LPs */}
            <div className="flex flex-col space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-arena-gold-light rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-arena-gold" />
                  </div>
                  <h2 className="arena-subtitle text-arena-navy">For Investors & LPs</h2>
                </div>
                <p className="arena-body text-gray-700">
                  Our approach transforms blind bets into evidence-based decisions.
                </p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-arena-hunter-green mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="arena-body font-semibold text-arena-navy">Reduced Go-to-Market Risk</h4>
                    <p className="arena-body text-gray-600">By the time we invest, startups have already proven demand with buyer-validated data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-arena-hunter-green mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="arena-body font-semibold text-arena-navy">Institutional Discipline</h4>
                    <p className="arena-body text-gray-600">Reg D/CF/A+ compliance, robust KYC/AML, and clear reporting standards</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-arena-hunter-green mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="arena-body font-semibold text-arena-navy">Transparent Journey</h4>
                    <p className="arena-body text-gray-600">Complete transparency at every step because trust is as valuable as performance</p>
                  </div>
                </div>
              </div>

              <div className="bg-arena-cream p-8 rounded-lg border-l-4 border-arena-gold min-h-[120px] flex items-center">
                <p className="arena-body text-arena-navy font-medium">
                  "This increases confidence in returns and brings transparency to every step of the journey."
                </p>
              </div>

              <div className="flex justify-center">
                <Link href="/invest" className="arena-btn-secondary">
                  <TrendingUp className="w-5 h-5 mr-2 flex-shrink-0" />
                  Join Our Circle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Beliefs */}
      <section className="arena-section-lg bg-arena-navy text-white">
        <div className="arena-container">
          <div className="space-y-16">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-white">Our <span className="arena-gradient-text">Beliefs</span></h2>
              <p className="arena-body-xl text-gray-300 max-w-3xl mx-auto">
                We're operators at heart, and we talk in outcomes, not buzzwords.
                These core beliefs guide every investment decision and partnership we make.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {coreValues.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div key={index} className="text-center space-y-6">
                    <div className="w-20 h-20 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                      <Icon className="w-10 h-10 text-arena-gold" />
                    </div>
                    <h3 className="arena-subtitle text-white">{value.title}</h3>
                    <p className="arena-body text-gray-300">{value.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <p className="arena-body-xl text-gray-300 italic">
                "Evidence beats opinion. Trust is earned through action. Technology should deepen humanity, not diminish it."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="arena-section-lg bg-arena-foggy-pith">
        <div className="arena-container">
          <div className="space-y-16">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Traditional VC vs <span className="arena-gradient-text">Arena Fund</span></h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                See how our buyer-validated approach fundamentally changes the venture capital equation,
                reducing risk while accelerating growth for both founders and investors.
              </p>
            </div>

            <div className="space-y-6 max-w-5xl mx-auto">
              {differentiators.map((diff, index) => (
                <div key={index} className="arena-card p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="text-center md:text-left">
                      <h4 className="arena-body font-semibold text-gray-500 mb-3">Traditional VC</h4>
                      <p className="arena-body text-gray-600">{diff.traditional}</p>
                    </div>

                    <div className="text-center md:text-left">
                      <h4 className="arena-body font-semibold text-arena-gold mb-3">Arena Fund</h4>
                      <p className="arena-body text-arena-navy font-medium">{diff.arena}</p>
                    </div>

                    <div className="text-center md:text-left">
                      <div className="inline-flex items-center px-4 py-2 bg-arena-abilene-lace text-arena-night-brown rounded-full arena-body font-medium">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {diff.impact}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Join Us in the Arena */}
      <section className="arena-section-lg bg-arena-gold text-arena-navy">
        <div className="arena-container">
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <h2 className="arena-headline text-arena-navy">Join Us in the Arena</h2>
              <p className="arena-body-xl max-w-3xl mx-auto">
                We're here for founders who build with clarity and conscience—and for investors who want
                data-driven conviction, not speculation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 text-center flex flex-col">
                <div className="w-20 h-20 mx-auto mb-6 bg-arena-navy rounded-full flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-arena-gold" />
                </div>
                <h3 className="arena-subtitle text-arena-navy mb-4">Founders</h3>
                <p className="arena-body text-arena-navy/80 mb-8 flex-grow">Ready to validate and scale with Fortune 500 buyers?</p>
                <div className="flex justify-center">
                  <Link href="/apply" className="arena-btn-primary-on-gold">
                    <Briefcase className="w-5 h-5 mr-2 flex-shrink-0" />
                    Pitch Us
                  </Link>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 text-center flex flex-col">
                <div className="w-20 h-20 mx-auto mb-6 bg-arena-navy rounded-full flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-arena-gold" />
                </div>
                <h3 className="arena-subtitle text-arena-navy mb-4">Investors</h3>
                <p className="arena-body text-arena-navy/80 mb-8 flex-grow">Looking to back buyer-proven startups?</p>
                <div className="flex justify-center">
                  <Link href="/invest" className="arena-btn-secondary-on-gold">
                    <TrendingUp className="w-5 h-5 mr-2 flex-shrink-0" />
                    Join Our Circle
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="arena-body text-arena-navy/70">
                Ready to transform how venture capital validates and scales enterprise AI?
              </p>
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </AIOptimizedContent>
    </SEOOptimizedPage>
  );
}