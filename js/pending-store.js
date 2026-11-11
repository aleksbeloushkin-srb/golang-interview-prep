// Ключ localStorage, запись в который браузер может не дать сделать (переполнено хранилище, запрет записи).
// Каждая правка — функция над разобранным значением. Пока запись не удалась, правки живут в памяти и
// накладываются на свежий снимок при каждом чтении: следующая правка не стирает предыдущую несохранённую,
// а записанное в снимок другой вкладкой не теряется. После отказа запись повторяется сама (onRetry) раз
// в PENDING_RETRY_MS, пока не удастся. Используют отметки карточек и попытки (app.js) и отметки плана (plan-view.js).
const PENDING_RETRY_MS = 5000;
// Хранилища по ключу — для синхронизации с сервером (auth.js): она отправляет то, что видит пользователь,
// вместе с несохранённым, а записав итог в браузер, снимает правки, которые в него уже вошли.
const PENDING_STORES = new Map();

// read() — свежий разобранный снимок, новый объект на каждый вызов.
function pendingStore(key, read, onRetry) {
  const edits = [];
  let timer = null;
  const stopRetry = () => {
    clearTimeout(timer);
    timer = null;
  };
  const store = {
    read() {
      const value = read();
      edits.forEach(edit => edit(value));
      return value;
    },
    // true — записано и правки больше не нужны; false — правки остаются в памяти, повтор по таймеру.
    write(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        if (!timer && onRetry) timer = setTimeout(() => { timer = null; onRetry(); }, PENDING_RETRY_MS);
        return false;
      }
      edits.length = 0;
      stopRetry();
      return true;
    },
    // Правка поверх свежего снимка; возвращает итог, записанный или нет.
    change(edit) {
      edits.push(edit);
      const value = store.read();
      store.write(value);
      return value;
    },
    get pending() {
      return edits.length > 0;
    },
    // Несохранённые правки больше не нужны (сброс прогресса).
    forget() {
      edits.length = 0;
      stopRetry();
    }
  };
  PENDING_STORES.set(key, store);
  return store;
}

// Несохранённое всех хранилищ: { ключ: строка JSON } — то, что будет записано, когда браузер даст.
function pendingSnapshot() {
  const out = {};
  for (const [key, store] of PENDING_STORES) if (store.pending) out[key] = JSON.stringify(store.read());
  return out;
}

// Значение ключа записано целиком, и несохранённые правки в нём уже учтены.
function pendingForget(key) {
  const store = PENDING_STORES.get(key);
  if (store) store.forget();
}

if (typeof module !== "undefined") module.exports = { pendingStore, pendingSnapshot, pendingForget, PENDING_RETRY_MS };
