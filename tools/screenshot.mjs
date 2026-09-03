import { chromium } from 'playwright';
import { findChromium } from '../lib/browser.mjs';
const b = await chromium.launch({ headless: true, executablePath: findChromium() });
const p = await (await b.newContext({viewport:{width:1500,height:1100},deviceScaleFactor:1})).newPage();
const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
for (const [hash,name] of [['#/','overview'],['#/marauder','marauder'],['#/hunter','hunter'],['#/gear','gear']]) {
  await p.goto('http://127.0.0.1:8899/'+hash, {waitUntil:'networkidle'});
  await p.waitForTimeout(900);
  await p.screenshot({path:`/tmp/shot_${name}.png`, fullPage:false});
}
// measure a class page
await p.goto('http://127.0.0.1:8899/#/marauder',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
console.log(JSON.stringify(await p.evaluate(()=>({
  builds:document.querySelectorAll('.card .tier').length,
  tiles:document.querySelectorAll('.tile').length,
  sidelists:document.querySelectorAll('.sidelist').length,
  weapons:document.querySelectorAll('.wpn').length,
  embeds:document.querySelectorAll('.emb').length,
  imgs:document.querySelectorAll('.gal img').length,
  scrollW:document.documentElement.scrollWidth, clientW:document.documentElement.clientWidth,
})),null,1));
console.log('ERRORS:', errs.length?errs.slice(0,6):'none');
await b.close();
