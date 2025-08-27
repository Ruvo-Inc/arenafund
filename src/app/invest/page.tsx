'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ModeSelector, { InvestorMode } from '@/components/ModeSelector';
import ProcessTimeline from '@/components/ProcessTimeline';
import ModeContent from '@/components/ModeContent';
import { 
  TrendingUp,
  Target,
  Building2,
  Award,
  BarChart3,
  Shield,
  FileText
} from 'lucide-react';

export default function InvestPage() {
  const [selectedMode, setSelectedMode] = useState<InvestorMode>('506b');

  const handleModeChange = useCallback((mode: InvestorMode) => {
    setSelectedMode(mode);
  }, []);

  const handleStartApplication = useCallback(() => {
    // TODO: This will be implemented in future tasks
    console.log(`Starting ${selectedMode} application process`);
  }, [selectedMode]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="arena-section bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="arena-badge">
                <TrendingUp className="w-4 h-4 mr-2" />
                Investment Opportunity
              </div>
              
              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                Invest in <span className="arena-gradient-text">buyer-validated AI</span>
              </h1>
              
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Arena Fund is the only VC that validates Fortune 500 buyers before investing. 
                Join accredited investors backing the next generation of AI startups with proven enterprise demand.
              </p>
            </div>

            {/* Mode Selection */}
            <ModeSelector 
              selectedMode={selectedMode} 
              onModeChange={handleModeChange}
            />

            {/* Mode-specific Content and CTAs */}
            <ModeContent 
              mode={selectedMode}
              onStartApplication={handleStartApplication}
            />
          </div>
        </div>
      </section>

      {/* Strategy Snapshot */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <h2 className="arena-headline text-arena-navy">Strategy Snapshot</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Arena Fund's differentiated approach to early-stage AI investing, 
                backed by Fortune 500 buyer validation and ILPA best practices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {/* Stage */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-arena-gold" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-arena-navy">Stage</h3>
                  <p className="text-sm text-gray-600">Pre-Seed – Series A</p>
                  <p className="text-xs text-gray-500">Early-stage focus when founders need us most</p>
                </div>
              </div>
              
              {/* Sectors */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-arena-gold" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-arena-navy">Sectors</h3>
                  <p className="text-sm text-gray-600">Enterprise AI, Healthcare AI</p>
                  <p className="text-xs text-gray-500">Fintech AI, Hi-Tech</p>
                </div>
              </div>
              
              {/* Edge */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-arena-gold" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-arena-navy">Edge</h3>
                  <p className="text-sm text-gray-600">Fortune 500 Buyer Validation</p>
                  <p className="text-xs text-gray-500">90% pilot-to-purchase conversion</p>
                </div>
              </div>
              
              {/* Reporting */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-arena-gold" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-arena-navy">Reporting</h3>
                  <p className="text-sm text-gray-600">ILPA Best Practices</p>
                  <p className="text-xs text-gray-500">Transparent, institutional-grade reporting</p>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-arena-foggy-pith rounded-2xl p-8 mt-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
                <div className="space-y-2">
                  <div className="arena-metric-value text-4xl">90%</div>
                  <div className="arena-metric-label">Pilot Success Rate</div>
                  <p className="text-sm text-gray-600">Our orchestrated pilots achieve 90% pilot-to-purchase conversion</p>
                </div>
                <div className="space-y-2">
                  <div className="arena-metric-value text-4xl">F500</div>
                  <div className="arena-metric-label">Buyer Network</div>
                  <p className="text-sm text-gray-600">Direct access to Fortune 500 decision makers</p>
                </div>
                <div className="space-y-2">
                  <div className="arena-metric-value text-4xl">SF</div>
                  <div className="arena-metric-label">Location</div>
                  <p className="text-sm text-gray-600">Based in San Francisco's "Arena" - the AI epicenter</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Timeline - Mode Specific */}
      <ProcessTimeline mode={selectedMode} />

      {/* Trust & Transparency */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="text-center space-y-12">
            <div className="space-y-6">
              <h2 className="arena-headline text-arena-navy">Trust & Transparency</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Arena Fund operates with institutional-grade transparency and follows ILPA best practices 
                to ensure alignment with our investor partners.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-arena-gold" />
                </div>
                <h3 className="font-semibold text-arena-navy">ILPA Standards</h3>
                <p className="text-sm text-gray-600">
                  We adhere to Institutional Limited Partners Association best practices for transparency and reporting.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-arena-gold" />
                </div>
                <h3 className="font-semibold text-arena-navy">Regulatory Compliance</h3>
                <p className="text-sm text-gray-600">
                  Full compliance with securities regulations and investor protection requirements.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-arena-gold" />
                </div>
                <h3 className="font-semibold text-arena-navy">Clear Documentation</h3>
                <p className="text-sm text-gray-600">
                  Comprehensive legal documentation and clear terms for all investment opportunities.
                </p>
              </div>
            </div>

            {/* Mode-specific Legal Disclaimers */}
            <div className="max-w-4xl mx-auto">
              {selectedMode === '506b' ? (
                <div className="bg-arena-abilene-lace border border-arena-hunter-green rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-arena-night-brown flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Rule 506(b) Private Offering Compliance
                  </h3>
                  <div className="text-sm text-arena-hunter-green space-y-2 text-left">
                    <p>
                      <strong>Important Securities Law Disclosure:</strong> This is a private offering under Rule 506(b) of Regulation D. 
                      No general solicitation or advertising is permitted. Investment opportunities are limited to:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Accredited investors as defined by SEC regulations</li>
                      <li>Up to 35 sophisticated non-accredited investors</li>
                      <li>Investors with pre-existing relationships with Arena Fund</li>
                    </ul>
                    <p className="font-medium">
                      Expression of interest does not constitute an offer to sell or solicitation of an offer to buy securities. 
                      All investments are subject to due diligence, documentation, and regulatory compliance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-arena-sunrise border border-arena-bright-umber rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-arena-night-brown flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Rule 506(c) Public Offering Compliance
                  </h3>
                  <div className="text-sm text-arena-hunter-green space-y-2 text-left">
                    <p>
                      <strong>Important Securities Law Disclosure:</strong> This is a public offering under Rule 506(c) of Regulation D. 
                      General solicitation and advertising are permitted, but strict verification requirements apply:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Only verified accredited investors may participate</li>
                      <li>Accreditation status must be verified through acceptable methods</li>
                      <li>No investment materials provided until verification is complete</li>
                    </ul>
                    <p className="font-medium">
                      Verification of accredited investor status is required by federal securities law before any investment 
                      documents can be shared or investment commitments accepted.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy and Data Protection */}
            <div className="bg-arena-foggy-pith rounded-lg p-6 max-w-4xl mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Privacy & Data Protection
              </h3>
              <div className="text-sm text-gray-700 space-y-2 text-left">
                <p>
                  Arena Fund is committed to protecting your personal and financial information in accordance with 
                  applicable privacy laws including GDPR, CCPA, and other data protection regulations.
                </p>
                <p>
                  All investor information is handled with institutional-grade security measures and is only shared 
                  with authorized parties as necessary for investment processing and regulatory compliance.
                </p>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-arena-gold transition-colors">
                Privacy Policy
              </Link>
              <span className="hidden sm:block text-gray-300">|</span>
              <Link href="/terms-of-use" className="text-sm text-gray-600 hover:text-arena-gold transition-colors">
                Terms of Use
              </Link>
              <span className="hidden sm:block text-gray-300">|</span>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-arena-gold transition-colors">
                Investment Terms
              </Link>
              <span className="hidden sm:block text-gray-300">|</span>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-arena-gold transition-colors">
                Contact Us
              </Link>
            </div>

            {/* Additional Compliance Information */}
            <div className="text-xs text-gray-500 max-w-4xl mx-auto space-y-2">
              <p>
                Arena Fund is a registered investment adviser. Past performance does not guarantee future results. 
                All investments involve risk and may result in loss of principal.
              </p>
              <p>
                This website and its contents are not intended for distribution to, or use by, any person or entity 
                in any jurisdiction where such distribution or use would be contrary to law or regulation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}