import fs from 'fs';

const PHOTO_DIR = '/home/berufsmesse/photos';
const clients = new Set<ReadableStreamDefaultController<string>>();

fs.watch(PHOTO_DIR, (event, filename) => {
  if (filename === 'latest.jpg') {
    const timestamp = Date.now();
    clients.forEach((controller) => {
      try {
        controller.enqueue(`data: ${timestamp}\n\n`);
      } catch {
        clients.delete(controller);
      }
    });
  }
});

export async function GET() {
  const stream = new ReadableStream<string>({
    start(controller: ReadableStreamDefaultController<string>) {
      clients.add(controller);
    },
    cancel(controller: ReadableStreamDefaultController<string>) {
      clients.delete(controller);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}