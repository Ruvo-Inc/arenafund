'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareDropdown from '@/components/ui/ShareDropdown';
import {
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  BarChart3,
  Users,
  Building2,
  Lightbulb,
  FileText
} from 'lucide-react';

export default function ProofBeforePromisesPage() {
  const articleMeta = {
    title: "Proof Before Promises: Why 95% of AI Pilots Fail - and How Founders and LPs Can Change the Odds",
    publishDate: "August 15, 2025",
    readTime: "12 min read",
    category: "Market Analysis",
    author: "Arena Fund Research Team"
  };

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
  const articleDescription = "In a market where most enterprise AI initiatives stall, understanding the anatomy of failure is the first step toward building proof that buyers can't ignore.";

  const keyStats = [
    { stat: "95%", label: "AI pilots fail to create measurable impact", source: "MIT Research" },
    { stat: "75%", label: "Companies can't scale AI initiatives", source: "BCG Study" },
    { stat: "42%", label: "Enterprises scrapped AI projects in 2025", source: "S&P Global" },
    { stat: "5%", label: "Pilots that successfully cross into adoption", source: "Industry Analysis" }
  ];

  const failureArchetypes = [
    {
      title: "The Orphan Pilot",
      description: "Championed by an innovation lab but ignored by executives. No senior sponsor, no budget, no chance.",
      founderAdvice: "If your buyer can't sign a budget, you don't have a customer.",
      lpAdvice: "Ask: 'Who loses political capital if this fails?' If the answer is 'no one,' the pilot is an orphan.",
      icon: Users
    },
    {
      title: "The Invisible Business Case",
      description: "Exciting tech, but no ROI defined. Without measurable outcomes, procurement cannot justify adoption.",
      founderAdvice: "Tie ROI to business metrics before kickoff.",
      lpAdvice: "Fund teams who speak in customer economics, not just algorithms.",
      icon: BarChart3
    },
    {
      title: "The Sandbox Trap",
      description: "The model works in testing but collapses against enterprise systems. IT balks, compliance blocks, security delays.",
      founderAdvice: "Integration isn't Phase Two — it's Day One.",
      lpAdvice: "Look for startups obsessed with deployment, not just accuracy.",
      icon: Building2
    },
    {
      title: "The Vanity Pilot",
      description: "Pilots chosen for headlines, not value: chatbots for PR, 'AI co-pilots' with no clear payback. They make noise, then vanish.",
      founderAdvice: "Be ruthless. Chase painkillers, not vitamins.",
      lpAdvice: "Back teams tackling unglamorous but undeniable ROI.",
      icon: TrendingUp
    }
  ];

  const successPatterns = [
    {
      title: "The Renewal Metric Pilot",
      description: "A healthcare startup didn't sell its algorithm. It sold faster triage time - a metric the hospital already used in renewal contracts. Within weeks, numbers improved. Procurement didn't need persuasion; the proof was on their dashboard."
    },
    {
      title: "The Political Capital Anchor",
      description: "A fintech pilot lived because the CIO staked her reputation on it. When results came in, she walked it into the budget cycle herself."
    },
    {
      title: "The Friction-First Test",
      description: "An enterprise SaaS founder invited procurement and security teams into the pilot design. By month two, compliance was signed off and integration mapped. Scaling wasn't a battle; it was the natural next step."
    },
    {
      title: "The Pain Line",
      description: "An insurance pilot quantified the cost of inaction: $2M per month in manual claims. The enterprise didn't need innovation - it needed the bleeding to stop."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Article Header */}
      <section className="arena-section bg-gradient-to-br from-white via-arena-cream to-white arena-subtle-pattern">
        <div className="arena-container">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="mb-8">
              <Link href="/insights" className="inline-flex items-center text-arena-gold hover:text-arena-gold-dark font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Insights
              </Link>
            </div>

            {/* Article Meta */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 text-sm">
                <span className="px-3 py-1 bg-arena-gold-light text-arena-navy rounded-full font-medium">
                  {articleMeta.category}
                </span>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{articleMeta.publishDate}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{articleMeta.readTime}</span>
                </div>
              </div>

              <h1 className="arena-display text-arena-navy leading-tight">
                Proof Before Promises: Why 95% of AI Pilots Fail — and How Founders and LPs Can Change the Odds
              </h1>

              <p className="arena-body-xl text-gray-600">
                In a market where most enterprise AI initiatives stall, understanding the anatomy of failure 
                is the first step toward building proof that buyers can't ignore.
              </p>

              {/* Share Actions */}
              <div className="flex items-center space-x-4 pt-4">
                <ShareDropdown 
                  title={articleMeta.title}
                  url={articleUrl}
                  description={articleDescription}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="arena-section bg-white">
        <div className="arena-container">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              
              {/* The Mirage of Progress */}
              <div className="space-y-6 mb-12">
                <h2 className="arena-subtitle text-arena-navy">The Mirage of Progress</h2>
                <p className="text-gray-700 leading-relaxed">
                  It always starts the same way: a Fortune 500 boardroom, an ambitious AI startup, and a dazzling demo. 
                  Executives nod. A pilot is approved.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Three months later, nothing has changed. The model never made it past a test group. Procurement lost interest. 
                  ROI was never measured. The startup is left chasing "just one more meeting."
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Multiply that story by a thousand and you see the truth: <strong>95% of enterprise AI pilots fail to create measurable impact.</strong>
                </p>
              </div>

              {/* Key Statistics */}
              <div className="bg-arena-foggy-pith rounded-2xl p-8 mb-12">
                <h3 className="arena-subtitle text-arena-navy mb-6 text-center">The Scale of the Problem</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {keyStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="arena-metric-value text-4xl">{stat.stat}</div>
                      <div className="arena-metric-label mb-1">{stat.label}</div>
                      <p className="text-xs text-gray-500">Source: {stat.source}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-gray-600 italic">
                    Founders call this pilot purgatory. LPs call it capital erosion. Enterprises write it off as innovation theater.
                  </p>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                <p className="text-gray-700 leading-relaxed">
                  Here's the real twist: pilots don't fail because the technology is weak. They fail because they were never designed to succeed.
                </p>
              </div>

              {/* The Anatomy of Failure */}
              <div className="space-y-8 mb-12">
                <h2 className="arena-subtitle text-arena-navy">The Anatomy of Failure</h2>
                <p className="text-gray-700 leading-relaxed">
                  If most pilots stall, it's not by chance. They fall into recognizable traps - the Four Archetypes of Failure:
                </p>

                <div className="space-y-8">
                  {failureArchetypes.map((archetype, index) => {
                    const Icon = archetype.icon;
                    return (
                      <div key={index} className="arena-card p-8">
                        <div className="flex items-start space-x-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-arena-foggy-pith rounded-full flex items-center justify-center">
                              <Icon className="w-6 h-6 text-arena-bright-umber" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-4">
                            <h3 className="font-semibold text-arena-navy text-xl">{index + 1}. {archetype.title}</h3>
                            <p className="text-gray-700">{archetype.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-arena-abilene-lace p-4 rounded-lg">
                                <h4 className="font-semibold text-arena-night-brown mb-2">For Founders:</h4>
                                <p className="text-arena-hunter-green text-sm">{archetype.founderAdvice}</p>
                              </div>
                              <div className="bg-arena-sunrise p-4 rounded-lg">
                                <h4 className="font-semibold text-arena-night-brown mb-2">For LPs:</h4>
                                <p className="text-arena-hunter-green text-sm">{archetype.lpAdvice}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-arena-cream p-6 rounded-lg border-l-4 border-arena-gold">
                  <p className="text-arena-navy font-medium">
                    The common thread? Each archetype is a promise without proof.
                  </p>
                </div>
              </div>

              {/* What Success Really Looks Like */}
              <div className="space-y-8 mb-12">
                <h2 className="arena-subtitle text-arena-navy">What Success Really Looks Like</h2>
                <p className="text-gray-700 leading-relaxed">
                  When pilots succeed, they don't look glamorous. They look disciplined, anchored, and unignorable. 
                  Across dozens of founder–enterprise interactions, four patterns repeat - the DNA of the rare 5% that scale.
                </p>

                <div className="space-y-6">
                  {successPatterns.map((pattern, index) => (
                    <div key={index} className="arena-card p-6 border-l-4 border-arena-hunter-green">
                      <h3 className="font-semibold text-arena-navy mb-3">{index + 1}. {pattern.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{pattern.description}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-arena-sunrise p-6 rounded-lg">
                  <p className="text-arena-night-brown font-medium">
                    The throughline: Proof is never abstract. It's renewal metrics, political stakes, friction resolved, and undeniable pain.
                  </p>
                </div>
              </div>

              {/* Proof Before Promises */}
              <div className="space-y-6 mb-12">
                <h2 className="arena-subtitle text-arena-navy">Proof Before Promises</h2>
                <p className="text-gray-700 leading-relaxed">
                  The insight isn't that venture has been wrong. It's that AI forces truth faster than stories can hide it.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  In enterprise AI, you can't sell on vision for long. A pilot either demonstrates measurable value in weeks - or it doesn't.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  For founders, survival means structuring proof early. The companies that break out aren't the ones with the boldest slides; 
                  they're the ones with evidence buyers can't ignore.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  For LPs, diligence means asking the only question that matters: where is there already proof of buyer demand?
                </p>
                <p className="text-gray-700 leading-relaxed">
                  That's why we say: <strong>Proof before promises.</strong>
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Not as a slogan, but as a discipline. The line between theater and traction, between speculation and conviction.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Because the future won't reward those who tell the best story. It will reward those who deliver the clearest proof.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="arena-section bg-arena-navy text-white">
        <div className="arena-container">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <h2 className="arena-headline text-white">Ready to Build Proof, Not Promises?</h2>
              <p className="arena-body-xl text-gray-300 max-w-3xl mx-auto">
                Arena Fund helps founders validate Fortune 500 buyer demand before investment. 
                Join the 5% that scale with evidence, not hope.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl bg-arena-gold text-arena-navy hover:bg-arena-gold-dark transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <FileText className="w-5 h-5 mr-2" />
                Apply for Funding
              </Link>
              <Link href="/insights" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl border-2 border-arena-gold text-arena-gold hover:bg-arena-gold hover:text-arena-navy transition-all duration-300">
                <Lightbulb className="w-5 h-5 mr-2" />
                More Insights
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}