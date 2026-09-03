// YouTube search scraper via Playwright.
// Usage: node pipeline/search_youtube.mjs "query" [--max 40] [--json out.json] [--sort relevance|date|views]
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { findChromium } from '../lib/browser.mjs';


const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? def : argv[i + 1];
};
const query = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--')).join(' ');
if (!query) { console.error('usage: node yt-search.mjs "query" [--max N] [--json out.json] [--sort date|views]'); process.exit(1); }

const MAX = parseInt(flag('max', '40'), 10);
const OUT = flag('json', null);
// YouTube's search filter param (sp=) for sort order.
const SORT = { relevance: '', date: 'CAISBAgCEAE%253D', views: 'CAMSBAgCEAE%253D' }[flag('sort', 'relevance')] ?? '';

const browser = await chromium.launch({ headless: true, executablePath: findChromium() });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  locale: 'en-US',
  viewport: { width: 1400, height: 1000 },
});
// Pre-set the consent cookie so the EU/GDPR interstitial never appears.
await ctx.addCookies([{ name: 'SOCS', value: 'CAI', domain: '.youtube.com', path: '/' }]);
const page = await ctx.newPage();

const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${SORT ? `&sp=${SORT}` : ''}`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

// Consent wall fallback, in case the cookie wasn't honored.
const consent = page.locator('button[aria-label*="Accept"], button:has-text("Accept all")').first();
if (await consent.count().catch(() => 0)) await consent.click({ timeout: 3000 }).catch(() => {});

await page.waitForSelector('ytd-video-renderer, ytd-rich-item-renderer', { timeout: 30000 });

const scrape = () => page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer')) {
    const a = el.querySelector('a#video-title, a#thumbnail[href*="/watch"]');
    const href = a?.getAttribute('href');
    if (!href?.includes('/watch')) continue;
    const id = new URL(href, 'https://www.youtube.com').searchParams.get('v');
    if (!id) continue;
    const meta = [...el.querySelectorAll('#metadata-line span, .inline-metadata-item')].map(s => s.textContent.trim());
    out.push({
      id,
      url: `https://www.youtube.com/watch?v=${id}`,
      title: (el.querySelector('#video-title')?.getAttribute('title') || a?.textContent || '').trim(),
      channel: el.querySelector('ytd-channel-name #text, .ytd-channel-name a')?.textContent.trim() || null,
      duration: el.querySelector('#time-status, ytd-thumbnail-overlay-time-status-renderer badge-shape')?.textContent.trim().split('\n')[0].trim() || null,
      views: meta[0] || null,
      published: meta[1] || null,
    });
  }
  return out;
});

// Scroll until we hit MAX or the list stops growing.
const seen = new Map();
for (let pass = 0; pass < 25; pass++) {
  for (const v of await scrape()) if (!seen.has(v.id)) seen.set(v.id, v);
  if (seen.size >= MAX) break;
  const before = seen.size;
  await page.keyboard.press('End');
  await page.waitForTimeout(1200);
  for (const v of await scrape()) if (!seen.has(v.id)) seen.set(v.id, v);
  if (seen.size === before) break;
}

const results = [...seen.values()].slice(0, MAX);
await browser.close();

if (OUT) {
  const { writeFileSync } = await import('node:fs');
  writeFileSync(OUT, JSON.stringify({ query, count: results.length, results }, null, 2));
  console.error(`wrote ${results.length} results -> ${OUT}`);
}
for (const [i, r] of results.entries()) {
  console.log(`${String(i + 1).padStart(2)}. ${r.title}`);
  console.log(`    ${r.url}  |  ${r.channel ?? '?'}  |  ${r.duration ?? '?'}  |  ${r.views ?? '?'}  |  ${r.published ?? '?'}`);
}
