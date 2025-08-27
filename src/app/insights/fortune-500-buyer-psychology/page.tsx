'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ShareDropdown from '@/components/ui/ShareDropdown';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  BarChart3,
  Shield,
  Lightbulb,
  FileText,
  Quote
} from 'lucide-react';

export default function Fortune500BuyerPsychologyPage() {
  const articleMeta = {
    title: "Fortune 500 Buyer Psychology: What Really Drives Enterprise AI Adoption",
    publishDate: "August 22, 2025",
    readTime: "15 min read",
    category: "Buyer Research",
    author: "Arena Fund Research Team"
  };

  const articleUrl = '';
  const articleDescription = "Enterprise AI adoption is not decided in a demo. It is decided in a room. Understanding the consensus table psychology is the key to scaling beyond pilot purgatory.";

  const hiddenLedgerLaws = [
    {
      law: "No Mobilizer, No Deal",
      rule: "If no one's reputation is on the line, the deal is already dead.",
      icon: Users
    },
    {
      law: "If It's Not a Renewal KPI, It's Theater",
      rule: "If the KPI isn't already on the renewal dashboard, adoption will never happen.",
      icon: BarChart3
    },
    {
      law: "Friction Deferred Becomes a Veto",
      rule: "Friction ignored is adoption denied.",
      icon: Shield
    },
    {
      law: "No Pain Line, No Momentum",
      rule: "If doing nothing doesn't hurt, adoption won't happen.",
      icon: AlertTriangle
    }
  ];

  const consensusStakeholders = [
    { role: "Legal", concern: "Where does liability fall if the model is wrong?" },
    { role: "IT", concern: "This breaks three legacy systems before it delivers one result." },
    { role: "Finance", concern: "Show me payback in twelve months or less." },
    { role: "Risk & Compliance", concern: "Who signs off when the algorithm drifts?" },
    { role: "Line of Business", concern: "My team is drowning already. Why should we carry another pilot?" }
  ];

  const founderLaws = [
    "Find the Mobilizer or Walk Away",
    "Design for Renewal KPIs, Not Vanity Metrics", 
    "Weaponize Friction Early",
    "Always Quantify the Pain Line"
  ];

  const lpLaws = [
    "Demand the Mobilizer",
    "Inspect the KPI",
    "Probe the Friction",
    "Verify the Pain Line"
  ];

  const futureLaws = [
    {
      title: "Political Capital Will Tighten",
      description: "Capital will follow the executives who put their reputations on the line."
    },
    {
      title: "Renewal KPIs Will Rule Everything", 
      description: "The next AI winners will be measured in CFO dashboards, not demo reels."
    },
    {
      title: "Friction Will Become the First Gate",
      description: "The moat will be compliance passed early, not algorithms pitched late."
    },
    {
      title: "The Pain Line Will Get Sharper",
      description: "If doing nothing isn't more expensive by next quarter, the project won't live to see the next quarter."
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
                Fortune 500 Buyer Psychology: What Really Drives Enterprise AI Adoption
              </h1>

              <p className="arena-body-xl text-gray-600">
                Enterprise AI adoption is not decided in a demo. It is decided in a room. 
                Understanding the consensus table psychology is the key to scaling beyond pilot purgatory.
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
              
              {/* Part 1: Inside the Consensus Table */}
              <div className="space-y-6 mb-12">
                <h2 className="arena-subtitle text-arena-navy">Part 1. Inside the Consensus Table</h2>
                <p className="text-gray-700 leading-relaxed">
                  Enterprise AI adoption is not decided in a demo. It is decided in a room.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Around the table sit ten people, each with veto power:
                </p>
              </div>

              {/* Consensus Stakeholders */}
              <div className="bg-arena-foggy-pith rounded-2xl p-8 mb-12">
                <h3 className="arena-subtitle text-arena-navy mb-6 text-center">The Consensus Table</h3>
                <div className="space-y-4">
                  {consensusStakeholders.map((stakeholder, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-lg">
                      <div className="flex-shrink-0 w-12 h-12 bg-arena-gold-light rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-arena-gold" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-arena-navy">{stakeholder.role}:</h4>
                        <p className="text-gray-600 italic">"{stakeholder.concern}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6 mb-12">
                <p className="text-gray-700 leading-relaxed">
                  The founder pitching never hears most of this. They see polite nods, maybe cautious enthusiasm. 
                  But the real adoption battle begins after the door closes.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This is the consensus table - where technology performance is irrelevant, and psychology rules.
                </p>
                
                <div className="bg-arena-abilene-lace p-6 rounded-lg border-l-4 border-arena-hunter-green">
                  <p className="text-arena-hunter-green">
                    <strong>Gartner</strong> calls it consensus buying: six to ten stakeholders, each with their own fears, each capable of stopping momentum. 
                    <strong>McKinsey</strong> shows that even when pilots succeed technically, they fail to scale unless one executive is willing to spend political capital. 
                    And <strong>S&P Global</strong> reports that in 2025, 42% of enterprises scrapped their AI programs not because the models were weak, 
                    but because the consensus broke.
                  </p>
                </div>

                <div className="bg-arena-cream p-6 rounded-lg border-l-4 border-arena-gold">
                  <p className="text-arena-navy font-medium text-lg">
                    Here's the hard truth: Fortune 500 adoption is not a technology race. It's a psychology game.
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed">
                  At the consensus table, every stakeholder runs the same silent calculation:
                </p>
                <ul className="space-y-2 text-gray-700 ml-6">
                  <li>• Will this make me look visionary, or reckless?</li>
                  <li>• Will it shorten my path to budget renewal, or lengthen it?</li>
                  <li>• Will it neutralize risk, or create it?</li>
                  <li>• If I do nothing, what happens to me?</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Those questions - not accuracy metrics, not demos - decide whether a pilot scales or dies.
                </p>
              </div>

              {/* Part 2: The Hidden Ledger */}
              <div className="space-y-6 mb-12">
                <h2 className="arena-subtitle text-arena-navy">Part 2. The Hidden Ledger</h2>
                <p className="text-gray-700 leading-relaxed">
                  Every Fortune 500 buyer keeps two ledgers.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  One is visible: budgets, ROI models, vendor scorecards. That's the ledger founders see.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  The other is hidden. It never appears in RFPs or pitch decks, but it decides the deal. 
                  This ledger is written in political capital, renewal KPIs, risk reflexes, and the pain of doing nothing. 
                  If it doesn't balance, adoption stalls - no matter how good the demo was.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We call it <strong>The Hidden Ledger</strong>. These are its four laws:
                </p>
              </div>

              {/* Hidden Ledger Laws */}
              <div className="space-y-8 mb-12">
                {hiddenLedgerLaws.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="arena-card p-8 border-l-4 border-arena-gold">
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-arena-gold-light rounded-full flex items-center justify-center">
                            <Icon className="w-6 h-6 text-arena-gold" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-arena-navy text-xl mb-2">Law {index + 1}. {item.law}</h3>
                          <p className="text-gray-700 font-medium">Rule of the ledger: {item.rule}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* The Ledger Decides Everything */}
              <div className="bg-arena-navy text-white p-8 rounded-2xl mb-12">
                <h3 className="arena-subtitle text-white mb-6 text-center">The Ledger Decides Everything</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                  <div className="space-y-2">
                    <p className="text-arena-gold font-bold">No mobilizer → dead.</p>
                    <p className="text-arena-gold font-bold">No renewal KPI → theater.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-arena-gold font-bold">Friction ignored → veto.</p>
                    <p className="text-arena-gold font-bold">No pain line → no adoption.</p>
                  </div>
                </div>
                <p className="text-gray-300 text-center mt-6 italic">
                  This is the silent calculus running in every Fortune 500 consensus meeting. 
                  Miss it, and your pilot becomes another statistic. Align with it, and adoption accelerates.
                </p>
              </div>

              {/* Part 3: Implications for Founders */}
              <div className="space-y-6 mb-12">
                <h2 className="arena-subtitle text-arena-navy">Part 3. Implications for Founders</h2>
                <p className="text-gray-700 leading-relaxed">
                  Founders don't lose enterprise pilots because their technology is weak. 
                  They lose because they fail to balance the Hidden Ledger.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you are building for the Fortune 500, these are not suggestions. They are survival laws.
                </p>
              </div>

              <div className="bg-arena-abilene-lace rounded-2xl p-8 mb-12">
                <h3 className="arena-subtitle text-arena-navy mb-6 text-center">Founder Survival Laws</h3>
                <div className="space-y-6">
                  {founderLaws.map((law, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-arena-hunter-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-arena-night-brown">{law}</h4>
                        <p className="text-arena-hunter-green text-sm mt-1">
                          Law: {law === "Find the Mobilizer or Walk Away" && "No mobilizer, no meeting."}
                          {law === "Design for Renewal KPIs, Not Vanity Metrics" && "If the KPI isn't on the CFO's dashboard, it isn't real."}
                          {law === "Weaponize Friction Early" && "Friction ignored is adoption denied."}
                          {law === "Always Quantify the Pain Line" && "No pain line, no deal."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-arena-sunrise rounded-lg">
                  <p className="text-arena-night-brown font-bold text-center">
                    Founder law: Design every pilot to balance the Hidden Ledger. Anything else is theater.
                  </p>
                </div>
              </div>

              {/* Part 4: Implications for LPs */}
              <div className="space-y-6 mb-12">
                <h2 className="arena-subtitle text-arena-navy">Part 4. Implications for LPs</h2>
                <p className="text-gray-700 leading-relaxed">
                  Capital isn't lost because the technology was bad. It's lost because the startup never balanced the Hidden Ledger.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you are an LP, your diligence must cut past pitch decks and market maps. 
                  The only question is: has the buyer's psychology already aligned?
                </p>
              </div>

              <div className="bg-arena-sunrise rounded-2xl p-8 mb-12">
                <h3 className="arena-subtitle text-arena-navy mb-6 text-center">LP Diligence Laws</h3>
                <div className="space-y-6">
                  {lpLaws.map((law, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-arena-hunter-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-arena-night-brown">{law}</h4>
                        <p className="text-arena-hunter-green text-sm mt-1">
                          LP law: {law === "Demand the Mobilizer" && "No mobilizer, no money."}
                          {law === "Inspect the KPI" && "If the CFO doesn't care about the metric, you shouldn't either."}
                          {law === "Probe the Friction" && "If friction hasn't been confronted, capital is at risk."}
                          {law === "Verify the Pain Line" && "No pain line, no portfolio company."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-arena-abilene-lace rounded-lg">
                  <p className="text-arena-night-brown font-bold text-center">
                    LP law: Back only startups that balance the Hidden Ledger. Anything less is speculation disguised as venture.
                  </p>
                </div>
              </div>

              {/* Part 5: The Market Future */}
              <div className="space-y-6 mb-12">
                <h2 className="arena-subtitle text-arena-navy">Part 5. The Market Future</h2>
                <p className="text-gray-700 leading-relaxed">
                  The Hidden Ledger isn't a framework. It's the operating system of Fortune 500 adoption. 
                  And it will only grow more ruthless over the next decade.
                </p>
              </div>

              <div className="space-y-6 mb-12">
                {futureLaws.map((law, index) => (
                  <div key={index} className="arena-card p-6 border-l-4 border-arena-bright-umber">
                    <h4 className="font-bold text-arena-night-brown mb-2">{law.title}</h4>
                    <p className="text-arena-hunter-green">Future law: {law.description}</p>
                  </div>
                ))}
              </div>

              <div className="bg-arena-foggy-pith p-6 rounded-lg mb-12">
                <p className="text-gray-700 leading-relaxed">
                  The market will reward ruthless clarity. Startups that balance the Hidden Ledger will scale. 
                  LPs who fund them will protect and multiply capital. The rest will fade into the 95% of pilots that never mattered.
                </p>
              </div>

              {/* Closing Manifesto */}
              <div className="bg-arena-gold text-arena-navy p-8 rounded-2xl mb-12">
                <div className="flex items-start space-x-4 mb-6">
                  <Quote className="w-8 h-8 text-arena-navy flex-shrink-0 mt-1" />
                  <h2 className="arena-subtitle text-arena-navy">Closing Manifesto - Proof Before Promises</h2>
                </div>
                
                <div className="space-y-4 text-arena-navy">
                  <p className="leading-relaxed">
                    Enterprise AI doesn't stall because models are weak. It stalls because the Hidden Ledger isn't balanced.
                  </p>
                  <p className="leading-relaxed">
                    The consensus table doesn't care about your demo. It doesn't care about your roadmap. 
                    It doesn't care about your vision slide. It cares about four things: who risks political capital, 
                    which renewal KPI moves, whether friction is neutralized, and whether doing nothing hurts more than change.
                  </p>
                  <p className="leading-relaxed">
                    That is the psychology that governs adoption. That is the ledger every Fortune 500 buyer runs in silence.
                  </p>
                  <p className="leading-relaxed">
                    Founders who ignore it will waste years in pilot purgatory. LPs who ignore it will bleed capital into startups with no future. 
                    Enterprises that ignore it will spend fortunes chasing theater.
                  </p>
                  <p className="leading-relaxed">
                    The winners will not be the loudest storytellers. They will be the ones with proof - proof that balances the Hidden Ledger, 
                    proof that forces consensus to act.
                  </p>
                  <p className="leading-relaxed font-bold">
                    That is why our ethos is simple, and it is final:
                  </p>
                </div>
                
                <div className="text-center mt-8 p-6 bg-arena-navy text-arena-gold rounded-xl">
                  <p className="text-2xl font-bold">Proof before promises.</p>
                  <p className="mt-2">Not a tagline. Not a suggestion. A law.</p>
                </div>
                
                <p className="text-arena-navy leading-relaxed mt-6">
                  Because in enterprise AI, the future does not belong to those who pitch the best story. 
                  It belongs to those who deliver the clearest proof - the kind that no consensus table can deny.
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
              <h2 className="arena-headline text-white">Ready to Balance the Hidden Ledger?</h2>
              <p className="arena-body-xl text-gray-300 max-w-3xl mx-auto">
                Arena Fund helps founders understand Fortune 500 buyer psychology and validate demand before investment. 
                Join the companies that scale with proof, not promises.
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