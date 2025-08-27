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
  ChevronRight
} from 'lucide-react';

const LAST_UPDATED = "December 15, 2024";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: Shield },
    { id: 'acceptance', title: 'Acceptance of Terms', icon: CheckCircle },
    { id: 'services', title: 'Our Services', icon: Building2 },
    { id: 'investor-terms', title: 'Investor Terms', icon: Scale },
    { id: 'user-obligations', title: 'User Obligations', icon: Users },
    { id: 'intellectual-property', title: 'Intellectual Property', icon: Lock },
    { id: 'disclaimers', title: 'Disclaimers', icon: AlertTriangle },
    { id: 'limitation-liability', title: 'Limitation of Liability', icon: Shield },
    { id: 'governing-law', title: 'Governing Law', icon: Globe },
    { id: 'contact', title: 'Contact Information', icon: Mail }
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
                Clear terms for <span className="arena-gradient-text">trusted partnerships</span>
              </h1>

              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                These terms govern your use of Arena Fund's services and establish the framework 
                for our investment and buyer validation processes.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Last updated: {LAST_UPDATED}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>SEC Compliant</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/invest" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-arena-navy text-white hover:bg-arena-navy-light transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <Building2 className="w-5 h-5 mr-2" />
                Investor Application
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

              {/* Overview */}
              <section id="overview" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Overview</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Welcome to Arena Fund. These Terms of Use ("Terms") govern your access to and use of our website, 
                    services, and investment opportunities. By accessing our services, you agree to be bound by these Terms.
                  </p>
                  <div className="bg-arena-cream p-6 rounded-lg border-l-4 border-arena-gold">
                    <h3 className="font-semibold text-arena-navy mb-2">Important Notice</h3>
                    <p className="text-sm">
                      Arena Fund is a registered investment adviser. Our services involve investment opportunities 
                      that are subject to securities laws and regulations. Please read these Terms carefully and 
                      consult with your legal and financial advisors before proceeding.
                    </p>
                  </div>
                </div>
              </section>

              {/* Acceptance of Terms */}
              <section id="acceptance" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Acceptance of Terms</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    By accessing or using Arena Fund's website and services, you acknowledge that you have read, 
                    understood, and agree to be bound by these Terms and our Privacy Policy.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Binding Agreement</h3>
                      <p className="text-sm text-gray-600">
                        These Terms constitute a legally binding agreement between you and Arena Fund. 
                        If you do not agree to these Terms, you may not use our services.
                      </p>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Updates to Terms</h3>
                      <p className="text-sm text-gray-600">
                        We may update these Terms from time to time. Continued use of our services 
                        after changes constitutes acceptance of the updated Terms.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Our Services */}
              <section id="services" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Building2 className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Our Services</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    Arena Fund provides investment advisory services, buyer validation, and related services 
                    to entrepreneurs and accredited investors.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">For Entrepreneurs</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Fortune 500 buyer validation services</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Pilot program orchestration</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Investment evaluation and funding</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Portfolio support and guidance</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">For Investors</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Access to buyer-validated investment opportunities</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Due diligence and investment documentation</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Portfolio reporting and updates</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Access to exclusive investment opportunities</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Investor Terms */}
              <section id="investor-terms" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Scale className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Investor Terms</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    Investment opportunities through Arena Fund are subject to specific terms and regulatory requirements.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="arena-card p-6 border-l-4 border-arena-hunter-green">
                      <h3 className="font-semibold text-arena-navy mb-3">Rule 506(b) Private Offerings</h3>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>
                          Private offerings under Rule 506(b) are available to accredited investors and up to 35 
                          sophisticated non-accredited investors who have pre-existing relationships with Arena Fund.
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>No general solicitation or advertising permitted</li>
                          <li>Expression of interest does not constitute an investment commitment</li>
                          <li>All investments subject to due diligence and documentation</li>
                          <li>Minimum investment amounts may apply</li>
                        </ul>
                      </div>
                    </div>

                    <div className="arena-card p-6 border-l-4 border-arena-hunter-green">
                      <h3 className="font-semibold text-arena-navy mb-3">Rule 506(c) Public Offerings</h3>
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>
                          Public offerings under Rule 506(c) require verification of accredited investor status 
                          before any investment materials can be shared.
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>General solicitation and advertising permitted</li>
                          <li>Accredited investor verification required by law</li>
                          <li>No investment materials provided until verification complete</li>
                          <li>Third-party verification may be required</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 mb-2">Investment Risks</h4>
                          <p className="text-sm text-yellow-700">
                            All investments involve risk of loss. Past performance does not guarantee future results. 
                            Investments in early-stage companies are particularly risky and may result in total loss of capital.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* User Obligations */}
              <section id="user-obligations" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">User Obligations</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    By using our services, you agree to comply with all applicable laws and these Terms.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">Prohibited Uses</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Providing false or misleading information</li>
                        <li>• Violating securities laws or regulations</li>
                        <li>• Unauthorized access to our systems</li>
                        <li>• Interfering with other users' access</li>
                        <li>• Using our services for illegal purposes</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-arena-navy">Required Compliance</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Provide accurate and complete information</li>
                        <li>• Maintain confidentiality of sensitive information</li>
                        <li>• Comply with all applicable securities laws</li>
                        <li>• Notify us of any changes to your status</li>
                        <li>• Respect intellectual property rights</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section id="intellectual-property" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Lock className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Intellectual Property</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    All content, trademarks, and intellectual property on our website and in our materials 
                    are owned by Arena Fund or our licensors.
                  </p>
                  <div className="arena-card p-6">
                    <h3 className="font-semibold text-arena-navy mb-3">Limited License</h3>
                    <p className="text-sm text-gray-600">
                      We grant you a limited, non-exclusive, non-transferable license to access and use our 
                      services for their intended purpose. You may not reproduce, distribute, or create 
                      derivative works without our written permission.
                    </p>
                  </div>
                </div>
              </section>

              {/* Disclaimers */}
              <section id="disclaimers" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Disclaimers</h2>
                </div>
                <div className="space-y-6">
                  <div className="bg-arena-sunrise border border-arena-bright-umber p-6 rounded-lg">
                    <h3 className="font-semibold text-arena-night-brown mb-3">Investment Disclaimers</h3>
                    <div className="text-sm text-arena-hunter-green space-y-2">
                      <p>
                        <strong>No Investment Advice:</strong> Information provided is for educational purposes only 
                        and does not constitute investment advice or recommendations.
                      </p>
                      <p>
                        <strong>Risk of Loss:</strong> All investments involve risk of loss, including potential 
                        total loss of principal. Past performance does not guarantee future results.
                      </p>
                      <p>
                        <strong>No Guarantees:</strong> We make no guarantees about investment returns, 
                        buyer validation outcomes, or business success.
                      </p>
                    </div>
                  </div>
                  
                  <div className="arena-card p-6">
                    <h3 className="font-semibold text-arena-navy mb-3">Service Disclaimers</h3>
                    <p className="text-sm text-gray-600">
                      Our services are provided "as is" without warranties of any kind. We disclaim all warranties, 
                      express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
                    </p>
                  </div>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section id="limitation-liability" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Limitation of Liability</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    To the maximum extent permitted by law, Arena Fund shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages.
                  </p>
                  <div className="arena-card p-6">
                    <h3 className="font-semibold text-arena-navy mb-3">Liability Cap</h3>
                    <p className="text-sm text-gray-600">
                      Our total liability to you for any claims arising from or related to these Terms or our 
                      services shall not exceed the amount you have paid to us in the twelve months preceding the claim.
                    </p>
                  </div>
                </div>
              </section>

              {/* Governing Law */}
              <section id="governing-law" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Globe className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Governing Law</h2>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles.
                  </p>
                  <div className="arena-card p-6">
                    <h3 className="font-semibold text-arena-navy mb-3">Dispute Resolution</h3>
                    <p className="text-sm text-gray-600">
                      Any disputes arising from these Terms shall be resolved through binding arbitration in 
                      San Francisco, California, in accordance with the rules of the American Arbitration Association.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section id="contact" className="scroll-mt-24">
                <div className="flex items-center space-x-3 mb-6">
                  <Mail className="w-6 h-6 text-arena-gold" />
                  <h2 className="arena-headline text-arena-navy">Contact Information</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-700">
                    If you have questions about these Terms, please contact us:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">Legal Inquiries</h3>
                      <div className="space-y-2 text-sm">
                        <a href="mailto:legal@thearenafund.com" className="flex items-center text-arena-gold hover:text-arena-gold-dark">
                          <Mail className="w-4 h-4 mr-2" />
                          legal@thearenafund.com
                        </a>
                        <p className="text-gray-600">For questions about these Terms or legal matters</p>
                      </div>
                    </div>
                    <div className="arena-card p-6">
                      <h3 className="font-semibold text-arena-navy mb-3">General Contact</h3>
                      <div className="space-y-2 text-sm">
                        <Link href="/contact" className="flex items-center text-arena-gold hover:text-arena-gold-dark">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Contact Form
                        </Link>
                        <p className="text-gray-600">For general inquiries and support</p>
                      </div>
                    </div>
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