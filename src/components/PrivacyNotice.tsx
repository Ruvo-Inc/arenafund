'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface PrivacyNoticeProps {
  variant?: 'modal' | 'inline' | 'compact';
  showConsentCheckbox?: boolean;
  onConsentChange?: (consented: boolean) => void;
  consentRequired?: boolean;
  className?: string;
}

export function PrivacyNotice({ 
  variant = 'modal', 
  showConsentCheckbox = false,
  onConsentChange,
  consentRequired = false,
  className = ''
}: PrivacyNoticeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const handleConsentChange = (consented: boolean) => {
    setHasConsented(consented);
    onConsentChange?.(consented);
  };

  const baseContent = (
    <>
      <div className="flex items-start space-x-2 mb-3">
        <Shield className="w-4 h-4 text-arena-hunter-green mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-arena-hunter-green mb-1">
            Privacy & Data Protection
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            By subscribing, you consent to receive email notifications about new articles and insights. 
            We respect your privacy and handle your data in accordance with our{' '}
            <Link 
              href="/privacy" 
              target="_blank"
              className="text-arena-hunter-green hover:text-arena-hunter-green/80 underline inline-flex items-center"
            >
              Privacy Policy
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
            {' '}and applicable data protection laws.
          </p>
        </div>
      </div>
    </>
  );

  const expandedContent = (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="space-y-3 text-xs text-gray-600">
        <div>
          <h5 className="font-medium text-gray-700 mb-1">What we collect:</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Your name and email address</li>
            <li>Subscription preferences and source</li>
            <li>Basic technical information (IP address, browser type)</li>
          </ul>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-700 mb-1">How we use it:</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Send you newsletter updates and new article notifications</li>
            <li>Improve our content and services</li>
            <li>Comply with legal requirements</li>
          </ul>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-700 mb-1">Your rights:</h5>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Unsubscribe at any time using the link in our emails</li>
            <li>Request access to or deletion of your data</li>
            <li>Update your subscription preferences</li>
          </ul>
        </div>
        
        <div className="bg-arena-cream p-3 rounded-md">
          <p className="text-xs text-arena-hunter-green">
            <strong>GDPR & CCPA Compliant:</strong> We never sell your information to third parties. 
            Your data is stored securely and processed lawfully. Contact us at{' '}
            <a 
              href="mailto:privacy@thearenafund.com" 
              className="underline hover:no-underline"
            >
              privacy@thearenafund.com
            </a>
            {' '}for any privacy-related questions.
          </p>
        </div>
      </div>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div className={`text-xs text-gray-600 ${className}`}>
        <p>
          By subscribing, you agree to our{' '}
          <Link 
            href="/privacy" 
            target="_blank"
            className="text-arena-hunter-green hover:text-arena-hunter-green/80 underline"
          >
            Privacy Policy
          </Link>
          . You can unsubscribe at any time.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      {baseContent}
      
      {variant === 'modal' && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1 text-xs text-arena-hunter-green hover:text-arena-hunter-green/80 transition-colors"
        >
          <span>{isExpanded ? 'Show less' : 'Learn more about data handling'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      )}
      
      {(isExpanded || variant === 'inline') && expandedContent}
      
      {showConsentCheckbox && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => handleConsentChange(e.target.checked)}
              className="mt-1 w-4 h-4 text-arena-hunter-green border-gray-300 rounded focus:ring-arena-hunter-green focus:ring-2"
              required={consentRequired}
            />
            <span className="text-xs text-gray-700 leading-relaxed">
              I consent to the collection and processing of my personal data as described above. 
              I understand that I can withdraw this consent at any time by unsubscribing or contacting 
              the privacy team.
              {consentRequired && <span className="text-arena-bright-umber ml-1">*</span>}
            </span>
          </label>
        </div>
      )}
    </div>
  );
}

export default PrivacyNotice;