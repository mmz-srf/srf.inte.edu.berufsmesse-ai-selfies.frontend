import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';
import path from 'path';
import { backgroundResolutions } from './config';

// Weight per file in public/fonts; there is no Light file, so weight 300 falls back to Regular
const FONT_FILES: { file: string; weight: number }[] = [
  { file: 'SRGSSRType_Rg.ttf', weight: 400 },
  { file: 'SRGSSRType_Md.ttf', weight: 500 },
  { file: 'SRGSSRType_Bd.ttf', weight: 700 },
];

let fontFaceCss: string | undefined;

// Embed the fonts as data URLs, since the page created by setContent cannot load files from the Next.js server
function getFontFaceCss(): string {
  if (!fontFaceCss) {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    fontFaceCss = FONT_FILES.map(({ file, weight }) => {
      const base64 = readFileSync(path.join(fontsDir, file)).toString('base64');
      return `@font-face { font-family: 'SRG SSR Type'; src: url(data:font/ttf;base64,${base64}) format('truetype'); font-weight: ${weight}; font-style: normal; }`;
    }).join('\n');
  }
  return fontFaceCss;
}

export async function htmlStringToPng(html: string, resX: number, resY: number): Promise<string> {
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

    await page.setViewport({ width: resX, height: resY });

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

    await page.setContent(`<style>${getFontFaceCss()}</style>${html}`, {
      waitUntil: 'domcontentloaded',
      timeout: 8000
    });
    await page.waitForNetworkIdle({ timeout: 8000 });

    await page.addStyleTag({
      content: 'html, body { margin: 0 !important; padding: 0 !important; background: transparent !important; } *, *::before, *::after { box-sizing: border-box; }'
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