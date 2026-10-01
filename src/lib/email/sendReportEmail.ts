/**
 * T3D Report Email Delivery
 *
 * Sends the completed report deliverable as an email attachment via
 * Resend, with a direct download link included as a backup — some
 * corporate email systems strip attachments, so the link matters.
 *
 * Product-agnostic: the deliverable can be a single PDF (Base Report,
 * Advanced Report) or a zip bundle (the complete Sovereign Report), so
 * the body copy and the Resend attachment's contentType are both driven
 * by the caller-supplied contentType rather than assuming PDF.
 */

import { Resend } from 'resend';

interface SendReportEmailInput {
  to:          string;
  firstName:   string;
  pdfBuffer:   Buffer;
  downloadUrl: string;
  /** e.g. "Sovereign Report", "Advanced Sovereign Report" — defaults to the Sovereign Report for backward compatibility. */
  productName?: string;
  /** Attachment filename, e.g. "T3D-Sovereign-Report-Jane.pdf" — defaults to the Sovereign Report's naming pattern. */
  filename?:    string;
  /** MIME type of the attachment, e.g. "application/pdf" or "application/zip" — defaults to "application/pdf" for backward compatibility. */
  contentType?: string;
}

export async function sendReportEmail({
  to,
  firstName,
  pdfBuffer,
  downloadUrl,
  productName = 'Sovereign Report',
  filename,
  contentType = 'application/pdf',
}: SendReportEmailInput): Promise<void> {
  // Constructed here, not at module scope — this ensures Resend is only
  // instantiated at actual send time, never as a side effect of Next.js
  // importing this module during build-time page-data collection.
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'T3D Studio <reports@3dimensions.guide>';

  // "It's attached to this email as a PDF" is wrong for the zip-bundle
  // Sovereign Report — generalize by what's actually attached.
  const attachmentNoun = contentType === 'application/zip' ? 'a zip file with both reports inside' : 'a PDF';

  const html = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0D0D0E;">
      <div style="background-color: #0D0D0E; padding: 32px 24px; text-align: center;">
        <p style="color: #F5F5F3; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin: 0; opacity: 0.6;">
          T3D · The ${productName}
        </p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Dear ${firstName},
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #333; margin-bottom: 20px;">
          Your complete ${productName} is ready — Human Design, Numerology,
          and Astrology, woven into one navigation guide built specifically
          for your exact configuration.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #333; margin-bottom: 28px;">
          It's attached to this email as ${attachmentNoun}. If for any reason the
          attachment doesn't come through, you can also download it directly:
        </p>
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${downloadUrl}"
             style="display: inline-block; background-color: #991B1B; color: #F5F5F3;
                    padding: 14px 32px; text-decoration: none; font-size: 13px;
                    letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">
            Download My Report
          </a>
        </div>
        <p style="font-size: 13px; line-height: 1.6; color: #888;">
          Questions? Just reply to this email, or reach us at
          <a href="mailto:privacy@3dimensions.guide" style="color: #1F8A4D;">privacy@3dimensions.guide</a>.
        </p>
      </div>
    </div>
  `;

  await resend.emails.send({
    from:    fromAddress,
    to,
    subject: `Your T3D ${productName} is ready`,
    html,
    attachments: [
      {
        filename:     filename || `T3D-Sovereign-Report-${firstName}.pdf`,
        content:      pdfBuffer.toString('base64'),
        contentType,
      },
    ],
  });
}
