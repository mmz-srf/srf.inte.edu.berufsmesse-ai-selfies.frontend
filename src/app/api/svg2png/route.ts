import { htmlStringToPng } from '@/app/libs/html2png';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { html } = body;
    if (!html) {
      return NextResponse.json({ error: 'Missing html in request body' }, { status: 400 });
    }

    const base64 = await htmlStringToPng(html);

    return NextResponse.json({ image: base64 });
  } catch (err: any) {
    console.error('API /api/svg2png error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
