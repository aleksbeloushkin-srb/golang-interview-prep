// Слияние прогресса двух устройств вместо выбора целого снимка (auth.js, кнопка «Объединить»).
// Вход и выход — снимки localStorage: { "go_prep_…": "<строка JSON>" }. Правила по ключам:
//   попытки карточек и проговора — объединение без повторов, по дате, с тем же лимитом длины;
//   отметки плана и решённые задачи практикума — объединение (снятая на одном устройстве отметка вернётся);
//   статус карточки при расхождении — с того устройства, где последняя попытка новее; при равенстве — «на повторении»;
//   прочие ключи (настройки) — этого браузера; ключ только на одной стороне — берётся как есть.
// Нечитаемое значение одной стороны уступает читаемому другой.

const MERGE_ATTEMPTS_KEEP = 20; // как recordAttempt в app.js
const MERGE_TALK_KEEP = 5;      // как TALK_KEEP в talk-trainer.js

function mergeParse(text) {
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

// Списки попыток: каждая попытка с одинаковыми полями учитывается столько раз, сколько её больше на одной из сторон
// (общая история не удваивается, разные попытки одного дня сохраняются); порядок — по дате, стабильно.
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
  return out.map((item, i) => [item, i])
    .sort((x, y) => { const dx = dateOf(x[0]), dy = dateOf(y[0]); return dx < dy ? -1 : dx > dy ? 1 : x[1] - y[1]; })
    .map(x => x[0]).slice(-keep);
}

function lastAttemptDay(attempts, cardId) {
  const list = attempts && Array.isArray(attempts[cardId]) ? attempts[cardId] : [];
  return list.reduce((max, a) => (a && typeof a.d === "string" && a.d > max ? a.d : max), "");
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
        const dl = lastAttemptDay(attemptsL, id), ds = lastAttemptDay(attemptsS, id);
        merged[id] = dl > ds ? a[id] : ds > dl ? b[id] : "review";
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

if (typeof module !== "undefined") module.exports = { mergeProgressSnapshots, mergeLists };
