import { chromium } from 'playwright';
import { findChromium } from '../lib/browser.mjs';
const b=await chromium.launch({headless:true,executablePath: findChromium()});
const p=await(await b.newContext({viewport:{width:1500,height:1050}})).newPage();
const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message));
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});

await p.goto('http://127.0.0.1:8899/#/marauder',{waitUntil:'networkidle'});
await p.waitForTimeout(800);
const st=async()=>p.evaluate(()=>({
  tabs:[...document.querySelectorAll('.tab')].map(t=>t.querySelector('.tn').textContent),
  active:document.querySelector('.tab.on')?.querySelector('.tn').textContent,
  shown:document.querySelector('.card .hd h3')?.textContent,
  cards:document.querySelectorAll('.card>.hd .tier').length,
  navOn:document.querySelector('nav a.item.on')?.textContent.trim(),
}));
console.log('marauder default:', JSON.stringify(await st()));
await p.screenshot({path:'/tmp/tabs1.png',clip:{x:250,y:0,width:1250,height:620}});

// click the 3rd tab
await p.locator('.tab').nth(2).click();
await p.waitForTimeout(600);
console.log('after click tab3:', JSON.stringify(await st()));
console.log('url:', await p.evaluate(()=>location.hash));

// deep link straight to a build
await p.goto('http://127.0.0.1:8899/#/hunter/hunter-pike',{waitUntil:'networkidle'});
await p.waitForTimeout(700);
console.log('deep link hunter-pike:', JSON.stringify(await st()));

// single-build class should show no tab strip
await p.goto('http://127.0.0.1:8899/#/medic',{waitUntil:'networkidle'});
await p.waitForTimeout(500);
console.log('medic (1 build) tabs:', await p.evaluate(()=>document.querySelectorAll('.tab').length));
console.log('ERRORS:',errs.length?errs.slice(0,5):'none');
await b.close();
