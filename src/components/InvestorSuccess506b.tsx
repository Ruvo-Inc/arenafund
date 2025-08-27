'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle,
  Clock,
  Mail,
  ArrowRight,
  FileText,
  Shield,
  Home
} from 'lucide-react';

interface InvestorSuccess506bProps {
  investorName?: string;
  investorEmail?: string;
  className?: string;
}

export default function InvestorSuccess506b({ 
  investorName, 
  investorEmail, 
  className = '' 
}: InvestorSuccess506bProps) {
  return (
    <div className={`bg-white ${className}`}>
      {/* Success Hero Section */}
      <section className="arena-section bg-gradient-to-br from-green-50 via-white to-arena-cream arena-subtle-pattern">
        <div className="arena-container-sm">
          <div className="text-center space-y-8">
            {/* Success Icon */}
            <div className="w-24 h-24 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-arena-gold" />
            </div>

            {/* Success Message */}
            <div className="space-y-6">
              <h1 className="arena-headline text-arena-navy">
                Interest Received Successfully
              </h1>
              
              <p className="arena-body-xl text-gray-600 max-w-2xl mx-auto">
                Thank you{investorName ? `, ${investorName},` : ''} for expressing your interest in Arena Fund's investment opportunities. 
                Your 506(b) expression of interest has been submitted and will be reviewed by our team.
              </p>
            </div>

            {/* Status Badge */}
            <div className="arena-badge">
              <Clock className="w-4 h-4 mr-2" />
              Expression of Interest Submitted
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps Section */}
      <section className="arena-section bg-white">
        <div className="arena-container-sm">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">What Happens Next</h2>
              <p className="arena-body-xl text-gray-600 max-w-2xl mx-auto">
                Our investment team will review your interest and reach out within 2-3 weeks with next steps.
              </p>
            </div>

            {/* Process Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="text-center space-y-4">
                <div className="arena-process-number">1</div>
                <h3 className="font-semibold text-arena-navy">Review Process</h3>
                <p className="text-sm text-gray-600">
                  Our team reviews your investment profile and preferences to assess fit with current opportunities.
                </p>
                <div className="text-xs text-gray-500 font-medium">
                  1-2 weeks
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4">
                <div className="arena-process-number">2</div>
                <h3 className="font-semibold text-arena-navy">Initial Contact</h3>
                <p className="text-sm text-gray-600">
                  If there's a potential match, we'll reach out to discuss specific investment opportunities.
                </p>
                <div className="text-xs text-gray-500 font-medium">
                  2-3 weeks
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4">
                <div className="arena-process-number">3</div>
                <h3 className="font-semibold text-arena-navy">Due Diligence</h3>
                <p className="text-sm text-gray-600">
                  Begin the due diligence process for specific investment opportunities that align with your interests.
                </p>
                <div className="text-xs text-gray-500 font-medium">
                  Ongoing
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="arena-card p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-arena-gold" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-arena-navy">Stay Connected</h3>
                <p className="text-sm text-gray-600">
                  We'll send updates to {investorEmail || 'your email address'} about the review process and any relevant investment opportunities.
                </p>
                <p className="text-xs text-gray-500">
                  You can update your preferences or unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimers Section */}
      <section className="arena-section bg-gray-50">
        <div className="arena-container-sm">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-arena-gold" />
              </div>
              <h2 className="arena-subtitle text-arena-navy">Important Disclaimers</h2>
            </div>

            <div className="space-y-6">
              {/* 506(b) Specific Disclaimer */}
              <div className="arena-card p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-arena-gold mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-arena-navy">506(b) Private Offering</h3>
                      <p className="text-sm text-gray-700">
                        This is an expression of interest only and does not constitute an offer or solicitation to purchase securities. 
                        Any actual investment opportunity will be made available only through a private placement memorandum and 
                        subscription agreement under Rule 506(b) of Regulation D.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Risk Disclaimer */}
              <div className="arena-card p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-arena-navy">Investment Risks</h3>
                      <p className="text-sm text-gray-700">
                        Private investments involve substantial risk and may result in partial or total loss of capital. 
                        Past performance does not guarantee future results. Investments are suitable only for accredited investors 
                        who can afford to lose their entire investment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="arena-card p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-arena-navy">Privacy & Data Protection</h3>
                      <p className="text-sm text-gray-700">
                        Your personal information is protected under our Privacy Policy and applicable data protection regulations. 
                        We will only use your information to evaluate investment opportunities and communicate about Arena Fund services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 border-t border-gray-200">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-arena-gold transition-colors">
                Privacy Policy
              </Link>
              <span className="hidden sm:block text-gray-300">|</span>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-arena-gold transition-colors">
                Terms of Use
              </Link>
              <span className="hidden sm:block text-gray-300">|</span>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-arena-gold transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Section */}
      <section className="arena-section bg-white">
        <div className="arena-container-sm">
          <div className="text-center space-y-8">
            <h2 className="arena-subtitle text-arena-navy">Continue Exploring</h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="arena-btn-secondary">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Link>
              
              <Link href="/invest" className="arena-btn-primary">
                Learn More About Arena Fund
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              Questions? <Link href="/contact" className="text-arena-gold hover:text-arena-gold-dark transition-colors">Contact our team</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}