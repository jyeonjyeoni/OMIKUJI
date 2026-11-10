export const TOPICS = [
  ['wish', '願望', '소원'], ['visitor', '待人', '기다리는 사람'],
  ['love', '恋愛', '연애'], ['study', '学問', '학업'],
  ['work', '仕事', '일'], ['money', '金運', '금전'],
  ['health', '健康', '건강'], ['travel', '旅行', '여행']
];
export function getKoreanDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const p = Object.fromEntries(parts.map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
export function parseCharm(search) {
  const params = new URLSearchParams(search);
  const ids = params.getAll('id');
  if (!ids.length) return { id: 'DEMO-OMAMORI', demo: true };
  if (ids.length !== 1 || !/^[A-Za-z0-9_-]{6,64}$/.test(ids[0])) throw new Error('INVALID_ID');
  return { id: ids[0], demo: false };
}
export function validateDatabase(db) {
  const expected = ['daikichi', 'kichi', 'chukichi', 'shokichi', 'suekichi', 'kyo'];
  const seen = new Set(), numbers = new Set();
  const requireText = value => { if (typeof value !== 'string' || !value.trim()) throw new Error('INVALID_DATA'); };
  const unique = id => { requireText(id); if (seen.has(id)) throw new Error('INVALID_DATA'); seen.add(id); };
  if (db?.version !== 'v1' || !Array.isArray(db.grades) || db.grades.length !== 6 || !Array.isArray(db.main)) throw new Error('INVALID_DATA');
  if (db.grades.reduce((sum,g) => sum + g.weight, 0) !== 100) throw new Error('INVALID_DATA');
  for (const [i,g] of db.grades.entries()) {
    if (g.id !== expected[i] || !Number.isInteger(g.weight) || g.weight <= 0) throw new Error('INVALID_DATA');
    requireText(g.label); requireText(g.name);
    if (!db.main.some(m => m.grade === g.id)) throw new Error('INVALID_DATA');
    for (const [key] of TOPICS) {
      const pool = db.topics?.[key]?.[g.id];
      if (!Array.isArray(pool) || !pool.length) throw new Error('INVALID_DATA');
      for (const m of pool) { unique(m.id); requireText(m.text); }
    }
  }
  for (const m of db.main) {
    unique(m.id);
    if (!expected.includes(m.grade) || !Number.isInteger(m.number) || m.number < 1 || numbers.has(m.number)) throw new Error('INVALID_DATA');
    numbers.add(m.number); ['title','poem','guidance'].forEach(key => requireText(m[key]));
  }
  return db;
}
export async function hash32(text) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return new DataView(buffer).getUint32(0, false);
}
export function gradeFromRoll(grades, roll) {
  let sum = 0;
  return grades.find(g => { sum += g.weight; return roll < sum; });
}
export async function drawFortune(db, id, date = getKoreanDate()) {
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(id)) throw new Error('INVALID_ID');
  const seed = `${db.version}|${date}|${id}`;
  const grade = gradeFromRoll(db.grades, (await hash32(`${seed}|grade`)) % 100);
  const pool = db.main.filter(f => f.grade === grade.id);
  const main = pool[(await hash32(`${seed}|main`)) % pool.length];
  const topics = {};
  await Promise.all(TOPICS.map(async ([key]) => {
    const messages = db.topics[key][grade.id];
    topics[key] = messages[(await hash32(`${seed}|${key}`)) % messages.length].text;
  }));
  return { date, grade, main, topics };
}
export function japaneseNumber(n) {
  if (n === 0) return '〇';
  const digits = '〇一二三四五六七八九';
  if (n < 10) return digits[n];
  if (n < 100) return (n >= 20 ? digits[Math.floor(n / 10)] : '') + '十' + (n % 10 ? digits[n % 10] : '');
  return String(n);
}
