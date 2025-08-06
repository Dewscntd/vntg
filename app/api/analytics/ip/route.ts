import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    // Determine the client IP
    let clientIp = '127.0.0.1'; // Default fallback

    if (cfConnectingIp) {
      // Cloudflare
      clientIp = cfConnectingIp;
    } else if (forwarded) {
      // X-Forwarded-For can contain multiple IPs, get the first one
      clientIp = forwarded.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    }

    // Basic IP validation
    const ipPattern =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(clientIp)) {
      clientIp = '127.0.0.1';
    }

    // Get additional client information
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const country =
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-vercel-ip-country') ||
      'Unknown';

    // Response data
    const responseData = {
      ip: clientIp,
      country: country,
      userAgent: userAgent,
      language: acceptLanguage,
      timestamp: new Date().toISOString(),
      headers: {
        'x-forwarded-for': forwarded,
        'x-real-ip': realIp,
        'cf-connecting-ip': cfConnectingIp,
        'cf-ipcountry': request.headers.get('cf-ipcountry'),
        'x-vercel-ip-country': request.headers.get('x-vercel-ip-country'),
      },
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error getting IP information:', error);
    return NextResponse.json(
      {
        error: 'Failed to get IP information',
        ip: '127.0.0.1',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // For analytics tracking with IP
    const body = await request.json();

    // Get IP information (same logic as GET)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');

    let clientIp = '127.0.0.1';

    if (cfConnectingIp) {
      clientIp = cfConnectingIp;
    } else if (forwarded) {
      clientIp = forwarded.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    }

    // Validate IP format
    const ipPattern =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(clientIp)) {
      clientIp = '127.0.0.1';
    }

    // Here you would typically save the analytics event with IP
    // For now, just return success with the IP information
    const analyticsData = {
      ...body,
      ip: clientIp,
      country:
        request.headers.get('cf-ipcountry') ||
        request.headers.get('x-vercel-ip-country') ||
        'Unknown',
      userAgent: request.headers.get('user-agent') || '',
      timestamp: new Date().toISOString(),
    };

    // In a real implementation, you would save this to your analytics database
    console.log('Analytics event with IP:', analyticsData);

    return NextResponse.json({
      success: true,
      message: 'Analytics event tracked successfully',
      data: analyticsData,
    });
  } catch (error) {
    console.error('Error tracking analytics with IP:', error);
    return NextResponse.json({ error: 'Failed to track analytics event' }, { status: 500 });
  }
}
