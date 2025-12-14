/**
 * Email Client for CBAF Notifications
 * Handles sending emails via Nodemailer (Gmail SMTP) and logging to database
 */

import nodemailer from 'nodemailer';
import { db } from '@/lib/db';
import { emailNotifications } from '@/lib/db/schema';

// Initialize Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  templateType: 'address_correction_request' | 'address_verified' | 'funding_processed';
  economyId?: string;
  videoId?: string;
  sentByAdminId?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Sends an email via Resend and logs to database
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    // Validate SMTP credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('SMTP credentials not configured');

      // Log failed email to database
      await db.insert(emailNotifications).values({
        recipientEmail: params.to,
        recipientName: params.toName,
        templateType: params.templateType,
        subject: params.subject,
        htmlBody: params.html,
        textBody: params.text,
        economyId: params.economyId,
        videoId: params.videoId,
        status: 'failed',
        errorMessage: 'SMTP credentials not configured',
        sentBy: params.sentByAdminId,
      });

      return {
        success: false,
        error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS in environment variables.'
      };
    }

    // Send via Nodemailer
    const info = await transporter.sendMail({
      from: `"CBAF Admin" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });

    // Log successful email to database
    await db.insert(emailNotifications).values({
      recipientEmail: params.to,
      recipientName: params.toName,
      templateType: params.templateType,
      subject: params.subject,
      htmlBody: params.html,
      textBody: params.text,
      economyId: params.economyId,
      videoId: params.videoId,
      status: 'sent',
      providerMessageId: info.messageId,
      sentBy: params.sentByAdminId,
      sentAt: new Date(),
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email send error:', error);

    // Try to log error to database
    try {
      await db.insert(emailNotifications).values({
        recipientEmail: params.to,
        recipientName: params.toName,
        templateType: params.templateType,
        subject: params.subject,
        htmlBody: params.html,
        textBody: params.text,
        economyId: params.economyId,
        videoId: params.videoId,
        status: 'failed',
        errorMessage: error.message || 'Unknown error',
        sentBy: params.sentByAdminId,
      });
    } catch (dbError) {
      console.error('Failed to log email error to database:', dbError);
    }

    return { success: false, error: error.message || 'Unknown error' };
  }
}

/**
 * Generate Address Correction Request Email
 */
export function generateAddressCorrectionEmail(params: {
  economyName: string;
  videoTitle: string;
  submittedDate: string;
  invalidMerchants: Array<{
    merchantName: string;
    submittedAddress: string;
    validationError: string;
  }>;
  updateUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `Action Required: Update Payment Addresses for ${params.economyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #374151;
          margin: 0;
          padding: 0;
          background-color: #F9FAFB;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: #000;
          color: #fff;
          padding: 30px 20px;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          letter-spacing: -0.5px;
        }
        .accent {
          color: #F7931A;
        }
        .content {
          padding: 40px 30px;
        }
        h1 {
          color: #1F2937;
          font-size: 24px;
          margin: 0 0 20px 0;
          font-weight: 600;
        }
        .info-box {
          background: #F9FAFB;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #F7931A;
        }
        .info-box strong {
          color: #1F2937;
        }
        .merchant-error {
          background: #FEE2E2;
          padding: 16px;
          margin: 12px 0;
          border-radius: 8px;
          border-left: 4px solid #DC2626;
        }
        .merchant-name {
          font-weight: 600;
          color: #1F2937;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .address {
          font-family: 'Courier New', monospace;
          color: #6B7280;
          font-size: 14px;
          margin: 4px 0;
        }
        .error-msg {
          color: #DC2626;
          font-size: 14px;
          margin-top: 4px;
          font-weight: 500;
        }
        .button {
          display: inline-block;
          background: #F7931A;
          color: #fff !important;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          margin: 25px 0;
          font-weight: 600;
          font-size: 16px;
        }
        .button:hover {
          background: #E8850B;
        }
        .footer {
          text-align: center;
          color: #6B7280;
          font-size: 14px;
          padding: 30px;
          border-top: 1px solid #E5E7EB;
          background-color: #F9FAFB;
        }
        .footer strong {
          color: #1F2937;
        }
        @media only screen and (max-width: 600px) {
          .content {
            padding: 30px 20px;
          }
          h1 {
            font-size: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CBAF <span class="accent">⚡</span></div>
        </div>

        <div class="content">
          <h1>⚠️ Payment Addresses Need Attention</h1>

          <p>Hi ${params.economyName} Team,</p>

          <p>We reviewed your recent video submission and found issues with some merchant payment addresses. Before we can approve your video and process funding, these addresses need to be corrected.</p>

          <div class="info-box">
            <strong>Video:</strong> ${params.videoTitle}<br>
            <strong>Submitted:</strong> ${params.submittedDate}
          </div>

          <h2 style="color: #DC2626; font-size: 18px; margin-top: 30px;">❌ Invalid Addresses:</h2>

          ${params.invalidMerchants.map(m => `
            <div class="merchant-error">
              <div class="merchant-name">${m.merchantName}</div>
              <div class="address">Submitted: ${m.submittedAddress}</div>
              <div class="error-msg">⚠️ ${m.validationError}</div>
            </div>
          `).join('')}

          <p style="margin-top: 30px;">Please update these addresses so we can process your funding request.</p>

          <div style="text-align: center;">
            <a href="${params.updateUrl}" class="button">Update Addresses</a>
          </div>

          <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
            <strong>Need help?</strong> Reply to this email or contact admin@cbaf.org
          </p>

          <p style="margin-top: 30px;">Best regards,<br>
          <strong>CBAF Admin Team</strong></p>
        </div>

        <div class="footer">
          <strong>Circular Bitcoin Africa Fund</strong><br>
          Building Bitcoin economies across Africa, one merchant at a time 🧡
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
CBAF - Payment Addresses Need Attention

Hi ${params.economyName} Team,

We reviewed your recent video submission and found issues with some merchant payment addresses.

Video: ${params.videoTitle}
Submitted: ${params.submittedDate}

INVALID ADDRESSES:

${params.invalidMerchants.map(m => `
${m.merchantName}
Submitted: ${m.submittedAddress}
Issue: ${m.validationError}
`).join('\n')}

Please update these addresses: ${params.updateUrl}

Need help? Reply to this email or contact admin@cbaf.org

Best regards,
CBAF Admin Team

---
Circular Bitcoin Africa Fund
Building Bitcoin economies across Africa, one merchant at a time
  `.trim();

  return { subject, html, text };
}

/**
 * Generate Address Verified Email
 */
export function generateAddressVerifiedEmail(params: {
  economyName: string;
  videoTitle: string;
  merchantCount: number;
  approvedDate: string;
  merchants: Array<{
    merchantName: string;
    lightningAddress: string;
    provider: string;
  }>;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `✅ Video Approved - Funding Processing for ${params.economyName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #374151;
          margin: 0;
          padding: 0;
          background-color: #F9FAFB;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: #000;
          color: #fff;
          padding: 30px 20px;
          text-align: center;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
        }
        .accent {
          color: #F7931A;
        }
        .content {
          padding: 40px 30px;
        }
        h1 {
          color: #10B981;
          font-size: 24px;
          margin: 0 0 20px 0;
          font-weight: 600;
        }
        .info-box {
          background: #F9FAFB;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #10B981;
        }
        .merchant-list {
          background: #F9FAFB;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .merchant-item {
          padding: 12px 0;
          border-bottom: 1px solid #E5E7EB;
        }
        .merchant-item:last-child {
          border-bottom: none;
        }
        .button {
          display: inline-block;
          background: #F7931A;
          color: #fff !important;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          margin: 25px 0;
          font-weight: 600;
          font-size: 16px;
        }
        .footer {
          text-align: center;
          color: #6B7280;
          font-size: 14px;
          padding: 30px;
          border-top: 1px solid #E5E7EB;
          background-color: #F9FAFB;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CBAF <span class="accent">⚡</span></div>
        </div>

        <div class="content">
          <h1>✅ Great News! Video Approved</h1>

          <p>Hi ${params.economyName} Team,</p>

          <p>Your video submission has been approved and all merchant payment addresses have been verified! 🎉</p>

          <div class="info-box">
            <strong>Video:</strong> ${params.videoTitle}<br>
            <strong>Merchants:</strong> ${params.merchantCount}<br>
            <strong>Approved:</strong> ${params.approvedDate}
          </div>

          <h2 style="color: #1F2937; font-size: 18px;">⚡ Verified Payment Addresses:</h2>

          <div class="merchant-list">
            ${params.merchants.map(m => `
              <div class="merchant-item">
                • <strong>${m.merchantName}</strong> → <code style="background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">${m.lightningAddress}</code> <span style="color: #6B7280;">(${m.provider})</span>
              </div>
            `).join('')}
          </div>

          <h3 style="color: #1F2937; font-size: 16px;">Next Steps:</h3>
          <ol style="padding-left: 20px; color: #4B5563;">
            <li>Your submission enters the monthly funding calculation</li>
            <li>Super admin processes batch payments at month-end</li>
            <li>Merchants receive funds directly to their verified addresses</li>
          </ol>

          <div style="text-align: center;">
            <a href="${params.dashboardUrl}" class="button">View Dashboard</a>
          </div>

          <p style="margin-top: 30px;">Keep up the great work! 🧡</p>

          <p>Best regards,<br>
          <strong>CBAF Admin Team</strong></p>
        </div>

        <div class="footer">
          <strong>Circular Bitcoin Africa Fund</strong><br>
          Building Bitcoin economies across Africa, one merchant at a time
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
CBAF - Video Approved!

Hi ${params.economyName} Team,

Your video submission has been approved and all merchant payment addresses have been verified!

Video: ${params.videoTitle}
Merchants: ${params.merchantCount}
Approved: ${params.approvedDate}

VERIFIED PAYMENT ADDRESSES:

${params.merchants.map(m => `• ${m.merchantName} → ${m.lightningAddress} (${m.provider})`).join('\n')}

NEXT STEPS:
1. Your submission enters the monthly funding calculation
2. Super admin processes batch payments at month-end
3. Merchants receive funds directly

View Dashboard: ${params.dashboardUrl}

Keep up the great work! 🧡

Best regards,
CBAF Admin Team

---
Circular Bitcoin Africa Fund
Building Bitcoin economies across Africa, one merchant at a time
  `.trim();

  return { subject, html, text };
}
