"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "Your full name"),
  email: z.string().email("Valid email required"),
  city: z.string().min(1, "City required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country required"),
  phone: z.string().optional(),
  organization: z.string().optional(),
  invest_range: z.string().min(1, "Select a range"),
  experience_level: z.string().min(1, "Select level"),
  accredited_status: z.enum(["Yes", "No", "Unsure"]),
  excitement_text: z.string().max(200, "Max 200 chars"),
  heard_about: z.string().optional(),
  value_add: z.string().optional(),
  e_signature_name: z.string().min(2, "Type your name"),
});

type FormData = z.infer<typeof schema>;

type Grecaptcha = {
  ready: (cb: () => void) => void;
  execute: (siteKey: string, opts: { action: string }) => Promise<string>;
};

type WindowWithCaptcha = Window & { grecaptcha?: Grecaptcha };

function getRecaptcha(): Promise<Grecaptcha> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("window undefined"));
    const w = window as unknown as WindowWithCaptcha;
    if (w.grecaptcha) return resolve(w.grecaptcha);
    reject(new Error("grecaptcha not loaded"));
  });
}

export default function Form({ siteKey }: { siteKey: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS === "1";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = useCallback(
    async (data: FormData) => {
      setSubmitting(true);
      setError(null);
      try {
        let token = "";
        if (devBypass) {
          token = "dev-bypass";
        } else {
          if (!siteKey) throw new Error("Missing reCAPTCHA site key");
          // Ensure script src has site key before accessing grecaptcha
          if (!document.querySelector('script[src^="https://www.google.com/recaptcha/api.js?render="]')) {
            const s = document.createElement("script");
            s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            s.async = true;
            s.defer = true;
            document.head.appendChild(s);
            await new Promise<void>((res, rej) => {
              s.onload = () => res();
              s.onerror = () => rej(new Error("reCAPTCHA script failed to load"));
            });
          }
          const grecaptcha = await getRecaptcha();
          // grecaptcha.ready expects a callback, not zero-arg invocation
          await new Promise<void>((resolve) => grecaptcha.ready(() => resolve()));
          token = await grecaptcha.execute(siteKey, { action: "submit" });
        }

        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, token }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || `Request failed (${res.status})`);
        }
        router.push("/success");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Submission failed";
        setError(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [router, siteKey, devBypass]
  );

  const fieldCls = "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelCls = "text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Full name</label>
          <input className={fieldCls} {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input className={fieldCls} type="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input className={fieldCls} {...register("city")} />
          {errors.city && <p className="text-xs text-red-600">{errors.city.message}</p>}
        </div>
        <div>
          <label className={labelCls}>State/Province</label>
          <input className={fieldCls} {...register("state")} />
        </div>
        <div>
          <label className={labelCls}>Country</label>
          <input className={fieldCls} {...register("country")} />
          {errors.country && <p className="text-xs text-red-600">{errors.country.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input className={fieldCls} {...register("phone")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>Organization</label>
          <input className={fieldCls} {...register("organization")} />
        </div>
        <div>
          <label className={labelCls}>Investment range</label>
          <select className={fieldCls} {...register("invest_range")}>
            <option value="">Select…</option>
            <option>Under $50k</option>
            <option>$50k–$100k</option>
            <option>$100k–$250k</option>
            <option>$250k–$500k</option>
            <option>$500k–$1M</option>
            <option>$1M+</option>
          </select>
          {errors.invest_range && (
            <p className="text-xs text-red-600">{errors.invest_range.message}</p>
          )}
        </div>
        <div>
          <label className={labelCls}>Experience level</label>
          <select className={fieldCls} {...register("experience_level")}>
            <option value="">Select…</option>
            <option>First-time</option>
            <option>Some experience</option>
            <option>Seasoned</option>
          </select>
          {errors.experience_level && (
            <p className="text-xs text-red-600">{errors.experience_level.message}</p>
          )}
        </div>
        <div>
          <label className={labelCls}>Accredited investor</label>
          <select className={fieldCls} {...register("accredited_status")}>
            <option value="">Select…</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Unsure">Unsure</option>
          </select>
          {errors.accredited_status && (
            <p className="text-xs text-red-600">{errors.accredited_status.message}</p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>What excites you about Arena Fund? (max 200 chars)</label>
          <textarea className={fieldCls} rows={3} {...register("excitement_text")} />
          {errors.excitement_text && (
            <p className="text-xs text-red-600">{errors.excitement_text.message}</p>
          )}
        </div>
        <div>
          <label className={labelCls}>How did you hear about us?</label>
          <input className={fieldCls} {...register("heard_about")} />
        </div>
        <div>
          <label className={labelCls}>How might you add value?</label>
          <input className={fieldCls} {...register("value_add")} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>E-signature (type your full name)</label>
          <input className={fieldCls} {...register("e_signature_name")} />
          {errors.e_signature_name && (
            <p className="text-xs text-red-600">{errors.e_signature_name.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            By submitting, you agree this typed name serves as your e-signature and you consent to our privacy and legal disclaimers.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
