import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
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

    // Create the acme-seed document
    await setDoc(doc(db, 'raises', 'acme-seed'), raise);
    console.log('✅ Created raises/acme-seed');

    // Also create the current document as fallback
    await setDoc(doc(db, 'raises', 'current'), { ...raise, updatedAt: new Date() });
    console.log('✅ Created raises/current');

    return NextResponse.json({ 
      success: true, 
      message: 'Seed data created successfully',
      data: {
        'raises/acme-seed': 'created',
        'raises/current': 'created'
      }
    });

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
