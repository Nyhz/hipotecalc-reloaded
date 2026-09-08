import { test } from 'node:test';
import assert from 'node:assert/strict';
import { data, completeQuarters, latestQuarter, ranking, summary, reportSource, reportQuarters, csv, datasetSchema } from '../../src/analytics/model';
import { change, median, previousQuarter, observation } from '../../src/analytics/metrics';
import { analyticsAlternate, base, reportPath } from '../../src/analytics/routes';
import { pages } from '../../src/analytics/pages';
import { chartSVG } from '../../src/analytics/images';
import { initialRankingSort, nextRankingSort, sortRankingRows, type SortKey, type SortableRankingRow } from '../../src/analytics/sorting';
const close = (actual:number,expected:number,tolerance=1e-8) => assert.ok(Math.abs(actual-expected)<tolerance,`${actual} ≠ ${expected}`);

test('quarterly images keep their period and sources without editorial production metadata',()=>{
  for(const lang of ['es','en'] as const) for(const q of reportQuarters){
    const svg=chartSVG(q,lang,reportSource(q));
    assert.ok(!/reconstrucción retrospectiva|retrospective reconstruction|corte de datos|data cutoff/i.test(svg));
    assert.ok(!svg.includes(data.sourceCutoff));
    assert.ok(svg.includes(q));
    assert.ok(svg.includes('Idealista')&&svg.includes('INE'));
    assert.ok(svg.includes(lang==='es'?'renta anual estimada':'estimated annual household income'));
    assert.ok(svg.includes('hipotecalc.com'));
  }
});

test('header clicks choose sensible defaults and toggle direction',()=>{
  assert.deepEqual(nextRankingSort(initialRankingSort,'rank'),{key:'rank',direction:'desc'});
  assert.deepEqual(nextRankingSort(initialRankingSort,'name'),{key:'name',direction:'asc'});
  for(const key of ['index','price','income','qoq','yoy'] as const){
    const next=nextRankingSort(initialRankingSort,key);
    assert.deepEqual(next,{key,direction:'desc'});
    assert.deepEqual(nextRankingSort(next,key),{key,direction:'asc'});
  }
});

test('numeric sorting uses numbers and full precision, not formatted text',()=>{
  const rows:SortableRankingRow[]=[
    {code:'1',rank:1,name:'A',index:10.001,qoq:-.03},
    {code:'2',rank:2,name:'B',index:10.0009,qoq:.02},
    {code:'3',rank:3,name:'C',index:2,qoq:0},
  ];
  assert.deepEqual(sortRankingRows(rows,{key:'index',direction:'asc'},'es').map(r=>r.code),['3','2','1']);
  assert.deepEqual(sortRankingRows(rows,{key:'qoq',direction:'asc'},'es').map(r=>r.code),['1','3','2']);
  assert.deepEqual(sortRankingRows(rows,{key:'qoq',direction:'desc'},'es').map(r=>r.code),['2','3','1']);
  assert.deepEqual(rows.map(r=>r.rank),[1,2,3]);
});

test('missing values stay last and tied values preserve official ranks',()=>{
  const rows:SortableRankingRow[]=[
    {code:'1',rank:1,name:'A',index:10,qoq:null},
    {code:'2',rank:2,name:'B',index:9,qoq:.02},
    {code:'3',rank:3,name:'C',index:8,qoq:.02},
    {code:'4',rank:4,name:'D',index:7,qoq:0},
  ];
  assert.deepEqual(sortRankingRows(rows,{key:'qoq',direction:'asc'},'es').map(r=>r.rank),[4,2,3,1]);
  assert.deepEqual(sortRankingRows(rows,{key:'qoq',direction:'desc'},'es').map(r=>r.rank),[2,3,4,1]);
  assert.deepEqual(sortRankingRows(rows,{key:'yoy',direction:'desc'},'es').map(r=>r.rank),[1,2,3,4]);
});

