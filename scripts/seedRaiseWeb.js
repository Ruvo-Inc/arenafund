// Simple web-based seed script using Firebase client SDK
// Run this in the browser console on localhost:3000

const seedRaise = async () => {
  // Import Firebase functions (assuming they're available globally)
  const { collection, doc, setDoc, Timestamp } = window.firebase.firestore;
  const { db } = window.firebaseConfig; // Assuming db is available globally
  
  const now = new Date();
  const closesAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 21); // +21 days

  const raise = {
    title: "AcmeAI Seed SPV",
    subtitle: "Agent for finance ops",
    status: "open",
    spvOpen: true,
    spvExternalUrl: "https://app.sydecar.io/…",
    cfOpen: true,
    cfExternalUrl: "https://your-cf-portal/…",
    minCheck: 10000,
    maxCheck: 250000,
    allocationUsd: 1500000,
    closesAt: closesAt,
    tags: ["B2B AI", "Finance Ops"],
    highlights: [
      "Validated with three Fortune 500 buyers",
      "Pilot-to-PO motion scoped with Arena GTM"
    ],
    createdAt: now,
    updatedAt: now
  };

  try {
    // Create the acme-seed document
    await setDoc(doc(db, 'raises', 'acme-seed'), raise);
    console.log('✅ Created raises/acme-seed');

    // Also create the current document as fallback
    await setDoc(doc(db, 'raises', 'current'), { ...raise, updatedAt: new Date() });
    console.log('✅ Created raises/current');

    console.log('🎉 Seed data created successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Instructions:
console.log('To run this seed script:');
console.log('1. Open http://localhost:3000 in your browser');
console.log('2. Open browser dev tools console');
console.log('3. Copy and paste this entire script');
console.log('4. Call seedRaise() to create the test data');

// Export for manual execution
if (typeof window !== 'undefined') {
  window.seedRaise = seedRaise;
}
