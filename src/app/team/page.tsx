'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Users,
  Briefcase,
  Building2,
  Mail,
  Star,
  CheckCircle,
  BookOpen,
  MapPin,
  Quote,
  ArrowRight,
  Target,
  Shield,
  Eye,
} from 'lucide-react';

export default function TeamPage() {
  const founderProfile = {
    name: "Mani Swaminathan",
    title: "Founder & Managing Partner",
    tagline: "Ex-operator with 20+ years in Fortune 500 tech - now investing in founders who prove demand.",
    bio: {
      paragraph1: "Mani brings 20+ years in enterprise technology - from NTT DATA and Accenture to scaling AI at Infrrd - where he guided Fortune 500 leaders across insurance, fintech, and communications. He has worked with Aspen Insurance, Wells Fargo, Tokio Marine, MoneyGram, S&P Global, and top U.S. airlines, partnering with Google, NVIDIA, and MongoDB to turn complex technology into measurable business value.",
      paragraph2: "That vantage point revealed a recurring gap: startups with world-class tech trapped in \"pilot purgatory\" - logos without revenue. Arena Fund was born to close that gap. Mani now bridges ambitious AI founders with the psychology, procurement, and proof Fortune 500 buyers demand."
    },
    pullQuote: "Proof before promises. Not a slogan - an operating law.",
    location: "San Francisco's AI epicenter",
    education: "Industrial Engineering",
    memberships: ["NextPlay member", "Bay Area venture ecosystem"],
    expertise: ["Fortune 500 Tech Strategy", "Enterprise AI Scaling", "Buyer Psychology", "Procurement Processes"],
    linkedin: "https://www.linkedin.com/in/maniswaminathan/",
    twitter: "https://x.com/ManiSw82",
    email: "mani.swaminathan@thearenafund.com"
  };

  const operatorStats = [
    {
      metric: "20+",
      label: "Years Enterprise Tech",
      description: "Deep Fortune 500 operational experience"
    },
    {
      metric: "F500",
      label: "Buyer Network",
      description: "Direct relationships with enterprise decision makers"
    },
    {
      metric: "3",
      label: "Major Platforms",
      description: "Google, NVIDIA, MongoDB partnerships"
    },
    {
      metric: "90%",
      label: "Pilot Success Rate",
      description: "Proven methodology for enterprise adoption"
    }
  ];

  const principleCards = [
    {
      icon: Eye,
      title: "Operator-First Perspective",
      description: "20+ years in Fortune 500 boardrooms provides unmatched insight into enterprise buyer psychology and procurement realities."
    },
    {
      icon: Shield,
      title: "Proof-Driven Investing",
      description: "Every investment decision backed by validated buyer demand, not market assumptions or technology promises."
    },
    {
      icon: Target,
      title: "Pilot-to-Purchase Focus",
      description: "Systematic approach to converting enterprise pilots into revenue, eliminating the 'pilot purgatory' trap."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="arena-section-lg bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="arena-badge">
                <Users className="w-4 h-4 mr-2" />
                Team
              </div>

              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                <span className="arena-gradient-text">Operator turned VC.</span> Building Arena Fund to turn pilots into revenue.
              </h1>

              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                20+ years guiding Fortune 500 tech strategy. Now investing in founders who prove demand.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link href="/invest" className="arena-btn-primary">
                <Briefcase className="w-5 h-5 mr-2 flex-shrink-0" />
                Partner with Us
              </Link>
              <Link href="/about" className="arena-btn-secondary">
                <Building2 className="w-5 h-5 mr-2 flex-shrink-0" />
                About Arena Fund
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Operator Stats */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Operator <span className="arena-gradient-text">Experience</span></h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                From Accenture and NTT to AI startups and Fortune 500 boardrooms - bridging founders and enterprise buyers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {operatorStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="arena-metric-value text-4xl md:text-5xl">{stat.metric}</div>
                  <div className="arena-metric-label mb-2">{stat.label}</div>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Profile */}
      <section className="arena-section bg-arena-foggy-pith">
        <div className="arena-container">
          <div className="space-y-16">
            {/* Main Profile */}
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Profile Image & Basic Info */}
                <div className="lg:col-span-1">
                  <div className="space-y-6">
                    {/* Professional Portrait */}
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-arena-gold-light">
                      <Image 
                        src="/team/mani-swaminathan.JPG" 
                        alt="Mani Swaminathan, Founder & Managing Partner of Arena Fund"
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                        priority
                      />
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h3 className="arena-subtitle text-arena-navy">{founderProfile.name}</h3>
                      <p className="text-arena-gold font-medium">{founderProfile.title}</p>
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {founderProfile.location}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-200">
                      <a 
                        href={founderProfile.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-arena-gold hover:text-arena-gold-dark transition-colors"
                        aria-label="LinkedIn Profile"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                      <a 
                        href={founderProfile.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-arena-gold hover:text-arena-gold-dark transition-colors"
                        aria-label="X (Twitter) Profile"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                      </a>
                      <a 
                        href={`mailto:${founderProfile.email}`} 
                        className="text-arena-gold hover:text-arena-gold-dark transition-colors"
                        aria-label="Email"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bio & Details */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Tagline */}
                  <div className="space-y-4">
                    <p className="arena-body-xl text-gray-700 leading-relaxed">
                      {founderProfile.tagline}
                    </p>
                  </div>

                  {/* Main Bio */}
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      {founderProfile.bio.paragraph1}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      {founderProfile.bio.paragraph2}
                    </p>
                  </div>

                  {/* Pull Quote */}
                  <div className="bg-white p-6 rounded-xl border-l-4 border-arena-gold">
                    <div className="flex items-start space-x-3">
                      <Quote className="w-6 h-6 text-arena-gold flex-shrink-0 mt-1" />
                      <p className="text-lg font-medium text-arena-navy italic">
                        {founderProfile.pullQuote}
                      </p>
                    </div>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Expertise */}
                    <div>
                      <h4 className="font-semibold text-arena-navy mb-3">Expertise</h4>
                      <div className="space-y-2">
                        {founderProfile.expertise.map((skill, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-arena-gold flex-shrink-0" />
                            <span className="text-sm text-gray-700">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Background */}
                    <div>
                      <h4 className="font-semibold text-arena-navy mb-3">Background</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-arena-gold flex-shrink-0" />
                          <span className="text-sm text-gray-700">{founderProfile.education}</span>
                        </div>
                        {founderProfile.memberships.map((membership, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-arena-gold flex-shrink-0" />
                            <span className="text-sm text-gray-700">{membership}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operating Principles */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Operating <span className="arena-gradient-text">Principles</span></h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Based in San Francisco's Arena district - the epicenter of AI - Arena Fund operates on principles forged from 20+ years in Fortune 500 boardrooms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {principleCards.map((principle, index) => (
                <div key={index} className="arena-card p-8 text-center">
                  <div className="space-y-6">
                    <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                      <principle.icon className="w-8 h-8 text-arena-gold" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="arena-subtitle text-arena-navy">{principle.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{principle.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Connect with Mani */}
      <section className="arena-section bg-arena-navy text-white">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto bg-arena-gold-light rounded-full flex items-center justify-center">
                <ArrowRight className="w-8 h-8 text-arena-gold" />
              </div>
              <h2 className="arena-headline text-white">Connect with Mani</h2>
              <p className="arena-body-xl text-gray-300 max-w-3xl mx-auto">
                Building Arena Fund on one principle: proof before promises. If you're a founder who's ready to prove demand or an LP interested in buyer-validated venture capital, let's connect.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <a 
                href={`mailto:${founderProfile.email}`}
                className="arena-btn-primary-on-dark"
              >
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                Email Mani
              </a>
              <Link href="/invest" className="arena-btn-secondary-on-dark">
                <Briefcase className="w-5 h-5 mr-2 flex-shrink-0" />
                Partner with Arena
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}