import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const {
  GMAIL_CLIENT_EMAIL,
  GMAIL_PRIVATE_KEY,
  GMAIL_IMPERSONATED_USER,
  GMAIL_FROM_ADDRESS,
  ADMIN_ALERT_EMAILS,
  SEND_APPLICANT_CONFIRMATION,
} = process.env as Record<string, string | undefined>;

function getJwtClient() {
  if (!GMAIL_CLIENT_EMAIL || !GMAIL_PRIVATE_KEY || !GMAIL_IMPERSONATED_USER) {
    throw new Error('Missing Gmail service account env vars');
  }

  // Private key may include literal \n when coming from Secret Manager. Normalize.
  const privateKey = GMAIL_PRIVATE_KEY.replace(/\\n/g, '\n');

  return new JWT({
    email: GMAIL_CLIENT_EMAIL,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/gmail.send'],
    subject: GMAIL_IMPERSONATED_USER,
  });
}

// Retry helper with exponential backoff + full jitter for transient Gmail errors
async function sendWithRetry<T>(
  fn: () => Promise<T>,
  meta: Record<string, unknown>,
  maxRetries = 5,
  baseDelayMs = 400
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      // Narrow unknown error to shapes commonly returned by googleapis
      const e = err as {
        code?: number;
        message?: string;
        response?: { status?: number; data?: unknown };
        errors?: Array<{ reason?: string }>;
      } | undefined;
      const status: number | undefined = e?.code ?? e?.response?.status;
      let reasons: string[] = Array.isArray(e?.errors)
        ? e!.errors!.map((x) => x?.reason).filter(Boolean) as string[]
        : [];
      // Some google errors have reasons under response.data.error.errors
      if (reasons.length === 0 && e?.response?.data && typeof e.response.data === 'object') {
        const data = e.response.data as { error?: { errors?: Array<{ reason?: string }> } };
        if (Array.isArray(data?.error?.errors)) {
          reasons = data.error.errors.map((x) => x?.reason).filter(Boolean) as string[];
        }
      }

      const retryable =
        status === 429 ||
        (typeof status === 'number' && status >= 500 && status < 600) ||
        reasons.includes('rateLimitExceeded') ||
        reasons.includes('backendError');

      if (!retryable || attempt >= maxRetries) {
        try {
          console.error(
            JSON.stringify({
              level: 'error',
              msg: 'Gmail send failed',
              attempt,
              maxRetries,
              status,
              reasons,
              error_message: e?.message,
              ...meta,
            })
          );
        } catch {}
        throw err;
      }

      // Full jitter backoff
      const delay = Math.min(30000, Math.random() * baseDelayMs * Math.pow(2, attempt));
      try {
        console.warn(
          JSON.stringify({
            level: 'warn',
            msg: 'Retrying Gmail send',
            attempt,
            next_delay_ms: Math.round(delay),
            status,
            reasons,
            ...meta,
          })
        );
      } catch {}
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export async function sendAdminEmail(subject: string, text: string, html?: string) {
  const jwt = getJwtClient();
  const gmail = google.gmail({ version: 'v1', auth: jwt });

  const to = (ADMIN_ALERT_EMAILS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (to.length === 0) return;

  const raw = buildRawMessage({
    from: (GMAIL_FROM_ADDRESS || GMAIL_IMPERSONATED_USER)!,
    to,
    subject,
    text,
    html,
  });

  const res = await sendWithRetry(
    () =>
      gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
      }),
    { context: 'admin_email', to, subject }
  );

  try {
    const id = res.data.id || null;
    const threadId = res.data.threadId || null;
    // Structured log for Cloud Run
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'Admin email sent via Gmail API',
        gmail_message_id: id,
        gmail_thread_id: threadId,
        to,
        subject,
      })
    );
  } catch {
    // Non-fatal: logging should never break the request
  }
}

export async function sendApplicantEmail(toEmail: string, name?: string) {
  if (SEND_APPLICANT_CONFIRMATION !== '1') return; // opt-in

  const jwt = getJwtClient();
  const gmail = google.gmail({ version: 'v1', auth: jwt });

  const subject = 'We received your Arena Fund submission';
  const text = [
    `Hi${name ? ' ' + name : ''},`,
    '',
    'Thank you for your interest in Arena Fund. We have received your submission and our team will review it shortly.',
    '',
    'Warmly,',
    'Arena Fund',
  ].join('\n');

  const html = [
    `<p>Hi${name ? ' ' + name : ''},</p>`,
    '<p>Thank you for your interest in <strong>Arena Fund</strong>. We have received your submission and our team will review it shortly.</p>',
    '<p>Warmly,<br/>Arena Fund</p>',
  ].join('');

  const raw = buildRawMessage({
    from: (GMAIL_FROM_ADDRESS || GMAIL_IMPERSONATED_USER)!,
    to: [toEmail],
    subject,
    text,
    html,
  });

  const res = await sendWithRetry(
    () =>
      gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
      }),
    { context: 'applicant_email', to: toEmail, subject }
  );

  try {
    const id = res.data.id || null;
    const threadId = res.data.threadId || null;
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'Applicant confirmation email sent',
        gmail_message_id: id,
        gmail_thread_id: threadId,
        to: toEmail,
        subject,
      })
    );
  } catch {}
}

function buildRawMessage(opts: { from: string; to: string[]; subject: string; text: string; html?: string }) {
  const boundary = '__arena_boundary__';
  const headers = [
    `From: ${opts.from}`,
    `To: ${opts.to.join(', ')}`,
    `Subject: ${opts.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join('\r\n');

  const textPart = [
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    '',
    opts.text,
  ].join('\r\n');

  const htmlPart = opts.html
    ? [
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        '',
        opts.html,
      ].join('\r\n')
    : '';

  const footer = `\r\n--${boundary}--`;

  const message = `${headers}\r\n\r\n${textPart}${htmlPart ? '\r\n' + htmlPart : ''}${footer}`;
  return Buffer.from(message).toString('base64url');
}
