/**
 * Sends the 6-digit code that confirms a marketing opt-in.
 * Plain and short on purpose: the code, how long it lasts, and what to do if
 * the person did not ask for it.
 */

import { Resend } from 'resend';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function sendOptInCodeEmail(input: { to: string; firstName: string; code: string }): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'T3D Studio <reports@3dimensions.guide>';
  const name = escapeHtml(input.firstName.trim() || 'there');

  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #0D0D0E; padding: 24px;">
      <p style="font-size: 16px; line-height: 1.6;">Hi ${name},</p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        Your code to confirm your email for T3D updates is:
      </p>
      <p style="font-size: 32px; letter-spacing: 8px; font-weight: 700; margin: 24px 0;">${input.code}</p>
      <p style="font-size: 14px; line-height: 1.6; color: #555;">
        It works for 15 minutes. If you did not ask for this, ignore this email.
        You will not be added to anything.
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #888;">
        Questions? Reach us at
        <a href="mailto:privacy@3dimensions.guide" style="color: #1F8A4D;">privacy@3dimensions.guide</a>.
      </p>
    </div>`;

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: input.to,
    subject: `Your T3D confirmation code: ${input.code}`,
    html,
    text: `Your code to confirm your email for T3D updates is ${input.code}. It works for 15 minutes. If you did not ask for this, ignore this email.`,
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
}
