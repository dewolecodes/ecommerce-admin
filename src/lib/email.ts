type EmailPayload = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'no-reply@localhost';

export async function sendEmail(payload: EmailPayload) {
  if (!SENDGRID_API_KEY) {
    throw new Error('Missing SENDGRID_API_KEY in server env');
  }

  const body = {
    personalizations: [
      {
        to: [{ email: payload.to }],
        subject: payload.subject,
      },
    ],
    from: { email: payload.from || SENDGRID_FROM },
    content: [],
  } as any;

  if (payload.html) body.content.push({ type: 'text/html', value: payload.html });
  if (payload.text) body.content.push({ type: 'text/plain', value: payload.text });

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SendGrid error: ${res.status} ${text}`);
  }
  return true;
}
