'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ChevronDown, 
  Search,
  FileText,
  BarChart3,
  Shield,
  Building2,
  DollarSign,
  Users,
  Target,
  Clock,
  Globe,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const categories = [
    { id: 'all', name: 'All Questions', icon: Shield },
    { id: 'investment', name: 'Investment Process', icon: Target },
    { id: 'criteria', name: 'Investment Criteria', icon: CheckCircle },
    { id: 'process', name: 'Our Process', icon: TrendingUp },
    { id: 'portfolio', name: 'Portfolio Support', icon: Users },
    { id: 'logistics', name: 'Logistics', icon: Clock }
  ];

  const faqs = [
    // Investment Process
    {
      id: 'investment-1',
      category: 'investment',
      question: "How do I apply for funding from Arena Fund?",
      answer: "Submit your application through our secure portal at /apply. We require a comprehensive overview of your buyer validation progress, including documented enterprise demand, pilot program results, and Fortune 500 buyer commitments. Our team reviews applications within 5 business days and provides detailed feedback regardless of outcome."
    },
    {
      id: 'investment-2', 
      category: 'investment',
      question: "What is your typical investment timeline?",
      answer: "Our investment process typically takes 4-6 weeks from initial application to term sheet. This includes: Initial review (1 week), buyer validation audit (2 weeks), due diligence and partner review (2 weeks), and final decision and documentation (1 week). We prioritize speed while maintaining thorough evaluation."
    },
    {
      id: 'investment-3',
      category: 'investment', 
      question: "Do you provide bridge funding during the process?",
      answer: "Yes, for qualified companies with validated Fortune 500 demand, we can provide bridge funding of $100K-$500K to maintain momentum during our investment process. This ensures critical buyer relationships and pilot programs continue uninterrupted."
    },

    // Investment Criteria
    {
      id: 'criteria-1',
      category: 'criteria',
      question: "What stage companies does Arena Fund invest in?",
      answer: "We invest in Pre-seed to Series A companies ($1M-$15M ARR) that have systematically validated Fortune 500 buyer demand. Companies must demonstrate: validated enterprise demand through our methodology, 2+ Fortune 500 pilot programs, proven pilot-to-purchase conversion, and scalable go-to-market operations."
    },
    {
      id: 'criteria-2',
      category: 'criteria', 
      question: "What sectors do you focus on?",
      answer: "We focus on B2B AI and enterprise software companies that solve critical Fortune 500 problems. Key sectors include: AI-powered data platforms, enterprise automation tools, cybersecurity solutions, supply chain optimization, and financial technology for large enterprises."
    },
    {
      id: 'criteria-3',
      category: 'criteria',
      question: "What is your typical investment size?",
      answer: "Our investments range from $250K-$2M, with the ability to lead or co-lead rounds up to $25M. Investment size depends on validated market demand, buyer commitment levels, and capital efficiency requirements for scaling proven go-to-market strategies."
    },
    {
      id: 'criteria-4',
      category: 'criteria',
      question: "Do you invest internationally?",
      answer: "We invest globally but require companies to have validated demand from US Fortune 500 buyers. International companies must demonstrate: US market entry strategy, Fortune 500 buyer validation, US-based go-to-market team, and commitment to US market as primary growth driver."
    },

    // Our Process  
    {
      id: 'process-1',
      category: 'process',
      question: "What is buyer validation and why is it important?",
      answer: "Buyer validation is our systematic process of proving Fortune 500 enterprise demand before investment. We validate: specific buyer pain points, procurement processes, budget allocation, decision-maker commitment, and pilot-to-purchase conversion rates. This reduces market risk by 67% and accelerates path to $10M ARR by 3x."
    },
    {
      id: 'process-2',
      category: 'process',
      question: "How do you validate Fortune 500 buyers?",
      answer: "Our 4-step validation process includes: (1) Buyer Discovery - mapping Fortune 500 decision makers and procurement processes, (2) Demand Validation - structured buyer interviews and needs assessment, (3) Pilot Orchestration - facilitating pilot programs with validated buyers, (4) Scale Acceleration - leveraging validated demand for enterprise sales growth."
    },
    {
      id: 'process-3',
      category: 'process',
      question: "What makes Arena Fund different from other VCs?",
      answer: "We're the only VC that validates Fortune 500 buyer demand before investing. Traditional VCs invest based on assumptions - we invest based on proven enterprise demand. Our portfolio companies achieve 90% pilot-to-purchase conversion rates and 3x faster path to $10M ARR through systematic buyer validation."
    },

    // Portfolio Support
    {
      id: 'portfolio-1',
      category: 'portfolio',
      question: "What support do you provide post-investment?",
      answer: "We provide hands-on support including: Fortune 500 buyer introductions, pilot program orchestration, enterprise sales strategy, procurement process navigation, customer success optimization, and follow-on funding preparation. Our operator network includes 500+ Fortune 500 executives."
    },
    {
      id: 'portfolio-2',
      category: 'portfolio',
      question: "How do you help with enterprise sales?",
      answer: "We accelerate enterprise sales through: validated buyer introductions, pilot program facilitation, procurement process guidance, contract negotiation support, customer success strategies, and expansion revenue optimization. Our portfolio companies achieve 90% pilot-to-purchase conversion rates."
    },
    {
      id: 'portfolio-3',
      category: 'portfolio',
      question: "Do you help with follow-on funding?",
      answer: "Yes, we actively support follow-on funding through: validated traction documentation, investor introductions, due diligence preparation, valuation optimization based on proven demand, and strategic positioning for growth rounds. Our portfolio companies raise follow-on funding 40% faster."
    },

    // Logistics
    {
      id: 'logistics-1',
      category: 'logistics',
      question: "What information do you need for initial review?",
      answer: "For initial review, we need: company overview and traction metrics, Fortune 500 buyer validation progress, pilot program results and conversion rates, current revenue and growth trajectory, team background and operator experience, and competitive differentiation and market positioning."
    },
    {
      id: 'logistics-2',
      category: 'logistics',
      question: "How do you handle confidentiality?",
      answer: "We maintain strict confidentiality through: signed NDAs before any detailed discussions, secure data rooms for sensitive information, limited partner access on need-to-know basis, and comprehensive data protection protocols. Your buyer relationships and competitive information remain completely confidential."
    },
    {
      id: 'logistics-3',
      category: 'logistics',
      question: "What are your standard investment terms?",
      answer: "Our terms are founder-friendly and market-standard: preferred equity with standard liquidation preferences, board seat or observer rights, pro-rata rights for follow-on investments, and performance-based milestones tied to buyer validation metrics. We prioritize alignment over control."
    }
  ];

  // Filter FAQs based on category and search
  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
                Frequently Asked Questions
              </div>
              
              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                Everything you need to know about <span className="arena-gradient-text">buyer validation</span>
              </h1>
              
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Get answers about our systematic Fortune 500 buyer validation process, investment criteria, 
                and how we help founders prove enterprise demand before scaling.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search frequently asked questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-arena-gold focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-arena-navy text-white hover:bg-arena-navy-light transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <FileText className="w-5 h-5 mr-2" />
                Apply for Funding
              </Link>
              <Link href="/invest" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl border-2 border-arena-navy text-arena-navy hover:bg-arena-navy hover:text-white transition-all duration-300">
                <BarChart3 className="w-5 h-5 mr-2" />
                Partner with Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <h3 className="arena-subtitle text-arena-navy mb-6">Browse by Category</h3>
                <nav className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    const categoryCount = category.id === 'all' 
                      ? faqs.length 
                      : faqs.filter(faq => faq.category === category.id).length;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                          isActive 
                            ? 'bg-arena-gold-light text-arena-navy border-l-4 border-arena-gold' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-arena-navy'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-arena-gold' : 'text-gray-400'}`} />
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          isActive ? 'bg-arena-gold text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {categoryCount}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* FAQ List */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="arena-subtitle text-gray-600 mb-2">No questions found</h3>
                    <p className="text-gray-500">Try adjusting your search or browse different categories.</p>
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isOpen = openItems.has(faq.id);
                    return (
                      <div key={faq.id} className="arena-card border-l-4 border-transparent hover:border-arena-gold transition-all duration-200">
                        <button
                          onClick={() => toggleItem(faq.id)}
                          className="w-full px-6 py-6 text-left flex items-start justify-between hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex-1 pr-4">
                            <h3 className="text-lg font-semibold text-arena-navy group-hover:text-arena-gold transition-colors">
                              {faq.question}
                            </h3>
                          </div>
                          <ChevronDown 
                            className={`w-5 h-5 text-arena-gold transition-transform flex-shrink-0 mt-1 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 border-t border-gray-100">
                            <div className="pt-4">
                              <p className="text-gray-700 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="arena-section bg-arena-navy text-white">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="arena-headline text-white">Still have questions?</h2>
              <p className="arena-body-xl text-gray-300 max-w-3xl mx-auto">
                Our team is here to help you understand our buyer validation process and determine 
                if Arena Fund is the right partner for your enterprise-focused startup.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-arena-gold text-arena-navy hover:bg-arena-gold-dark transition-all duration-300">
                <Users className="w-5 h-5 mr-2" />
                Schedule a Call
              </Link>
              <a 
                href="mailto:invest@arenafund.vc" 
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl border-2 border-white text-white hover:bg-white hover:text-arena-navy transition-all duration-300"
              >
                <Globe className="w-5 h-5 mr-2" />
                Email Our Team
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
