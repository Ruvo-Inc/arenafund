'use client';

import React from 'react';
import { InvestorMode } from './ModeSelector';

interface ProcessTimelineProps {
  mode: InvestorMode;
  className?: string;
}

interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

const process506b: ProcessStep[] = [
  {
    number: 1,
    title: 'Share Your Interest',
    description: 'Complete our expression of interest form with your investment preferences and accreditation status.'
  },
  {
    number: 2,
    title: 'Review Process',
    description: 'Our team reviews your interest and investment criteria for potential fit with our opportunities.'
  },
  {
    number: 3,
    title: 'Follow-up',
    description: 'If there\'s a potential match, we\'ll reach out within 2-3 weeks to discuss next steps.'
  }
];

const process506c: ProcessStep[] = [
  {
    number: 1,
    title: 'Accreditation Verification',
    description: 'Upload verification documents or use third-party verification services.'
  },
  {
    number: 2,
    title: 'Investor Profile',
    description: 'Complete detailed investor profile including entity information and jurisdiction.'
  },
  {
    number: 3,
    title: 'Investment Preferences',
    description: 'Specify your check size preferences and sector interests.'
  },
  {
    number: 4,
    title: 'Data Room Access',
    description: 'Upon verification, gain access to investment documents and due diligence materials.'
  }
];

export default function ProcessTimeline({ mode, className = '' }: ProcessTimelineProps) {
  const steps = mode === '506b' ? process506b : process506c;
  const gridCols = mode === '506b' ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4';

  return (
    <section className={`arena-section bg-arena-foggy-pith ${className}`}>
      <div className="arena-container">
        <div className="text-center space-y-12">
          <div className="space-y-6">
            <h2 className="arena-headline text-arena-navy">
              {mode === '506b' ? 'Expression of Interest Process' : 'Investment Verification Process'}
            </h2>
            <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
              {mode === '506b' 
                ? 'A streamlined process to express your interest in Arena Fund\'s private investment opportunities.'
                : 'A comprehensive verification process for accredited investors seeking access to our investment opportunities.'
              }
            </p>
          </div>

          <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
            {steps.map((step) => (
              <div key={step.number} className="arena-process-step text-center space-y-4">
                <div className="arena-process-number">{step.number}</div>
                <h3 className="font-semibold text-arena-navy">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Timeline indicator for 506(c) */}
          {mode === '506c' && (
            <div className="mt-8 p-4 bg-arena-gold-light rounded-lg">
              <p className="text-sm text-arena-navy font-medium">
                Estimated completion time: 3-5 business days after document submission
              </p>
            </div>
          )}

          {/* Timeline indicator for 506(b) */}
          {mode === '506b' && (
            <div className="mt-8 p-4 bg-arena-abilene-lace rounded-lg">
              <p className="text-sm text-arena-night-brown font-medium">
                Response time: 2-3 weeks for qualified expressions of interest
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}