for(const lang of ['es','en'] as const) test(`all quarters/columns sort without changing ranks or input (${lang})`,()=>{
  const keys:SortKey[]=['rank','name','index','price','income','qoq','yoy'];
  const collator=new Intl.Collator(lang,{sensitivity:'base'});
  for(const q of reportQuarters){
    const rows=ranking(q), original=JSON.stringify(rows);
    for(const key of keys) for(const direction of ['asc','desc'] as const){
      const sorted=sortRankingRows(rows,{key,direction},lang);
      assert.equal(sorted.length,100);
      assert.equal(new Set(sorted.map(r=>r.code)).size,100);
      for(let i=1;i<sorted.length;i++){
        const a=sorted[i-1][key],b=sorted[i][key];
        if(b===null)continue;
        assert.notEqual(a,null);
        const delta=typeof a==='string'&&typeof b==='string'?collator.compare(a,b):Number(a)-Number(b);
        assert.ok(direction==='asc'?delta<=0:delta>=0,`${q}/${key}/${direction}`);
      }
      assert.equal(sorted.find(r=>r.code===rows[0].code)!.rank,1);
    }
    assert.equal(JSON.stringify(rows),original);
  }
});

test('sorting a filtered subset retains its ranks in the complete universe',()=>{
  const filtered=ranking('2026Q1').filter(r=>r.province==='Málaga');
  const sorted=sortRankingRows(filtered,{key:'name',direction:'asc'},'es');
  assert.equal(sorted.length,7);
  assert.equal(sorted.find(r=>r.name==='Marbella')!.rank,1);
  assert.ok(sorted.some(r=>r.rank>7));
});

