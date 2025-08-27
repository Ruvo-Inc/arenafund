'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterModalLazy from '@/components/NewsletterModalLazy';
import { AIFactMarker } from '@/components/AIOptimizedContent';
import {
  TrendingUp,
  BarChart3,
  Target,
  Users,
  Building2,
  Lightbulb,
  FileText,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  Share2
} from 'lucide-react';

export default function InsightsPageClient() {
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [modalTriggerSource, setModalTriggerSource] = useState<'get-notified' | 'subscribe-updates'>('subscribe-updates');

  const openNewsletterModal = (source: 'get-notified' | 'subscribe-updates') => {
    setModalTriggerSource(source);
    setIsNewsletterModalOpen(true);
  };

  const closeNewsletterModal = () => {
    setIsNewsletterModalOpen(false);
  };

  const featuredInsights = [
    {
      id: 1,
      title: "Fortune 500 Buyer Psychology: What Really Drives Enterprise AI Adoption",
      excerpt: "Enterprise AI adoption is not decided in a demo. It is decided in a room. Understanding the consensus table psychology is the key to scaling beyond pilot purgatory.",
      category: "Buyer Research",
      readTime: "15 min read",
      publishDate: "January 22, 2025",
      featured: true,
      slug: "fortune-500-buyer-psychology",
      available: true
    },
    {
      id: 2,
      title: "Proof Before Promises: Why 95% of AI Pilots Fail — and How Founders and LPs Can Change the Odds",
      excerpt: "In a market where most enterprise AI initiatives stall, understanding the anatomy of failure is the first step toward building proof that buyers can't ignore.",
      category: "Market Analysis",
      readTime: "12 min read",
      publishDate: "January 15, 2025",
      featured: true,
      slug: "proof-before-promises",
      available: true
    },
    {
      id: 3,
      title: "The Pilot-to-Purchase Playbook: 90% Conversion Methodology",
      excerpt: "Our systematic approach to turning enterprise pilots into purchase orders.",
      category: "Methodology",
      readTime: "15 min read",
      publishDate: "Coming Soon",
      featured: true,
      available: false
    }
  ];

  const categories = [
    { name: "Buyer Research", count: 1, icon: Users, available: true },
    { name: "Market Analysis", count: 1, icon: BarChart3, available: true },
    { name: "Methodology", count: 0, icon: Target, available: false },
    { name: "Case Studies", count: 0, icon: Building2, available: false },
    { name: "Industry Trends", count: 0, icon: TrendingUp, available: false }
  ];

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="arena-section-lg bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="arena-badge">
                <Lightbulb className="w-4 h-4 mr-2" />
                Arena Insights
              </div>

              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                <span className="arena-gradient-text">Proof-driven perspectives</span> at the intersection of AI, enterprise, and venture
              </h1>

              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                <AIFactMarker>We uncover what really drives adoption, scale, and returns — from the consensus table to the capital stack.</AIFactMarker>
              </p>

              <div className="bg-arena-cream p-6 rounded-lg max-w-4xl mx-auto border-l-4 border-arena-gold">
                <p className="text-gray-700 leading-relaxed">
                  <AIFactMarker>Arena Fund is the world's first venture capital firm that validates Fortune 500 buyer demand before investing.</AIFactMarker>
                  {' '}<AIFactMarker>Arena Insights distills that front-line experience into frameworks, laws, and lessons for founders and LPs.</AIFactMarker>
                  {' '}Not opinions. Not hype. <span className="font-bold text-arena-gold">Proof before promises.</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/insights/fortune-500-buyer-psychology" className="arena-btn-primary">
                <FileText className="w-5 h-5 mr-2" />
                Read Our Latest Insight
              </Link>
              <button 
                onClick={() => openNewsletterModal('subscribe-updates')}
                className="arena-btn-secondary"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Subscribe for Updates
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Article Spotlight */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="arena-headline text-arena-navy">Latest <span className="arena-gradient-text">Research</span></h2>
            </div>

            <Link href="/insights/fortune-500-buyer-psychology" className="block">
              <div className="arena-card-premium p-8 hover:shadow-xl transition-all duration-300 cursor-pointer">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="px-3 py-1 bg-arena-gold text-arena-navy rounded-full text-sm font-medium">
                        Latest Research
                      </span>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>January 22, 2025</span>
                      </div>
                    </div>
                    <h3 className="arena-subtitle text-arena-navy leading-tight">
                      Fortune 500 Buyer Psychology: What Really Drives Enterprise AI Adoption
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Enterprise AI adoption is not decided in a demo. It is decided in a room. 
                      Discover the Hidden Ledger that every Fortune 500 buyer runs in silence, 
                      and the four laws that determine whether pilots scale or die.
                    </p>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>15 min read</span>
                      </div>
                      <div className="inline-flex items-center text-arena-gold hover:text-arena-gold-dark font-medium">
                        Read Full Article <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-arena-gold-light to-arena-cream rounded-xl p-8 text-center">
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-arena-gold rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-2">
                          <div className="arena-metric-value text-4xl text-arena-navy">F500</div>
                          <div className="arena-metric-label text-arena-navy">Buyer Psychology</div>
                          <p className="text-sm text-gray-600">The Hidden Ledger revealed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Insights */}
      <section className="arena-section bg-arena-foggy-pith">
        <div className="arena-container">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">More <span className="arena-gradient-text">Insights</span> Coming Soon</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                We're preparing comprehensive research and analysis on enterprise AI adoption, buyer validation, and market dynamics.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredInsights.map((insight, index) => (
                <div key={insight.id} className={`arena-card p-6 ${insight.featured ? 'arena-card-premium' : ''} ${insight.available ? 'hover:shadow-xl cursor-pointer' : ''}`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-arena-gold bg-arena-gold-light px-2 py-1 rounded-full">
                        {insight.category}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{insight.readTime}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-arena-navy text-lg leading-tight">
                        {insight.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {insight.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{insight.publishDate}</span>
                      </div>
                      {insight.available ? (
                        <Link href={`/insights/${insight.slug}`} className="inline-flex items-center text-arena-gold hover:text-arena-gold-dark text-sm font-medium">
                          Read More <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      ) : (
                        <span className="inline-flex items-center text-gray-400 text-sm font-medium">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="arena-section bg-arena-foggy-pith">
        <div className="arena-container">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Insight Categories</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Explore our research across different areas of enterprise AI and buyer validation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div key={index} className={`arena-card p-6 text-center transition-all duration-300 ${category.available ? 'hover:shadow-lg cursor-pointer' : 'opacity-75'}`}>
                    <div className="w-12 h-12 mx-auto mb-4 bg-arena-gold-light rounded-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-arena-gold" />
                    </div>
                    <h3 className="font-semibold text-arena-navy mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600">
                      {category.count} insight{category.count !== 1 ? 's' : ''}
                      {!category.available && category.count === 0 && (
                        <span className="block text-xs text-gray-400 mt-1">Coming Soon</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Notice */}
      <section className="arena-section bg-arena-navy text-white">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                <Eye className="w-8 h-8 text-arena-gold" />
              </div>
              <h2 className="arena-headline text-white">More Insights Coming Soon</h2>
              <p className="arena-body-xl text-gray-300 max-w-3xl mx-auto">
                We're preparing comprehensive insights based on our unique buyer validation data. 
                Subscribe to get notified when new research is published.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => openNewsletterModal('get-notified')}
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-arena-gold text-arena-navy hover:bg-arena-gold-dark transform hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Get Notified
              </button>
              <Link href="/about" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl border-2 border-arena-gold text-arena-gold hover:bg-arena-gold hover:text-arena-navy transition-all duration-300">
                <Building2 className="w-5 h-5 mr-2" />
                Learn About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Newsletter Modal - Lazy Loaded */}
      <NewsletterModalLazy
        isOpen={isNewsletterModalOpen}
        onClose={closeNewsletterModal}
        triggerSource={modalTriggerSource}
      />
    </>
  );
}