// app/process/page.tsx
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Process | The Arena Fund",
  description:
    "Our end-to-end process for B2B AI investing: buyer validation, focused diligence, investment committee, compliant SPVs, and post-invest GTM to convert pilots to POs.",
  metadataBase: new URL("https://www.thearenafund.com"),
  alternates: { canonical: "/process" },
  openGraph: {
    type: "website",
    url: "https://www.thearenafund.com/process",
    title: "Process | The Arena Fund",
    description:
      "How we invest in B2B AI: talk to buyers first, do focused diligence, run a tight IC, then help convert pilots to POs.",
    images: [
      {
        url: "/og/arena-og.jpg",
        width: 1200,
        height: 630,
        alt: "The Arena Fund",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Process | The Arena Fund",
    description:
      "Buyer validation before we wire. Focused diligence. Clear IC. Compliant SPVs. Post-invest GTM support.",
    images: ["/og/arena-og.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function ProcessPage() {
  // JSON-LD: HowTo (our process), FAQPage, BreadcrumbList
  const jsonLdHowTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "The Arena Fund Investment Process",
    description:
      "End-to-end process for evaluating and supporting B2B AI startups, from buyer validation through post-investment GTM.",
    totalTime: "P21D",
    step: [
      {
        "@type": "HowToStep",
        name: "Sourcing and screen",
        text:
          "Source B2B AI startups through operator network, founder inbound, and targeted research. Screen for clear buyer, workflow, and data path.",
      },
      {
        "@type": "HowToStep",
        name: "Buyer validation",
        text:
          "Run calls with relevant budget owners and workflow leaders. Confirm urgency, integration path, security constraints, and value.",
      },
      {
        "@type": "HowToStep",
        name: "Focused diligence",
        text:
          "Validate GTM plan, sales motion, technical approach, security posture, pricing, and pilot design with success metrics.",
      },
      {
        "@type": "HowToStep",
        name: "Investment committee",
        text:
          "Document the case, risks, and plan. IC records the decision, check size, structure, and support plan.",
      },
      {
        "@type": "HowToStep",
        name: "Vehicle launch",
        text:
          "Launch a 506(c) SPV for accredited investors via an administrative provider. Where suitable, open a parallel Reg CF allocation with a qualified partner.",
      },
      {
        "@type": "HowToStep",
        name: "Post-invest GTM",
        text:
          "Support founders with buyer intros, pilot design, security and procurement, and sales operations to convert pilots to POs.",
      },
    ],
  };

  const jsonLdFAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What do you invest in?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "B2B AI with a clear buyer, near-term value, and a credible path to a production purchase order.",
        },
      },
      {
        "@type": "Question",
        name: "How long from intro to decision?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Typical range is two to four weeks when we can reach the right buyers and align on pilot success metrics.",
        },
      },
      {
        "@type": "Question",
        name: "Who can invest with you?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Accredited investors via 506(c) SPVs. For select deals we open a community allocation under Reg CF through a registered funding portal partner.",
        },
      },
      {
        "@type": "Question",
        name: "What are the fees?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "SPVs charge no management fee and 10% carry, plus a one-time admin fee and standard third-party costs. Reg CF allocations follow the portal’s posted terms.",
        },
      },
      {
        "@type": "Question",
        name: "How do you help after investing?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "We run a 90-day GTM plan, set pilot success metrics, prepare security and procurement, and bring operator intros that move to purchase.",
        },
      },
      {
        "@type": "Question",
        name: "What are the risks?",
        acceptedAnswer: {
          "@type": "Answer",
          text:
            "Private investments are illiquid and risky. You can lose all capital. Past results do not predict future outcomes.",
        },
      },
    ],
  };

  const jsonLdBreadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.thearenafund.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Process",
        item: "https://www.thearenafund.com/process",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* JSON-LD */}
        <Script
          id="ld-howto"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdHowTo) }}
        />
        <Script
          id="ld-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
        />
        <Script
          id="ld-breadcrumbs-proc"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
        />

        {/* Page header notice */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-xs text-blue-700">
            Information only. Not an offer. See{" "}
            <Link href="/disclosures" className="ml-1 underline hover:text-blue-900">
              disclosures
            </Link>
            .
          </div>
        </div>

        {/* Hero */}
        <section aria-labelledby="hero-heading" className="text-center">
          <h1 id="hero-heading" className="font-['Outfit'] text-4xl font-semibold tracking-tight md:text-6xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Hear the buyer before you wire
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 leading-relaxed">
            We talk to the budget owner first. Then we invest. Then we help convert pilots to POs.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/investors#current-raise"
              className="group w-full rounded-xl bg-gray-900 px-8 py-4 text-center text-white font-medium shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-200 sm:w-auto"
              data-analytics="process_hero_current"
            >
              See current raise
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
            <Link
              href="/account"
              className="w-full rounded-xl border-2 border-gray-200 px-8 py-4 text-center font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 sm:w-auto"
              data-analytics="process_hero_access"
            >
              Request access
            </Link>
          </div>
        </section>

        {/* Overview: six steps */}
        <section id="overview" aria-labelledby="overview-heading" className="mt-20">
          <h2 id="overview-heading" className="text-3xl font-bold text-gray-900 mb-8">
            The path from intro to PO
          </h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3 lg:grid-cols-3">
            <Step
              index={1}
              title="Sourcing and screen"
              body="Targeted B2B AI. Clear buyer, workflow fit, data path, and time-to-value."
            />
            <Step
              index={2}
              title="Buyer validation"
              body="Talk to budget owners and workflow leaders. Confirm urgency and path to production."
            />
            <Step
              index={3}
              title="Focused diligence"
              body="GTM plan, security posture, pricing, integration, and pilot design with success metrics."
            />
            <Step
              index={4}
              title="Investment committee"
              body="Write the case, decide structure and size, and record risks and plan."
            />
            <Step
              index={5}
              title="Vehicle launch"
              body="506(c) SPV for accredited investors via our admin provider. Parallel Reg CF where suitable."
            />
            <Step
              index={6}
              title="Post-invest GTM"
              body="90-day plan, buyer intros, security and procurement, sales ops cadence."
            />
          </ol>
        </section>

        {/* Buyer validation deep dive */}
        <section id="validation" aria-labelledby="validation-heading" className="mt-20">
          <h2 id="validation-heading" className="text-3xl font-bold text-gray-900 mb-8">Buyer validation</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Card
              title="Who we speak with"
              body="Budget owners and workflow leaders who feel the pain. Security, data, and operations where relevant."
            />
            <Card
              title="What we confirm"
              body="Urgency, value, data access, integration path, security requirements, and a credible path to a purchase order."
            />
            <Card
              title="What we produce"
              body="A short brief that captures buyer quotes, risks, and the pilot success criteria founders can use."
            />
            <Card
              title="Why it matters"
              body="Faster learning, higher signal, and better odds of moving from pilot to production."
            />
          </div>
        </section>

        {/* Diligence and IC */}
        <section id="diligence" aria-labelledby="diligence-heading" className="mt-20">
          <h2 id="diligence-heading" className="text-3xl font-bold text-gray-900 mb-8">Focused diligence and IC</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <List
              title="Focused diligence"
              items={[
                "Founding team and owner insight",
                "Technical approach and data posture",
                "Security, compliance, and procurement readiness",
                "GTM basics and pricing",
                "Pilot design and success metrics",
              ]}
            />
            <List
              title="Investment committee"
              items={[
                "Write the case and risks",
                "Record check size and structure",
                "Define post-invest support plan",
                "Track dissent and open questions",
                "Decision and timing",
              ]}
            />
            <List
              title="What founders receive"
              items={[
                "Structured buyer feedback",
                "Pilot and security checklist",
                "GTM suggestions tied to buyer language",
                "Clear yes or no",
              ]}
            />
          </div>
        </section>

        {/* Vehicles and compliance */}
        <section id="vehicles" aria-labelledby="vehicles-heading" className="mt-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-8 shadow-lg">
          <h2 id="vehicles-heading" className="text-3xl font-bold text-gray-900 mb-8">Vehicles and compliance</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Card
              title="506(c) SPV"
              body="Accredited investors join via a special purpose vehicle administered by our provider, Sydecar. No management fee. 10% carry. One-time admin fee and standard third-party costs."
            />
            <Card
              title="Community via Reg CF"
              body="For select deals we open an allocation on a registered funding portal partner. Terms, disclosures, and process follow the portal."
            />
            <Card
              title="Onboarding and custody"
              body="KYC and accreditation checks are required. Custody and escrow services are provided by qualified third parties engaged by the admin or portal."
            />
            <Card
              title="Security and wiring"
              body="Documents are executed electronically. Wiring over secure instructions only. We never share wires over chat or public channels."
            />
          </div>
          <div className="mt-6 rounded-xl bg-white/50 p-4">
            <p className="text-sm text-gray-600">
              All investments are subject to final documents. Allocations and terms vary by deal.
            </p>
          </div>
        </section>

        {/* Post-invest GTM support */}
        <section id="gtm" aria-labelledby="gtm-heading" className="mt-20">
          <h2 id="gtm-heading" className="text-3xl font-bold text-gray-900 mb-8">Post-invest GTM</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <Card
              title="90-day plan"
              body="Weekly cadence, forecast hygiene, and a simple dashboard for pilot conversion."
            />
            <Card
              title="Buyer intros"
              body="Operator intros with context. We brief both sides and align on success metrics."
            />
            <Card
              title="Security and procurement"
              body="Vendor security checklist, policy templates, and help with reviews to shorten cycles."
            />
          </div>
          <div className="mt-8">
            <Link href="/founders" className="inline-flex items-center rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
              How we work with founders
              <span className="ml-2">→</span>
            </Link>
          </div>
        </section>

        {/* Timeline */}
        <section id="timeline" aria-labelledby="timeline-heading" className="mt-20">
          <h2 id="timeline-heading" className="text-3xl font-bold text-gray-900 mb-8">Typical timeline</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            <TimelineItem title="Week 0" body="Intro and screen. Data room request." />
            <TimelineItem title="Week 1" body="Buyer calls. Draft pilot criteria." />
            <TimelineItem title="Week 2" body="Focused diligence. IC write-up." />
            <TimelineItem title="Week 3" body="IC decision. SPV launch or pass." />
          </div>
          <div className="mt-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              Timelines vary by access to buyers and complexity of security and integration.
            </p>
          </div>
        </section>

        {/* What we look for */}
        <section id="criteria" aria-labelledby="criteria-heading" className="mt-20">
          <h2 id="criteria-heading" className="text-3xl font-bold text-gray-900 mb-8">What we look for</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <List
              title="Signals"
              items={[
                "Named buyer and budget",
                "Workflow pain with urgency",
                "Fast pilot path and success metrics",
                "Referenceable customers in sight",
                "Data and integration feasibility",
              ]}
            />
            <List
              title="Anti-signals"
              items={[
                "Unclear buyer or committee",
                "Weak data posture or security",
                "Value not tied to a budget line",
                "Pilot with no production plan",
                "Crowded space with no angle",
              ]}
            />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" aria-labelledby="faq-heading" className="mt-20">
          <h2 id="faq-heading" className="text-3xl font-bold text-gray-900 mb-8">FAQ</h2>
          <dl className="mt-8 space-y-6">
            <QA
              q="How many deals per cycle?"
              a="A tiny slate. We focus on a handful to keep quality and attention high."
            />
            <QA
              q="Do you lead?"
              a="We co-lead or follow based on fit. We avoid taking time from founders unless we believe we can add value."
            />
            <QA
              q="Will you sign an NDA?"
              a="We rarely need one for early evaluation. If needed later, we keep it tight and specific."
            />
            <QA
              q="Do you take board seats?"
              a="Case by case. Support and access matter more than titles."
            />
            <QA
              q="Do you invest outside the Bay Area?"
              a="Yes. Buyer access and execution quality drive priority."
            />
            <QA
              q="How do I share a deck?"
              a="Create an account and share materials securely on the Account page."
            />
          </dl>
        </section>

        {/* Final CTA */}
        <section className="mt-20 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-10 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready when the buyer is</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300 leading-relaxed">
            If buyer demand is real, we will see it together. Then we invest and help you win.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/investors#current-raise"
              className="group rounded-xl bg-white px-8 py-4 text-gray-900 font-medium shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-200"
              data-analytics="process_footer_current"
            >
              See current raise
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
            <Link
              href="/account"
              className="rounded-xl border-2 border-white/30 px-8 py-4 font-medium hover:border-white/50 hover:bg-white/10 transition-all duration-200"
              data-analytics="process_footer_access"
            >
              Request access
            </Link>
          </div>
          <div className="mt-6 rounded-xl bg-white/10 p-4">
            <p className="text-sm text-gray-400">
              Any offering is made only through final documents. Private investments involve risk including loss of capital.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- UI helpers ---------- */

function Step(props: { index: number; title: string; body: string }) {
  const { index, title, body } = props;
  return (
    <li className="group rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white shadow-lg">
          {index}
        </span>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="mt-4 text-gray-600 leading-relaxed">{body}</p>
    </li>
  );
}

function Card(props: { title: string; body: string }) {
  return (
    <article className="group rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
        <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
      </div>
      <h3 className="text-xl font-bold mb-3">{props.title}</h3>
      <p className="text-gray-600 leading-relaxed">{props.body}</p>
    </article>
  );
}

function List(props: { title: string; items: string[] }) {
  return (
    <article className="group rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white">
      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
        <div className="w-6 h-6 bg-green-500 rounded-full"></div>
      </div>
      <h3 className="text-xl font-bold mb-4">{props.title}</h3>
      <div className="space-y-3">
        {props.items.map((t, i) => (
          <div key={i} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700">{t}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function TimelineItem(props: { title: string; body: string }) {
  return (
    <div className="group rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white">
      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
        <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
      </div>
      <div className="text-sm font-semibold uppercase tracking-wider text-purple-600 mb-2">{props.title}</div>
      <div className="text-gray-700 leading-relaxed">{props.body}</div>
    </div>
  );
}

function QA(props: { q: string; a: string }) {
  return (
    <div className="group rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 bg-white">
      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
        <div className="w-6 h-6 bg-amber-500 rounded-full"></div>
      </div>
      <dt className="text-lg font-bold text-gray-900 mb-3">{props.q}</dt>
      <dd className="text-gray-600 leading-relaxed">{props.a}</dd>
    </div>
  );
}
