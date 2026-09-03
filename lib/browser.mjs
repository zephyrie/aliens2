// Locate a Chromium binary already in the Playwright cache.
//
// The npm-cached Playwright build often expects a browser revision that was
// never downloaded, so `chromium.launch()` fails with a missing-executable
// error. Pick the newest headless_shell (or full chrome) that actually exists.
import { existsSync, readdirSync } from 'node:fs';

export function findChromium() {
  if (process.env.PW_CHROME) return process.env.PW_CHROME;
  const root = `${process.env.HOME}/.cache/ms-playwright`;
  if (!existsSync(root)) return undefined;
  const rev = d => parseInt(d.split('-').pop(), 10) || 0;
  const dirs = readdirSync(root);
  for (const [prefix, bin] of [
    ['chromium_headless_shell-', 'chrome-linux/headless_shell'],
    ['chromium-', 'chrome-linux/chrome'],
  ]) {
    const hit = dirs
      .filter(d => d.startsWith(prefix))
      .sort((a, b) => rev(b) - rev(a))
      .map(d => `${root}/${d}/${bin}`)
      .find(existsSync);
    if (hit) return hit;
  }
}