test('fixed universe, unique keys and correct availability',()=>{
  assert.equal(data.cities.length,100);
  assert.equal(new Set(data.cities.map(c=>c.code)).size,100);
  assert.equal(data.factors.length,15);
  assert.equal(completeQuarters().length,13);
  assert.equal(latestQuarter,'2026Q1');
  const all=data.cities.flatMap(c=>c.observations);
  assert.equal(all.length,1500);
  assert.equal(all.filter(o=>o.index!==null).length,1300);
  assert.equal(all.filter(o=>o.index===null).length,200);
  assert.equal(all.filter(o=>o.quarter==='2026Q3'&&o.priceMonths===1).length,1);
  assert.equal(data.cities.find(c=>c.name.includes('Santiago'))!.observations.at(-1)!.priceMonths,1);
});
for (const city of data.cities) test(`recompute prices, income and IHEC: ${city.name}`,()=>{
  assert.match(city.code,/^\d{5}$/);
  assert.equal(new Set(city.observations.map(o=>o.quarter)).size,15);
  for(const o of city.observations){
    const prices=o.monthlyPrices.filter((p):p is number=>p!==null);
    assert.equal(prices.length,o.priceMonths);
    close(o.price!,Math.round(prices.reduce((a,b)=>a+b,0)/prices.length*100)/100);
    const factor=data.factors.find(f=>f.quarter===o.quarter)!.factor;
    if(factor===null){assert.equal(o.income,null);assert.equal(o.index,null);}
    else {close(o.income!,city.income2023*factor);close(o.index!,o.price!*data.referenceArea/o.income!);}
  }
});
test('reconstruct the national income profile and ECV annual anchor',()=>{
  const mean=(a:number[])=>a.reduce((s,n)=>s+n,0)/a.length;
  const baseline=(year:string)=>mean(data.factors.filter(f=>f.quarter.startsWith(year)).map(f=>f.rdbMillion!*1e6/f.households!));
  for(const f of data.factors.filter(f=>f.factor!==null)){
    close(f.rdbPerHousehold!,f.rdbMillion!*1e6/f.households!,1e-6);
    const profile=f.rdbPerHousehold!/baseline(f.quarter.startsWith('2023')?'2023':'2024');
    close(f.profile!,profile,1e-8);
    close(f.ecvFactor!,38994/36996,1e-8);
    close(f.factor!,profile*(f.quarter.startsWith('2023')?1:38994/36996),1e-8);
  }
});
test('independent reproduction of proxy-selection backtest',()=>{
  let national=0,regional=0,wins=0;
  for(const r of data.backtest){
    const actual=r.income2023/r.income2022-1;
    const n=Math.abs(r.nationalProxy-actual),c=Math.abs(r.regionalProxy-actual);
    national+=n;regional+=c;if(n<c)wins++;
  }
  close(national,1.43,.005); close(regional,2.96,.005); assert.equal(wins,86);
});
for(const q of reportQuarters) test(`edition, ranking and median changes: ${q}`,()=>{
  const s=summary(q),rows=ranking(q),source=reportSource(q);
  assert.equal(rows.length,100); assert.equal(rows[0].rank,1); assert.equal(rows[99].rank,100);
  assert.equal(new Set(rows.map(r=>r.code)).size,100);
  assert.equal(source.version,data.version);
  close(s.median,(rows[49].index+rows[50].index)/2);
  assert.ok(source.publishedAt>`${q.slice(0,4)}-01-01`);
  assert.ok(Date.parse(source.publishedAt)<=Date.now());
  const prior=completeQuarters().includes(previousQuarter(q));
  if(prior)close(s.qoq!,s.median/summary(previousQuarter(q)).median-1);
  else assert.equal(s.qoq,null);
  for(const r of rows){
    assert.equal(r.qoq,change(r.index,observation(r,previousQuarter(q))?.index??null));
    assert.equal(r.yoy,change(r.index,observation(r,previousQuarter(q,true))?.index??null));
  }
});
test('missing quarters cannot produce a released report or ranking',()=>{
  for(const q of ['2022Q4','2026Q2','2026Q3','2027Q1']){
    assert.throws(()=>reportSource(q)); assert.equal(ranking(q).length,0);
  }
  assert.equal(change(1,null),null);assert.equal(change(null,1),null);assert.equal(change(1,0),null);
  assert.equal(median([3,1,2,4]),2.5);assert.throws(()=>median([]));
});
test('Madrid independently checked anchor values',()=>{
  const city=data.cities.find(c=>c.code==='28079')!;
  close(observation(city,'2026Q1')!.income!,56120.19491236);
  close(observation(city,'2026Q1')!.index!,9.338998213004603);
  assert.equal(ranking('2026Q1').find(r=>r.code===city.code)!.rank,5);
});
test('CSV preserves attribution, precision, absent changes and fixed editions',()=>{
  for(const lang of ['es','en'] as const){
    const text=csv(lang,data),lines=text.trim().split('\r\n');
    assert.equal(lines.length,1301);assert.ok(text.startsWith('\uFEFF'));
    assert.ok(text.includes('Equipo Hipotecalc'));assert.ok(text.includes('https://www.ine.es/'));
    assert.ok(text.includes('0.01 = 1 %'));assert.ok(!text.includes('undefined'));
    const first=csv(lang,data,'2023Q1').trim().split('\r\n');
    assert.equal(first.length,101);assert.match(first[1],/,"","",/);
    const d=datasetSchema(lang,data,'2026Q1');
    assert.equal(d.temporalCoverage,'2026-01-01/2026-03-31');
    assert.equal(d.datePublished,data.publishedAt);
    assert.ok(d.distribution.contentUrl.endsWith('/2026q1.csv'));
  }
});
test('40 unique canonical pages and reciprocal English/Spanish routes',()=>{
  const all=[...pages('es'),...pages('en')];
  assert.equal(all.length,40);assert.equal(new Set(all.map(p=>p.path)).size,40);
  assert.equal(all.filter(p=>p.kind==='report').length,26);
  for(const page of all){
    const other=analyticsAlternate(page.path)!;
    assert.ok(all.some(p=>p.path===other));assert.equal(analyticsAlternate(other),page.path);
  }
  assert.equal(reportPath('2023Q1','es'),`${base('es')}/informes/2023-t1`);
  assert.equal(reportPath('2023Q1','en'),`${base('en')}/reports/2023-q1`);
  assert.equal(analyticsAlternate('/calculadora-itp'),null);
});
