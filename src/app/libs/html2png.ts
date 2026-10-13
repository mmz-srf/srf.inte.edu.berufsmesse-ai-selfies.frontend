import puppeteer from 'puppeteer';

// Overlay SVGs declare their own canvas via viewBox="0 0 W H" (in SVG user units,
// which map 1:1 to CSS px at the default 96dpi). Rendering at any other viewport
// size stretches/squishes the SVG's own layout, since it has no width/height
// attributes of its own to anchor to.
function extractSvgViewportSize(html: string): { width: number; height: number } | null {
  const match = html.match(/viewBox=["']\s*[\d.-]+\s+[\d.-]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  if (!match) {
    return null;
  }
  const width = Math.ceil(parseFloat(match[1]));
  const height = Math.ceil(parseFloat(match[2]));
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  return { width, height };
}

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
    const svgViewportSize = extractSvgViewportSize(html);
    await page.setViewport(svgViewportSize ?? { width: 670, height: 938 });

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

    // The overlay SVGs reference the SRF corporate font by name (SRGSSRType-Bold/-Medium/
    // -Regular/-Light) but never declare @font-face, so headless Chromium has no way to
    // find those files and silently falls back to a default font. There's no dedicated
    // Light weight file, so it falls back to Regular.
    await page.addStyleTag({
      content: `
        @font-face { font-family: 'SRGSSRType-Bold'; src: url('http://localhost:3000/fonts/SRGSSRType_Bd.ttf') format('truetype'); font-weight: 700; }
        @font-face { font-family: 'SRGSSRType-Medium'; src: url('http://localhost:3000/fonts/SRGSSRType_Md.ttf') format('truetype'); font-weight: 500; }
        @font-face { font-family: 'SRGSSRType-Regular'; src: url('http://localhost:3000/fonts/SRGSSRType_Rg.ttf') format('truetype'); font-weight: 400; }
        @font-face { font-family: 'SRGSSRType-Light'; src: url('http://localhost:3000/fonts/SRGSSRType_Rg.ttf') format('truetype'); font-weight: 300; }
      `
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
      fullPage: true,
      omitBackground: true
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