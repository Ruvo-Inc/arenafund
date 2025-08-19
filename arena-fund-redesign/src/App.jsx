import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button.jsx'
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Globe, 
  TrendingUp, 
  Shield, 
  Zap,
  Target,
  Brain,
  Sparkles,
  ChevronDown,
  Play
} from 'lucide-react'
import './App.css'

function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  const opacity = useTransform(scrollY, [0, 200], [1, 0])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                ARENA FUND
              </span>
            </motion.div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#process" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Process</a>
              <a href="#portfolio" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Portfolio</a>
              <a href="#investors" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Investors</a>
              <a href="#founders" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Founders</a>
            </div>
            
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6">
              Get Access
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background Elements */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
        />
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-full mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">B2B AI • Operator-Led • Buyer-Validated</span>
            </div>
          </motion.div>

          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Hear the buyer
            </span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              before you wire.
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Curated B2B AI. Tiny slate. Heavy conviction. We validate with Fortune 500 buyers, 
            then invest through SPVs and Reg CF, and help convert pilots to POs.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold group"
            >
              See Current Raise
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-slate-300 hover:border-slate-400 px-8 py-4 text-lg font-semibold group"
            >
              <Play className="mr-2 w-5 h-5" />
              How We Invest
            </Button>
          </motion.div>

          {/* Key Metrics */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { title: "B2B AI", subtitle: "Applied, revenue-proximate", icon: Brain },
              { title: "SPVs + Reg CF", subtitle: "Deal by deal access", icon: Target },
              { title: "GTM", subtitle: "Enterprise buyer access", icon: Sparkles }
            ].map((metric, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/50 hover:bg-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <metric.icon className="w-8 h-8 text-blue-600 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-bold text-slate-900 mb-2">{metric.title}</div>
                <div className="text-sm text-slate-600">{metric.subtitle}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-slate-400" />
          </motion.div>
        </div>
      </section>

      {/* Operator Advantage Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Operator Advantage
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              We bring enterprise buyer access and post-investment GTM support that converts pilots to purchase orders.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Sourcing with Intent",
                description: "B2B AI in workflows, data, security, and infra. No spray and pray. We track signals that predict enterprise pull.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Shield,
                title: "Buyer Validation",
                description: "We run structured buyer calls. Budget reality. Integration path. Security posture. Pilot scope. Reference path.",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Users,
                title: "Post-Invest GTM",
                description: "Introductions, pilot design, procurement prep, SOC2 plan, early sales ops. The goal is purchase orders.",
                color: "from-purple-500 to-pink-500"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 h-full hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border border-white/10">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              How We Invest
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Our disciplined approach ensures every investment is buyer-validated before we commit capital.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              { step: "01", title: "Select", description: "We pick a tiny slate per cycle. We optimize for quality of signal, not deal count." },
              { step: "02", title: "Validate", description: "Controlled buyer calls with decision makers. We test need, timing, and constraints." },
              { step: "03", title: "Invest", description: "We invest through 506c SPVs for accredited investors, and coordinate Reg CF when fit is strong." },
              { step: "04", title: "Help Sell", description: "We align on a 90-day GTM plan. We measure intro quality, pilot design, and conversion to PO." }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <div className="absolute -top-4 left-8 w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 mt-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-slate-300 hover:border-slate-400 px-8 py-4 text-lg font-semibold group"
            >
              Read the Full Process
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              What Good Looks Like
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Real buyer validation leads to real enterprise deals.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Data Quality for AI Apps",
                points: [
                  "Buyer: top 10 bank, model governance",
                  "Pilot scope, P0 issues, success metrics set day 1",
                  "Security review cleared with standard controls"
                ]
              },
              {
                title: "Agentic Support for B2B Tools",
                points: [
                  "Buyer: global SaaS, support lead time cut",
                  "Integration via API and SSO, under 2 weeks",
                  "PO issued after 2 pilots, vendor added"
                ]
              },
              {
                title: "Secure LLM Infrastructure",
                points: [
                  "Buyer: Fortune 100, data residency enforced",
                  "Policy guardrails mapped to spend tiers",
                  "Champion secured, enterprise plan locked"
                ]
              }
            ].map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">{story.title}</h3>
                  <div className="space-y-4">
                    {story.points.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-600 text-sm leading-relaxed">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.3),transparent_50%)]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Join the Next Allocation
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Create an account to request access. We review requests quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold group"
              >
                Get Access
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/30 hover:border-white/50 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              >
                For Investors
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default App

