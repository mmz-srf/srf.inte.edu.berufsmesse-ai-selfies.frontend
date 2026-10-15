import { isKnownBackground, readStatistics, recordResult } from '@/app/libs/statistics';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json(await readStatistics(), { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('API /api/statistics error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

// Called by the client once an image was generated successfully. Prints are counted in /api/print directly.
export async function POST(request: Request) {
  try {
    const { background } = await request.json();
    if (!isKnownBackground(background)) {
      return NextResponse.json({ error: 'Missing or unknown background in request body' }, { status: 400 });
    }

    return NextResponse.json(await recordResult(background));
  } catch (err: any) {
    console.error('API /api/statistics error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
