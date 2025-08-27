import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import InvestorSuccess506b from '../InvestorSuccess506b';
import InvestorSuccess506c from '../InvestorSuccess506c';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { it } from 'zod/v4/locales';
import { describe } from 'node:test';

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    )
  };
});

describe('InvestorSuccess506b', () => {
  it('renders success message for 506(b) mode', () => {
    render(
      <InvestorSuccess506b 
        investorName="John Doe"
        investorEmail="john@example.com"
      />
    );

    expect(screen.getByText('Interest Received Successfully')).toBeInTheDocument();
    expect(screen.getByText(/Thank you, John Doe, for expressing your interest/)).toBeInTheDocument();
    expect(screen.getByText('Expression of Interest Submitted')).toBeInTheDocument();
  });

  it('renders without investor name when not provided', () => {
    render(<InvestorSuccess506b investorEmail="john@example.com" />);

    expect(screen.getByText('Interest Received Successfully')).toBeInTheDocument();
    expect(screen.getByText(/Thank you for expressing your interest/)).toBeInTheDocument();
  });

  it('displays 506(b) specific disclaimers', () => {
    render(<InvestorSuccess506b />);

    expect(screen.getByText('506(b) Private Offering')).toBeInTheDocument();
    expect(screen.getByText(/This is an expression of interest only/)).toBeInTheDocument();
  });

  it('shows correct timeline for 506(b) process', () => {
    render(<InvestorSuccess506b />);

    expect(screen.getByText('Review Process')).toBeInTheDocument();
    expect(screen.getByText('Initial Contact')).toBeInTheDocument();
    expect(screen.getByText('Due Diligence')).toBeInTheDocument();
    expect(screen.getByText('2-3 weeks')).toBeInTheDocument();
  });
});

describe('InvestorSuccess506c', () => {
  it('renders success message for 506(c) mode', () => {
    render(
      <InvestorSuccess506c 
        investorName="Jane Smith"
        investorEmail="jane@example.com"
        entityName="Smith Family Office"
      />
    );

    expect(screen.getByText('Verification Submitted Successfully')).toBeInTheDocument();
    expect(screen.getByText(/Thank you, Jane Smith, for completing the 506\(c\) investor verification/)).toBeInTheDocument();
    expect(screen.getByText(/Your entity "Smith Family Office" has been/)).toBeInTheDocument();
    expect(screen.getByText('Verification Under Review')).toBeInTheDocument();
  });

  it('renders without entity name when not provided', () => {
    render(
      <InvestorSuccess506c 
        investorName="Jane Smith"
        investorEmail="jane@example.com"
      />
    );

    expect(screen.getByText('Verification Submitted Successfully')).toBeInTheDocument();
    expect(screen.getByText(/Your application has been submitted for review/)).toBeInTheDocument();
  });

  it('displays 506(c) specific disclaimers', () => {
    render(<InvestorSuccess506c />);

    expect(screen.getByText('506(c) Public Offering')).toBeInTheDocument();
    expect(screen.getByText(/This opportunity is available only to verified accredited investors/)).toBeInTheDocument();
    expect(screen.getAllByText('Accreditation Verification')).toHaveLength(2); // One in timeline, one in disclaimers
  });

  it('shows correct timeline for 506(c) process', () => {
    render(<InvestorSuccess506c />);

    expect(screen.getByText('Document Review')).toBeInTheDocument();
    expect(screen.getAllByText('Accreditation Verification')).toHaveLength(2);
    expect(screen.getByText('Data Room Access')).toBeInTheDocument();
    expect(screen.getByText('Investment Review')).toBeInTheDocument();
    expect(screen.getByText('1-3 business days')).toBeInTheDocument();
    expect(screen.getByText('3-5 business days')).toBeInTheDocument();
  });

  it('displays data room access information', () => {
    render(<InvestorSuccess506c />);

    expect(screen.getByText('Secure Data Room Access')).toBeInTheDocument();
    expect(screen.getByText('Investment Materials')).toBeInTheDocument();
    expect(screen.getByText('Due Diligence')).toBeInTheDocument();
    expect(screen.getByText('Compliance Documents')).toBeInTheDocument();
  });
});