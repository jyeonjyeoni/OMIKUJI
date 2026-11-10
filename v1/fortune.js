import { TOPICS, getKoreanDate, parseCharm, validateDatabase, drawFortune, japaneseNumber } from './engine.js';
const $ = id => document.getElementById(id);
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key,value) { try { localStorage.setItem(key,value); } catch { /* A blocked store never prevents a draw. */ } }
};
let db, charm, current, generation = 0, state = 'loading', rolloverTimer;
function setState(next, message = '') {
  state = next;
  for (const key of ['entry','fortune','error']) $(key).hidden = key !== next;
  $('daily-note').hidden = next !== 'fortune';
  $('status').textContent = message;
  $('status').hidden = !message;
}
function visitKey() { return `omamori:${db.version}:${charm.demo ? 'demo' : 'charm'}:${charm.id}:opened`; }
function render(result) {
  const day = new Date(`${result.date}T12:00:00+09:00`);
  $('date-label').textContent = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year:'numeric', month:'long', day:'numeric', weekday:'long' }).format(day);
  $('paper-date').dateTime = result.date;
  $('paper-date').textContent = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { timeZone:'Asia/Seoul', era:'long', year:'numeric', month:'long', day:'numeric' }).format(day);
  $('paper-date').lang = 'ja';
  $('fortune-number').textContent = `第${japaneseNumber(result.main.number)}番`;
  $('grade').textContent = result.grade.label;
  $('grade-name').textContent = result.grade.name;
  $('fortune-title').textContent = result.main.title;
  $('poem').textContent = result.main.poem;
  $('guidance').textContent = result.main.guidance;
  $('primary-topics').replaceChildren(); $('secondary-topics').replaceChildren();
  TOPICS.forEach(([key, jp, ko], index) => {
    const row = document.createElement('div'); row.className = 'topic';
    const dt = document.createElement('dt'), title = document.createElement('span'), name = document.createElement('small'), dd = document.createElement('dd');
    title.lang = 'ja'; title.textContent = jp; name.textContent = ko; dd.textContent = result.topics[key];
    dt.append(title,name); row.append(dt,dd); $(index < 4 ? 'primary-topics' : 'secondary-topics').append(row);
  });
  $('more-topics').open = false;
}
function scheduleRollover() {
  clearTimeout(rolloverTimer);
  const today = getKoreanDate();
  const tomorrow = new Date(`${today}T00:00:00+09:00`).getTime() + 86400000;
  rolloverTimer = setTimeout(() => refreshDate(), Math.max(100, tomorrow - Date.now() + 100));
}
async function prepare() {
  const token = ++generation;
  setState('loading', '오늘의 종이를 준비하고 있어요.');
  $('fortune').classList.remove('revealing');
  $('open-fortune').disabled = true;
  try {
    charm = parseCharm(location.search);
    $('demo-note').hidden = !charm.demo;
    if (!globalThis.crypto?.subtle) throw new Error('SECURE_CONTEXT');
    if (!db) {
      if (location.protocol === 'file:') {
        // The generated browser bundle provides the same data for local previews.
        db = validateDatabase(LOCAL_FORTUNES);
      } else {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch(new URL('fortunes.json', document.baseURI), { cache: 'no-cache', signal: controller.signal });
        if (!response.ok) throw new Error('LOAD_FAILED');
        db = validateDatabase(await response.json());
      } finally { clearTimeout(timeout); }
      }
    }
    const date = getKoreanDate();
    const result = await drawFortune(db, charm.id, date);
    if (token !== generation) return;
    if (date !== getKoreanDate()) return prepare();
    current = result; render(result);
    $('open-fortune').disabled = false;
    setState(storage.get(visitKey()) === date ? 'fortune' : 'entry');
    scheduleRollover();
  } catch (error) {
    if (token !== generation) return;
    const invalid = error.message === 'INVALID_ID';
    $('error-message').textContent = invalid
      ? '부적 주소를 확인하지 못했어요. NFC를 다시 태그하거나 체험용 운세를 열어 주세요.'
      : error.message === 'SECURE_CONTEXT'
        ? '안전한 연결에서 운세를 열 수 있어요. HTTPS 주소 또는 로컬 미리보기 서버로 접속해 주세요.'
        : '운세를 불러오지 못했어요. 인터넷 연결을 확인한 뒤 다시 불러와 주세요.';
    $('retry').hidden = invalid; $('demo-link').hidden = !invalid;
    setState('error');
  }
}
function refreshDate() {
  if (state === 'loading' || !current) return;
  if (current.date !== getKoreanDate()) prepare(); else scheduleRollover();
}
$('open-fortune').addEventListener('click', () => {
  if (!current || state !== 'entry') return;
  if (current.date !== getKoreanDate()) { prepare(); return; }
  storage.set(visitKey(), current.date);
  setState('fortune');
  $('fortune').classList.add('revealing');
  $('grade').focus({ preventScroll: true });
});
$('retry').addEventListener('click', () => prepare());
const motion = $('reduce-motion');
const savedMotion = storage.get('omamori:reduce-motion');
motion.checked = savedMotion === null ? matchMedia('(prefers-reduced-motion: reduce)').matches : savedMotion === 'true';
function applyMotion() { document.documentElement.classList.toggle('reduce-motion', motion.checked); }
applyMotion();
motion.addEventListener('change', () => { storage.set('omamori:reduce-motion', String(motion.checked)); applyMotion(); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshDate(); });
window.addEventListener('pageshow', refreshDate);
window.addEventListener('focus', refreshDate);
window.addEventListener('storage', event => {
  if (db && charm && current && event.key === visitKey() && event.newValue === current.date && state === 'entry') setState('fortune');
});
window.omamoriStarted = true;
prepare();
