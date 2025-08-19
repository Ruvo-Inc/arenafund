import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPool } from '../../../lib/db';
import { sendAdminEmail, sendApplicantEmail } from '../../../lib/email';

const BodySchema = z.object({
  token: z.string().min(1), // reCAPTCHA token
  name: z.string().min(2),
  email: z.string().email(),
  city: z.string().min(1),
  state: z.string().optional().nullable(),
  country: z.string().min(1),
  phone: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  invest_range: z.string().min(1),
  experience_level: z.string().min(1),
  accredited_status: z.enum(['Yes', 'No', 'Unsure']),
  excitement_text: z.string().max(200),
  heard_about: z.string().optional().nullable(),
  value_add: z.string().optional().nullable(),
  e_signature_name: z.string().min(2),
});

async function verifyRecaptcha(token: string, remoteIp?: string | null) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error('Missing RECAPTCHA_SECRET_KEY');

  const params = new URLSearchParams();
  params.set('secret', secret);
  params.set('response', token);
  if (remoteIp) params.set('remoteip', remoteIp);

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });
  const data = (await res.json()) as { success: boolean; score?: number; action?: string } & Record<string, unknown>;
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }
    const input = parsed.data;

    // Local dev bypass: skip captcha, DB, and email when explicitly enabled.
    // Set DEV_BYPASS=1 in your environment to activate.
    if (process.env.DEV_BYPASS === '1') {
      return NextResponse.json({ ok: true, dev_bypass: true });
    }

    // Determine client IP and UA
    const ua = req.headers.get('user-agent') || undefined;
    const xff = req.headers.get('x-forwarded-for');
    const ip = (xff?.split(',')[0] || '').trim() || undefined;

    // Verify reCAPTCHA v3
    const verify = await verifyRecaptcha(input.token, ip);
    const score = typeof verify.score === 'number' ? verify.score : null;
    if (!verify.success || (score !== null && score < 0.3)) {
      return NextResponse.json({ error: 'Captcha failed', score }, { status: 400 });
    }

    // Insert into DB
    const pool = await getPool();
    const q = `
      INSERT INTO public.investor_submissions (
        name, email, city, state, country, phone, organization,
        invest_range, experience_level, accredited_status, excitement_text,
        heard_about, value_add, e_signature_name, ip_address, user_agent, recaptcha_score
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17
      ) RETURNING id, created_at;
    `;
    const values = [
      input.name,
      input.email,
      input.city,
      input.state ?? null,
      input.country,
      input.phone ?? null,
      input.organization ?? null,
      input.invest_range,
      input.experience_level,
      input.accredited_status,
      input.excitement_text,
      input.heard_about ?? null,
      input.value_add ?? null,
      input.e_signature_name,
      ip ?? null,
      ua ?? null,
      score,
    ];

    const { rows } = await pool.query(q, values);
    const { id, created_at } = rows[0];

    // Send admin email (best-effort)
    const subject = `New Arena Fund interest: ${input.name} <${input.email}>`;
    const text = `New submission\n\nName: ${input.name}\nEmail: ${input.email}\nCity: ${input.city}\nState: ${input.state || ''}\nCountry: ${input.country}\nPhone: ${input.phone || ''}\nOrganization: ${input.organization || ''}\nInvest Range: ${input.invest_range}\nExperience: ${input.experience_level}\nAccredited: ${input.accredited_status}\nHeard About: ${input.heard_about || ''}\nValue Add: ${input.value_add || ''}\nExcitement: ${input.excitement_text}\nE-Sign: ${input.e_signature_name}\nIP: ${ip || ''}\nUA: ${ua || ''}\nScore: ${score ?? ''}\nCreated: ${created_at}\nID: ${id}`;
    try {
      await sendAdminEmail(subject, text);
    } catch (e) {
      console.error('Email send failed', e);
    }

    // Send applicant confirmation (opt-in via SEND_APPLICANT_CONFIRMATION=1)
    try {
      await sendApplicantEmail(input.email, input.name);
    } catch (e) {
      console.error('Applicant confirmation send failed', e);
    }

    return NextResponse.json({ ok: true, id, created_at });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
