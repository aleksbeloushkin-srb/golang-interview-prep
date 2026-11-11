// Слияние прогресса двух устройств вместо выбора целого снимка (auth.js, кнопка «Объединить»).
// Вход и выход — снимки localStorage: { "go_prep_…": "<строка JSON>" }. Правила по ключам:
//   попытки карточек и проговора — объединение без повторов, по дате, с тем же лимитом длины;
//   отметки плана и решённые задачи практикума — объединение (снятая на одном устройстве отметка вернётся);
//   статус карточки при расхождении — итог последнего дня объединённой истории (как у расписания, attemptDayResults);
//   без истории — с того устройства, где последняя попытка новее, при равенстве — «на повторении»;
//   прочие ключи (настройки) — этого браузера; ключ только на одной стороне — берётся как есть.
// Нечитаемое значение одной стороны уступает читаемому другой.

const MERGE_ATTEMPTS_KEEP = 20; // как recordAttempt в app.js
const MERGE_TALK_KEEP = 5;      // как TALK_KEEP в talk-trainer.js

// Итог учебного дня по истории попыток карточки: за день засчитывается худшая оценка. Общий для расписания
// (review-queue.js, cardSchedule) и слияния устройств, поэтому порядок попыток внутри дня и сторона слияния
// не меняют ни дату проверки, ни статус. Возвращает [{ day, rating }] по возрастанию дня; кривые записи пропускаются.
const RATING_RANK = { none: 0, anchors: 1, self: 2 };

function attemptDayResults(list) {
  const byDay = new Map();
  for (const a of Array.isArray(list) ? list : []) {
    if (!a || typeof a.d !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(a.d) || !Object.prototype.hasOwnProperty.call(RATING_RANK, a.r)) continue;
    const r = byDay.get(a.d);
    if (r === undefined || RATING_RANK[a.r] < RATING_RANK[r]) byDay.set(a.d, a.r);
  }
  return [...byDay.keys()].sort().map(day => ({ day, rating: byDay.get(day) }));
}

function mergeParse(text) {
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

// Списки попыток: каждая попытка с одинаковыми полями учитывается столько раз, сколько её больше на одной из сторон
// (общая история не удваивается, разные попытки одного дня сохраняются). Порядок — по дате, внутри дня — не от стороны:
// худшая оценка последней, затем по записи. Поэтому обрезка до keep одинакова с обеих сторон и, пока от дня
// остаётся хоть одна попытка, не отрезает его итог (худшую оценку, attemptDayResults).
function mergeLists(a, b, dateOf, keep) {
  const out = [];
  const count = new Map();
  const add = (list, side) => (Array.isArray(list) ? list : []).forEach(item => {
    const key = JSON.stringify(item);
    const seen = count.get(key) || [0, 0];
    seen[side]++;
    count.set(key, seen);
    if (seen[side] > seen[1 - side]) out.push(item);
  });
  add(a, 0);
  add(b, 1);
  // Испорченная попытка без оценки встаёт раньше оценок своего дня и отрезается первой; у результатов проговора
  // оценок нет — внутри дня они идут по записи.
  const rank = item => (item && Object.prototype.hasOwnProperty.call(RATING_RANK, item.r) ? RATING_RANK[item.r] : 3);
  const order = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
  return out.map(item => ({ item, day: dateOf(item), rank: rank(item), text: JSON.stringify(item) }))
    .sort((x, y) => order(x.day, y.day) || y.rank - x.rank || order(x.text, y.text))
    .map(x => x.item).slice(-keep);
}

function lastAttemptDay(attempts, cardId) {
  const list = attempts && Array.isArray(attempts[cardId]) ? attempts[cardId] : [];
  return list.reduce((max, a) => (a && typeof a.d === "string" && a.d > max ? a.d : max), "");
}

// Статус карточки, который на устройствах разный: «сам» за последний день объединённой истории — «ответил сам»,
// иначе «на повторении». Без истории — прежнее правило: статус стороны с более новой попыткой, при равенстве — «на повторении».
function mergeCardStatus(id, local, server, attemptsL, attemptsS) {
  const days = attemptDayResults(mergeLists(attemptsL[id], attemptsS[id], x => (x && x.d) || "", MERGE_ATTEMPTS_KEEP));
  if (days.length) return days[days.length - 1].rating === "self" ? "mastered" : "review";
  const dl = lastAttemptDay(attemptsL, id), ds = lastAttemptDay(attemptsS, id);
  return dl > ds ? local : ds > dl ? server : "review";
}

function mergeProgressSnapshots(local, server) {
  local = local || {};
  server = server || {};
  const out = {};
  const keys = new Set([...Object.keys(local), ...Object.keys(server)]);
  const L = key => mergeParse(local[key]);
  const S = key => mergeParse(server[key]);
  const attemptsL = L("go_prep_attempts_v1") || {};
  const attemptsS = S("go_prep_attempts_v1") || {};

  for (const key of keys) {
    if (!(key in server)) { out[key] = local[key]; continue; }
    if (!(key in local)) { out[key] = server[key]; continue; }
    if (local[key] === server[key]) { out[key] = local[key]; continue; }
    const a = L(key), b = S(key);
    if (!a || !b) { out[key] = a ? local[key] : b ? server[key] : local[key]; continue; }
    let merged;
    if (key === "go_prep_attempts_v1") {
      merged = {};
      for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) merged[id] = mergeLists(a[id], b[id], x => (x && x.d) || "", MERGE_ATTEMPTS_KEEP);
    } else if (key === "go_prep_progress_v2") {
      merged = { ...b, ...a };
      for (const id of Object.keys(a)) {
        if (!(id in b) || a[id] === b[id]) continue;
        merged[id] = mergeCardStatus(id, a[id], b[id], attemptsL, attemptsS);
      }
    } else if (key === "go_prep_plan_v1") {
      merged = { ...a, done: { ...(b.done || {}), ...(a.done || {}) } };
    } else if (key === "go_prep_practice_v1") {
      merged = { ...b };
      for (const [id, v] of Object.entries(a)) {
        const other = b[id];
        merged[id] = other && other.passedAt && v && v.passedAt && other.passedAt > v.passedAt ? other : v;
      }
    } else if (key === "go_prep_talk_v1" && a.results && b.results) {
      const results = {};
      for (const id of new Set([...Object.keys(a.results), ...Object.keys(b.results)])) {
        results[id] = mergeLists(a.results[id], b.results[id], x => (x && x.at) || "", MERGE_TALK_KEEP);
      }
      merged = { ...a, results };
    } else {
      out[key] = local[key]; // настройка: остаётся как в этом браузере
      continue;
    }
    out[key] = JSON.stringify(merged);
  }
  return out;
}

if (typeof module !== "undefined") module.exports = { mergeProgressSnapshots, mergeLists, attemptDayResults };
