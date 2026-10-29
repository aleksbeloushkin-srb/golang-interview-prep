// Вход через Google (Cognito, Authorization Code + PKCE), запросы к API и синхронизация прогресса.
//
// Токены живут только в памяти вкладки: после перезагрузки страницы снова нажимаешь «Войти»
// (Google обычно пускает без пароля). На время перехода к Google в sessionStorage лежат только
// одноразовые state и code_verifier и маршрут, куда вернуться, — без них код входа не обменять.
// Без входа сайт работает как раньше, на localStorage.

const AUTH_PENDING_KEY = "go_prep_auth_pending_v1";
const AUTH_RESUME_KEY = "go_prep_auth_resume_v1";
// Не секрет: «в прошлый раз входил». По нему при новом открытии сайт сам проходит вход
// (Cognito и Google помнят сессию, обычно без единого клика). Одна попытка на вкладку.
const AUTH_HINT_KEY = "go_prep_signed_in_v1";
const AUTH_TRIED_KEY = "go_prep_auth_tried_v1";
const SYNC_PREFIX = "go_prep_";
// Не синхронизируем служебные ключи входа и черновики практикума (они в sessionStorage).
// Голос озвучки — настройка этого устройства, а не прогресс: не синхронизируется.
const SYNC_EXCLUDE = new Set([AUTH_PENDING_KEY, AUTH_RESUME_KEY, AUTH_HINT_KEY, AUTH_TRIED_KEY, "go_prep_tts_voice_v1"]);
const SYNC_INTERVAL_MS = 5000;

const authState = {
  accessToken: null,
  refreshToken: null,
  expiresAt: 0,
  email: "",
  sync: { version: 0, last: null, ready: false, status: "", kind: "" }
};

class AuthRequiredError extends Error {}

// Должен совпадать с адресом возврата в Cognito: …/golang-interview-prep/ (без index.html).
function authRedirectUri() {
  return window.location.origin + window.location.pathname.replace(/index\.html$/, "");
}

