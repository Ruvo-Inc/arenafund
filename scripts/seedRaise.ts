// scripts/seedRaise.ts
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

initializeApp({ credential: applicationDefault(), projectId: "arenafund" });
const db = getFirestore();

type RaiseStatus = "draft" | "open" | "closed";
interface Raise {
  title: string;
  subtitle: string;
  status: RaiseStatus;
  spvOpen: boolean;
  spvExternalUrl: string | null;
  cfOpen: boolean;
  cfExternalUrl: string | null;
  minCheck: number;
  maxCheck: number;
  allocationUsd: number;
  closesAt: FirebaseFirestore.Timestamp;
  tags: string[];
  highlights: string[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

async function main() {
  const now = Timestamp.now();
  const closes = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 21)); // +21 days

  const raise: Raise = {
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
    closesAt: closes,
    tags: ["B2B AI", "Finance Ops"],
    highlights: [
      "Validated with three Fortune 500 buyers",
      "Pilot-to-PO motion scoped with Arena GTM"
    ],
    createdAt: now,
    updatedAt: now
  };

  // Create the specific acme-seed doc
  const docRef = db.collection("raises").doc("acme-seed");
  await docRef.set(raise);

  // Also set a 'current' pointer document with identical fields,
  // so your page has a deterministic fallback
  await db.collection("raises").doc("current").set({ ...raise, updatedAt: Timestamp.now() });

  console.log("Seeded raise:", docRef.path, "and raises/current");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
