// app/founders/page.tsx
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Founders | The Arena Fund",
  description:
    "Operator background and principles behind The Arena Fund. Two decades in enterprise technology, buyer validation, and post-invest GTM for B2B AI.",
  metadataBase: new URL("https://www.thearenafund.com"),
  alternates: { canonical: "/founders" },
  openGraph: {
    type: "website",
    url: "https://www.thearenafund.com/founders",
    title: "Founders | The Arena Fund",
    description:
      "Why we exist, how we work, and the operating principles that guide our B2B AI investing.",
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
    title: "Founders | The Arena Fund",
    description:
      "Operator background and principles behind The Arena Fund. Buyer validation and post-invest GTM for B2B AI.",
    images: ["/og/arena-og.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function FoundersPage() {
  // JSON-LD: Person, Organization, Breadcrumbs
  const jsonLdPerson = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mani Swaminathan",
    jobTitle: "General Partner",
    worksFor: {
      "@type": "Organization",
      name: "The Arena Fund",
      url: "https://www.thearenafund.com",
    },
    url: "https://www.thearenafund.com/founders",
    sameAs: [
      "https://www.linkedin.com/in/maniswaminathan/",
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Enterprise Software",
      "Go To Market",
      "Financial Services",
      "Insurance",
      "Aviation",
    ],
  };

  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Arena Fund",
    url: "https://www.thearenafund.com",
    logo: "https://www.thearenafund.com/og/arena-og.jpg",
    sameAs: [],
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
        name: "Founders",
        item: "https://www.thearenafund.com/founders",
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="mobile-content-container py-8 sm:py-12">
      {/* JSON-LD */}
      <Script
        id="ld-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
      />
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
      />
      <Script
        id="ld-breadcrumbs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />

      {/* Page header notice */}
      <p className="mb-4 text-center text-xs text-gray-600">
        This page is informational. It is not an offer. See{" "}
        <Link href="/disclosures" className="underline">
          disclosures
        </Link>
        .
      </p>

      {/* Hero */}
      <section aria-labelledby="hero-heading" className="text-center">
        <h1 id="hero-heading" className="font-['Outfit'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Operator first. Buyer first.
        </h1>
        <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg text-gray-600 leading-relaxed">
          Two decades building and selling enterprise technology. We invest in B2B AI after real buyer validation, then help convert pilots to POs.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row">
          <Link
            href="/investors#current-raise"
            className="btn-touch-primary group w-full max-w-xs rounded-xl px-6 sm:px-8 py-3 sm:py-4 text-center font-medium shadow-lg hover:shadow-xl transition-all duration-200 sm:w-auto"
            data-analytics="founders_hero_current"
          >
            See current raise
          </Link>
          <Link
            href="/account"
            className="btn-touch-secondary w-full max-w-xs rounded-xl border-2 border-gray-200 px-6 sm:px-8 py-3 sm:py-4 text-center font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 sm:w-auto"
            data-analytics="founders_hero_access"
          >
            Request access
          </Link>
        </div>
      </section>

      {/* Profile header */}
      <section aria-labelledby="mani-heading" className="mt-12 sm:mt-16">
        <div className="mobile-content-grid cols-1 gap-6 md:grid-cols-[220px,1fr] items-start">
          <div className="mx-auto h-40 w-40 overflow-hidden rounded-2xl border md:mx-0 md:h-48 md:w-48">
            {/* Optional photo at /public/people/mani.jpg */}
            <img
              src="/people/mani.jpg"
              alt="Mani Swaminathan"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 id="mani-heading" className="text-2xl font-semibold">
              Mani Swaminathan
            </h2>
            <p className="mt-1 text-sm text-gray-600">General Partner</p>
            <p className="mt-4 text-sm text-gray-700">
              Twenty years in enterprise technology across strategy, design, and large programs.
              Work with Fortune 500 buyers across financial services, insurance, aviation, and high tech.
              Led transformations and critical deals above 20M.
              Early AI strategy and rollout for enterprise teams.
              Leadership roles across technology and sales.
              Operator time inside a niche AI company.
              Founder experience in transportation and insurance.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full border px-2 py-1">AI and SaaS</span>
              <span className="rounded-full border px-2 py-1">Financial services</span>
              <span className="rounded-full border px-2 py-1">Insurance</span>
              <span className="rounded-full border px-2 py-1">Aviation</span>
              <span className="rounded-full border px-2 py-1">Go to market</span>
              <span className="rounded-full border px-2 py-1">Enterprise sales</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/maniswaminathan/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border px-4 py-2 text-sm"
              >
                LinkedIn
              </a>
              <Link href="/account" className="rounded-lg bg-black px-4 py-2 text-sm text-white">
                Request intro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Arena */}
      <section id="why" aria-labelledby="why-heading" className="mt-16 sm:mt-20">
        <h2 id="why-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Why The Arena Fund</h2>
        <div className="mobile-content-grid cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          <Card
            title="Buyer validation"
            body="We speak with budget owners and workflow leaders before we wire. We look for urgency, data access, and a clear path to a PO."
          />
          <Card
            title="Execution edge"
            body="We know how enterprise buys. We help founders design pilots, prepare for security, and navigate procurement."
          />
          <Card
            title="Tiny slate"
            body="Few deals each cycle. Heavy time on what we do back the founders to win and grow."
          />
        </div>
      </section>

      {/* Operating principles */}
      <section id="principles" aria-labelledby="principles-heading" className="mt-16 sm:mt-20">
        <h2 id="principles-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Operating principles</h2>
        <div className="mobile-content-grid cols-2 gap-6 mt-6">
          <List
            title="How we decide"
            items={[
              "Start with the buyer and the budget line",
              "Focus on integration and data path",
              "Demand clear value and defensibility",
              "Move fast and write it down",
            ]}
          />
          <List
            title="How we support"
            items={[
              "Buyer intros with context that matters",
              "Pilot design with success metrics",
              "Security and procurement checklist",
              "Sales ops cadence and forecasting basics",
            ]}
          />
        </div>
      </section>

      {/* Background detail */}
      <section id="background" aria-labelledby="background-heading" className="mt-16 sm:mt-20">
        <h2 id="background-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Background</h2>
        <div className="mobile-content-grid cols-2 gap-6 mt-6">
          <Card
            title="Enterprise work"
            body="Strategy and transformation with Fortune 500 buyers across banks, insurers, airlines, and high tech. Hands-on with large programs and revenue motions."
          />
          <Card
            title="Deals and delivery"
            body="Led 20M plus programs and critical deals. Owned outcomes from design to scale. Paired with C-suite and budget owners."
          />
          <Card
            title="AI experience"
            body="Early AI strategy and rollout for enterprise teams. Operator time at a niche AI startup focused on business outcomes."
          />
          <Card
            title="Founder path"
            body="Founded and scaled efforts in transportation and insurance. Learned the hard edges of product, GTM, and capital."
          />
        </div>
        <p className="mt-4 text-xs text-gray-500">
          Logos and references available on request with proper permissions.
        </p>
      </section>

      {/* Network and advisors */}
      <section id="network" aria-labelledby="network-heading" className="mt-16 sm:mt-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 sm:p-8 shadow-lg">
        <h2 id="network-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Operator network</h2>
        <p className="mt-2 text-sm text-gray-700">
          We bring senior buyers and operators to diligence and post-invest work. Security, data, procurement, and sales leaders help shorten the path from pilot to PO.
        </p>
        <div className="mobile-content-grid cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          <Pill title="Security and risk" body="CISOs, GRC leads, and architects" />
          <Pill title="Data" body="ML leaders and platform owners" />
          <Pill title="GTM" body="Sales and marketing operators" />
        </div>
        <div className="mt-8">
          <Link href="/process#validation" className="inline-flex items-center rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
            See how buyer calls shape conviction
            <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      {/* How we work with founders */}
      <section id="work-with-us" aria-labelledby="work-with-us-heading" className="mt-16 sm:mt-20">
        <h2 id="work-with-us-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Working with us</h2>
        <div className="mobile-content-grid cols-2 gap-6 mt-6">
          <List
            title="What we look for"
            items={[
              "B2B AI with a clear buyer and workflow",
              "Short time to a credible pilot",
              "Data posture and integration path",
              "A plan to win reference customers",
            ]}
          />
          <List
            title="What you get"
            items={[
              "Direct buyer conversations with context",
              "90-day GTM plan to convert pilots",
              "Hands-on help for security and procurement",
              "Clear quarterly updates to investors",
            ]}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/process" className="inline-flex items-center rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
            Read the process
            <span className="ml-2">→</span>
          </Link>
          <Link href="/account" className="rounded-xl bg-gray-900 px-6 py-3 text-sm text-white font-medium shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-200">
            Share your deck
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mt-16 sm:mt-20 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 lg:p-10 text-center text-white shadow-2xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Let's talk to the buyer</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-gray-300 leading-relaxed">
          If there is real demand, we will see it together. Then we invest and help you win.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            href="/investors#current-raise"
            className="group rounded-xl bg-white px-8 py-4 text-gray-900 font-medium shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-200"
            data-analytics="founders_footer_current"
          >
            See current raise
          </Link>
          <Link
            href="/account"
            className="rounded-xl border-2 border-white/30 px-8 py-4 font-medium hover:border-white/50 hover:bg-white/10 transition-all duration-200"
            data-analytics="founders_footer_access"
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

function Card(props: { title: string; body: string }) {
  return (
    <article className="mobile-card-layout bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
        <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-3">{props.title}</h3>
      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{props.body}</p>
    </article>
  );
}

function List(props: { title: string; items: string[] }) {
  return (
    <article className="mobile-card-layout bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
        <div className="w-6 h-6 bg-green-500 rounded-full"></div>
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-3">{props.title}</h3>
      <div className="space-y-3">
        {props.items.map((t, i) => (
          <div key={i} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm sm:text-base text-gray-700">{t}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

function Pill(props: { title: string; body: string }) {
  return (
    <div className="mobile-card-layout bg-white rounded-xl border border-blue-200 p-4 sm:p-6 text-center">
      <div className="text-sm font-semibold text-blue-600 mb-2">{props.title}</div>
      <div className="text-sm sm:text-base font-medium text-gray-900">{props.body}</div>
    </div>
  );
}
