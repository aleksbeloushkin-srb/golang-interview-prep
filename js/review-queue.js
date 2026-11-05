// Очередь повторения карточек и занятие «Продолжить занятие».
// Дата следующей проверки выводится из истории попыток (go_prep_attempts_v1, app.js): отдельного хранилища
// для расписания нет, поэтому оно синхронизируется и сливается вместе с попытками.
// Интервалы — рабочая гипотеза, пересмотреть по нагрузке: «не ответил» — завтра, «с опорой» — через 2 дня,
// «сам» подряд — через 4, 8, 16, затем 30 дней. Отметка старого формата без истории — проверить сегодня.
const REVIEW_DAYS = { none: 1, anchors: 2 };
const REVIEW_SELF_DAYS = [4, 8, 16, 30];
// Текущее занятие — только этот браузер (auth.js исключает ключ из синхронизации).
const SESSION_KEY = "go_prep_session_v1";
const SESSION_SIZE = 10;

function reviewIso(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function reviewToday() {
  return reviewIso(new Date());
}

function reviewAddDays(iso, days) {
  const [y, m, d] = iso.split("-").map(Number);
  return reviewIso(new Date(y, m - 1, d + days));
}

function reviewShort(iso) {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}

// { last, rating, streak, due } по истории карточки или null, если попыток нет.
function cardSchedule(cardId, attempts) {
  const raw = (attempts || loadAttempts())[cardId];
  const list = (Array.isArray(raw) ? raw : []).filter(a => a && ATTEMPT_LABELS[a.r] && /^\d{4}-\d{2}-\d{2}$/.test(a.d));
  if (!list.length) return null;
  // История дописывается по порядку, но после слияния устройств её стоит упорядочить по дате (стабильно).
  const sorted = list.map((a, i) => [a, i]).sort((x, y) => (x[0].d < y[0].d ? -1 : x[0].d > y[0].d ? 1 : x[1] - y[1])).map(x => x[0]);
  const last = sorted[sorted.length - 1];
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0 && sorted[i].r === "self"; i--) streak++;
  const days = last.r === "self" ? REVIEW_SELF_DAYS[Math.min(streak, REVIEW_SELF_DAYS.length) - 1] : REVIEW_DAYS[last.r];
  return { last: last.d, rating: last.r, streak, due: reviewAddDays(last.d, days) };
}

// Дата проверки карточки: по истории; у отметки старого формата без истории — сегодня; у новой — null.
function cardDue(card, attempts, today) {
  const s = cardSchedule(card.id, attempts);
  if (s) return s.due;
  return state.progress[card.id] ? today : null;
}

function cardIsDue(card, attempts, today) {
  const due = cardDue(card, attempts, today || reviewToday());
  return due !== null && due <= (today || reviewToday());
}

// Просроченные карточки, самые давние сначала.
function reviewDueCards(attempts, today) {
  return CARDS.map((card, i) => ({ card, i, due: cardDue(card, attempts, today) }))
    .filter(x => x.due !== null && x.due <= today)
    .sort((a, b) => (a.due < b.due ? -1 : a.due > b.due ? 1 : a.i - b.i))
    .map(x => x.card);
}

// Карточки текущей недели плана, которые ещё ни разу не проверялись. До старта программы — неделя 1.
function reviewWeekCards(attempts) {
  if (typeof PLAN === "undefined" || typeof planToday !== "function") return [];
  if (!planState.saved) planState.saved = planLoad();
  const today = planToday();
  if (today.after) return [];
  const week = PLAN.weeks[today.before ? 0 : today.weekNumber - 1];
  const ids = [];
  week.days.forEach(day => day.tasks.forEach(task => (task.links || []).forEach(id => {
    if (/^c\d+$/.test(id) && !ids.includes(id)) ids.push(id);
  })));
  return ids.map(id => CARDS.find(c => c.id === id)).filter(c => c && !cardSchedule(c.id, attempts) && !state.progress[c.id]);
}

/* --- Занятие: до 10 карточек — сначала просроченные, затем новые с текущей недели --- */
function reviewLoadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!s || !Array.isArray(s.ids) || !Array.isArray(s.done)) return null;
    const known = new Set(CARDS.map(c => c.id));
    const ids = s.ids.filter(id => known.has(id));
    return { ids, done: s.done.filter(id => ids.includes(id)), created: typeof s.created === "string" ? s.created : reviewToday() };
  } catch {
    return null;
  }
}

function reviewSaveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch { /* занятие останется только на этой странице */ }
}

function reviewSessionLeft(session) {
  return session ? session.ids.filter(id => !session.done.includes(id)) : [];
}

function reviewBuildSession() {
  const attempts = loadAttempts();
  const today = reviewToday();
  const ids = [];
  [...reviewDueCards(attempts, today), ...reviewWeekCards(attempts)].forEach(c => {
    if (!ids.includes(c.id)) ids.push(c.id);
  });
  return { ids: ids.slice(0, SESSION_SIZE), done: [], created: today };
}

// Карточки занятия в его порядке, без уже оценённых.
function reviewSessionCards() {
  if (!state.session) state.session = reviewLoadSession();
  return reviewSessionLeft(state.session).map(id => CARDS.find(c => c.id === id)).filter(Boolean);
}

// Оценённая в занятии карточка выходит из него; следующая встаёт на её место.
function reviewSessionMark(cardId) {
  const s = state.session;
  if (state.filter !== "session" || !s || !s.ids.includes(cardId) || s.done.includes(cardId)) return;
  s.done.push(cardId);
  reviewSaveSession(s);
}

// Начатое занятие продолжить, иначе собрать новое. Работает с любой страницы: переводит на карточки.
function continueSession() {
  let s = reviewLoadSession();
  if (!s || !reviewSessionLeft(s).length) s = reviewBuildSession();
  reviewSaveSession(s);
  state.session = s;
  state.filter = "session";
  state.index = 0;
  state.revealed = false;
  saveCardView();
  if (!/^#\/cards(\/|$)/.test(location.hash)) location.hash = "#/cards";
  renderCard();
  updateReviewButton();
  const title = document.getElementById("card-q-en");
  if (title) {
    if (!title.hasAttribute("tabindex")) title.setAttribute("tabindex", "-1");
    title.focus({ preventScroll: true });
  }
}

function reviewCounts() {
  const attempts = loadAttempts();
  const today = reviewToday();
  let self = 0;
  for (const card of CARDS) {
    const s = cardSchedule(card.id, attempts);
    if (s ? s.rating === "self" : state.progress[card.id] === "mastered") self++;
  }
  return { self, due: reviewDueCards(attempts, today).length, fresh: reviewWeekCards(attempts).length };
}

// Подпись кнопки: начатое занятие — сколько осталось; иначе — сколько к повторению и новых.
function reviewButtonLabel() {
  const left = reviewSessionLeft(reviewLoadSession()).length;
  if (left) return `▶ Продолжить занятие: осталось ${left}`;
  const { due, fresh } = reviewCounts();
  if (!due && !fresh) return "▶ Занятие: повторять пока нечего";
  return `▶ Занятие до ${SESSION_SIZE} карточек: к повторению ${due}, новых на неделе ${fresh}`;
}

function updateReviewButton() {
  document.querySelectorAll("[data-review-start]").forEach(btn => { btn.textContent = reviewButtonLabel(); });
}

// Строка статуса карточки: как ответил в последний раз и когда следующая проверка.
function reviewStatusText(card) {
  const st = state.progress[card.id] || "unseen";
  if (st === "unseen") return "Новая";
  const today = reviewToday();
  const s = cardSchedule(card.id);
  const label = st === "mastered" ? "Ответил сам ✓" : "На повторении";
  const last = s ? ` · ${reviewShort(s.last)}: ${ATTEMPT_LABELS[s.rating]}` : "";
  const due = cardDue(card, null, today);
  const next = due <= today ? " · пора повторить" : ` · следующая проверка ${reviewShort(due)}`;
  return label + last + next;
}

// Пустое занятие: что дальше.
function reviewEmptyText() {
  const s = state.session;
  const done = s ? s.done.length : 0;
  const attempts = loadAttempts();
  const today = reviewToday();
  const next = CARDS.map(c => cardDue(c, attempts, today)).filter(d => d && d > today).sort()[0];
  return {
    title: done ? `Занятие закончено: ${done} из ${s.ids.length}` : "Повторять пока нечего",
    hint: (next ? `Следующая проверка — ${reviewShort(next)}. ` : "") + "Новое занятие соберёт кнопка «Занятие» над карточкой; остальные карточки — в подборке «Все»."
  };
}
