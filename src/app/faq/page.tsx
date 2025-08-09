export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold">Frequently Asked Questions</h1>
        <div className="space-y-4">
          <div>
            <h2 className="font-medium">What is Arena Fund?</h2>
            <p className="text-gray-700">An AI‑literate investment collective focused on humane systems and enduring value.</p>
          </div>
          <div>
            <h2 className="font-medium">Who can apply?</h2>
            <p className="text-gray-700">Qualified investors and aligned operators globally. We review each submission thoughtfully.</p>
          </div>
          <div>
            <h2 className="font-medium">How do you evaluate opportunities?</h2>
            <p className="text-gray-700">Clarity of intent, quality of team, systems thinking, and long‑term alignment.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
