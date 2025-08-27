'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SEOOptimizedPage } from '@/components/SEOOptimizedPage'
import { AIOptimizedContent, AIFactMarker, AIDataPoint } from '@/components/AIOptimizedContent'
import { arenaFundPages } from '@/lib/seo-integration'
import {
  BarChart3,
  CheckCircle,
  Zap,
  Rocket,
  X,
  Target,
  FileText,
  Users,
  Briefcase,
  Lightbulb
} from 'lucide-react'

export default function Home() {
  const pageConfig = arenaFundPages.home;
  const validationSteps = [
    {
      number: "01",
      title: "Buyer Discovery",
      description: "Map Fortune 500 decision makers and procurement processes across target verticals",
      icon: Users,
      details: "Direct access to 500+ enterprise buyers through our network"
    },
    {
      number: "02",
      title: "Demand Validation",
      description: "Systematic validation of enterprise demand through structured buyer interviews",
      icon: Target,
      details: "Proprietary methodology with 85% accuracy in predicting enterprise adoption"
    },
    {
      number: "03",
      title: "Pilot Orchestration",
      description: "Facilitate pilot programs with validated buyers to prove product-market fit",
      icon: Zap,
      details: "90% pilot to purchase order conversion rate across portfolio"
    },
    {
      number: "04",
      title: "Scale Acceleration",
      description: "Leverage validated demand to accelerate enterprise sales and follow-on funding",
      icon: Briefcase,
      details: "3x faster path to $10M ARR compared to traditional VC approach"
    }
  ]

  const competitiveAdvantages = [
    {
      traditional: "Generic founder-market fit assessment",
      arena: "Systematic Fortune 500 buyer validation",
      impact: "85% higher enterprise adoption rate"
    },
    {
      traditional: "Post-investment sales support",
      arena: "Pre-investment demand validation",
      impact: "3x faster path to $10M ARR"
    },
    {
      traditional: "Network introductions",
      arena: "Orchestrated pilot programs",
      impact: "90% pilot to purchase conversion"
    },
    {
      traditional: "Market size assumptions",
      arena: "Validated enterprise demand",
      impact: "67% reduction in market risk"
    }
  ]

  return (
    <SEOOptimizedPage
      title={pageConfig.title}
      description={pageConfig.description}
      url={pageConfig.url}
      keywords={[...pageConfig.keywords]}
      breadcrumbs={[...pageConfig.breadcrumbs]}
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
                  <Zap className="w-4 h-4 mr-2" />
                  Buyer-Validated B2B AI
                </div>

                <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                  The Only VC Fund That Validates <span className="arena-gradient-text">Fortune 500 Buyers</span> Before Investing
                </h1>
              </div>

              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                <AIFactMarker>We secure real enterprise demand through Fortune 500 pilots before committing capital.</AIFactMarker>
                {' '}With a <AIDataPoint type="percentage">90% pilot-to-purchase conversion rate</AIDataPoint>, founders scale faster and LPs invest with proven traction.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="arena-btn-primary">
                <Rocket className="w-5 h-5 mr-2" />
                Apply for Funding
              </Link>
              <Link href="/invest" className="arena-btn-secondary">
                <BarChart3 className="w-5 h-5 mr-2" />
                Invest With Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="arena-section-lg bg-white">
        <div className="arena-container">
          <div className="space-y-16">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Traditional VC Has a <span className="arena-gradient-text">Demand Problem</span></h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                <AIFactMarker>Most venture funds invest based on assumptions about market demand.</AIFactMarker>
                {' '}<AIFactMarker>We validate real enterprise buyers before writing checks.</AIFactMarker>
              </p>
            </div>

            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="arena-card p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-arena-gold-light flex items-center justify-center">
                      <X className="w-6 h-6 text-arena-gold" />
                    </div>
                    <div>
                      <h3 className="arena-subtitle text-arena-navy mb-6">Traditional VC Approach</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-arena-bright-umber mt-2 flex-shrink-0"></div>
                          <span className="arena-body text-gray-600">Invests before market fit is proven</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-arena-bright-umber mt-2 flex-shrink-0"></div>
                          <span className="arena-body text-gray-600">Traction assumed, not tested</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-arena-bright-umber mt-2 flex-shrink-0"></div>
                          <span className="arena-body text-gray-600">Limited hands-on sales support</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="arena-card p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-arena-navy-light flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-arena-gold" />
                    </div>
                    <div>
                      <h3 className="arena-subtitle text-arena-navy mb-6">Arena Fund Approach</h3>
                      <ul className="space-y-4">
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-arena-gold mt-2 flex-shrink-0"></div>
                          <span className="arena-body text-gray-700">Customer demand before capital</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-arena-gold mt-2 flex-shrink-0"></div>
                          <span className="arena-body text-gray-700">Pilots with 90% conversion rate</span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-arena-gold mt-2 flex-shrink-0"></div>
                          <span className="arena-body text-gray-700">Revenue acceleration post-investment</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="arena-card p-8">
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-arena-gold-light mb-4">
                      <BarChart3 className="w-8 h-8 text-arena-gold" />
                    </div>
                    <h3 className="arena-subtitle text-arena-navy">Market Validation Metrics</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="arena-body text-gray-600">Traditional VC Success Rate</span>
                        <span className="arena-body font-semibold text-arena-navy">5-10%</span>
                      </div>
                      <div className="w-full bg-arena-abilene-lace rounded-full h-3">
                        <div className="bg-arena-bright-umber h-3 rounded-full transition-all duration-1000" style={{ width: '7.5%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="arena-body text-gray-600">Arena Fund Success Rate</span>
                        <span className="arena-body font-semibold text-arena-gold">90%</span>
                      </div>
                      <div className="w-full bg-arena-abilene-lace rounded-full h-3">
                        <div className="bg-arena-gold h-3 rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                  </div>

                  <p className="text-center arena-body text-gray-600 italic">
                    Our buyer-validated approach reduces investment risk while accelerating founder growth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buyer Validation Methodology */}
      <section className="arena-section-lg bg-arena-foggy-pith">
        <div className="arena-container">
          <div className="space-y-16">
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <div className="arena-badge">
                  <Target className="w-4 h-4 mr-2" />
                  Our 4-Stage Process
                </div>
                <h2 className="arena-headline text-arena-navy">Buyer-Validated <span className="arena-gradient-text">Methodology</span></h2>
                <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                  A systematic approach that validates enterprise demand before investment,
                  reducing risk and accelerating growth for both founders and investors.
                </p>
              </div>
            </div>

            {/* Process Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {validationSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="group cursor-pointer">
                    <div className="arena-card p-8 text-center relative overflow-hidden hover:shadow-lg transition-all duration-300 h-[280px]">
                      {/* Default state content */}
                      <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                        <div className="arena-process-number mb-4">{step.number}</div>
                        <Icon className="w-10 h-10 text-arena-gold mx-auto mb-4" />
                        <h3 className="arena-subtitle text-arena-navy mb-4 leading-tight">{step.title}</h3>

                        {/* Dots - positioned at bottom */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                          <div className="flex items-center justify-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-arena-gold rounded-full animate-pulse"></div>
                            <div className="w-1.5 h-1.5 bg-arena-gold rounded-full animate-pulse delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-arena-gold rounded-full animate-pulse delay-150"></div>
                          </div>
                        </div>
                      </div>

                      {/* Hover overlay - covers entire card */}
                      <div className="absolute inset-0 bg-white p-8 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="arena-process-number mb-4">{step.number}</div>
                        <Icon className="w-10 h-10 text-arena-gold mx-auto mb-4" />
                        <h3 className="arena-subtitle text-arena-navy mb-4 leading-tight">{step.title}</h3>
                        <p className="arena-body text-gray-600 mb-3 text-center">{step.description}</p>
                        <p className="text-sm text-arena-gold font-medium text-center">{step.details}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Competitive Advantage */}
      <section className="arena-section-lg bg-white">
        <div className="arena-container">
          <div className="space-y-16">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Why Arena Fund Wins</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Systematic buyer validation creates unfair advantages for both investors and founders,
                fundamentally changing the risk-reward equation in venture capital.
              </p>
            </div>

            <div className="space-y-6 max-w-5xl mx-auto">
              {competitiveAdvantages.map((advantage, index) => (
                <div key={index} className="arena-card p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="text-center md:text-left">
                      <h4 className="arena-body font-semibold text-gray-500 mb-3">Traditional VC</h4>
                      <p className="arena-body text-gray-600">{advantage.traditional}</p>
                    </div>

                    <div className="text-center md:text-left">
                      <h4 className="arena-body font-semibold text-arena-gold mb-3">Arena Fund</h4>
                      <p className="arena-body text-arena-navy font-medium">{advantage.arena}</p>
                    </div>

                    <div className="text-center md:text-left">
                      <h4 className="arena-body font-semibold text-arena-hunter-green mb-3">Impact</h4>
                      <p className="arena-body text-arena-night-brown font-bold">{advantage.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="arena-section-lg bg-arena-gold text-arena-navy">
        <div className="arena-container">
          <div className="text-center space-y-10">
            <div className="space-y-6">
              <h2 className="arena-headline text-arena-navy">Ready to Partner with Arena Fund?</h2>
              <p className="arena-body-xl max-w-3xl mx-auto">
                Join the only VC fund that proves Fortune 500 buyer demand before investing.
                Systematic validation, orchestrated pilots, guaranteed enterprise traction.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="arena-btn-primary-on-gold">
                <FileText className="w-5 h-5 mr-2" />
                Apply for Funding
              </Link>
              <Link href="/invest" className="arena-btn-secondary-on-gold">
                <BarChart3 className="w-5 h-5 mr-2" />
                Partner with Us
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4">
              <Link href="/thesis" className="inline-flex items-center arena-body text-arena-navy hover:text-arena-navy-light font-medium transition-colors duration-200">
                <Target className="w-4 h-4 mr-2" />
                Our Investment Thesis
              </Link>
              <Link href="/insights" className="inline-flex items-center arena-body text-arena-navy hover:text-arena-navy-light font-medium transition-colors duration-200">
                <Lightbulb className="w-4 h-4 mr-2" />
                Market Insights
              </Link>
              <Link href="/about" className="inline-flex items-center arena-body text-arena-navy hover:text-arena-navy-light font-medium transition-colors duration-200">
                <Users className="w-4 h-4 mr-2" />
                About Arena Fund
              </Link>
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </AIOptimizedContent>
    </SEOOptimizedPage>
  );
}
