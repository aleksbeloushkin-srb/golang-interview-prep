// Текст для озвучки: как код и обозначения произносят вслух на интервью.
// На странице остаётся исходный текст; это преобразование нужно только генератору аудио.

// Слова, которые синтезатор иначе читает неверно. Ключ — токен целиком.
const WORDS = {
  fmt: "F-M-T",
  io: "I-O",
  EOF: "E-O-F",
  Errorf: "Error-f",
  int64: "int sixty-four",
  float64: "float sixty-four",
  EUR: "euros",
  JPY: "yen",
  JVM: "J-V-M",
  ID: "I-D",
  OS: "O-S",
  GC: "G-C",
  CPU: "C-P-U",
  HTTP: "H-T-T-P",
  API: "A-P-I",
  SQL: "S-Q-L",
  JSON: "Jason",
  LIFO: "LIE-foe",
  GOMAXPROCS: "GO-MAX-PROCS",
  GOGC: "GO-G-C",
  GOMEMLIMIT: "GO-MEM-LIMIT"
};

// Fowler–Noll–Vo, 32 бита: тот же хеш считает страница (js/audio.js), чтобы найти запись к текущему тексту.
export function textHash(text) {
  let h = 0x811c9dc5;
  for (const ch of text) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

const splitCamel = word => word
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

function speakWord(word) {
  if (Object.hasOwn(WORDS, word)) return WORDS[word];
  if (/^[A-Z]{2,5}$/.test(word)) return word.split("").join("-"); // аббревиатура: по буквам
  if (/[a-z][A-Z]|[A-Z]{2}[a-z]/.test(word)) return splitCamel(word);
  return word;
}

export function toSpeech(text) {
  let s = text;
  s = s.replace(/[“”]/g, "\"").replace(/[‘’]/g, "'");
  s = s.replace(/""/g, "empty string");
  s = s.replace(/"([^"\n]{1,60})"/g, "$1"); // строковые литералы читаются как текст
  s = s.replace(/\b[Gg]o (1)\.(\d+)\+?/g, (m, one, minor) => `Go one ${minor}${m.endsWith("+") ? " or later" : ""}`);
  s = s.replace(/%([wvsdq])\b/g, "percent $1");
  s = s.replace(/\s:=\s/g, " colon-equals ");
  s = s.replace(/\s!=\s/g, " not equal to ");
  s = s.replace(/\s==\s/g, " equals ");
  s = s.replace(/\(&(\w+)\)\.(\w+)\(\)/g, "address of $1 dot $2");
  s = s.replace(/\(&(\w+)\)/g, "address of $1");
  s = s.replace(/&(\w+)\{\}/g, "address of a $1 literal");
  s = s.replace(/&(\w+)/g, "address of $1");
  s = s.replace(/\b(\w+)\{\}/g, "a $1 literal");
  s = s.replace(/\bmap\[(\*?\w+)\](\*?\w+)/g, "map of $1 to $2"); // map[K]*V → map of K to pointer to V
  s = s.replace(/\*(\w+)/g, "pointer to $1");
  s = s.replace(/\[\](\w+)/g, "slice of $1");
  s = s.replace(/\b([A-Za-z_]\w*)\(\)/g, "$1"); // String() → String
  s = s.replace(/\b_\b/g, "underscore");
  s = s.replace(/\s=\s/g, " equals ");
  s = s.replace(/\b([A-Z])\?/g, "nullable $1");
  s = s.replace(/(^|[\s(])-(\d)/g, "$1minus $2");
  // pkg.Name → pkg dot Name (точка внутри токена, не конец предложения).
  s = s.replace(/\b([A-Za-z_]\w*)\.(?=[A-Za-z_])/g, "$1 dot ");
  s = s.replace(/[A-Za-z_][A-Za-z0-9_]*/g, speakWord);
  s = s.replace(/\s*\(\s*/g, ", ").replace(/\s*\)/g, ",").replace(/,\s*([,.;:])/g, "$1").replace(/,,+/g, ",");
  s = s.replace(/\?\./g, "?"); // "…?". после снятых кавычек
  return s.replace(/\s{2,}/g, " ").trim();
}
