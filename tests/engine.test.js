import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getKoreanDate, parseCharm, validateDatabase, drawFortune, hash32, gradeFromRoll, TOPICS, japaneseNumber } from '../engine.js';
const db = JSON.parse(await readFile(new URL('../fortunes.json', import.meta.url), 'utf8'));
test('Expanded database: 280 main + 1680 topic readings with unique IDs and numbers', () => {
  validateDatabase(db);
  assert.equal(db.main.length,280);
  for (const grade of db.grades) {
    assert.equal(db.main.filter(m=>m.grade===grade.id).length,40);
    for (const [key] of TOPICS) assert.equal(db.topics[key][grade.id].length,30);
  }
  assert.equal(new Set(db.main.map(m=>m.poem)).size,280);
  assert.equal(new Set(db.main.map(m=>m.guidance)).size,280);
  const messages=Object.values(db.topics).flatMap(t=>Object.values(t).flat().map(m=>m.text));
  assert.equal(messages.length,1680); assert.equal(new Set(messages).size,1680);
});
test('Date is Korea midnight independent of browser timezone', () => {
  assert.equal(getKoreanDate(new Date('2026-11-10T14:59:59.999Z')),'2026-11-10');
  assert.equal(getKoreanDate(new Date('2026-11-10T15:00:00.000Z')),'2026-11-11');
  assert.equal(getKoreanDate(new Date('2026-12-31T15:00:00Z')),'2027-01-01');
  assert.equal(getKoreanDate(new Date('2028-02-28T15:00:00Z')),'2028-02-29');
});
test('IDs are strict, case-sensitive, and demo is explicit', () => {
  assert.deepEqual(parseCharm(''),{id:'DEMO-OMAMORI',demo:true});
  assert.deepEqual(parseCharm('?id=7K3P9D'),{id:'7K3P9D',demo:false});
  assert.equal(parseCharm('?id=abcDEF').id,'abcDEF');
  for (const query of ['?id=', '?id=short','?id=7K3P9D&id=ABCDEF','?id=%3Cscript%3E','?id=ABC%20DEF',`?id=${'A'.repeat(65)}`]) assert.throws(()=>parseCharm(query));
});
test('SHA-256 has stable byte order',async()=>assert.equal(await hash32('abc'),0xba7816bf));
test('Weighted boundaries exactly allocate 10 / 20 / 30 / 25 / 12 / 2 / 1 slots',()=>{
  const counts=Object.fromEntries(db.grades.map(g=>[g.id,0]));
  for(let i=0;i<100;i++) counts[gradeFromRoll(db.grades,i).id]++;
  assert.deepEqual(Object.values(counts),[10,20,30,25,12,2,1]);
});
test('Same version + date + charm produces identical full reading', async()=>{
  const a=await drawFortune(db,'7K3P9D','2026-11-10');
  const b=await drawFortune(structuredClone(db),'7K3P9D','2026-11-10');
  assert.deepEqual(a,b); assert.equal(Object.keys(a.topics).length,8);
  assert.notDeepEqual(a,await drawFortune(db,'ABCDEF','2026-11-10'));
  assert.notDeepEqual(a,await drawFortune(db,'7K3P9D','2026-11-11'));
});
test('Large sample covers all grades and always selects matching complete content',async()=>{
  const seen=new Set();
  for(let i=0;i<3000;i++) {
    const r=await drawFortune(db,`TEST-${i.toString().padStart(4,'0')}`,'2026-11-10');
    seen.add(r.grade.id); assert.equal(r.main.grade,r.grade.id);
    for(const [key] of TOPICS) assert.ok(db.topics[key][r.grade.id].some(t=>t.text===r.topics[key]));
  }
  assert.equal(seen.size,7);
});
test('Incomplete and malformed databases fail before rendering',()=>{
  for(const mutate of [d=>d.grades[0].weight=11,d=>d.topics.wish.kyo=[],d=>d.main[0].number=d.main[1].number,d=>d.main[0].poem='',d=>d.version='v3']) {
    const broken=structuredClone(db); mutate(broken); assert.throws(()=>validateDatabase(broken));
  }
});
test('Without a charm ID the page draws per browser, not one shared demo reading',async()=>{
  const app=await readFile(new URL('../fortune.js',import.meta.url),'utf8');
  assert.match(app,/if \(charm\.demo\) charm\.id = deviceId\(\);/);
  const a=await drawFortune(db,'DEV-00000000000000000001','2026-11-10'), b=await drawFortune(db,'DEV-00000000000000000002','2026-11-10');
  assert.notDeepEqual(a,b);
});
test('Japanese lot numbers format correctly',()=>{
  assert.equal(japaneseNumber(1),'一'); assert.equal(japaneseNumber(10),'十'); assert.equal(japaneseNumber(18),'十八'); assert.equal(japaneseNumber(48),'四十八');
  assert.equal(japaneseNumber(100),'百'); assert.equal(japaneseNumber(101),'百一'); assert.equal(japaneseNumber(218),'二百十八'); assert.equal(japaneseNumber(240),'二百四十');
});
test('v1 engine/data still reproduce the original reading',async()=>{
  const legacy=JSON.parse(await readFile(new URL('../v1/fortunes.json',import.meta.url),'utf8'));
  const oldEngine=await import('../v1/engine.js');
  oldEngine.validateDatabase(legacy);
  assert.equal(legacy.main.length,48);
  const original=await oldEngine.drawFortune(legacy,'7K3P9D','2026-11-10');
  assert.equal(original.main.number,28);
  assert.equal(original.grade.id,'shokichi');
  for(const entry of legacy.main) assert.deepEqual(db.main.find(m=>m.id===entry.id),entry);
  for(const [key] of TOPICS) for(const g of legacy.grades) for(const entry of legacy.topics[key][g.id]) assert.deepEqual(db.topics[key][g.id].find(m=>m.id===entry.id),entry);
});
test('Classic browser bundle matches current source and database',async()=>{
  const bundle=await readFile(new URL('../browser.js',import.meta.url),'utf8');
  const match=bundle.match(/^const LOCAL_FORTUNES = (.+);$/m);
  assert.ok(match);
  assert.deepEqual(JSON.parse(match[1]),db);
  assert.ok(!bundle.includes('import.meta'));
  assert.ok(!/^import |^export /m.test(bundle));
});
