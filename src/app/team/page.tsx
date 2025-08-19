// app/team/page.tsx
'use client';

import Link from "next/link";
import Script from "next/script";
import { MobilePageWrapper, MobilePageSection, MobileCard, MobileGrid, MobileStack } from "@/components/ui";
import { Linkedin, ExternalLink, Users, Building, Award } from "lucide-react";

// Metadata moved to layout since this is now a client component

export default function TeamPage() {
  // JSON-LD: Organization and Person (leadership)
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Arena Fund",
    url: "https://www.thearenafund.com",
    logo: "https://www.thearenafund.com/logo/arena-mark.png",
    sameAs: ["https://www.linkedin.com/company/thearenafund/"],
  };

  const maniJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mani Swaminathan",
    jobTitle: "Founder and Managing Partner",
    url: "https://www.thearenafund.com/team",
    sameAs: ["https://www.linkedin.com/in/maniswaminathan/"],
    worksFor: { "@type": "Organization", name: "The Arena Fund" },
    knowsAbout: ["B2B AI", "Enterprise GTM", "AI Strategy", "SaaS", "Financial Services", "Insurance"],
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.thearenafund.com/" },
      { "@type": "ListItem", position: 2, name: "Team", item: "https://www.thearenafund.com/team" },
    ],
  };

  return (
    <MobilePageWrapper
      title="Our Team"
      subtitle="Operator-led investors with deep B2B AI experience and buyer validation expertise"
      showBackButton={true}
      showBreadcrumb={true}
      variant="centered"
      contentSpacing="lg"
    >
      {/* JSON-LD */}
      <Script id="ld-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <Script id="ld-person-mani" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(maniJsonLd) }} />
      <Script id="ld-breadcrumbs-team" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />

      {/* Page header notice */}
      <p className="mb-4 text-center text-xs text-gray-600">
        Information only. Not an offer. See{" "}
        <Link href="/disclosures" className="underline">
          disclosures
        </Link>
        .
      </p>

      {/* Hero */}
      <section aria-labelledby="hero" className="text-center">
        <h1 id="hero" className="text-4xl font-semibold tracking-tight md:text-6xl">
          Operator-led. Buyer-validated.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600 md:text-lg">
          We invest in B2B AI with a clear buyer, then help convert pilots to purchase orders.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/investors#current-raise"
            className="w-full rounded-lg bg-black px-5 py-3 text-center text-white sm:w-auto"
            data-analytics="team_hero_current"
          >
            See current raise
          </Link>
          <Link
            href="/account"
            className="w-full rounded-lg border px-5 py-3 text-center sm:w-auto"
            data-analytics="team_hero_access"
          >
            Request access
          </Link>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" aria-labelledby="leadership-heading" className="mt-16">
        <h2 id="leadership-heading" className="text-2xl font-semibold">Leadership</h2>

        <article className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Portrait placeholder block; replace src with an uploaded image when ready */}
          <div className="flex items-start">
            <div
              aria-hidden="true"
              className="h-44 w-44 rounded-xl border bg-gray-50"
              title="Portrait"
            />
          </div>

          <div className="rounded-xl border p-5">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-xl font-medium">Mani Swaminathan</h3>
                <p className="text-sm text-gray-600">Founder and Managing Partner</p>
              </div>
              <Link
                href="https://www.linkedin.com/in/maniswaminathan/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
              >
                LinkedIn
              </Link>
            </header>

            <p className="mt-4 text-sm text-gray-700">
              Twenty years building with Fortune 500 buyers across banking and finance, insurance, airlines, and high tech.
              Led IT strategy, business design, and enterprise transformations. Early into applied AI in the enterprise, shaped roadmaps,
              and ran delivery teams that passed security and procurement at scale.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <List
                title="Where experience meets buyer need"
                items={[
                  "Owned and closed enterprise programs including deals above $20M",
                  "Ran GTM with C-suite access and budget owners",
                  "Drove AI strategy and production rollouts in regulated environments",
                  "Hands-on with pricing, procurement, and vendor security reviews",
                ]}
              />
              <List
                title="Sectors"
                items={["Banking and finance", "Insurance", "Airlines", "SaaS and high tech"]}
              />
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <List
                title="Logos worked with"
                items={["Wells Fargo", "Alaska Airlines", "Tokio Marine", "Aspen", "Starbucks", "Google partner ecosystem"]}
              />
              <List
                title="Founder and operator"
                items={[
                  "Built and led a business unit at a niche AI startup",
                  "Founded companies in transportation and insurance",
                  "Active in operator networks for B2B AI",
                ]}
              />
            </div>
          </div>
        </article>
      </section>

      {/* Operator council */}
      <section id="operators" aria-labelledby="operators-heading" className="mt-16">
        <h2 id="operators-heading" className="text-2xl font-semibold">Operator council</h2>
        <p className="mt-4 max-w-3xl text-sm text-gray-700">
          We involve budget owners and workflow leaders in diligence and post-investment support.
          They speak the buyer language, define pilot success, and help shorten the path to production.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Card
            title="Who participates"
            body="CIO, CISO, VP Ops, Head of Data, and sales leaders with budget and delivery accountability."
          />
          <Card
            title="How they help"
            body="Buyer calls for validation, pilot design, security and procurement prep, and early customer intros."
          />
          <Card
            title="Conflicts and confidentiality"
            body="We screen for conflicts and keep engagements narrow and documented. No sensitive employer data is shared."
          />
        </div>

        <div className="mt-6">
          <Link href="/founders" className="rounded-lg border px-4 py-2 text-sm">
            How we work with founders
          </Link>
        </div>
      </section>

      {/* Values */}
      <section id="values" aria-labelledby="values-heading" className="mt-16">
        <h2 id="values-heading" className="text-2xl font-semibold">Values in practice</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Card title="Talk to buyers first" body="Signal comes from budget owners. We prioritize speed to clarity." />
          <Card title="Focus beats volume" body="A tiny slate each cycle so founders and investors get full attention." />
          <Card title="Do the work" body="Structured briefs, clear IC notes, and a 90-day GTM plan after funding." />
        </div>
      </section>

      {/* CTA */}
      <MobilePageSection variant="card">
        <h2 className="text-2xl font-semibold text-center">Ready when the buyer is</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-600 text-center">
          If buyer demand is real, we will see it together. Then we invest and help you win.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/investors#current-raise"
            className="rounded-lg bg-black px-5 py-3 text-white"
            data-analytics="team_footer_current"
          >
            See current raise
          </Link>
          <Link
            href="/account"
            className="rounded-lg border px-5 py-3"
            data-analytics="team_footer_access"
          >
            Request access
          </Link>
        </div>
        <p className="mt-3 text-xs text-gray-500 text-center">
          Any offering is made only through final documents. Private investments involve risk including loss of capital.
        </p>
      </MobilePageSection>
    </MobilePageWrapper>
  );
}

/* ---------- UI helpers ---------- */

function Card(props: { title: string; body: string }) {
  return (
    <article className="rounded-xl border p-5">
      <h3 className="text-lg font-medium">{props.title}</h3>
      <p className="mt-2 text-sm text-gray-600">{props.body}</p>
    </article>
  );
}

function List(props: { title: string; items: string[] }) {
  return (
    <article className="rounded-xl border p-5">
      <h3 className="text-lg font-medium">{props.title}</h3>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-700">
        {props.items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </article>
  );
}
