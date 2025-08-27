import Link from 'next/link';
import type { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo-utils';
import { StructuredData } from '@/components/StructuredData';
import { generatePageStructuredData } from '@/lib/structured-data';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Target,
  TrendingUp,
  Users,
  Building2,
  CheckCircle,
  BarChart3,
  Zap,
  Award,
  ArrowRight,
  Globe,
  Briefcase,
  FileText,
  Lightbulb,
  Shield,
  Eye,
  Brain,
  Rocket,
  AlertTriangle,
  Layers,
  Database,
  Workflow,
  RefreshCw,
  Quote,
  Scale,
  Activity,
  Cpu,
  Palette,
  Settings
} from 'lucide-react';

// Generate SEO metadata for the thesis page using integration utilities
import { generateArenaFundPageSEO } from '@/lib/seo-integration';
import { SEOOptimizedPage } from '@/components/SEOOptimizedPage';
import { AIOptimizedContent, AIFactMarker, AIDataPoint } from '@/components/AIOptimizedContent';

const { metadata } = generateArenaFundPageSEO('thesis');
export { metadata };

export default function ThesisPage() {
  const coreTheories = [
    {
      title: "The Hidden Ledger of Demand",
      description: "Enterprise adoption is psychology, not technology.",
      details: "If a pilot doesn't balance political capital, renewal KPIs, risk reflexes, and pain lines, it will die. Arena validates this ledger before investing.",
      icon: Scale,
      laws: ["Political Capital", "Renewal KPIs", "Risk Reflexes", "Pain Lines"]
    },
    {
      title: "The Last-Mile Advantage", 
      description: "Defensibility won't come from owning a foundation model.",
      details: "It will come from proprietary datasets, workflow integration, and domain trust. These are the moats enterprises cannot ignore.",
      icon: Target,
      advantages: ["Proprietary Datasets", "Workflow Integration", "Domain Trust", "Revenue Lock-in"]
    },
    {
      title: "The Demand Validation Flywheel",
      description: "Buyers validate → startups de-risk → adoption accelerates → proof attracts more buyers.",
      details: "This compounding loop shortens sales cycles and accelerates revenue.",
      icon: RefreshCw,
      stages: ["Validate", "De-risk", "Adopt", "Scale"]
    }
  ];

  const investmentAreas = [
    {
      title: "Vertical AI Applications",
      description: "Healthcare, finance, insurance, legal — industries where proprietary data + regulation create high walls and urgent needs.",
      icon: Building2,
      examples: ["Healthcare AI", "Financial Services", "Legal Tech", "Insurance Analytics"]
    },
    {
      title: "Enterprise Productivity & Knowledge Work",
      description: "AI tools that tame unstructured data, accelerate workflows, and give knowledge workers leverage.",
      icon: Activity,
      examples: ["Document Intelligence", "Workflow Automation", "Decision Support", "Data Analysis"]
    },
    {
      title: "Generative Creative Tools",
      description: "Platforms that democratize design, media, and education by pairing foundation models with superior user experience.",
      icon: Palette,
      examples: ["Design Automation", "Content Creation", "Educational Tools", "Media Production"]
    },
    {
      title: "Infrastructure & Orchestration",
      description: "Trust, compliance, data, and orchestration layers that make AI adoption enterprise-ready.",
      icon: Settings,
      examples: ["AI Orchestration", "Compliance Tools", "Data Pipelines", "Trust Infrastructure"]
    }
  ];

  const approachPrinciples = [
    {
      title: "Model-Agnostic & Modular",
      description: "We leverage the best foundation models but don't depend on any single one.",
      icon: Layers
    },
    {
      title: "Data Pipelines as Moats",
      description: "Proprietary, structured, and continuously enriched data is where long-term advantage compounds.",
      icon: Database
    },
    {
      title: "Compliance at the Core",
      description: "Regulation (KYC/AML, HIPAA, GDPR) isn't a hurdle — it's a foundation of trust.",
      icon: Shield
    },
    {
      title: "Proof as the Filter",
      description: "We don't bet on potential. We scale only what the market has already validated.",
      icon: CheckCircle
    }
  ];

  return (
    <SEOOptimizedPage
      title="Investment Thesis | Arena Fund - Proof Before Promises in AI"
      description="Arena Fund's investment thesis: Buyer-validated venture capital in the Foundation Model era. We invest where adoption pressure is highest and proof delivers immediate ROI."
      url="/thesis"
      type="article"
      publishedDate="2024-01-01T00:00:00Z"
      author="Arena Fund"
      section="Investment Strategy"
      keywords={['investment thesis', 'AI venture capital', 'foundation models', 'enterprise AI', 'buyer validation']}
      breadcrumbs={[
        { name: 'Home', url: '/' },
        { name: 'Thesis', url: '/thesis' },
      ]}
    >
      <AIOptimizedContent enableFactMarkers enableCitations>
        <Header />

      {/* Hero Section */}
      <section className="arena-section-lg bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="arena-badge">
                <Brain className="w-4 h-4 mr-2" />
                Arena Fund Thesis
              </div>

              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                <span className="arena-gradient-text">Proof Before Promises</span> in the Foundation Model Era
              </h1>

              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                <AIFactMarker>Arena Fund is the first venture capital fund built on Fortune 500 buyer validation.</AIFactMarker>
                {' '}<AIFactMarker>We invest in founders who design for adoption in the Foundation Model era — where value comes not from the biggest models, 
                but from the clearest proof of demand.</AIFactMarker>
              </p>
            </div>

            {/* AI Stack Diagram - Sophisticated Visual */}
            <div className="max-w-4xl mx-auto">
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 border border-gray-200 shadow-2xl overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.3) 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }}></div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="arena-subtitle text-arena-navy mb-8 text-center">The AI Value Stack</h3>
                  
                  {/* Stack Layers with Sophisticated Design */}
                  <div className="space-y-6">
                    {/* Foundation Models - Grayed Out */}
                    <div className="relative">
                      <div className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-6 text-center opacity-60">
                        <div className="flex items-center justify-center space-x-4 mb-3">
                          <Cpu className="w-6 h-6 text-gray-500" />
                          <div className="font-bold text-gray-600 text-lg">Foundation Models</div>
                          <Cpu className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="text-sm text-gray-500 mb-2">OpenAI • Anthropic • Google • Meta</div>
                        <div className="text-xs text-gray-400">Commoditized Infrastructure</div>
                      </div>
                      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                        ×
                      </div>
                    </div>

                    {/* Arrow Down */}
                    <div className="flex justify-center">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-gray-300 to-arena-gold"></div>
                    </div>

                    {/* Platforms - Moderate Interest */}
                    <div className="relative">
                      <div className="bg-[#EAE3D2] border-2 border-[#d5ceba] rounded-2xl p-6 text-center">
                        <div className="flex items-center justify-center space-x-4 mb-3">
                          <Layers className="w-6 h-6 text-[#826644]" />
                          <div className="font-bold text-[#322D25] text-lg">Platforms & Infrastructure</div>
                          <Layers className="w-6 h-6 text-[#826644]" />
                        </div>
                        <div className="text-sm text-[#3A4A3F] mb-2">Integration • APIs • Orchestration</div>
                        <div className="text-xs text-[#826644]">Competitive Landscape</div>
                      </div>
                      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-[#826644] text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                        ~
                      </div>
                    </div>

                    {/* Arrow Down - Highlighted */}
                    <div className="flex justify-center">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-arena-gold rounded-full"></div>
                    </div>

                    {/* Applications - Arena's Focus */}
                    <div className="relative">
                      <div className="bg-gradient-to-r from-arena-gold-light to-arena-cream border-4 border-arena-gold rounded-2xl p-8 text-center shadow-lg">
                        <div className="flex items-center justify-center space-x-4 mb-4">
                          <Target className="w-8 h-8 text-arena-gold" />
                          <div className="font-black text-arena-navy text-xl">Applications & Last Mile</div>
                          <Target className="w-8 h-8 text-arena-gold" />
                        </div>
                        <div className="text-arena-navy font-semibold mb-3">Where adoption, revenue, and defensibility emerge</div>
                        <div className="inline-flex items-center bg-arena-gold text-arena-navy px-4 py-2 rounded-full font-bold text-sm">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Arena's Investment Focus
                        </div>
                      </div>
                      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-arena-gold text-arena-navy rounded-full w-10 h-10 flex items-center justify-center font-black text-lg">
                        ✓
                      </div>
                    </div>
                  </div>

                  {/* Value Flow Indicators */}
                  <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="text-xs text-gray-500">High Capital</div>
                      <div className="text-xs text-gray-400">Low Margins</div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-[#d5ceba] rounded-full mx-auto flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[#826644]" />
                      </div>
                      <div className="text-xs text-[#826644]">Medium Capital</div>
                      <div className="text-xs text-[#3A4A3F]">Medium Margins</div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-12 h-12 bg-arena-gold rounded-full mx-auto flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-xs text-arena-gold font-bold">Lower Capital</div>
                      <div className="text-xs text-arena-gold font-bold">Higher Margins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link href="/apply" className="arena-btn-primary">
                <Briefcase className="w-5 h-5 mr-2 flex-shrink-0" />
                Share Your Thesis With Us
              </Link>
              <Link href="/insights" className="arena-btn-secondary">
                <BarChart3 className="w-5 h-5 mr-2 flex-shrink-0" />
                Read Our Research
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Foundation Model Era */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">The Foundation Model <span className="arena-gradient-text">Era</span></h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <p className="arena-body-xl text-gray-700 leading-relaxed">
                <AIFactMarker>AI has entered its defining epoch — as transformative as the microchip, the Internet, and mobile computing.</AIFactMarker>
                {' '}<AIFactMarker>But unlike prior eras, the prize is no longer in building the model itself. The giants own that game.</AIFactMarker>
              </p>
              <p className="arena-body-xl text-gray-700 leading-relaxed">
                <AIFactMarker>The opportunity lies in the last mile: vertical applications, enterprise platforms, and productivity tools 
                that embed these models into workflows, deliver ROI, and prove value at the buyer's desk.</AIFactMarker>
              </p>
            </div>

            <div className="bg-arena-gold text-arena-navy p-8 rounded-2xl max-w-4xl mx-auto">
              <div className="flex items-start space-x-4">
                <Quote className="w-8 h-8 text-arena-navy flex-shrink-0 mt-1" />
                <p className="arena-body-xl font-medium">
                  "The future of AI isn't about who builds the biggest models. It's about who proves adoption in the last mile."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Core Theories */}
      <section className="arena-section bg-gray-50">
        <div className="arena-container">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Our Core <span className="arena-gradient-text">Theories</span></h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Arena Fund's thesis rests on three operating truths:
              </p>
            </div>

            <div className="space-y-12">
              {coreTheories.map((theory, index) => {
                const Icon = theory.icon;
                return (
                  <div key={index} className="relative">
                    {/* Theory Number */}
                    <div className="absolute -left-4 -top-4 w-16 h-16 bg-arena-gold rounded-full flex items-center justify-center shadow-lg z-10">
                      <span className="text-2xl font-black text-arena-navy">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    
                    <div className="arena-card-premium p-10 ml-8">
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                        <div className="lg:col-span-3 space-y-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-arena-gold-light to-arena-gold rounded-2xl flex items-center justify-center shadow-md">
                              <Icon className="w-7 h-7 text-arena-navy" />
                            </div>
                            <h3 className="arena-subtitle text-arena-navy">{theory.title}</h3>
                          </div>
                          <div className="bg-arena-cream p-6 rounded-xl border-l-4 border-arena-gold">
                            <p className="text-arena-navy font-bold text-lg leading-relaxed">{theory.description}</p>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-lg">{theory.details}</p>
                        </div>
                        
                        <div className="lg:col-span-2">
                          {theory.laws && (
                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                              <h4 className="font-bold text-arena-navy mb-4 flex items-center">
                                <Scale className="w-5 h-5 mr-2 text-arena-gold" />
                                The Four Laws
                              </h4>
                              <div className="space-y-3">
                                {theory.laws.map((law, idx) => (
                                  <div key={idx} className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-arena-gold text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium">{law}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {theory.advantages && (
                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                              <h4 className="font-bold text-arena-navy mb-4 flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-arena-gold" />
                                Moat Elements
                              </h4>
                              <div className="space-y-3">
                                {theory.advantages.map((advantage, idx) => (
                                  <div key={idx} className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-arena-gold text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium">{advantage}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {theory.stages && (
                            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                              <h4 className="font-bold text-arena-navy mb-4 flex items-center">
                                <RefreshCw className="w-5 h-5 mr-2 text-arena-gold" />
                                Flywheel Stages
                              </h4>
                              <div className="space-y-3">
                                {theory.stages.map((stage, idx) => (
                                  <div key={idx} className="flex items-start space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-arena-gold to-arena-gold-dark text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                      {idx + 1}
                                    </div>
                                    <div className="flex-1">
                                      <span className="text-sm text-gray-700 font-medium">{stage}</span>
                                      {idx < theory.stages.length - 1 && (
                                        <div className="w-0.5 h-4 bg-arena-gold ml-4 mt-2"></div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Where We Invest */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Where We <span className="arena-gradient-text">Invest</span></h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Arena backs startups operating where adoption pressure is highest and proof delivers immediate ROI.
              </p>
            </div>

            {/* Investment Matrix - Professional 2x2 */}
            <div className="max-w-6xl mx-auto">
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 border border-gray-200 shadow-2xl">
                {/* Axis Labels */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-arena-gold text-arena-navy px-4 py-2 rounded-full text-sm font-bold">
                  High Adoption Pressure
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-400 text-white px-4 py-2 rounded-full text-sm font-bold">
                  Low Adoption Pressure
                </div>
                <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 bg-arena-gold text-arena-navy px-4 py-2 rounded-full text-sm font-bold">
                  High ROI Proof
                </div>
                <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 rotate-90 bg-gray-400 text-white px-4 py-2 rounded-full text-sm font-bold">
                  Low ROI Proof
                </div>

                <div className="grid grid-cols-2 gap-8 h-96">
                  {/* Quadrant 1: Vertical AI - Top Left */}
                  <div className="bg-gradient-to-br from-arena-gold-light to-arena-cream rounded-2xl p-8 border-4 border-arena-gold relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-4 right-4 w-8 h-8 bg-arena-gold text-arena-navy rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-10 h-10 text-arena-gold-dark" />
                        <h3 className="font-bold text-arena-navy text-xl">Vertical AI</h3>
                      </div>
                      <p className="text-arena-navy text-sm leading-relaxed">Healthcare, finance, insurance, legal — industries where proprietary data + regulation create high walls and urgent needs.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-arena-gold text-arena-navy px-2 py-1 rounded text-xs text-center font-medium">Healthcare AI</div>
                        <div className="bg-arena-gold text-arena-navy px-2 py-1 rounded text-xs text-center font-medium">FinTech</div>
                        <div className="bg-arena-gold text-arena-navy px-2 py-1 rounded text-xs text-center font-medium">Legal Tech</div>
                        <div className="bg-arena-gold text-arena-navy px-2 py-1 rounded text-xs text-center font-medium">InsurTech</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-arena-gold rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  </div>

                  {/* Quadrant 2: Enterprise Productivity - Top Right */}
                  <div className="bg-gradient-to-br from-[#EAE3D2] to-[#e0d9c6] rounded-2xl p-8 border-4 border-[#d5ceba] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-4 right-4 w-8 h-8 bg-[#3A4A3F] text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-10 h-10 text-[#3A4A3F]" />
                        <h3 className="font-bold text-[#322D25] text-xl">Enterprise Productivity</h3>
                      </div>
                      <p className="text-[#3A4A3F] text-sm leading-relaxed">AI tools that tame unstructured data, accelerate workflows, and give knowledge workers leverage.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#d5ceba] text-[#3A4A3F] px-2 py-1 rounded text-xs text-center font-medium">Document AI</div>
                        <div className="bg-[#d5ceba] text-[#3A4A3F] px-2 py-1 rounded text-xs text-center font-medium">Workflow Auto</div>
                        <div className="bg-[#d5ceba] text-[#3A4A3F] px-2 py-1 rounded text-xs text-center font-medium">Decision Support</div>
                        <div className="bg-[#d5ceba] text-[#3A4A3F] px-2 py-1 rounded text-xs text-center font-medium">Data Analysis</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#3A4A3F] rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  </div>

                  {/* Quadrant 3: Creative Tools - Bottom Left */}
                  <div className="bg-gradient-to-br from-[#F4BF77] to-[#f0b869] rounded-2xl p-8 border-4 border-[#ecb15b] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-4 right-4 w-8 h-8 bg-[#322D25] text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Palette className="w-10 h-10 text-[#322D25]" />
                        <h3 className="font-bold text-[#322D25] text-xl">Creative Tools</h3>
                      </div>
                      <p className="text-[#322D25] text-sm leading-relaxed">Platforms that democratize design, media, and education by pairing foundation models with superior UX.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#ecb15b] text-[#322D25] px-2 py-1 rounded text-xs text-center font-medium">Design Auto</div>
                        <div className="bg-[#ecb15b] text-[#322D25] px-2 py-1 rounded text-xs text-center font-medium">Content Gen</div>
                        <div className="bg-[#ecb15b] text-[#322D25] px-2 py-1 rounded text-xs text-center font-medium">EdTech Tools</div>
                        <div className="bg-[#ecb15b] text-[#322D25] px-2 py-1 rounded text-xs text-center font-medium">Media Prod</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#322D25] rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  </div>

                  {/* Quadrant 4: Infrastructure - Bottom Right */}
                  <div className="bg-gradient-to-br from-[#FBF6EF] to-[#f7f2e9] rounded-2xl p-8 border-4 border-[#f3eee3] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-4 right-4 w-8 h-8 bg-[#826644] text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Settings className="w-10 h-10 text-[#826644]" />
                        <h3 className="font-bold text-[#322D25] text-xl">Infrastructure</h3>
                      </div>
                      <p className="text-[#826644] text-sm leading-relaxed">Trust, compliance, data, and orchestration layers that make AI adoption enterprise-ready.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#f3eee3] text-[#826644] px-2 py-1 rounded text-xs text-center font-medium">AI Orchestration</div>
                        <div className="bg-[#f3eee3] text-[#826644] px-2 py-1 rounded text-xs text-center font-medium">Compliance</div>
                        <div className="bg-[#f3eee3] text-[#826644] px-2 py-1 rounded text-xs text-center font-medium">Data Pipelines</div>
                        <div className="bg-[#f3eee3] text-[#826644] px-2 py-1 rounded text-xs text-center font-medium">Trust Infra</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[#826644] rounded-full opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  </div>
                </div>

                {/* Center Focus Indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-arena-gold rounded-full flex items-center justify-center shadow-lg z-10">
                  <Target className="w-10 h-10 text-arena-navy" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="arena-section bg-gray-50">
        <div className="arena-container">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Our <span className="arena-gradient-text">Approach</span></h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Arena Fund operates with full-stack vision and data-first discipline:
              </p>
            </div>

            {/* Four Principles - Consistent Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {approachPrinciples.map((principle, index) => {
                const Icon = principle.icon;
                return (
                  <div key={index} className="relative">
                    {/* Principle Number */}
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-arena-navy rounded-full flex items-center justify-center shadow-lg z-10">
                      <span className="text-sm font-bold text-arena-gold">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    
                    <div className="arena-card-premium p-8 ml-4 mt-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-arena-gold-light to-arena-gold rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                          <Icon className="w-7 h-7 text-arena-navy" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-arena-navy mb-3 text-lg">{principle.title}</h3>
                          <p className="text-gray-700 leading-relaxed">{principle.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sophisticated Full-Stack Pyramid */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-12 border border-gray-200 shadow-2xl">
                <h3 className="arena-subtitle text-arena-navy mb-8 text-center">Full-Stack AI Investment Pyramid</h3>
                
                <div className="relative">
                  {/* Pyramid Layers */}
                  <div className="space-y-4">
                    {/* Application Layer - Top */}
                    <div className="mx-0">
                      <div className="bg-gradient-to-r from-arena-gold-light to-arena-gold p-6 rounded-2xl text-center border-4 border-arena-gold shadow-lg relative">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-arena-navy text-arena-gold rounded-full flex items-center justify-center font-bold text-sm">4</div>
                        <div className="font-black text-arena-navy text-xl mb-2">Application Layer</div>
                        <div className="text-arena-navy font-semibold">User experience & adoption</div>
                        <div className="text-sm text-arena-navy mt-2 opacity-80">Where value is realized</div>
                      </div>
                    </div>

                    {/* Workflow Integration - Arena's Focus */}
                    <div className="mx-8">
                      <div className="bg-gradient-to-r from-[#F4BF77] to-[#f0b869] p-6 rounded-2xl text-center border-4 border-[#ecb15b] shadow-lg relative">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-arena-gold text-arena-navy rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div className="font-bold text-[#322D25] text-lg mb-2">Workflow Integration</div>
                        <div className="text-[#322D25] font-semibold">Arena's sweet spot</div>
                        <div className="inline-flex items-center bg-arena-gold text-arena-navy px-3 py-1 rounded-full text-xs font-bold mt-2">
                          <Target className="w-3 h-3 mr-1" />
                          Primary Focus
                        </div>
                      </div>
                    </div>

                    {/* Infrastructure */}
                    <div className="mx-16">
                      <div className="bg-gradient-to-r from-[#EAE3D2] to-[#e0d9c6] p-6 rounded-2xl text-center border-4 border-[#d5ceba] shadow-lg relative">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#3A4A3F] text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div className="font-bold text-[#322D25] text-lg mb-2">Infrastructure</div>
                        <div className="text-[#3A4A3F] font-semibold">Trust & compliance</div>
                        <div className="text-sm text-[#826644] mt-2">Enterprise readiness</div>
                      </div>
                    </div>

                    {/* Data Pipelines - Foundation */}
                    <div className="mx-24">
                      <div className="bg-gradient-to-r from-[#FBF6EF] to-[#f7f2e9] p-6 rounded-2xl text-center border-4 border-[#f3eee3] shadow-lg relative">
                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#826644] text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div className="font-bold text-[#322D25] text-lg mb-2">Data Pipelines</div>
                        <div className="text-[#826644] font-semibold">Proprietary moats</div>
                        <div className="text-sm text-[#3A4A3F] mt-2">Foundation of defensibility</div>
                      </div>
                    </div>
                  </div>

                  {/* Value Legend - Better Positioned */}
                  <div className="mt-8 flex justify-center">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <h4 className="font-semibold text-arena-navy mb-4 text-center">Value Impact Scale</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-arena-gold rounded-full"></div>
                          <div className="text-xs text-gray-700 font-medium">High Value</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-[#3A4A3F] rounded-full"></div>
                          <div className="text-xs text-gray-700 font-medium">High Impact</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-[#F4BF77] rounded-full"></div>
                          <div className="text-xs text-gray-700 font-medium">Medium Impact</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-[#826644] rounded-full"></div>
                          <div className="text-xs text-gray-700 font-medium">Foundation</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Do It */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Why We <span className="arena-gradient-text">Do It</span></h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <p className="arena-body-xl text-gray-700 leading-relaxed">
                AI will unlock trillions in value, but only if it is built for adoption.
              </p>
              <p className="arena-body-xl text-gray-700 leading-relaxed">
                We believe:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-arena-cream p-6 rounded-lg text-center border border-arena-gold-light">
                  <Brain className="w-8 h-8 text-arena-gold mx-auto mb-3" />
                  <p className="text-arena-navy font-medium">Technology should amplify human creativity, not replace it.</p>
                </div>
                <div className="bg-[#EAE3D2] p-6 rounded-lg text-center border border-[#d5ceba]">
                  <Users className="w-8 h-8 text-[#3A4A3F] mx-auto mb-3" />
                  <p className="text-[#322D25] font-medium">Innovation should be inclusive and responsible, not extractive.</p>
                </div>
                <div className="bg-[#FBF6EF] p-6 rounded-lg text-center border border-[#f3eee3]">
                  <Shield className="w-8 h-8 text-[#826644] mx-auto mb-3" />
                  <p className="text-[#322D25] font-medium">Venture capital should de-risk adoption before investing, not gamble on potential.</p>
                </div>
              </div>
            </div>

            <div className="bg-arena-navy text-arena-gold p-8 rounded-2xl max-w-4xl mx-auto">
              <div className="text-center">
                <p className="text-2xl font-bold mb-2">Proof before promises isn't our slogan.</p>
                <p className="text-xl">It's our law.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Manifesto */}
      <section className="arena-section bg-arena-gold text-arena-navy">
        <div className="arena-container">
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Closing <span className="text-arena-navy">Manifesto</span></h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <p className="arena-body-xl text-arena-navy leading-relaxed font-medium">
                The Foundation Model era rewards clarity.
              </p>
              <p className="arena-body-xl text-arena-navy leading-relaxed">
                Startups that balance the Hidden Ledger and design for the last mile will scale faster and build moats deeper. 
                LPs who back them will protect capital and compound returns. Enterprises that partner with them will escape 
                pilot purgatory and accelerate adoption.
              </p>
              <p className="arena-body-xl text-arena-navy leading-relaxed font-medium">
                This is Arena's thesis: the winners in AI will not be those who shout the loudest promises, 
                but those who prove demand the fastest.
              </p>
            </div>

            <div className="text-center space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <Link href="/apply" className="arena-btn-primary-on-gold">
                  <Briefcase className="w-5 h-5 mr-2 flex-shrink-0" />
                  Share Your Thesis With Us
                </Link>
                <Link href="/invest" className="arena-btn-secondary-on-gold">
                  <FileText className="w-5 h-5 mr-2 flex-shrink-0" />
                  Partner With Arena
                </Link>
              </div>
              <p className="text-arena-navy/80 text-sm max-w-2xl mx-auto">
                Founders: building undeniable proof of adoption? LPs: seeking validated exposure? Let's talk.
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