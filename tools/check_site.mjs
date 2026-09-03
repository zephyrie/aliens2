import { chromium } from 'playwright';
import { findChromium } from '../lib/browser.mjs';
const b=await chromium.launch({headless:true,executablePath: findChromium()});
const errs=[];
for (const vp of [{width:1500,height:1000,n:'desktop'},{width:390,height:844,n:'mobile'}]) {
  const p=await(await b.newContext({viewport:{width:vp.width,height:vp.height}})).newPage();
  p.on('pageerror',e=>errs.push(`${vp.n} PAGEERROR: ${e.message}`));
  p.on('console',m=>{if(m.type()==='error')errs.push(`${vp.n} ${m.text()}`)});
  for (const r of ['','duelist','marauder','machinist','hunter','medic','specialist','weapons','gear']) {
    await p.goto(`http://127.0.0.1:8899/#/${r}`,{waitUntil:'domcontentloaded'});
    await p.waitForTimeout(450);
    const m=await p.evaluate(()=>({
      h:document.getElementById('main').innerText.length,
      tiles:document.querySelectorAll('.tile').length,
      emb:document.querySelectorAll('.emb').length,
      ovf:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,
      brokenImgs:[...document.querySelectorAll('img')].filter(i=>i.complete&&i.naturalWidth===0).length,
    }));
    if(m.h<300) errs.push(`${vp.n} #/${r} nearly empty (${m.h} chars)`);
    if(m.ovf) errs.push(`${vp.n} #/${r} HORIZONTAL OVERFLOW`);
    if(m.brokenImgs) errs.push(`${vp.n} #/${r} ${m.brokenImgs} broken images`);
    if(vp.n==='desktop') console.log(`  #/${r||'(overview)'} — ${m.h} chars, ${m.tiles} tiles, ${m.emb} embeds`);
  }
  await p.close();
}
console.log('\nISSUES:', errs.length?errs:'none');
await b.close();
