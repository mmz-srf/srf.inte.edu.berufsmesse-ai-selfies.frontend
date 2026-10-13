import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { image, printerPath } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'Missing image in request body' }, { status: 400 });
    }

    const fileName = `selfie_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    const filePath = path.join(printerPath, fileName);

    await fs.writeFile(filePath, Buffer.from(image, 'base64'));

    console.log(`Print job written to ${filePath}`);
    return NextResponse.json({ fileName });
  } catch (err: any) {
    console.error('API /api/print error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
