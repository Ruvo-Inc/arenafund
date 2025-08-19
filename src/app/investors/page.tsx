// app/investors/page.tsx
import type { Metadata } from "next";
import InvestorsClient from "./InvestorsClient";

export const metadata: Metadata = {
  title: "Investors | The Arena Fund",
  description:
    "Buyer-validated B2B AI. Operator diligence, real buyer demand, post-invest GTM to convert pilots to POs.",
  alternates: { canonical: "/investors" },
  openGraph: {
    type: "website",
    url: "https://www.thearenafund.com/investors",
    title: "Investors | The Arena Fund",
    description:
      "Buyer-validated B2B AI. Operator diligence, real buyer demand, post-invest GTM to convert pilots to POs.",
    images: [{ url: "/og/arena-og.jpg", width: 1200, height: 630, alt: "The Arena Fund" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Investors | The Arena Fund",
    description:
      "Buyer-validated B2B AI. Operator diligence, real buyer demand, post-invest GTM to convert pilots to POs.",
    images: ["/og/arena-og.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function InvestorsPage() {
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.thearenafund.com/" },
      { "@type": "ListItem", position: 2, name: "Investors", item: "https://www.thearenafund.com/investors" },
    ],
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "The Arena Fund",
    url: "https://www.thearenafund.com",
    sameAs: ["https://www.linkedin.com/company/thearenafund"],
    areaServed: "US",
    serviceType: "Investment Management",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <InvestorsClient />
    </>
  );
}
