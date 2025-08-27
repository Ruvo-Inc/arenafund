import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo-utils";
import { StructuredData } from "@/components/StructuredData";
import { generatePageStructuredData } from "@/lib/structured-data";
import { WebVitalsMonitor, PerformanceDashboard } from "@/components/WebVitalsMonitor";
import { recordWebVitals } from "@/lib/performance-monitoring";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Generate comprehensive metadata using SEO utilities
export const metadata: Metadata = generateSEOMetadata({
  title: "Arena Fund | Buyer-Validated Venture Capital for B2B AI Startups",
  description: "The only VC fund that validates Fortune 500 buyers before investing. Systematic enterprise demand validation reduces risk for investors and accelerates revenue for founders.",
  keywords: "venture capital, buyer validation, Fortune 500, B2B AI, enterprise sales, startup funding, AI investment, enterprise AI, B2B startups",
  url: "/",
  type: "website",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate structured data for the root layout
  const structuredData = generatePageStructuredData({
    type: 'webpage',
    title: 'Arena Fund | Buyer-Validated Venture Capital for B2B AI Startups',
    description: 'The only VC fund that validates Fortune 500 buyers before investing. Systematic enterprise demand validation reduces risk for investors and accelerates revenue for founders.',
    url: '/',
  });

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Crimson+Text:wght@400;600;700&display=swap" 
          rel="stylesheet" 
        />
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.png" as="image" />
      </head>
      <body className={`${inter.variable} antialiased bg-white text-gray-900`}>
        <StructuredData data={structuredData} />
        <WebVitalsMonitor />
        {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
        {children}
      </body>
    </html>
  );
}

