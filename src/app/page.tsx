import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Arena Fund
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          A decisive, elegant, AI‑literate investment collective. If you’re
          interested in participating, submit an expression of interest.
        </p>
        <div className="mt-8">
          <Link
            href="/apply"
            className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700"
          >
            Apply / Express Interest
          </Link>
        </div>
      </div>
    </main>
  );
}
