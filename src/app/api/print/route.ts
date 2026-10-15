import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { recordPrint } from '@/app/libs/statistics';

export async function POST(request: Request) {
  try {
    const { image, printerPath } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'Missing image in request body' }, { status: 400 });
    }

    const fileName = `selfie_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
    const filePath = path.join(printerPath, fileName);

    await fs.writeFile(filePath, Buffer.from(image, 'base64'));

    console.log(`Print job written to ${filePath}`);

    // The print job is already queued, so a failing statistics write must not report the print as failed
    await recordPrint().catch((err) => console.error('Failed to record print statistics:', err));

    return NextResponse.json({ fileName });
  } catch (err: any) {
    console.error('API /api/print error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
