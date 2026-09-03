// Batch YouTube search: one browser, many queries, deduped merged output.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { findChromium } from '../lib/browser.mjs';


const queries = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const PER = parseInt(process.env.PER_QUERY || '30', 10);
const OUT = process.argv[3] || 'data/search/sweep.json';

const browser = await chromium.launch({ headless: true, executablePath: findChromium() });
const ctx = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  locale: 'en-US', viewport: { width: 1400, height: 1000 },
});
await ctx.addCookies([{ name: 'SOCS', value: 'CAI', domain: '.youtube.com', path: '/' }]);
const page = await ctx.newPage();

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
      id, url: `https://www.youtube.com/watch?v=${id}`,
      title: (el.querySelector('#video-title')?.getAttribute('title') || a?.textContent || '').trim(),
      channel: el.querySelector('ytd-channel-name #text, .ytd-channel-name a')?.textContent.trim() || null,
      duration: el.querySelector('#time-status, ytd-thumbnail-overlay-time-status-renderer badge-shape')?.textContent.trim().split('\n')[0].trim() || null,
      views: meta[0] || null,
      published: meta[1] || null,
      description: el.querySelector('.metadata-snippet-text, #description-text')?.textContent.trim() || null,
    });
  }
  return out;
});

const all = new Map();
for (const q of queries) {
  process.stderr.write(`search: ${q} ... `);
  try {
    await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('ytd-video-renderer, ytd-rich-item-renderer', { timeout: 25000 });
    const found = new Map();
    for (let pass = 0; pass < 20; pass++) {
      for (const v of await scrape()) if (!found.has(v.id)) found.set(v.id, v);
      if (found.size >= PER) break;
      const before = found.size;
      await page.keyboard.press('End');
      await page.waitForTimeout(1100);
      for (const v of await scrape()) if (!found.has(v.id)) found.set(v.id, v);
      if (found.size === before) break;
    }
    let fresh = 0;
    for (const [id, v] of [...found].slice(0, PER)) {
      if (all.has(id)) { all.get(id).queries.push(q); continue; }
      all.set(id, { ...v, queries: [q] }); fresh++;
    }
    process.stderr.write(`${found.size} found, ${fresh} new (total ${all.size})\n`);
  } catch (e) {
    process.stderr.write(`FAILED: ${e.message.split('\n')[0]}\n`);
  }
}

await browser.close();
const results = [...all.values()];
writeFileSync(OUT, JSON.stringify({ generated: 'batch', queries, count: results.length, results }, null, 2));
console.error(`\n=> ${results.length} unique videos -> ${OUT}`);
