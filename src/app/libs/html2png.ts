import puppeteer from 'puppeteer';

export async function htmlStringToPng(html: string): Promise<string> {
  let browser;
  
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--ignore-certificate-errors',
        '--allow-insecure-localhost'
      ]
    } as any);
    
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
    page.on('request', (request) => {
      request.continue();
    });

    await page.setContent(html, {
      waitUntil: 'domcontentloaded',
      timeout: 8000
    });
    await page.waitForNetworkIdle({ timeout: 8000 });

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