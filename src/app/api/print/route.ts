import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

// Mount point of the Raspberry Pi share smb://192.168.10.168/to_printer on the machine running Next.js.
// The Pi picks up every file dropped into this folder and prints it.
const PRINT_DIR = process.env.PRINT_DIR || '/mnt/to_printer';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ error: 'Missing image in request body' }, { status: 400 });
    }

    const fileName = `selfie_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    const filePath = path.join(PRINT_DIR, fileName);
    const tmpPath = `${filePath}.part`;

    await fs.writeFile(tmpPath, Buffer.from(image, 'base64'));
    await fs.rename(tmpPath, filePath);

    console.log(`Print job written to ${filePath}`);
    return NextResponse.json({ fileName });
  } catch (err: any) {
    console.error('API /api/print error:', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}
