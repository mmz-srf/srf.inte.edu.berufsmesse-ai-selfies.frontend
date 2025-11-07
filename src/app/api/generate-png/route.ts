import { NextResponse } from 'next/server';
import { htmlStringToPng } from '@/app/libs/html2png';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { html } = body;
    if (!html) {
      return NextResponse.json({ error: 'Missing html in request body' }, { status: 400 });
    }

  const origin = request.headers.get('origin') || 'https://192.168.2.1:3000';
  const base64 = await htmlStringToPng(html, origin);

    return NextResponse.json({ image: base64 });
  } catch (err: any) {
    console.error('API /api/generate-png error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
