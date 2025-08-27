'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Shield,
  FileText,
  Scale,
  Lock,
  Globe,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle,
  Mail,
  Phone,
  Building2,
  ExternalLink,
  ChevronRight,
  Eye,
  UserCheck,
  Gavel,
  BookOpen
} from 'lucide-react';

const LAST_UPDATED = "August 22, 2025";

export default function TermsOfUsePage() {
  const [activeSection, setActiveSection] = useState('acceptance');

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: CheckCircle },
    { id: 'modifications', title: 'Modifications', icon: FileText },
    { id: 'eligibility', title: 'Eligibility', icon: UserCheck },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: Lock },
    { id: 'submissions', title: 'User Submissions', icon: BookOpen },
    { id: 'acceptable-use', title: 'Acceptable Use', icon: Users },
    { id: 'regulatory', title: 'Regulatory Disclaimers', icon: Scale },
    { id: 'disclaimers', title: 'Disclaimers & Liability', icon: AlertTriangle },
    { id: 'indemnification', title: 'Indemnification', icon: Shield },
    { id: 'international', title: 'International Users', icon: Globe },
    { id: 'governing-law', title: 'Governing Law', icon: Gavel },
    { id: 'contact', title: 'Contact', icon: Mail }
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
                <Scale className="w-4 h-4 mr-2" />
                Terms of Use
              </div>

              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                Website <span className="arena-gradient-text">Terms of Use</span>
              </h1>

              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                These terms govern your use of the Arena Fund website and establish the rules 
                for accessing our content, services, and information.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Effective Date: {LAST_UPDATED}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-arena-hunter-green" />
                <span>Legally Binding</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-arena-navy text-white hover:bg-arena-navy-light transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <FileText className="w-5 h-5 mr-2" />
                Apply for Funding
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl border-2 border-arena-navy text-arena-navy hover:bg-arena-navy hover:text-white transition-all duration-300">
                <Mail className="w-5 h-5 mr-2" />
                Legal Questions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="arena-subtitle text-arena-navy mb-6">Terms Sections</h3>
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
                  <h4 className="font-semibold text-arena-navy mb-2">Legal Questions?</h4>
                  <p className="text-sm text-gray-600 mb-3">Contact our legal team directly</p>
                  <a
                    href="mailto:legal@thearenafund.com"
                    className="text-sm text-arena-gold hover:text-arena-gold-dark font-medium"
                  >
                    legal@thearenafund.com
                  </a>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-12">

              {/* Acceptance of Terms */}
              <section id="acceptance" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Acceptance of Terms</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    By accessing or using this website ("Site"), you agree to these Terms of Use and our{' '}
                    <Link href="/privacy" className="text-arena-gold hover:text-arena-gold-dark underline">
                      Privacy Policy
                    </Link>. If you do not agree, do not use the Site.
                  </p>
                  <div className="bg-arena-cream p-6 rounded-lg border-l-4 border-arena-gold">
                    <h3 className="font-semibold text-arena-navy mb-2">Binding Agreement</h3>
                    <p className="text-sm">
                      These Terms constitute a legally binding agreement between you and Arena Fund. 
                      Your use of the Site indicates your acceptance of these Terms.
                    </p>
                  </div>
                </div>
              </section>

              {/* Modifications */}
              <section id="modifications" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Modifications</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Arena Fund may update these Terms at any time. Updated versions will be posted here, 
                    and continued use of the Site constitutes acceptance of changes.
                  </p>
                  <div className="arena-card p-6">
                    <h3 className="font-semibold text-arena-navy mb-3">Notice of Changes</h3>
                    <p className="text-sm text-gray-600">
                      We will update the "Effective Date" at the top of these Terms when changes are made. 
                      We encourage you to review these Terms periodically for any updates.
                    </p>
                  </div>
                </div>
              </section>

              {/* Eligibility */}
              <section id="eligibility" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <UserCheck className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Eligibility</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Users must be 18 years or older (or the age of majority in their jurisdiction). 
                    By using this Site, you confirm you meet eligibility requirements.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Age Requirements</h3>
                      <p className="text-sm text-gray-600">
                        You must be at least 18 years old or the age of majority in your jurisdiction 
                        to use our services and enter into these Terms.
                      </p>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Legal Capacity</h3>
                      <p className="text-sm text-gray-600">
                        You must have the legal capacity to enter into binding agreements and 
                        comply with all applicable laws and regulations.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section id="intellectual-property" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Lock className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Use of Content & Intellectual Property</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    All content on the Site is owned by Arena Fund or its licensors. You may view, download, 
                    or print for personal use only. Commercial use, modification, or redistribution is 
                    prohibited without written consent.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">Permitted Uses</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-arena-hunter-green mt-0.5 flex-shrink-0" />
                          <span>Personal, non-commercial viewing</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-arena-hunter-green mt-0.5 flex-shrink-0" />
                          <span>Downloading for personal reference</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-arena-hunter-green mt-0.5 flex-shrink-0" />
                          <span>Printing for personal use</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-arena-hunter-green mt-0.5 flex-shrink-0" />
                          <span>Sharing links to our content</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">Prohibited Uses</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-arena-bright-umber mt-0.5 flex-shrink-0" />
                          <span>Commercial use without permission</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-arena-bright-umber mt-0.5 flex-shrink-0" />
                          <span>Modification or derivative works</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-arena-bright-umber mt-0.5 flex-shrink-0" />
                          <span>Redistribution or republishing</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-arena-bright-umber mt-0.5 flex-shrink-0" />
                          <span>Removal of copyright notices</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Submissions */}
              <section id="submissions" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <BookOpen className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Investor Submissions & Pilot Validation Materials</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    When you submit information through our website, specific terms apply to protect both parties.
                  </p>
                  <div className="space-y-6">
                    <div className="arena-card p-6 border-l-4 border-arena-hunter-green">
                      <h3 className="font-semibold text-arena-navy mb-3">Non-Binding Submissions</h3>
                      <p className="text-sm text-gray-600">
                        Any information you submit (including investor interest forms or pitch materials) is for 
                        informational purposes only and does not constitute a binding offer or commitment from either party.
                      </p>
                    </div>
                    
                    <div className="arena-card p-6 border-l-4 border-arena-hunter-green">
                      <h3 className="font-semibold text-arena-navy mb-3">Pilot Validation Data</h3>
                      <p className="text-sm text-gray-600">
                        Case studies, metrics, or pilot program data shared on this Site are illustrative only 
                        and do not guarantee future results or investment outcomes. Past performance does not 
                        predict future success.
                      </p>
                    </div>

                    <div className="arena-card p-6 border-l-4 border-arena-sunrise">
                      <h3 className="font-semibold text-arena-navy mb-3">Confidentiality</h3>
                      <p className="text-sm text-gray-600">
                        Unless expressly agreed in writing, Arena Fund is under no obligation to treat submitted 
                        materials as confidential. Do not submit confidential information through public forms.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Acceptable Use */}
              <section id="acceptable-use" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Acceptable Use</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    You agree not to misuse the Site, including attempting unauthorized access, 
                    misrepresenting your identity, or transmitting harmful code.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">Prohibited Activities</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Unauthorized access to systems or data</li>
                        <li>• Misrepresenting your identity or credentials</li>
                        <li>• Transmitting viruses or malicious code</li>
                        <li>• Interfering with site functionality</li>
                        <li>• Harvesting user information</li>
                        <li>• Using automated systems without permission</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">Required Conduct</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Provide accurate information</li>
                        <li>• Respect other users and their privacy</li>
                        <li>• Comply with all applicable laws</li>
                        <li>• Use the site for legitimate purposes only</li>
                        <li>• Report security vulnerabilities</li>
                        <li>• Maintain account security</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Regulatory Disclaimers */}
              <section id="regulatory" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Scale className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Regulatory Disclaimers</h2>
                </div>
                <div className="space-y-6">
                  <div className="bg-arena-abilene-lace border border-arena-hunter-green p-6 rounded-lg">
                    <h3 className="font-semibold text-arena-night-brown mb-3">Securities Law Compliance</h3>
                    <div className="text-sm text-arena-hunter-green space-y-2">
                      <p>
                        Interests in Arena Fund have not been registered under the Securities Act of 1933 and are 
                        offered pursuant to exemptions including{' '}
                        <a href="https://www.sec.gov/smallbusiness/exemptofferings/regd" target="_blank" rel="noopener noreferrer" className="underline">
                          Regulation D
                        </a>,{' '}
                        <a href="https://www.sec.gov/smallbusiness/exemptofferings/regcrowdfunding" target="_blank" rel="noopener noreferrer" className="underline">
                          Regulation Crowdfunding (Reg CF)
                        </a>, and{' '}
                        <a href="https://www.sec.gov/smallbusiness/exemptofferings/rega" target="_blank" rel="noopener noreferrer" className="underline">
                          Regulation A+
                        </a>.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">KYC/AML Compliance</h3>
                      <p className="text-sm text-gray-600">
                        All investors must comply with{' '}
                        <a href="https://www.sec.gov/spotlight/cybersecurity/cybersecurity-risk-alert-aml-kyc.pdf" target="_blank" rel="noopener noreferrer" className="text-arena-gold underline">
                          KYC/AML requirements
                        </a>{' '}
                        before any investment is accepted.
                      </p>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">No Investment Advice</h3>
                      <p className="text-sm text-gray-600">
                        Nothing on this Site constitutes investment advice, a solicitation, 
                        or an offer to buy or sell securities.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Disclaimers & Limitation of Liability */}
              <section id="disclaimers" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Disclaimers & Limitation of Liability</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    The Site is provided "as is." Arena Fund disclaims all warranties, express or implied. 
                    Arena Fund is not liable for indirect, incidental, or consequential damages arising from Site use.
                  </p>
                  
                  <div className="bg-arena-sunrise border border-arena-bright-umber p-6 rounded-lg">
                    <h3 className="font-semibold text-arena-night-brown mb-3">Important Disclaimers</h3>
                    <div className="text-sm text-arena-hunter-green space-y-2">
                      <p>
                        <strong>No Warranties:</strong> We provide the site "as is" without any warranties 
                        of merchantability, fitness for a particular purpose, or non-infringement.
                      </p>
                      <p>
                        <strong>Service Availability:</strong> We do not guarantee uninterrupted or error-free 
                        operation of the site. Maintenance and updates may cause temporary unavailability.
                      </p>
                      <p>
                        <strong>Third-Party Content:</strong> We are not responsible for the accuracy or 
                        reliability of third-party content, links, or services referenced on our site.
                      </p>
                    </div>
                  </div>

                  <div className="arena-card p-6">
                    <h3 className="font-semibold text-arena-navy mb-3">Limitation of Liability</h3>
                    <p className="text-sm text-gray-600">
                      To the maximum extent permitted by law, Arena Fund's total liability for any claims 
                      related to the site shall not exceed $100 or the amount you paid us in the past 12 months, 
                      whichever is greater.
                    </p>
                  </div>
                </div>
              </section>

              {/* Indemnification */}
              <section id="indemnification" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Indemnification</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    You agree to indemnify and hold Arena Fund, its affiliates, and representatives harmless 
                    from claims arising from your use of the Site or breach of these Terms.
                  </p>
                  <div className="arena-card p-6">
                    <h3 className="font-semibold text-arena-navy mb-3">Your Responsibility</h3>
                    <p className="text-sm text-gray-600">
                      You will defend, indemnify, and hold us harmless from any claims, damages, or expenses 
                      (including reasonable attorney fees) arising from your violation of these Terms or 
                      applicable laws.
                    </p>
                  </div>
                </div>
              </section>

              {/* International Users */}
              <section id="international" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Globe className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">International Users</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    This Site is controlled from the United States. Arena Fund makes no representation that 
                    Site content is appropriate or available in other jurisdictions. Users accessing from 
                    outside the U.S. do so at their own risk and are responsible for compliance with local laws.
                  </p>
                  <div className="arena-card p-6">
                    <h3 className="font-semibold text-arena-navy mb-3">Export Controls</h3>
                    <p className="text-sm text-gray-600">
                      Our services and content may be subject to U.S. export control laws. You agree to 
                      comply with all applicable export and import laws and regulations.
                    </p>
                  </div>
                </div>
              </section>

              {/* Governing Law & Dispute Resolution */}
              <section id="governing-law" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Gavel className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Governing Law & Dispute Resolution</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    These Terms are governed by the laws of the State of California, without regard to 
                    conflict of law rules. Any dispute shall be resolved through binding arbitration under 
                    the rules of the American Arbitration Association (AAA) in San Francisco, CA.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Arbitration</h3>
                      <p className="text-sm text-gray-600">
                        Disputes will be resolved through binding arbitration rather than court proceedings. 
                        Judgment on the arbitration award may be entered in any court of competent jurisdiction.
                      </p>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Class Action Waiver</h3>
                      <p className="text-sm text-gray-600">
                        You agree to resolve disputes individually and waive any right to participate in 
                        class action lawsuits or class-wide arbitrations.
                      </p>
                    </div>
                  </div>

                  <div className="bg-arena-foggy-pith p-6 rounded-lg">
                    <h3 className="font-semibold text-arena-navy mb-3">Severability & Waiver</h3>
                    <p className="text-sm text-gray-600">
                      If any part of these Terms is found unenforceable, the remainder will remain in effect. 
                      Failure to enforce any provision does not constitute a waiver of our rights.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Mail className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Contact</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    For questions regarding these Terms, please contact:{' '}
                    <a href="mailto:legal@thearenafund.com" className="text-arena-gold hover:text-arena-gold-dark underline">
                      legal@thearenafund.com
                    </a>
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Legal Department</h3>
                      <div className="space-y-2 text-sm">
                        <a href="mailto:legal@thearenafund.com" className="flex items-center text-arena-gold hover:text-arena-gold-dark">
                          <Mail className="w-4 h-4 mr-2" />
                          legal@thearenafund.com
                        </a>
                        <p className="text-gray-600">For questions about these Terms of Use</p>
                      </div>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">General Inquiries</h3>
                      <div className="space-y-2 text-sm">
                        <Link href="/contact" className="flex items-center text-arena-gold hover:text-arena-gold-dark">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Contact Form
                        </Link>
                        <p className="text-gray-600">For general questions and support</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-arena-cream p-6 rounded-lg border-l-4 border-arena-gold">
                    <h3 className="font-semibold text-arena-navy mb-2">Document Updates</h3>
                    <p className="text-sm text-gray-600">
                      We may update these Terms from time to time. The most current version will always be 
                      available on this page with the effective date clearly marked.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}