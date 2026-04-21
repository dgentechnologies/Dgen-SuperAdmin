import { Resend } from 'resend';

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: EmailPayload) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { error } = await resend.emails.send({
    from: from ?? process.env.EMAIL_FROM!,
    to: Array.isArray(to) ? to : [to],
    subject,
    html
  });

  if (error) {
    throw new Error(`Email failed: ${error.message}`);
  }
}
