import fs from 'fs';

const PHOTO_PATH = '/home/pi/photos/latest.jpg';

export async function GET() {
  try {
    const file = fs.readFileSync(PHOTO_PATH);
    
    return new Response(file, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'no-store',
      }
    });
  } catch {
    return new Response('No photo yet', { status: 404 });
  }
}