'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Users, Shield, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { InvestorMode } from './ModeSelector';
import InvestorForm506b from './InvestorForm506b';
import InvestorForm506c from './InvestorForm506c';

interface ModeContentProps {
  mode: InvestorMode;
  onStartApplication?: () => void;
  className?: string;
}

export default function ModeContent({ mode, onStartApplication, className = '' }: ModeContentProps) {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ name?: string; email?: string; entityName?: string }>({});

  const handleStartApplication = useCallback(() => {
    setShowForm(true);
    setShowSuccess(false);
    if (onStartApplication) {
      onStartApplication();
    }
  }, [onStartApplication]);

  const handleFormSuccess = useCallback((data?: { name?: string; email?: string; entityName?: string }) => {
    // Store form data for success display
    setSuccessData(data || {});
    setShowForm(false);
    setShowSuccess(true);
    
    // Also store in sessionStorage for potential page navigation
    if (data?.name) {
      sessionStorage.setItem('investorName', data.name);
    }
    if (data?.email) {
      sessionStorage.setItem('investorEmail', data.email);
    }
    if (data?.entityName) {
      sessionStorage.setItem('entityName', data.entityName);
    }
  }, []);

  const handleFormError = useCallback((error: string) => {
    console.error('Form submission error:', error);
    // Error handling is managed within the form component
  }, []);

  const handleBackToInfo = useCallback(() => {
    setShowForm(false);
    setShowSuccess(false);
  }, []);



  // Show success state
  if (showSuccess) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-arena-gold" />
          </div>
          
          <div className="space-y-4">
            <h2 className="arena-headline text-arena-navy">
              {mode === '506b' ? 'Interest Submitted!' : 'Verification Started!'}
            </h2>
            
            <div className="space-y-3 text-gray-600">
              {mode === '506b' ? (
                <>
                  <p className="arena-body">
                    Thank you for expressing interest in Arena Fund. We have received your information and will 
                    reach out within 2–3 weeks if there is a suitable investment opportunity that matches your criteria.
                  </p>
                  <p className="text-sm">
                    This was an expression of interest only. It is not an offer or solicitation of securities. 
                    We will contact you only if there is a suitable investment opportunity available.
                  </p>
                </>
              ) : (
                <>
                  <p className="arena-body">
                    Thank you for starting the investor verification process. We have received your information and 
                    will review your accreditation documents within 3-5 business days.
                  </p>
                  <p className="text-sm">
                    Once verified, you will receive access to our secure data room with detailed investment materials 
                    and due diligence documents.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Success Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button 
              onClick={handleBackToInfo}
              className="btn-mobile arena-btn-secondary w-full sm:w-auto"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Information
            </button>
            <Link href="/faq" className="btn-mobile arena-btn-primary w-full sm:w-auto" style={{ WebkitTapHighlightColor: 'transparent' }}>
              <FileText className="w-4 h-4 mr-2" />
              Read FAQ
            </Link>
          </div>

          {/* Success Disclaimers */}
          <div className="max-w-3xl mx-auto">
            {mode === '506b' ? (
              <div className="bg-arena-abilene-lace border border-arena-hunter-green rounded-lg p-4 space-y-3">
                <p className="text-sm text-arena-night-brown font-medium">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Next Steps for 506(b) Private Offering
                </p>
                <div className="text-xs text-arena-hunter-green space-y-1">
                  <p>
                    • We will review your expression of interest against our current and upcoming investment opportunities
                  </p>
                  <p>
                    • If there is a suitable match, we will contact you to discuss the opportunity in detail
                  </p>
                  <p>
                    • All communications will be conducted in compliance with Rule 506(b) private offering regulations
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-arena-sunrise border border-arena-bright-umber rounded-lg p-4 space-y-3">
                <p className="text-sm text-arena-night-brown font-medium">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Next Steps for 506(c) Verification
                </p>
                <div className="text-xs text-arena-hunter-green space-y-1">
                  <p>
                    • Our compliance team will review your accreditation verification documents
                  </p>
                  <p>
                    • You will receive email confirmation once verification is complete
                  </p>
                  <p>
                    • Verified investors gain immediate access to investment opportunities and due diligence materials
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show forms based on mode
  if (showForm) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <button 
            onClick={handleBackToInfo}
            className="inline-flex items-center text-sm text-gray-600 hover:text-arena-gold transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Information
          </button>
        </div>
        {mode === '506b' ? (
          <InvestorForm506b 
            onSubmissionSuccess={handleFormSuccess}
            onSubmissionError={handleFormError}
          />
        ) : (
          <InvestorForm506c 
            onSubmissionSuccess={handleFormSuccess}
            onSubmissionError={handleFormError}
          />
        )}
      </div>
    );
  }
  // Show default information and CTAs
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mode-specific CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        {mode === '506b' ? (
          <>
            <button 
              className="btn-mobile arena-btn-primary w-full sm:w-auto"
              onClick={handleStartApplication}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Users className="w-5 h-5 mr-2" />
              Share Interest
            </button>
            <Link href="/faq" className="btn-mobile arena-btn-secondary w-full sm:w-auto" style={{ WebkitTapHighlightColor: 'transparent' }}>
              <FileText className="w-5 h-5 mr-2" />
              Learn More
            </Link>
          </>
        ) : (
          <>
            <button 
              className="btn-mobile arena-btn-primary w-full sm:w-auto"
              onClick={handleStartApplication}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Shield className="w-5 h-5 mr-2" />
              Start Investor Verification
            </button>
            <Link href="/faq" className="btn-mobile arena-btn-secondary w-full sm:w-auto" style={{ WebkitTapHighlightColor: 'transparent' }}>
              <FileText className="w-5 h-5 mr-2" />
              Verification Process
            </Link>
          </>
        )}
      </div>

      {/* Mode-specific disclaimers */}
      <div className="max-w-3xl mx-auto">
        {mode === '506b' ? (
          <div className="bg-arena-abilene-lace border border-arena-hunter-green rounded-lg p-4 space-y-3">
            <p className="text-sm text-arena-night-brown font-medium">
              <Shield className="w-4 h-4 inline mr-1" />
              Rule 506(b) Private Offering Disclosure
            </p>
            <div className="text-xs text-arena-hunter-green space-y-1">
              <p className="font-medium">
                This is an expression of interest only. It is not an offer or solicitation of securities.
              </p>
              <p>
                Private offerings under Rule 506(b) are limited to accredited investors and up to 35 sophisticated 
                non-accredited investors with pre-existing relationships. No general solicitation permitted.
              </p>
              <p>
                All investments involve risk and may result in loss of principal. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-arena-sunrise border border-arena-bright-umber rounded-lg p-4 space-y-3">
            <p className="text-sm text-arena-night-brown font-medium">
              <Shield className="w-4 h-4 inline mr-1" />
              Rule 506(c) Public Offering Disclosure
            </p>
            <div className="text-xs text-arena-hunter-green space-y-1">
              <p className="font-medium">
                This opportunity is available only to verified accredited investors. Verification is required by federal law.
              </p>
              <p>
                Public offerings under Rule 506(c) require verification of accredited investor status before any 
                investment materials can be shared. General solicitation is permitted.
              </p>
              <p>
                All investments involve risk and may result in loss of principal. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional mode-specific information */}
      <div className="max-w-4xl mx-auto">
        {mode === '506b' ? (
          <div className="bg-arena-abilene-lace rounded-lg p-6 text-center">
            <h3 className="font-semibold text-arena-night-brown mb-2">Private Offering Benefits</h3>
            <ul className="text-sm text-arena-hunter-green space-y-1">
              <li>• Streamlined expression of interest process</li>
              <li>• Access to exclusive private investment opportunities</li>
              <li>• Direct relationship building with Arena Fund team</li>
            </ul>
          </div>
        ) : (
          <div className="bg-arena-sunrise rounded-lg p-6 text-center">
            <h3 className="font-semibold text-arena-night-brown mb-2">Verified Investor Advantages</h3>
            <ul className="text-sm text-arena-hunter-green space-y-1">
              <li>• Immediate access to investment documents upon verification</li>
              <li>• Priority consideration for investment opportunities</li>
              <li>• Access to comprehensive due diligence materials</li>
            </ul>
          </div>
        )}
      </div>

      {/* Compliance and Legal Links */}
      <div className="max-w-4xl mx-auto pt-6 border-t border-gray-200">
        <div className="text-center space-y-3">
          <p className="text-xs text-gray-500">
            Arena Fund is a registered investment adviser. Investment opportunities are subject to regulatory compliance and due diligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
            <Link href="/privacy" className="text-gray-500 hover:text-arena-gold transition-colors">
              Privacy Policy
            </Link>
            <span className="hidden sm:block text-gray-300">|</span>
            <Link href="/terms" className="text-gray-500 hover:text-arena-gold transition-colors">
              Terms of Use
            </Link>
            <span className="hidden sm:block text-gray-300">|</span>
            <a href="mailto:legal@thearenafund.com" className="text-gray-500 hover:text-arena-gold transition-colors">
              Legal Questions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}