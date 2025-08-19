// Typography Test Page - Comprehensive responsive typography scale testing
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Typography Test | The Arena Fund",
  description: "Testing responsive typography scale with consistent line heights and spacing",
};

export default function FontTestPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Page Title */}
        <div className="text-center">
          <h1 className="heading-hero mb-6">Responsive Typography Scale</h1>
          <p className="lead text-gray-600 max-w-3xl mx-auto">
            Testing comprehensive responsive typography system with consistent line heights, 
            spacing, and mobile-first scaling across all breakpoints.
          </p>
        </div>

        {/* Responsive Heading Hierarchy */}
        <section className="space-y-12">
          <h2 className="heading-section border-b border-gray-200 pb-4">
            Responsive Heading Hierarchy
          </h2>
          
          <div className="grid gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h1 className="mb-4">H1: Hero Heading</h1>
              <p className="text-gray-600 mb-4">
                Scales from 36px (mobile) → 48px (tablet) → 56px (desktop) → 64px (large desktop)
              </p>
              <code className="text-sm bg-white px-3 py-1 rounded border">
                font-size: var(--text-4xl) → var(--text-5xl) → var(--text-6xl)
              </code>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h2 className="mb-4">H2: Section Heading</h2>
              <p className="text-gray-600 mb-4">
                Scales from 30px (mobile) → 36px (tablet) → 40px (desktop)
              </p>
              <code className="text-sm bg-white px-3 py-1 rounded border">
                font-size: var(--text-3xl) responsive scaling
              </code>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="mb-4">H3: Subsection Heading</h3>
              <p className="text-gray-600 mb-4">
                Scales from 24px (mobile) → 28px (tablet) → 32px (desktop)
              </p>
              <code className="text-sm bg-white px-3 py-1 rounded border">
                font-size: var(--text-2xl) responsive scaling
              </code>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h4 className="mb-4">H4: Card Heading</h4>
              <p className="text-gray-600 mb-4">
                Scales from 20px (mobile) → 22px (tablet+)
              </p>
              <code className="text-sm bg-white px-3 py-1 rounded border">
                font-size: var(--text-xl) responsive scaling
              </code>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h5 className="mb-4">H5: Minor Heading</h5>
              <p className="text-gray-600 mb-4">
                Scales from 18px (mobile) → 20px (tablet+)
              </p>
              <code className="text-sm bg-white px-3 py-1 rounded border">
                font-size: var(--text-lg) responsive scaling
              </code>
            </div>
          </div>
        </section>

        {/* Body Text Scale */}
        <section className="space-y-12">
          <h2 className="heading-section border-b border-gray-200 pb-4">
            Body Text Scale & Spacing
          </h2>
          
          <div className="grid gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Lead Text</h3>
              <p className="lead mb-4">
                This is lead text for introductory paragraphs. It uses larger font size 
                and maintains excellent readability with proper line height and spacing.
              </p>
              <code className="text-sm bg-white px-3 py-1 rounded border">
                .lead: var(--text-lg) / line-height-relaxed
              </code>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Body Text</h3>
              <p className="mb-4">
                This is standard body text using Inter font family. It maintains consistent 
                spacing and line height for optimal readability across all devices.
              </p>
              <p className="mb-4">
                Multiple paragraphs demonstrate proper spacing between elements. 
                <strong>Strong text uses Outfit font</strong> for emphasis while maintaining 
                the overall text flow. <em>Italic text also uses Outfit</em> for consistency.
              </p>
              <code className="text-sm bg-white px-3 py-1 rounded border">
                p: var(--text-base) / line-height-relaxed + margin-bottom
              </code>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Small Text</h3>
              <small className="block mb-4">
                This is small text used for captions, metadata, and secondary information. 
                It maintains readability while being visually de-emphasized.
              </small>
              <code className="text-sm bg-white px-3 py-1 rounded border">
                small: var(--text-sm) / line-height-normal
              </code>
            </div>
          </div>
        </section>

        {/* Responsive Typography Utilities */}
        <section className="space-y-12">
          <h2 className="heading-section border-b border-gray-200 pb-4">
            Responsive Typography Utilities
          </h2>
          
          <div className="grid gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Tailwind Responsive Classes</h3>
              <div className="space-y-4">
                <p className="text-responsive-6xl font-display font-bold">Hero Text</p>
                <p className="text-responsive-4xl font-display font-bold">Section Title</p>
                <p className="text-responsive-2xl font-display font-semibold">Card Title</p>
                <p className="text-responsive-lg">Large body text</p>
                <p className="text-responsive-base">Base body text</p>
                <p className="text-responsive-sm text-gray-600">Small text</p>
              </div>
              <code className="text-sm bg-white px-3 py-1 rounded border mt-4 block">
                text-responsive-* classes scale automatically with breakpoints
              </code>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Semantic Heading Classes</h3>
              <div className="space-y-4">
                <p className="heading-hero">Hero Heading</p>
                <p className="heading-section">Section Heading</p>
                <p className="heading-subsection">Subsection Heading</p>
                <p className="heading-card">Card Heading</p>
                <p className="heading-minor">Minor Heading</p>
              </div>
              <code className="text-sm bg-white px-3 py-1 rounded border mt-4 block">
                .heading-* classes provide semantic typography with responsive scaling
              </code>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Body Text Classes</h3>
              <div className="space-y-4">
                <p className="body-large">Large body text for emphasis</p>
                <p className="body-base">Standard body text for content</p>
                <p className="body-small">Small body text for details</p>
                <p className="body-caption">Caption text for metadata</p>
              </div>
              <code className="text-sm bg-white px-3 py-1 rounded border mt-4 block">
                .body-* classes provide consistent body text styling
              </code>
            </div>
          </div>
        </section>

        {/* Line Height & Spacing Demonstration */}
        <section className="space-y-12">
          <h2 className="heading-section border-b border-gray-200 pb-4">
            Line Height & Spacing System
          </h2>
          
          <div className="grid gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Consistent Line Heights</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Tight (1.25) - Headings
                  </h4>
                  <p className="text-2xl font-display font-semibold" style={{lineHeight: 'var(--line-height-tight)'}}>
                    This heading uses tight line height for better visual hierarchy and space efficiency.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Relaxed (1.625) - Body Text
                  </h4>
                  <p className="text-base" style={{lineHeight: 'var(--line-height-relaxed)'}}>
                    This body text uses relaxed line height for optimal readability and comfortable reading experience. 
                    The increased line spacing helps reduce eye strain and improves comprehension.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Normal (1.5) - UI Elements
                  </h4>
                  <p className="text-sm" style={{lineHeight: 'var(--line-height-normal)'}}>
                    UI elements and small text use normal line height for balanced spacing and readability.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Consistent Spacing</h3>
              <div className="space-y-4">
                <h4 className="heading-minor">Heading with proper bottom margin</h4>
                <p>
                  Paragraphs maintain consistent bottom margins using the spacing scale. 
                  This creates visual rhythm and hierarchy throughout the content.
                </p>
                <p>
                  Multiple paragraphs demonstrate the spacing system in action, 
                  with each element properly spaced according to its semantic importance.
                </p>
                <ul className="space-y-2">
                  <li>List items have consistent spacing</li>
                  <li>Using the design token spacing scale</li>
                  <li>Maintaining visual rhythm</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Real-world Example */}
        <section className="space-y-12">
          <h2 className="heading-section border-b border-gray-200 pb-4">
            Real-world Implementation
          </h2>
          
          <div className="bg-white border border-gray-200 rounded-xl p-8 lg:p-12">
            <h3 className="heading-hero mb-6">Hear the buyer before you wire.</h3>
            <p className="lead mb-8">
              Curated B2B AI. <strong>Tiny slate. Heavy conviction.</strong> We validate with Fortune 500 buyers, 
              then invest through SPVs and Reg CF, and help convert pilots to POs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="btn-primary">
                See current raise
              </button>
              <button className="btn-secondary">
                How we invest
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="heading-card mb-4">Process Step</h3>
              <p className="body-base mb-4">
                Each step in our process is designed to validate buyer demand 
                before investment decisions are made.
              </p>
              <small className="text-gray-500">Step 1 of 6</small>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="heading-card mb-4">Team Member</h3>
              <p className="body-base mb-4">
                Our operator network brings decades of B2B AI experience 
                to every investment decision.
              </p>
              <small className="text-gray-500">Operator Council</small>
            </div>
          </div>
        </section>

        {/* Breakpoint Testing */}
        <section className="space-y-12">
          <h2 className="heading-section border-b border-gray-200 pb-4">
            Breakpoint Testing
          </h2>
          
          <div className="bg-blue-50 p-8 rounded-xl">
            <h3 className="heading-card mb-6">Responsive Behavior</h3>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold mb-2">Mobile (default)</h4>
                  <ul className="space-y-1 text-xs">
                    <li>H1: 36px</li>
                    <li>H2: 30px</li>
                    <li>H3: 24px</li>
                    <li>Body: 16px</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold mb-2">Tablet (768px+)</h4>
                  <ul className="space-y-1 text-xs">
                    <li>H1: 48px</li>
                    <li>H2: 36px</li>
                    <li>H3: 28px</li>
                    <li>Body: 16px</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold mb-2">Desktop (1024px+)</h4>
                  <ul className="space-y-1 text-xs">
                    <li>H1: 56px</li>
                    <li>H2: 40px</li>
                    <li>H3: 32px</li>
                    <li>Body: 16px</li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-semibold mb-2">Large (1280px+)</h4>
                  <ul className="space-y-1 text-xs">
                    <li>H1: 64px</li>
                    <li>H2: 40px</li>
                    <li>H3: 32px</li>
                    <li>Body: 16px</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white rounded border">
                <h4 className="font-semibold mb-2">Testing Instructions</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Resize browser window to test responsive scaling</li>
                  <li>Use browser dev tools to inspect computed font-size values</li>
                  <li>Verify line-height ratios remain consistent</li>
                  <li>Check that spacing scales proportionally</li>
                  <li>Test on actual devices for real-world validation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Guide */}
        <section className="space-y-12">
          <h2 className="heading-section border-b border-gray-200 pb-4">
            Implementation Guide
          </h2>
          
          <div className="grid gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">CSS Custom Properties</h3>
              <div className="bg-white p-4 rounded border font-mono text-sm overflow-x-auto">
                <pre>{`/* Responsive typography scale */
--text-4xl: 2.25rem;  /* Mobile */
--text-5xl: 3rem;     /* Mobile */

@media (min-width: 768px) {
  --text-4xl: 3rem;   /* Tablet */
  --text-5xl: 3.75rem;
}

@media (min-width: 1024px) {
  --text-4xl: 3.5rem; /* Desktop */
  --text-5xl: 4.5rem;
}`}</pre>
              </div>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="heading-card mb-6">Tailwind Classes</h3>
              <div className="bg-white p-4 rounded border font-mono text-sm overflow-x-auto">
                <pre>{`<!-- Responsive scaling -->
<h1 class="text-responsive-5xl font-display font-bold">
  Hero Heading
</h1>

<!-- Semantic classes -->
<h2 class="heading-section">Section Title</h2>
<p class="body-large">Lead paragraph</p>
<p class="body-base">Standard content</p>`}</pre>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}