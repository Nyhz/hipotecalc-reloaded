import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

function walk(dir) {
  return readdirSync(dir, {withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]);
}
const files=walk('dist').filter(f=>f.endsWith('.html'));
const regional=files.filter(f=>/^dist\/(en\/)?itp\/[^/]+\/index\.html$/.test(f));
assert.equal(regional.length,36,'18 regional pages in each language');
let jsonLd=0, pictures=0;
for(const f of files) {
  const html=readFileSync(f,'utf8');
  assert.ok(!/IVA equivalente|equivalent VAT|378\.212\s*€|378,212\s*€/.test(html),f+' retired wording');
  for(const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const schema=JSON.parse(match[1]);
    assert.ok(schema && typeof schema==='object',f);
    jsonLd++;
  }
  for(const match of html.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
    for(const value of match[1].split(',')) {
      const url=value.trim().split(/\s+/)[0];
      if(url.startsWith('/img/')) assert.ok(existsSync(join('dist',url)),f+' missing '+url);
    }
  }
  if(regional.includes(f)) {
    assert.ok(html.includes('name="fecha"'),f+' purchase date');
    const foral = /\/(navarra|navarre|pais-vasco|basque-country)\//.test(f);
    assert.ok(html.includes(`name="${foral?'valorForal':'referenciaExiste'}"`),f+' territorial valuation field');
    assert.ok(html.includes('2026-09-06'),f+' fiscal review');
    assert.ok(html.includes('image/webp'),f+' responsive map');
    assert.ok(html.includes('width="1800" height="1238"'),f+' image dimensions');
    pictures++;
  }
}
const calculators=['calculadora-itp','calculadora-hipotecaria','calculadora-alquiler','calculadora-gastos-compraventa','en/itp-calculator','en/mortgage-calculator','en/rental-calculator','en/property-purchase-costs-calculator'];
for(const path of calculators) {
  const html=readFileSync(join('dist',path,'index.html'),'utf8');
  assert.ok(/dateModified[^\n]{0,10}2026-09-06/.test(html),path+' schema review date');
}
console.log(JSON.stringify({htmlPages:files.length,regionalPages:pictures,jsonLdParsed:jsonLd,calculatorDates:calculators.length,missingImages:0,retiredWording:0,regionalRoutes:regional.map(f=>'/'+relative('dist',f).replace(/\/index\.html$/,''))},null,2));
