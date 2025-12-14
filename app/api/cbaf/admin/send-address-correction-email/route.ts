import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/session';
import { sendEmail, generateAddressCorrectionEmail } from '@/lib/email';

interface InvalidAddress {
  merchantName: string;
  lightningAddress: string;
  provider: string;
  error: string;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const { videoId, economyEmail, economyName, invalidAddresses } = await req.json() as {
      videoId: string;
      economyEmail: string;
      economyName: string;
      invalidAddresses: InvalidAddress[];
    };

    if (!videoId || !economyEmail || !economyName || !invalidAddresses?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate email HTML
    const emailData = generateAddressCorrectionEmail({
      economyName,
      videoTitle: `Video ${videoId.substring(0, 8)}`,
      submittedDate: new Date().toLocaleDateString(),
      invalidMerchants: invalidAddresses.map(addr => ({
        merchantName: addr.merchantName,
        submittedAddress: addr.lightningAddress,
        validationError: addr.error,
      })),
      updateUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://afribitools.com'}/cbaf/videos/submit`,
    });

    // Send email
    const result = await sendEmail({
      to: economyEmail,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      templateType: 'address_correction_request',
      videoId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
