/* Озвучка английских ответов: кнопка «🔊 Слушать» и переключатель голоса.
   Файлы и манифест (data/audio.js) делает scripts/gen-audio.mjs. Кнопка появляется, только если
   запись сделана для текущего текста: хеш исходного текста совпадает с манифестом. */
const TTS_VOICE_KEY = "go_prep_tts_voice_v1";
// voice — выбор голоса в этой вкладке: работает и без localStorage; errorKey — запись, которая не загрузилась.
const ttsState = { audio: null, key: null, voice: null, errorKey: null };

// FNV-1a, 32 бита — тот же, что в scripts/speech-text.mjs.
function ttsHash(text) {
  let h = 0x811c9dc5;
  for (const ch of text) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function ttsVoices() {
  return typeof AUDIO !== "undefined" && AUDIO.voices ? Object.keys(AUDIO.voices) : [];
}

function ttsVoice() {
  const voices = ttsVoices();
  if (voices.includes(ttsState.voice)) return ttsState.voice;
  let saved = null;
  try { saved = localStorage.getItem(TTS_VOICE_KEY); } catch { saved = null; }
  return voices.includes(saved) ? saved : voices[0];
}

function ttsEntry(key, text) {
  if (typeof AUDIO === "undefined" || !AUDIO.items) return null;
  const entry = AUDIO.items[key];
  return entry && entry.hash === ttsHash(text) ? entry : null;
}

function ttsVoiceLabel(voice) {
  return (AUDIO.voices[voice] && AUDIO.voices[voice].label) || voice;
}

// Состояние кнопки: играет, не загрузилось или готово к запуску.
function ttsPlayView(key) {
  if (ttsState.key === key && ttsState.audio && !ttsState.audio.paused) return { text: "⏸ Стоп", label: "Остановить", pressed: true };
  if (ttsState.errorKey === key) return { text: "↻ Повторить", label: "Повторить загрузку записи", pressed: false };
  return { text: "🔊 Слушать", label: "Слушать по-английски", pressed: false };
}

const TTS_ERROR = "Запись не загрузилась — проверь сеть и нажми «Повторить».";
const TTS_VOICE_HINT = "запись начнётся сначала";

// HTML кнопок для текста; пустая строка, если записи для этого текста нет.
function ttsControlsHtml(key, text) {
  if (!ttsEntry(key, text)) return "";
  const voice = escapeHtml(ttsVoiceLabel(ttsVoice()));
  const view = ttsPlayView(key);
  const other = ttsVoices().length > 1;
  return `<span class="tts" data-tts-key="${escapeHtml(key)}" data-tts-hash="${ttsHash(text)}">
    <button type="button" class="btn btn-sm tts-play" aria-pressed="${view.pressed}" aria-label="${view.label}">${view.text}</button>
    ${other ? `<button type="button" class="btn btn-sm tts-voice" title="Сменить голос: ${TTS_VOICE_HINT}" aria-label="Голос: ${voice}. Сменить, ${TTS_VOICE_HINT}">${voice} ⇄</button>` : ""}
    <span class="tts-status" role="status">${ttsState.errorKey === key ? TTS_ERROR : ""}</span>
  </span>`;
}

// То же для кода, который строит DOM через createElement (план, практикум).
function ttsControlsNode(key, text) {
  const html = ttsControlsHtml(key, text);
  if (!html) return null;
  const wrap = document.createElement("span");
  wrap.innerHTML = html;
  return wrap.firstElementChild;
}

function ttsRefresh() {
  document.querySelectorAll(".tts[data-tts-key]").forEach(box => {
    const key = box.dataset.ttsKey;
    const view = ttsPlayView(key);
    const play = box.querySelector(".tts-play");
    play.textContent = view.text;
    play.setAttribute("aria-pressed", String(view.pressed));
    play.setAttribute("aria-label", view.label);
    const voiceButton = box.querySelector(".tts-voice");
    if (voiceButton) {
      const label = ttsVoiceLabel(ttsVoice());
      voiceButton.textContent = `${label} ⇄`;
      voiceButton.setAttribute("aria-label", `Голос: ${label}. Сменить, ${TTS_VOICE_HINT}`);
    }
    const status = box.querySelector(".tts-status");
    const message = ttsState.errorKey === key ? TTS_ERROR : "";
    if (status && status.textContent !== message) status.textContent = message;
  });
}

// keepError — оставить сообщение об ошибке (остановка из-за самой ошибки).
function ttsStop(keepError) {
  if (ttsState.audio) {
    ttsState.audio.pause();
    ttsState.audio = null;
  }
  ttsState.key = null;
  if (!keepError) ttsState.errorKey = null;
  ttsRefresh();
}

function ttsFailed(audio, key) {
  if (ttsState.audio !== audio) return; // ошибка старой записи, которую уже сменили
  ttsState.errorKey = key;
  ttsStop(true);
}

function ttsPlay(key) {
  const entry = typeof AUDIO !== "undefined" && AUDIO.items[key];
  if (!entry) return;
  ttsStop();
  const audio = new Audio(entry[ttsVoice()]);
  ttsState.audio = audio;
  ttsState.key = key;
  audio.addEventListener("ended", () => { if (ttsState.audio === audio) ttsStop(); });
  audio.addEventListener("error", () => ttsFailed(audio, key));
  audio.play().catch(() => ttsFailed(audio, key));
  ttsRefresh();
}

function ttsToggle(key) {
  if (ttsState.key === key && ttsState.audio && !ttsState.audio.paused) ttsStop();
  else ttsPlay(key);
}

function ttsNextVoice() {
  const voices = ttsVoices();
  const next = voices[(voices.indexOf(ttsVoice()) + 1) % voices.length];
  ttsState.voice = next; // работает и без хранилища; localStorage — только чтобы помнить между визитами
  try { localStorage.setItem(TTS_VOICE_KEY, next); } catch { /* голос не запомнится после перезагрузки */ }
  const replay = ttsState.key && ttsState.audio && !ttsState.audio.paused ? ttsState.key : null;
  if (replay) ttsPlay(replay);
  else ttsRefresh();
}

document.addEventListener("click", event => {
  const box = event.target.closest(".tts[data-tts-key]");
  if (!box) return;
  if (event.target.closest(".tts-play")) ttsToggle(box.dataset.ttsKey);
  else if (event.target.closest(".tts-voice")) ttsNextVoice();
});

// Смена карточки или раздела — звук останавливается.
window.addEventListener("hashchange", () => ttsStop());
