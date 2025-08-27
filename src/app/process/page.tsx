'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  Search,
  Users,
  CheckCircle,
  Rocket,
  BarChart3,
  FileCheck,
  TrendingUp,
  Shield,
  Scale,
  FileText,
  Target,
  Handshake,
  Zap,
  Award,
  X
} from 'lucide-react'

export default function ProcessPage() {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})
  const [activeStage, setActiveStage] = useState(0)
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)
  const [userInteracted, setUserInteracted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement
            const animateKey = target.dataset.animate
            if (animateKey) {
              setIsVisible(prev => ({
                ...prev,
                [animateKey]: true
              }))
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Separate effect for stage observation to prevent infinite loops
  useEffect(() => {
    const stageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stageIndex = parseInt(entry.target.getAttribute('data-stage-index') || '0')
            // Only set active stage if user hasn't interacted yet
            if (!userInteracted && activeStage === 0) {
              setActiveStage(stageIndex)
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    // Observe only desktop stage elements (not mobile)
    document.querySelectorAll('.desktop-timeline [data-stage-index]').forEach((el) => {
      stageObserver.observe(el)
    })

    return () => {
      stageObserver.disconnect()
    }
  }, [activeStage, userInteracted])

  const processStages = [
    {
      number: "01",
      title: "Screen",
      description: "Identify high-potential B2B AI in Enterprise, Healthcare, Fintech, Hi-Tech",
      icon: Search,
      details: "We focus on AI startups targeting Fortune 500 enterprises with clear ROI potential"
    },
    {
      number: "02", 
      title: "Assess",
      description: "Evaluate founder expertise, vision, and readiness",
      icon: Users,
      details: "Deep dive into team capabilities, market understanding, and execution track record"
    },
    {
      number: "03",
      title: "Validate", 
      description: "Engage Fortune 500 buyers for feedback and demand proof",
      icon: Target,
      details: "Direct buyer interviews and demand validation through our enterprise network"
    },
    {
      number: "04",
      title: "Pilot",
      description: "Orchestrate enterprise pilots with success metrics",
      icon: Rocket,
      details: "Structured pilot programs with clear success criteria and conversion pathways"
    },
    {
      number: "05",
      title: "Review",
      description: "IC rigor with pilot data & buyer validation",
      icon: BarChart3,
      details: "Investment committee review with validated demand data and pilot results"
    },
    {
      number: "06",
      title: "Close",
      description: "Founder-friendly terms, KYC/AML, Reg D/CF/A+ compliance",
      icon: FileCheck,
      details: "Transparent terms with full regulatory compliance and streamlined closing"
    },
    {
      number: "07",
      title: "Accelerate",
      description: "Post-investment revenue growth via our corporate network",
      icon: TrendingUp,
      details: "Ongoing enterprise sales support and network introductions for scale"
    }
  ]

  const founderBenefits = [
    "Early enterprise validation + customers",
    "Hands-on pilot and sales support", 
    "Clear, transparent term sheets"
  ]

  const investorBenefits = [
    "Systematic risk reduction",
    "90% pilot-to-purchase conversion",
    "Full compliance + disciplined governance"
  ]

  const complianceFeatures = [
    {
      icon: Shield,
      title: "KYC & AML Verified",
      description: "Full know-your-customer and anti-money laundering compliance"
    },
    {
      icon: Scale,
      title: "Reg D / CF / A+ Compliant", 
      description: "Securities regulations compliance across all offering types"
    },
    {
      icon: FileText,
      title: "Transparent LP Reporting",
      description: "Regular, detailed reporting to all limited partners"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="arena-section bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container px-6">
          <div 
            data-animate="hero"
            className={`text-center space-y-8 transition-all duration-1000 ${isVisible['hero'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="space-y-6">
              <h1 className="arena-display text-arena-navy max-w-4xl mx-auto">
                We Validate <span className="arena-gradient-text">Fortune 500 Demand</span> - Before We Invest
              </h1>
              
              <p className="arena-body-xl text-gray-600 max-w-4xl mx-auto">
                Arena Fund is the world&#39;s first venture fund for B2B AI startups that secures real enterprise demand 
                through Fortune 500 pilots before committing capital. With a 90% pilot-to-purchase conversion rate, 
                founders scale faster and LPs invest with proven traction.
              </p>
            </div>
          </div>
        </div>
      </section> 
     {/* Process Timeline */}
      <section className="arena-section-lg bg-white">
        <div className="arena-container px-6">
          <div 
            data-animate="process"
            className={`space-y-12 transition-all duration-1000 ${isVisible['process'] ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 translate-y-8'}`}
          >
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Our 7-Stage Buyer-Validated Model</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                A systematic approach that validates enterprise demand before investment, 
                reducing risk and accelerating growth for both founders and investors.
              </p>
            </div>

            {/* Desktop Timeline */}
            <div className="hidden lg:block desktop-timeline">
              <div className="relative">
                {/* Road-like Timeline */}
                <div className="absolute top-12 left-0 right-0 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-arena-gold to-arena-gold-dark transition-all duration-1000 rounded-full"
                    style={{ width: `${((activeStage) / 6) * 100}%` }}
                  />
                  {/* Road markings */}
                  <div className="absolute inset-0 flex justify-between items-center px-4">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="w-1 h-1 bg-arena-navy rounded-full"></div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-4 relative z-10">
                  {processStages.map((stage, index) => {
                    const Icon = stage.icon
                    const isActive = activeStage === index
                    const isHovered = hoveredStage === index
                    
                    return (
                      <div 
                        key={index} 
                        data-stage-index={index}
                        className="text-center relative"
                        onMouseEnter={() => setHoveredStage(index)}
                        onMouseLeave={() => setHoveredStage(null)}
                        onClick={() => {
                          setUserInteracted(true)
                          setActiveStage(index)
                        }}
                      >
                        <div 
                          className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 transition-all duration-500 transform ${
                            isActive || isHovered
                              ? 'bg-gradient-to-br from-arena-gold to-arena-gold-dark text-arena-navy shadow-arena-gold scale-110' 
                              : 'bg-gray-100 text-gray-400'
                          } ${isActive ? 'ring-4 ring-arena-gold ring-opacity-50' : ''}`}
                        >
                          <Icon className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <div className={`text-xs font-bold ${isActive || isHovered ? 'text-arena-gold' : 'text-gray-400'}`}>
                            {stage.number}
                          </div>
                          <h3 className={`font-semibold text-sm ${isActive || isHovered ? 'text-arena-navy' : 'text-gray-500'}`}>
                            {stage.title}
                          </h3>
                        </div>
                        
                        {/* Hover/Active Details Card - Only show if this is the active/hovered stage and no other stage is hovered */}
                        {((isActive && hoveredStage === null) || isHovered) && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-56 bg-white rounded-xl shadow-lg p-3 border border-gray-100 z-20 transition-all duration-300">
                            <div className="text-left space-y-1">
                              <p className="text-gray-600 text-xs">{stage.description}</p>
                              <p className="text-arena-gold text-xs font-medium">{stage.details}</p>
                            </div>
                            <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45"></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3">
              {processStages.map((stage, index) => {
                const Icon = stage.icon
                const isActive = activeStage === index
                return (
                  <div 
                    key={index} 
                    data-stage-index={index}
                    className={`arena-card p-5 transition-all duration-300 ${isActive ? 'ring-2 ring-arena-gold' : ''}`}
                    onClick={() => {
                      setUserInteracted(true)
                      setActiveStage(index)
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-arena-gold to-arena-gold-dark text-arena-navy shadow-arena-gold scale-110' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs font-bold ${isActive ? 'text-arena-gold' : 'text-gray-400'}`}>{stage.number}</span>
                          <h3 className={`font-semibold text-sm ${isActive ? 'text-arena-navy' : 'text-gray-500'}`}>{stage.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm">{stage.description}</p>
                        <p className="text-xs text-arena-gold">{stage.details}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Who Benefits */}
      <section className="arena-section-lg bg-gray-50">
        <div className="arena-container px-6">
          <div 
            data-animate="benefits"
            className={`space-y-12 transition-all duration-1000 ${isVisible['benefits'] ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-8'}`}
          >
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Built for Founders. Built for Investors.</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Our dual-sided approach creates value for both entrepreneurs and capital partners 
                through systematic risk reduction and proven demand validation.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* For Founders */}
              <div className="arena-card-premium p-8">
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-arena-gold to-arena-gold-dark flex items-center justify-center">
                    <Rocket className="w-8 h-8 text-arena-navy" />
                  </div>
                  <h3 className="arena-subtitle text-arena-navy text-center">For Founders</h3>
                  <ul className="space-y-2 text-left ml-4">
                    {founderBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-arena-gold flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* For Investors */}
              <div className="arena-card-premium p-8">
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-arena-navy to-arena-navy-light flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-arena-gold" />
                  </div>
                  <h3 className="arena-subtitle text-arena-navy text-center">For Investors</h3>
                  <ul className="space-y-2 text-left ml-4">
                    {investorBenefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-arena-gold flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Arena Fund vs Traditional VC */}
      <section className="arena-section-lg bg-white">
        <div className="arena-container px-6">
          <div 
            data-animate="comparison"
            className={`space-y-12 transition-all duration-1000 ${isVisible['comparison'] ? 'opacity-100 translate-y-0 delay-400' : 'opacity-0 translate-y-8'}`}
          >
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-arena-navy">Why We&#39;re Different</h2>
              <p className="arena-body-xl text-gray-600 max-w-3xl mx-auto">
                Arena Fund vs. Traditional VC - a systematic approach that validates demand before investment.
              </p>
            </div>

            <div className="arena-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Arena Fund */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-arena-gold to-arena-gold-dark flex items-center justify-center mb-4">
                      <Award className="w-8 h-8 text-arena-navy" />
                    </div>
                    <h3 className="arena-subtitle text-arena-gold text-center">Arena Fund</h3>
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-arena-gold mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Customer demand before capital</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-arena-gold mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Pilots with 90% conversion rate</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-arena-gold mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">Revenue acceleration post-investment</span>
                    </li>
                  </ul>
                </div>

                {/* Traditional VC */}
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Handshake className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="arena-subtitle text-gray-500 text-center">Traditional VC</h3>
                  </div>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start space-x-3">
                      <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">Invests before market fit is proven</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">Traction assumed, not tested</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500">Limited hands-on sales support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Trust & Compliance */}
      <section className="arena-section-lg bg-arena-navy text-white">
        <div className="arena-container px-6">
          <div 
            data-animate="compliance"
            className={`space-y-12 transition-all duration-1000 ${isVisible['compliance'] ? 'opacity-100 translate-y-0 delay-500' : 'opacity-0 translate-y-8'}`}
          >
            <div className="text-center space-y-6">
              <h2 className="arena-headline text-white">Compliance You Can Count On</h2>
              <p className="arena-body-xl text-gray-300 max-w-3xl mx-auto">
                Full regulatory compliance and transparent governance across all investment activities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {complianceFeatures.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="text-center space-y-5">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-arena-gold to-arena-gold-dark flex items-center justify-center">
                      <Icon className="w-8 h-8 text-arena-navy" />
                    </div>
                    <h3 className="font-semibold text-arena-gold">{feature.title}</h3>
                    <p className="text-gray-300 text-sm">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="arena-section-xl bg-gradient-to-br from-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container px-6">
          <div 
            data-animate="cta"
            className={`text-center space-y-12 transition-all duration-1000 ${isVisible['cta'] ? 'opacity-100 translate-y-0 delay-600' : 'opacity-0 translate-y-8'}`}
          >
            <div className="space-y-8">
              <h2 className="arena-display text-arena-navy max-w-3xl mx-auto">
                AI with <span className="arena-gradient-text">Soul</span>. Structure in Place.
              </h2>
              <p className="arena-body-xl text-gray-600 max-w-4xl mx-auto">
                Our disciplined, buyer-validated process transforms AI innovation into proven enterprise solutions. 
                Founders gain traction. Investors gain confidence. Together, we accelerate technology that matters.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
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

      <Footer />
    </div>
  );
}