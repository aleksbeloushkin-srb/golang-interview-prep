// Ключ localStorage, запись в который браузер может не дать сделать (переполнено хранилище, запрет записи).
// Каждая правка — функция над разобранным значением. Пока запись не удалась, правки живут в памяти и
// накладываются на свежий снимок при каждом чтении: следующая правка не стирает предыдущую несохранённую,
// а записанное в снимок другой вкладкой не теряется. После отказа запись повторяется сама (onRetry) раз
// в PENDING_RETRY_MS, пока не удастся. Используют отметки карточек и попытки (app.js) и отметки плана (plan-view.js).
const PENDING_RETRY_MS = 5000;

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
  return store;
}

if (typeof module !== "undefined") module.exports = { pendingStore, PENDING_RETRY_MS };
