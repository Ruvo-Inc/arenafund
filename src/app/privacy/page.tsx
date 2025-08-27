'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Shield,
  FileText,
  BarChart3,
  Lock,
  Globe,
  Users,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Search,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import type { Metadata } from "next";

const LAST_UPDATED = "December 15, 2024";

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: Shield },
    { id: 'information-we-collect', title: 'Information We Collect', icon: FileText },
    { id: 'how-we-use', title: 'How We Use Information', icon: BarChart3 },
    { id: 'sharing-disclosure', title: 'Sharing & Disclosure', icon: Users },
    { id: 'data-security', title: 'Data Security', icon: Lock },
    { id: 'your-rights', title: 'Your Privacy Rights', icon: CheckCircle },
    { id: 'cookies-tracking', title: 'Cookies & Tracking', icon: Eye },
    { id: 'data-retention', title: 'Data Retention', icon: Clock },
    { id: 'international-transfers', title: 'International Transfers', icon: Globe },
    { id: 'contact', title: 'Contact Us', icon: Mail }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="arena-section bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="arena-badge">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </div>

              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                Your privacy is our <span className="arena-gradient-text">priority</span>
              </h1>

              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                We're committed to protecting your personal information and being transparent about how we collect,
                use, and safeguard your data in our buyer validation and investment processes.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {LAST_UPDATED}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>GDPR & CCPA Compliant</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-arena-navy text-white hover:bg-arena-navy-light transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <FileText className="w-5 h-5 mr-2" />
                Apply for Funding
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl border-2 border-arena-navy text-arena-navy hover:bg-arena-navy hover:text-white transition-all duration-300">
                <Mail className="w-5 h-5 mr-2" />
                Contact Privacy Team
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Privacy Content */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="arena-subtitle text-arena-navy mb-6">Privacy Sections</h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;

                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSection(section.id);
                          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${isActive
                            ? 'bg-arena-gold-light text-arena-navy border-l-4 border-arena-gold'
                            : 'text-gray-600 hover:bg-arena-foggy-pith hover:text-arena-navy'
                          }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-arena-gold' : 'text-gray-400'}`} />
                        <span className="font-medium text-sm">{section.title}</span>
                      </a>
                    );
                  })}
                </nav>

                {/* Quick Contact */}
                <div className="mt-8 p-4 bg-arena-foggy-pith rounded-lg">
                  <h4 className="font-semibold text-arena-navy mb-2">Privacy Questions?</h4>
                  <p className="text-sm text-gray-600 mb-3">Contact our privacy team directly</p>
                  <a
                    href="mailto:privacy@thearenafund.com"
                    className="text-sm text-arena-gold hover:text-arena-gold-dark font-medium"
                  >
                    privacy@thearenafund.com
                  </a>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-12">

              {/* Overview */}
              <section id="overview" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Overview</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p className="text-gray-700">
                    Arena Fund is committed to protecting your privacy and handling your personal information with care and transparency.
                    This Privacy Policy explains how we collect, use, share, and protect your information when you interact with our services.
                    Please also review our{' '}
                    <Link href="/terms-of-use" className="text-arena-gold hover:text-arena-gold-dark underline">
                      Terms of Use
                    </Link>{' '}
                    which govern your use of our website.
                  </p>
                  <div className="bg-arena-cream p-6 rounded-lg border-l-4 border-arena-gold">
                    <h3 className="font-semibold text-arena-navy mb-2">Key Principles</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>We only collect information necessary for our buyer validation and investment processes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>We implement industry-leading security measures to protect your data</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>We provide you with control over your personal information</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>We comply with GDPR, CCPA, and other applicable privacy regulations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
              {/* Information We Collect */}
              <section id="information-we-collect" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Information We Collect</h2>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-arena-gold" />
                        Personal Information
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Name, email address, phone number</li>
                        <li>• Professional title and company information</li>
                        <li>• LinkedIn profile and professional background</li>
                        <li>• Investment preferences and criteria</li>
                      </ul>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-arena-gold" />
                        Business Information
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Company details and business model</li>
                        <li>• Financial information and metrics</li>
                        <li>• Fortune 500 buyer relationships</li>
                        <li>• Pilot program data and results</li>
                      </ul>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3 flex items-center">
                        <Eye className="w-5 h-5 mr-2 text-arena-gold" />
                        Usage Information
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Website interactions and page views</li>
                        <li>• Device information and IP address</li>
                        <li>• Browser type and operating system</li>
                        <li>• Referral sources and search terms</li>
                      </ul>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-arena-gold" />
                        Communication Data
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Email correspondence and attachments</li>
                        <li>• Meeting notes and call recordings</li>
                        <li>• Support requests and feedback</li>
                        <li>• Survey responses and preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section id="how-we-use" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">How We Use Information</h2>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-arena-gold-light rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-arena-gold" />
                      </div>
                      <h3 className="font-semibold text-arena-navy mb-2">Buyer Validation</h3>
                      <p className="text-sm text-gray-600">
                        Validate Fortune 500 enterprise demand and facilitate buyer-founder connections
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-arena-gold-light rounded-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-arena-gold" />
                      </div>
                      <h3 className="font-semibold text-arena-navy mb-2">Investment Process</h3>
                      <p className="text-sm text-gray-600">
                        Evaluate investment opportunities and manage our portfolio companies
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-arena-gold-light rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-arena-gold" />
                      </div>
                      <h3 className="font-semibold text-arena-navy mb-2">Relationship Management</h3>
                      <p className="text-sm text-gray-600">
                        Maintain relationships with founders, investors, and enterprise buyers
                      </p>
                    </div>
                  </div>
                  <div className="bg-arena-foggy-pith p-6 rounded-lg">
                    <h3 className="font-semibold text-arena-navy mb-3">Specific Use Cases</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <ul className="space-y-2 text-gray-600">
                        <li>• Conducting buyer validation processes</li>
                        <li>• Facilitating pilot programs with Fortune 500 companies</li>
                        <li>• Evaluating investment opportunities</li>
                        <li>• Providing portfolio support and guidance</li>
                      </ul>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Sending relevant investment updates</li>
                        <li>• Improving our website and services</li>
                        <li>• Complying with legal and regulatory requirements</li>
                        <li>• Protecting against fraud and security threats</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
              {/* Sharing & Disclosure */}
              <section id="sharing-disclosure" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Sharing & Disclosure</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    We only share your information when necessary for our business operations, with your consent, or as required by law.
                    We never sell your personal information to third parties.
                  </p>
                  <div className="space-y-4">
                    <div className="arena-card p-6 border-l-4 border-green-500">
                      <h3 className="font-semibold text-arena-navy mb-3">Trusted Service Providers</h3>
                      <p className="text-sm text-gray-600 mb-3">We work with carefully vetted partners to provide our services:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <ul className="space-y-1 text-gray-600">
                          <li>• Cloud infrastructure (Google Cloud, AWS)</li>
                          <li>• Email and communication platforms</li>
                          <li>• Analytics and performance monitoring</li>
                        </ul>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Legal and compliance services</li>
                          <li>• Financial and accounting services</li>
                          <li>• Security and fraud prevention</li>
                        </ul>
                      </div>
                    </div>
                    <div className="arena-card p-6 border-l-4 border-arena-hunter-green">
                      <h3 className="font-semibold text-arena-navy mb-3">Business Partners</h3>
                      <p className="text-sm text-gray-600">
                        With your explicit consent, we may share relevant information with Fortune 500 buyers,
                        co-investors, or other partners to facilitate business opportunities.
                      </p>
                    </div>
                    <div className="arena-card p-6 border-l-4 border-arena-bright-umber">
                      <h3 className="font-semibold text-arena-navy mb-3">Legal Requirements</h3>
                      <p className="text-sm text-gray-600">
                        We may disclose information when required by law, court order, or to protect our rights,
                        property, or safety, or that of others.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Lock className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Data Security</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    We implement comprehensive security measures to protect your information from unauthorized access,
                    alteration, disclosure, or destruction.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">Technical Safeguards</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>End-to-end encryption for data transmission</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Encrypted data storage with AES-256</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Multi-factor authentication requirements</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Regular security audits and penetration testing</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">Operational Safeguards</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Role-based access controls</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Employee privacy training programs</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Incident response and breach notification procedures</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Regular backup and disaster recovery testing</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-arena-sunrise border border-arena-bright-umber p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-arena-bright-umber mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-arena-night-brown">Security Incident Reporting</h4>
                        <p className="text-sm text-arena-hunter-green mt-1">
                          If you suspect a security incident or have concerns about the security of your information,
                          please contact us immediately at <a href="mailto:security@thearenafund.com" className="underline">security@thearenafund.com</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              {/* Your Privacy Rights */}
              <section id="your-rights" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Your Privacy Rights</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    You have important rights regarding your personal information. The specific rights available to you
                    may depend on your location and applicable privacy laws.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-4">Universal Rights</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-arena-gold-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Eye className="w-3 h-3 text-arena-gold" />
                          </div>
                          <div>
                            <strong className="text-arena-navy">Access</strong>
                            <p className="text-gray-600">Request a copy of the personal information we hold about you</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-arena-gold-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-3 h-3 text-arena-gold" />
                          </div>
                          <div>
                            <strong className="text-arena-navy">Correction</strong>
                            <p className="text-gray-600">Request correction of inaccurate or incomplete information</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-arena-gold-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle className="w-3 h-3 text-arena-gold" />
                          </div>
                          <div>
                            <strong className="text-arena-navy">Deletion</strong>
                            <p className="text-gray-600">Request deletion of your personal information (subject to legal requirements)</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-4">Additional Rights (GDPR/CCPA)</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-arena-gold-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Lock className="w-3 h-3 text-arena-gold" />
                          </div>
                          <div>
                            <strong className="text-arena-navy">Portability</strong>
                            <p className="text-gray-600">Receive your data in a structured, machine-readable format</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-arena-gold-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Users className="w-3 h-3 text-arena-gold" />
                          </div>
                          <div>
                            <strong className="text-arena-navy">Objection</strong>
                            <p className="text-gray-600">Object to processing based on legitimate interests</p>
                          </div>
                        </li>
                        <li className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-arena-gold-light rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Clock className="w-3 h-3 text-arena-gold" />
                          </div>
                          <div>
                            <strong className="text-arena-navy">Restriction</strong>
                            <p className="text-gray-600">Request restriction of processing in certain circumstances</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-arena-cream p-6 rounded-lg">
                    <h3 className="font-semibold text-arena-navy mb-3">How to Exercise Your Rights</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      To exercise any of these rights, please contact our privacy team. We will respond to your request
                      within the timeframes required by applicable law.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href="mailto:privacy@thearenafund.com"
                        className="inline-flex items-center px-4 py-2 bg-arena-navy text-white rounded-lg hover:bg-arena-navy-light transition-colors text-sm"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        privacy@thearenafund.com
                      </a>
                      <Link
                        href="/contact"
                        className="inline-flex items-center px-4 py-2 border border-arena-navy text-arena-navy rounded-lg hover:bg-arena-navy hover:text-white transition-colors text-sm"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contact Form
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies-tracking" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Eye className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Cookies & Tracking</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    We use cookies and similar technologies to enhance your experience, analyze usage, and improve our services.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="arena-card p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-arena-sunrise rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-arena-hunter-green" />
                      </div>
                      <h3 className="font-semibold text-arena-navy mb-2">Essential Cookies</h3>
                      <p className="text-sm text-gray-600">
                        Required for basic website functionality, security, and user authentication
                      </p>
                    </div>
                    <div className="arena-card p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-arena-abilene-lace rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-arena-hunter-green" />
                      </div>
                      <h3 className="font-semibold text-arena-navy mb-2">Analytics Cookies</h3>
                      <p className="text-sm text-gray-600">
                        Help us understand how visitors interact with our website to improve user experience
                      </p>
                    </div>
                    <div className="arena-card p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 bg-arena-foggy-pith rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-arena-bright-umber" />
                      </div>
                      <h3 className="font-semibold text-arena-navy mb-2">Marketing Cookies</h3>
                      <p className="text-sm text-gray-600">
                        Used to deliver relevant content and track the effectiveness of our marketing campaigns
                      </p>
                    </div>
                  </div>
                  <div className="bg-arena-foggy-pith p-6 rounded-lg">
                    <h3 className="font-semibold text-arena-navy mb-3">Cookie Management</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      You can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border">Google Analytics</span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border">Session Management</span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border">Security</span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-600 border">Preferences</span>
                    </div>
                  </div>
                </div>
              </section>
              {/* Data Retention */}
              <section id="data-retention" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Data Retention</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    We retain your personal information only as long as necessary to fulfill the purposes for which it was collected,
                    comply with legal obligations, and resolve disputes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Retention Periods</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• <strong>Application Data:</strong> 7 years after final decision</li>
                        <li>• <strong>Investment Records:</strong> 10 years after investment exit</li>
                        <li>• <strong>Communication Records:</strong> 3 years after last contact</li>
                        <li>• <strong>Website Analytics:</strong> 26 months maximum</li>
                        <li>• <strong>Marketing Data:</strong> Until consent withdrawn</li>
                      </ul>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Secure Deletion</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Automated deletion processes for expired data</li>
                        <li>• Secure overwriting of storage media</li>
                        <li>• Certificate of destruction for physical documents</li>
                        <li>• Regular audits of retention compliance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* International Transfers */}
              <section id="international-transfers" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Globe className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">International Transfers</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    Arena Fund operates globally, and your information may be transferred to and processed in countries
                    other than your country of residence.
                  </p>
                  <div className="bg-arena-abilene-lace border border-arena-hunter-green p-6 rounded-lg">
                    <h3 className="font-semibold text-arena-navy mb-3">Transfer Safeguards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <ul className="space-y-2 text-gray-600">
                        <li>• Standard Contractual Clauses (SCCs)</li>
                        <li>• Adequacy decisions by regulatory authorities</li>
                        <li>• Binding Corporate Rules (BCRs)</li>
                      </ul>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Privacy Shield certification (where applicable)</li>
                        <li>• Explicit consent for specific transfers</li>
                        <li>• Derogations for specific situations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Mail className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Contact Us</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    If you have questions about this Privacy Policy or our privacy practices, please contact us using the information below.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-4">Privacy Team</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-arena-gold" />
                          <a href="mailto:privacy@thearenafund.com" className="text-arena-gold hover:text-arena-gold-dark">
                            privacy@thearenafund.com
                          </a>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Building2 className="w-5 h-5 text-arena-gold" />
                          <span className="text-gray-600">Arena Fund</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Globe className="w-5 h-5 text-arena-gold" />
                          <span className="text-gray-600">San Francisco, CA</span>
                        </div>
                      </div>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-4">Response Times</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• <strong>General Inquiries:</strong> 2-3 business days</li>
                        <li>• <strong>Privacy Rights Requests:</strong> 30 days maximum</li>
                        <li>• <strong>Security Incidents:</strong> 24 hours</li>
                        <li>• <strong>Data Breach Notifications:</strong> 72 hours (where required)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="arena-section bg-arena-navy text-white">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="arena-headline text-white">Questions about your privacy?</h2>
              <p className="arena-body-xl text-gray-300 max-w-3xl mx-auto">
                Our privacy team is here to help you understand how we protect your information
                and assist with any privacy-related requests.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:privacy@thearenafund.com"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-arena-gold text-arena-navy hover:bg-arena-gold-dark transition-all duration-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact Privacy Team
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}