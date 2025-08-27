/**
 * StructuredData component for injecting JSON-LD structured data into pages
 */

import Script from 'next/script';

interface StructuredDataProps {
  data: string;
}

/**
 * Component to inject structured data (JSON-LD) into the page head
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: data }}
    />
  );
}

export default StructuredData;