function authBase64Url(bytes) {
  let s = "";
  new Uint8Array(bytes).forEach(b => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function authRandom(n) {
  return authBase64Url(crypto.getRandomValues(new Uint8Array(n)));
}

function authSession(key, value) {
  try {
    if (value === undefined) return sessionStorage.getItem(key);
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    return null;
  }
  return null;
}

function authIsSignedIn() {
  return Boolean(authState.accessToken);
}

// Переход на страницу входа Google через Cognito. route — куда вернуться после входа.
async function authSignIn(route) {
  const verifier = authRandom(48);
  const challenge = authBase64Url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  const state = authRandom(24);
  authSession(AUTH_PENDING_KEY, JSON.stringify({ state, verifier, route: route || window.location.hash || "" }));
  const params = new URLSearchParams({
    response_type: "code",
    client_id: BACKEND.clientId,
    redirect_uri: authRedirectUri(),
    scope: "openid email profile",
    identity_provider: "Google",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state
  });
  window.location.assign(`${BACKEND.authDomain}/oauth2/authorize?${params}`);
}

function authHint(on) {
  try {
    if (on) localStorage.setItem(AUTH_HINT_KEY, "1");
    else localStorage.removeItem(AUTH_HINT_KEY);
  } catch {
    // без хранилища просто не будет автоматического входа
  }
}

function authHasHint() {
  try {
    return localStorage.getItem(AUTH_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function authSignOut() {
  authState.accessToken = authState.refreshToken = null;
  authHint(false);
  const params = new URLSearchParams({ client_id: BACKEND.clientId, logout_uri: authRedirectUri() });
  window.location.assign(`${BACKEND.authDomain}/logout?${params}`);
}

function authReadIdToken(idToken) {
  try {
    const payload = atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(payload, c => c.charCodeAt(0))));
  } catch {
    return {};
  }
}

async function authToken(body) {
  const resp = await fetch(`${BACKEND.authDomain}/oauth2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: BACKEND.clientId, ...body })
  });
  if (!resp.ok) throw new Error(`вход: ${resp.status}`);
  const t = await resp.json();
  authState.accessToken = t.access_token;
  if (t.refresh_token) authState.refreshToken = t.refresh_token;
  authState.expiresAt = Date.now() + (t.expires_in || 3600) * 1000;
  if (t.id_token) authState.email = authReadIdToken(t.id_token).email || "";
}

// Возврат с Google: ?code=…&state=… → токены; адрес очищается, маршрут после # восстанавливается.
async function authHandleRedirect() {
  const query = new URLSearchParams(window.location.search);
  const pendingRaw = authSession(AUTH_PENDING_KEY);
  if (!query.has("code") && !query.has("error")) return false;
  authSession(AUTH_PENDING_KEY, null);
  let pending = null;
  try {
    pending = JSON.parse(pendingRaw || "null");
  } catch {
    pending = null;
  }
  history.replaceState(null, "", window.location.pathname + ((pending && pending.route) || window.location.hash || ""));
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  if (query.has("error")) {
    authHint(false);
    authSetStatus(`Вход не удался: ${query.get("error_description") || query.get("error")}`, "warn");
    return false;
  }
  if (!pending || pending.state !== query.get("state")) {
    authSetStatus("Вход не удался: ответ не от нашего запроса. Попробуй ещё раз.", "warn");
    return false;
  }
  try {
    await authToken({ grant_type: "authorization_code", code: query.get("code"), redirect_uri: authRedirectUri(), code_verifier: pending.verifier });
    authHint(true);
    authSession(AUTH_TRIED_KEY, null); // удалось — при следующей перезагрузке снова войти сам
    return true;
  } catch (e) {
    authSetStatus(`Вход не удался (${e.message}). Попробуй ещё раз.`, "warn");
    return false;
  }
}

// Запрос к API с токеном. Бросает AuthRequiredError, если нужно войти.
async function apiFetch(path, options = {}) {
  if (!authState.accessToken) throw new AuthRequiredError("нужно войти");
  if (Date.now() > authState.expiresAt - 60000 && authState.refreshToken) {
    try {
      await authToken({ grant_type: "refresh_token", refresh_token: authState.refreshToken });
    } catch {
      authState.accessToken = null;
      authRender();
      throw new AuthRequiredError("сессия истекла");
    }
  }
  const resp = await fetch(BACKEND.apiUrl + path, {
    ...options,
    headers: { ...(options.headers || {}), authorization: `Bearer ${authState.accessToken}`, "content-type": "application/json" }
  });
  if (resp.status === 401) {
    authState.accessToken = null;
    authRender();
    throw new AuthRequiredError("сессия истекла");
  }
  return resp;
}

// --- Без входа сайт только для чтения: отметки прогресса и проверка — после входа.

// true, если можно менять прогресс. Если бэкенд не подключён (нет config.js), сайт работает как раньше.
function siteCanEdit() {
  return typeof BACKEND === "undefined" || authIsSignedIn();
}

// Показать, что для действия нужен вход, с кнопкой входа рядом.
function siteNeedSignIn(what) {
  const box = document.getElementById("signin-notice");
  if (!box) return;
  const button = authButton("Войти через Google", () => authSignIn());
  const close = authEl("button", { type: "button", className: "signin-notice-close", "aria-label": "Закрыть подсказку", text: "✕" });
  close.addEventListener("click", () => box.classList.add("hidden"));
  box.replaceChildren(authEl("span", { text: `Без входа сайт работает только на чтение. ${what || "Чтобы отмечать прогресс"}, войди через Google.` }), button, close);
  box.classList.remove("hidden");
  // Подсказка всплывает поверх страницы: место, где нажали, остаётся на экране.
  button.focus({ preventScroll: true });
}

// --- Синхронизация прогресса: все ключи go_prep_* из localStorage одним объектом.

function syncSnapshot() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(SYNC_PREFIX) || SYNC_EXCLUDE.has(key)) continue;
      out[key] = localStorage.getItem(key);
    }
  } catch {
    return null;
  }
  return out;
}

function syncSame(a, b) {
  const ka = Object.keys(a || {}).sort();
  const kb = Object.keys(b || {}).sort();
  return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]);
}

async function syncPush(snapshot, version) {
  const resp = await apiFetch("/progress", { method: "PUT", body: JSON.stringify({ version, progress: snapshot }) });
  if (resp.status === 409) return { conflict: true };
  if (!resp.ok) throw new Error(`сохранение: ${resp.status}`);
  const body = await resp.json();
  authState.sync.version = body.version;
  authState.sync.last = snapshot;
  return { conflict: false };
}

async function syncStart() {
  authState.sync.ready = false;
  authSetStatus("Сверяю прогресс с сервером…", "busy");
  const local = syncSnapshot() || {};
  let server;
  try {
    const resp = await apiFetch("/progress");
    if (!resp.ok) throw new Error(`загрузка: ${resp.status}`);
    server = await resp.json();
  } catch (e) {
    authSetStatus(`Прогресс не сверен: ${e.message}`, "warn");
    return;
  }
  if (!server.progress) {
    await syncPushReport(local, 0, "Прогресс этого браузера сохранён на сервере.");
    return;
  }
  authState.sync.version = server.version;
  if (syncSame(local, server.progress)) {
    authState.sync.last = local;
    authState.sync.ready = true;
    authSetStatus("Прогресс совпадает с сервером.", "ok");
    return;
  }
  // Новое устройство: своих отметок нет — спрашивать нечего, берём серверные.
  if (!Object.keys(local).length) {
    syncTakeServer(server);
    return;
  }
  syncAskWhich(server);
}

// Записать серверный прогресс в этот браузер и перезагрузить страницу: так его подхватят все разделы.
function syncTakeServer(server) {
  try {
    Object.keys(syncSnapshot() || {}).forEach(k => localStorage.removeItem(k));
    Object.entries(server.progress).forEach(([k, v]) => localStorage.setItem(k, v));
    if (!syncSame(syncSnapshot(), server.progress)) throw new Error("не записалось");
  } catch {
    authSetStatus("Не удалось записать прогресс в этот браузер.", "warn");
    return;
  }
  authSession(AUTH_RESUME_KEY, "1"); // после перезагрузки вход восстановится сам
  window.location.reload();
}

async function syncPushReport(snapshot, version, done) {
  try {
    const r = await syncPush(snapshot, version);
    if (r.conflict) {
      await syncStart();
      return;
    }
    authState.sync.ready = true;
    authSetStatus(done, "ok");
  } catch (e) {
    authSetStatus(`Не сохранилось: ${e.message}`, "warn");
  }
}

// Прогресс на сервере и в браузере разный: выбирает пользователь.
function syncAskWhich(server) {
  const panel = document.getElementById("sync-choice");
  if (!panel) return;
  const when = server.updatedAt ? new Date(server.updatedAt).toLocaleString("ru-RU") : "раньше";
  panel.replaceChildren(
    authEl("p", { text: `На сервере сохранён другой прогресс (${when}). Какой оставить?` }),
    authButton("Взять с сервера", () => syncTakeServer(server)),
    authButton("Оставить этот браузер", async () => {
      panel.classList.add("hidden");
      await syncPushReport(syncSnapshot() || {}, server.version, "Прогресс этого браузера сохранён на сервере.");
    })
  );
  panel.classList.remove("hidden");
  panel.querySelector("button").focus();
  authSetStatus("Выбери, какой прогресс оставить.", "warn");
}

// Раз в несколько секунд и при уходе со страницы — отправить изменения.
async function syncTick() {
  if (!authState.sync.ready || !authIsSignedIn()) return;
  const now = syncSnapshot();
  if (!now || syncSame(now, authState.sync.last)) return;
  authState.sync.ready = false;
  try {
    const r = await syncPush(now, authState.sync.version);
    if (r.conflict) {
      await syncStart();
      return;
    }
    authSetStatus(`Сохранено на сервере в ${new Date().toLocaleTimeString("ru-RU")}.`, "ok");
  } catch (e) {
    authSetStatus(`Не сохранилось: ${e.message}. Повторю позже.`, "warn");
  }
  authState.sync.ready = true;
}

// --- Шапка: «Войти через Google» или почта и «Выйти», строка состояния.

function authEl(tag, attrs, children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "text") node.textContent = v;
    else if (k === "className") node.className = v;
    else node.setAttribute(k, v);
  }
  [].concat(children || []).forEach(c => node.append(c));
  return node;
}

function authButton(text, onClick) {
  const b = authEl("button", { type: "button", className: "btn btn-sm", text });
  b.addEventListener("click", onClick);
  return b;
}

// kind: ok | busy | warn. В шапке — точка и короткая подпись, полный текст — во всплывающей
// подсказке и в role="status" для читалки.
const AUTH_STATUS_LABEL = { ok: "сохранено", busy: "синхронизация…", warn: "не сохранено" };

function authSetStatus(text, kind = "ok") {
  authState.sync.status = text;
  authState.sync.kind = kind;
  const s = document.getElementById("account-status");
  if (!s) return;
  s.hidden = false;
  s.dataset.kind = kind;
  s.title = text;
  s.querySelector(".account-status-label").textContent = AUTH_STATUS_LABEL[kind] || "";
  s.querySelector(".visually-hidden").textContent = text;
}

// Простая иконка «войти»: стрелка в дверной проём (своя, не логотип).
function authSignInIcon() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "account-icon");
  for (const d of ["M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4", "M10 16l4-4-4-4", "M14 12H4"]) {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

function authRender() {
  const box = document.getElementById("account");
  if (!box) return;
  const status = authEl("span", { id: "account-status", className: "account-status" }, [
    authEl("span", { className: "account-dot", "aria-hidden": "true" }),
    authEl("span", { className: "account-status-label", "aria-hidden": "true" }),
    authEl("span", { className: "visually-hidden", role: "status" })
  ]);
  if (authIsSignedIn()) {
    const email = authState.email || "Вы вошли";
    const out = authEl("button", { type: "button", className: "account-signout", text: "Выйти" });
    out.addEventListener("click", authSignOut);
    box.replaceChildren(authEl("div", { className: "account-chip" }, [
      authEl("span", { className: "account-avatar", "aria-hidden": "true", text: email.charAt(0).toUpperCase() }),
      authEl("span", { className: "account-email", title: email, text: email }),
      status,
      out
    ]));
  } else {
    const signIn = authEl("button", { type: "button", className: "account-signin", "aria-label": "Войти через Google" }, [authSignInIcon(), authEl("span", { className: "account-signin-full", text: "Войти через Google" }), authEl("span", { className: "account-signin-short", text: "Войти" })]);
    signIn.addEventListener("click", () => authSignIn());
    box.replaceChildren(signIn, status);
  }
  if (authState.sync.status) authSetStatus(authState.sync.status, authState.sync.kind);
  else status.hidden = true;
  document.documentElement.dataset.auth = authIsSignedIn() ? "in" : "out";
  if (authIsSignedIn()) document.getElementById("signin-notice")?.classList.add("hidden");
  document.dispatchEvent(new CustomEvent("auth-changed"));
}

async function authInit() {
  if (typeof BACKEND === "undefined") return;
  authRender();
  const signedIn = await authHandleRedirect();
  if (!signedIn && authSession(AUTH_RESUME_KEY)) {
    authSession(AUTH_RESUME_KEY, null);
    authSignIn();
    return;
  }
  // Входил раньше — войти снова сам, один раз на вкладку (если не вышло, остаёмся в режиме чтения).
  if (!signedIn && authHasHint() && !authSession(AUTH_TRIED_KEY) && !new URLSearchParams(window.location.search).has("error")) {
    authSession(AUTH_TRIED_KEY, "1");
    authSignIn();
    return;
  }
  authRender();
  if (signedIn) {
    await syncStart();
    setInterval(syncTick, SYNC_INTERVAL_MS);
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && syncTick());
  }
}

document.addEventListener("DOMContentLoaded", authInit);
