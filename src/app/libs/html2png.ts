import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function htmlStringToPng(html: string, baseUrl?: string): Promise<string> {
  let browser;
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        ...( { ignoreHTTPSErrors: true } as any ),
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--ignore-certificate-errors',
        '--allow-insecure-localhost'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 670, height: 938 });

    page.on('requestfailed', (req) => {
      console.warn('Request failed:', req.url(), req.failure()?.errorText);
    });
    page.on('response', (res) => {
      const status = res.status();
      if (status >= 400) {
        console.warn('Non-OK response:', res.url(), status);
      }
    });

    // Forward browser console messages to server logs for debugging
    page.on('console', (msg) => {
      try {
        const text = msg.text();
        console.log('PAGE CONSOLE:', text);
      } catch (e) {
        console.log('PAGE CONSOLE (err reading)');
      }
    });

    await page.setRequestInterception(true);
    page.on('request', (request) => request.continue());

    let content = html;
    try {
      const hasBase = /<base\s+href=["']?[^>]+>/i.test(html);
      const resolvedBase = baseUrl || process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL;
      if (!hasBase && resolvedBase) {
        if (/<head[\s>]/i.test(html)) {
          content = html.replace(/(<head[^>]*>)/i, `$1<base href="${resolvedBase}" />`);
        } else {
          content = `<head><base href="${resolvedBase}" /></head>` + html;
        }
      }
      content = content.replace(/(<img[^>]+src=["'])(\/images\/["'a-zA-Z0-9_\-\/\.]+)(["'][^>]*>)/gi, (m, pre, src, post) => {
        try {
          const rel = src.replace(/^\//, '');
          const filePath = path.join(process.cwd(), 'public', rel);
          if (fs.existsSync(filePath)) {
            const buf = fs.readFileSync(filePath);
            const ext = path.extname(filePath).toLowerCase().replace('.', '') || 'png';
            const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
            const data = `data:${mime};base64,${buf.toString('base64')}`;
            return `${pre}${data}${post}`;
          }
        } catch (e) {
        }
        return m;
      });
    } catch (e) {
      console.error('Error injecting base tag:', e);
    }

    // Allow more time for slow resources; 30s
    await page.setContent(content, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });

    await page.addStyleTag({
      content: 'html, body { margin: 0 !important; padding: 0 !important; } *, *::before, *::after { box-sizing: border-box; }'
    });

    await page.evaluate(() => {
      try {
        if (document && document.documentElement) {
          (document.documentElement.style as any).margin = '0';
          (document.documentElement.style as any).padding = '0';
        }
        if (document && document.body) {
          (document.body.style as any).margin = '0';
          (document.body.style as any).padding = '0';
        }
      } catch (e) {
        console.error('Error setting document styles:', e);
      }
    });

    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 1000));

    const screenshot = await page.screenshot({ 
      encoding: "base64",
      type: 'png',
      fullPage: true
    });
    
    return screenshot;
  } catch (error) {
    console.error('Fehler beim Erstellen des Screenshots:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}