'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle,
  Shield,
  FileCheck,
  Mail,
  ArrowRight,
  FileText,
  Lock,
  Home,
  Clock
} from 'lucide-react';

interface InvestorSuccess506cProps {
  investorName?: string;
  investorEmail?: string;
  entityName?: string;
  className?: string;
}

export default function InvestorSuccess506c({ 
  investorName, 
  investorEmail, 
  entityName,
  className = '' 
}: InvestorSuccess506cProps) {
  return (
    <div className={`bg-white ${className}`}>
      {/* Success Hero Section */}
      <section className="arena-section bg-gradient-to-br from-blue-50 via-white to-arena-cream arena-subtle-pattern">
        <div className="arena-container-sm">
          <div className="text-center space-y-8">
            {/* Success Icon */}
            <div className="w-24 h-24 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-arena-gold" />
            </div>

            {/* Success Message */}
            <div className="space-y-6">
              <h1 className="arena-headline text-arena-navy">
                Verification Submitted Successfully
              </h1>
              
              <p className="arena-body-xl text-gray-600 max-w-2xl mx-auto">
                Thank you{investorName ? `, ${investorName},` : ''} for completing the 506(c) investor verification process. 
                {entityName && ` Your entity "${entityName}" has been`} Your application has been submitted for review and accreditation verification.
              </p>
            </div>

            {/* Status Badge */}
            <div className="arena-badge">
              <Shield className="w-4 h-4 mr-2" />
              Verification Under Review
            </div>
          </div>
        </div>
      </section>

      {/* Verification Process Section */}
      <section className="arena-section bg-white">
        <div className="arena-container-sm">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Verification & Data Room Access</h2>
              <p className="arena-body-xl text-gray-600 max-w-2xl mx-auto">
                Our compliance team will verify your accreditation status and provide secure access to investment materials.
              </p>
            </div>

            {/* Process Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="text-center space-y-4">
                <div className="arena-process-number">1</div>
                <h3 className="font-semibold text-arena-navy">Document Review</h3>
                <p className="text-sm text-gray-600">
                  Our compliance team reviews your verification documents for completeness and authenticity.
                </p>
                <div className="text-xs text-gray-500 font-medium">
                  1-3 business days
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center space-y-4">
                <div className="arena-process-number">2</div>
                <h3 className="font-semibold text-arena-navy">Accreditation Verification</h3>
                <p className="text-sm text-gray-600">
                  Verification of your accredited investor status through third-party validation or document review.
                </p>
                <div className="text-xs text-gray-500 font-medium">
                  3-5 business days
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center space-y-4">
                <div className="arena-process-number">3</div>
                <h3 className="font-semibold text-arena-navy">Data Room Access</h3>
                <p className="text-sm text-gray-600">
                  Upon verification, you'll receive secure credentials to access our investor data room.
                </p>
                <div className="text-xs text-gray-500 font-medium">
                  Within 24 hours
                </div>
              </div>

              {/* Step 4 */}
              <div className="text-center space-y-4">
                <div className="arena-process-number">4</div>
                <h3 className="font-semibold text-arena-navy">Investment Review</h3>
                <p className="text-sm text-gray-600">
                  Review investment materials, conduct due diligence, and participate in available opportunities.
                </p>
                <div className="text-xs text-gray-500 font-medium">
                  Ongoing
                </div>
              </div>
            </div>

            {/* Data Room Preview */}
            <div className="arena-card p-8 space-y-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-arena-gold" />
                </div>
                <h3 className="font-semibold text-arena-navy">Secure Data Room Access</h3>
                <p className="text-sm text-gray-600 max-w-lg mx-auto">
                  Once verified, you'll gain access to our secure data room containing detailed investment materials, 
                  due diligence documents, and current investment opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="text-center space-y-2">
                  <FileText className="w-6 h-6 text-arena-gold mx-auto" />
                  <h4 className="text-sm font-medium text-gray-900">Investment Materials</h4>
                  <p className="text-xs text-gray-600">PPMs, term sheets, and offering documents</p>
                </div>
                <div className="text-center space-y-2">
                  <FileCheck className="w-6 h-6 text-arena-gold mx-auto" />
                  <h4 className="text-sm font-medium text-gray-900">Due Diligence</h4>
                  <p className="text-xs text-gray-600">Financial models, market analysis, and references</p>
                </div>
                <div className="text-center space-y-2">
                  <Shield className="w-6 h-6 text-arena-gold mx-auto" />
                  <h4 className="text-sm font-medium text-gray-900">Compliance Documents</h4>
                  <p className="text-xs text-gray-600">Legal agreements and regulatory filings</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="arena-card p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-arena-gold" />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-arena-navy">Verification Updates</h3>
                <p className="text-sm text-gray-600">
                  We'll send verification status updates to {investorEmail || 'your email address'} throughout the process. 
                  You'll receive data room credentials once verification is complete.
                </p>
                <p className="text-xs text-gray-500">
                  Expected completion: 3-5 business days from submission
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
              {/* 506(c) Specific Disclaimer */}
              <div className="arena-card p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-arena-gold mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-arena-navy">506(c) Public Offering</h3>
                      <p className="text-sm text-gray-700">
                        This opportunity is available only to verified accredited investors under Rule 506(c) of Regulation D. 
                        Verification of accredited investor status is required before accessing investment materials or participating in any offering. 
                        General solicitation and advertising are permitted for 506(c) offerings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Requirements */}
              <div className="arena-card p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-arena-navy">Accreditation Verification</h3>
                      <p className="text-sm text-gray-700">
                        Arena Fund is required to take reasonable steps to verify that all investors are accredited investors. 
                        Verification may include review of documentation such as tax returns, bank statements, brokerage statements, 
                        or letters from qualified third parties such as attorneys or CPAs.
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
                        Investments are illiquid and may not be suitable for all investors. Past performance does not guarantee future results. 
                        Only invest amounts you can afford to lose entirely.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Security Notice */}
              <div className="arena-card p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Lock className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h3 className="font-semibold text-arena-navy">Data Security & Privacy</h3>
                      <p className="text-sm text-gray-700">
                        Your verification documents and personal information are protected with bank-level security. 
                        Data room access is secured with multi-factor authentication and all activities are logged for compliance. 
                        We comply with all applicable privacy regulations including GDPR and CCPA.
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
              Questions about verification? <Link href="/contact" className="text-arena-gold hover:text-arena-gold-dark transition-colors">Contact our compliance team</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}