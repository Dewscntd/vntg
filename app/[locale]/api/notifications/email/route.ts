import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { successResponse, errorResponse, handleDatabaseError } from '@/lib/api/index';

// Lazy initialization to avoid build-time errors
const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(process.env.RESEND_API_KEY);
};

// POST /api/notifications/email - Send email notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, templateId, userId } = body;

    if (!to || !subject || !html) {
      return errorResponse('Missing required fields: to, subject, html', 400);
    }

    // Send email
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: 'Peakees <notifications@peakees.com>',
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return errorResponse('Failed to send email', 500);
    }

    return successResponse({
      message: 'Email sent successfully',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Email notification error:', error);
    return handleDatabaseError(error as Error);
  }
}
