import puppeteer from 'puppeteer';

export async function htmlStringToPng(html: string): Promise<string> {
  let browser;
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 670, height: 938 });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      request.continue();
    });

    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 8000 // TODO: adjust time (8s is way too long)
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
        // ignore
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