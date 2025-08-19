import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold">Thank you</h1>
        <p className="mt-4 text-gray-600">
          Your expression of interest has been received. We’ll review and follow up shortly.
        </p>
        <div className="mt-8">
          <Link href="/" className="text-indigo-600 hover:underline">Return home</Link>
        </div>
      </div>
    </main>
  );
}
