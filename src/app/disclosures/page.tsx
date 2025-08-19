// app/disclosures/page.tsx
import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";

const LAST_UPDATED = "Aug 11, 2025";

export const metadata: Metadata = {
  title: "Disclosures | The Arena Fund",
  description:
    "Important information about risks, eligibility, offering limitations, fees, conflicts, and policies for The Arena Fund.",
  metadataBase: new URL("https://www.thearenafund.com"),
  alternates: { canonical: "/disclosures" },
  openGraph: {
    type: "website",
    url: "https://www.thearenafund.com/disclosures",
    title: "Disclosures | The Arena Fund",
    description:
      "Risks, eligibility, offering limitations, fees, conflicts, and policies for The Arena Fund.",
    images: [{ url: "/og/arena-og.jpg", width: 1200, height: 630, alt: "The Arena Fund" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclosures | The Arena Fund",
    description:
      "Risks, eligibility, offering limitations, fees, conflicts, and policies for The Arena Fund.",
    images: ["/og/arena-og.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function DisclosuresPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.thearenafund.com/" },
      { "@type": "ListItem", position: 2, name: "Disclosures", item: "https://www.thearenafund.com/disclosures" },
    ],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Disclosures",
    url: "https://www.thearenafund.com/disclosures",
    description:
      "Important information about risks, eligibility, offering limitations, fees, conflicts, and policies for The Arena Fund.",
    isPartOf: { "@type": "WebSite", name: "The Arena Fund", url: "https://www.thearenafund.com" },
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mobile-content-container py-8 sm:py-12 max-w-4xl">
      <Script id="ld-disclosures-breadcrumbs" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      <Script id="ld-disclosures-page" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />

      <header className="text-center mb-8 sm:mb-12">
        <p className="text-sm text-gray-600 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 inline-block">
          Information only. Not an offer. See details below.
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Disclosures</h1>
        <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
      </header>

      {/* Quick nav */}
      <nav aria-label="Sections" className="mb-8 sm:mb-12 bg-gray-50 rounded-xl p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Sections</h2>
        <div className="mobile-content-grid cols-2 gap-2 sm:gap-3">
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#no-offer">No offer or advice</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#eligibility">Eligibility and limitations</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#reg-cf">Reg CF offerings</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#risks">Risk factors</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#performance">Performance and projections</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#fees">Fees and expenses</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#conflicts">Conflicts and allocation</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#process">Diligence and process limits</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#privacy">Privacy and data</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#compliance">Compliance and KYC</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#jurisdiction">Jurisdiction</a>
          <a className="touch-target block px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors" href="#contact">Contact</a>
        </div>
      </nav>

      <Section id="no-offer" title="No offer or advice">
        <P>
          The information on this site is provided for informational purposes only. It does not
          constitute an offer to sell or a solicitation of an offer to buy any securities.
          Any offering will be made only to qualified investors through definitive
          documentation that describes terms, risks, and conflicts in full.
        </P>
        <P>
          Nothing here is investment, legal, accounting, or tax advice. Speak with your advisors before
          making any investment decision.
        </P>
      </Section>

      <Section id="eligibility" title="Eligibility and limitations">
        <List
          items={[
            "Private placements for SPVs are intended for verified accredited investors under Rule 506(c).",
            "Verification may be completed by a qualified third party. Proof is required before subscription.",
            "Investments are illiquid and speculative. Transfers and withdrawals are restricted.",
            "Minimums, maximums, and rights vary by deal and are defined in the final documents.",
          ]}
        />
      </Section>

      <Section id="reg-cf" title="Reg CF offerings">
        <P>
          Community investments, where available, are offered under Regulation Crowdfunding through a
          registered funding portal partner. Any Reg CF investment occurs only on that portal, not on this
          website. The portal provides offering documents, risk disclosures, and investor limits. Follow the
          portal’s instructions and disclosures when participating.
        </P>
      </Section>

      <Section id="risks" title="Risk factors">
        <List
          items={[
            "Loss of capital. Early-stage companies fail frequently and can return zero.",
            "Illiquidity. There is no public market. Secondary sales, if any, are limited.",
            "Dilution. Future financing can dilute your interest.",
            "Concentration. Focused strategies increase exposure to sector, stage, and geography.",
            "Execution. Product, GTM, compliance, and team risks are material in B2B AI.",
            "Regulatory. Changes in laws or interpretations can affect outcomes.",
            "Operational. Key person risk, process failures, cybersecurity, and third-party dependencies.",
          ]}
        />
      </Section>

      <Section id="performance" title="Performance and projections">
        <P>
          Any references to traction, customers, or pipeline are based on information provided by founders and buyers during diligence. We do not guarantee accuracy or completeness.
        </P>
        <P>
          Forward-looking statements are uncertain. Actual results differ due to known and unknown risks.
          Do not rely on projections. Do not assume future performance from any reference to past outcomes.
        </P>
      </Section>

      <Section id="fees" title="Fees and expenses">
        <P>
          For SPVs, we target no management fee and 10 percent carried interest, plus a one-time administrative fee and standard third-party costs. Exact terms are set in final deal documents and may vary by transaction, structure, or service provider.
        </P>
        <P>
          Reg CF investments follow the funding portal’s fee and expense schedule. Review the portal’s disclosures.
        </P>
      </Section>

      <Section id="conflicts" title="Conflicts and allocation">
        <List
          items={[
            "We may advise or assist portfolio companies with GTM or commercial introductions.",
            "We may receive information from founders, buyers, and operators that is not public.",
            "We screen for conflicts, document roles, and limit engagements to defined scopes.",
            "We allocate opportunities using a fair and documented process, subject to capacity and diligence outcomes.",
          ]}
        />
      </Section>

      <Section id="process" title="Diligence and process limits">
        <P>
          Buyer validation, operator input, and GTM planning are diligence tools. They reduce uncertainty
          but do not remove risk. Access to buyers, pilots, or purchase orders is not guaranteed. Post-investment support is best efforts.
        </P>
      </Section>

      <Section id="privacy" title="Privacy and data">
        <P>
          We collect, process, and store information to operate this site and evaluate investors and founders.
          See our <Link className="underline" href="/privacy">Privacy Policy</Link> for details on what we collect, how we use it, data retention, and your choices.
        </P>
      </Section>

      <Section id="compliance" title="Compliance and KYC">
        <List
          items={[
            "Subscriptions are subject to KYC, AML, and sanctions screening.",
            "Tax and regulatory forms are required and vary by jurisdiction and structure.",
            "We reserve the right to decline or rescind participation where required by policy or law.",
          ]}
        />
      </Section>

      <Section id="jurisdiction" title="Jurisdiction">
        <P>
          This website is intended for use in the United States. Availability in other jurisdictions is
          limited and subject to local law. Users are responsible for complying with applicable rules.
        </P>
      </Section>

      <Section id="contact" title="Contact">
        <P>
          Questions about these disclosures or a specific deal can be sent to{" "}
          <a className="underline" href="mailto:contact@thearenafund.com">contact@thearenafund.com</a>.
        </P>
        <p className="text-xs text-gray-500">
          Do not send material nonpublic information or confidential employer data.
        </p>
      </Section>

      <footer className="mt-12 pt-8 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          The Arena Fund may update these disclosures at any time. Continued use of the site indicates
          acceptance of the current version.
        </p>
      </footer>
      </div>
    </main>
  );
}

/* ---------- primitives ---------- */

function Section(props: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={props.id} aria-labelledby={`${props.id}-h`} className="mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-gray-200">
      <h2 id={`${props.id}-h`} className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{props.title}</h2>
      <div className="space-y-4">{props.children}</div>
      <div className="mt-4">
        <a className="touch-target inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors" href="#top">
          ↑ Back to top
        </a>
      </div>
    </section>
  );
}

function P(props: { children: React.ReactNode }) {
  return <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{props.children}</p>;
}

function List(props: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-4">
      {props.items.map((t, i) => (
        <li key={i} className="flex items-start space-x-3">
          <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
          <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{t}</span>
        </li>
      ))}
    </ul>
  );
}
