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
    await page.setViewport({ width: 1200, height: 800 });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      request.continue();
    });

    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 8000 // TODO: adjust time (8s is way too long)
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