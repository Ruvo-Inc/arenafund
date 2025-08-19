import Form from "../../components/Form";
import RecaptchaScript from "../../components/RecaptchaScript";

export const dynamic = "force-dynamic"; // ensure server reads env at request time

export default function ApplyPage() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  return (
    <>
      <RecaptchaScript siteKey={siteKey} />
      <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold">Expression of Interest</h1>
        <p className="mt-2 text-gray-600">
          Share a few details below. We’ll follow up with next steps.
        </p>
        <div className="mt-8">
          <Form siteKey={siteKey} />
        </div>
      </div>
      </main>
    </>
  );
}
