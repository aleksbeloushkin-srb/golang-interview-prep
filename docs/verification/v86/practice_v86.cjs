// One-off edit of data/practice.js for v86: three new tasks generated from their fixtures,
// and the kata of the track as a changed condition (field katas) for W3-1, W3-3, W4-1, W4-4:
// the practice page shows it from data/tracks.js, so the kata is described only there.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../../..");
const file = path.join(root, "data/practice.js");
const src = fs.readFileSync(file, "utf8");
const marker = "const PRACTICE = ";
const start = src.indexOf(marker), end = src.lastIndexOf("];");
const tasks = JSON.parse(src.slice(start + marker.length, end + 1));
const fixture = (dir, name) => fs.readFileSync(path.join(root, dir, name), "utf8").replace(/\n+$/, "");
const byId = id => { const t = tasks.find(x => x.id === id); if (!t) throw new Error(id); return t; };

function files(dir, pkg) {
  return {
    starter: { name: `${pkg}.go`, code: fixture(dir, "starter.go.txt") },
    tests: { name: `${pkg}_test.go`, code: fixture(dir, `${pkg}_test.go`) },
    solution: { name: `${pkg}.go`, code: fixture(dir, `${pkg}.go`) }
  };
}

const timeout = {
  id: "p-timeout", code: "W5-3", week: 5,
  title: "Обёртка с таймаутом", titleEN: "A call with a timeout",
  goalRU: "Дождаться результата функции не дольше заданного времени и не оставить горутину висеть после того, как функция вернулась, — даже если она не слушает ctx: пока функция работает, её горутина живёт, обёртка лишь перестаёт ждать.",
  contractRU: [
    "Call возвращает результат и ошибку f, если f успела за d.",
    "По истечении d — нулевое значение и context.DeadlineExceeded (errors.Is); если раньше отменён родительский ctx — его ctx.Err().",
    "f получает ctx с этим дедлайном; Call отменяет его при возврате — и после успеха тоже.",
    "Call не ждёт f, которая не слушает ctx: возвращается в срок.",
    "Опоздавшая f отдаёт результат и завершается: после возврата Call её горутина не висит."
  ],
  contractEN: [
    "Call returns f's result and error if f finishes within d.",
    "After d it returns the zero value and context.DeadlineExceeded (errors.Is); if the parent ctx is done first, its ctx.Err().",
    "f gets a ctx with that deadline; Call cancels it on return, after success too.",
    "Call does not wait for an f that ignores ctx: it returns on time.",
    "A late f still hands over its result and exits: its goroutine does not hang after Call has returned."
  ],
  planTasks: ["w5-sat-4"],
  links: ["c22", "c12", "q9"],
  katas: ["k2-5"],
  hints: [
    "context.WithTimeout(ctx, d) и defer cancel(): дедлайн для f и отмена на любом пути выхода — две строки.",
    "Запусти f в горутине и жди в select: результат или <-ctx.Done().",
    "Канал результата — с буфером 1: опоздавшая f отправит и выйдет, даже если её уже никто не ждёт.",
    "Результат и ошибку отправь одной структурой: так их не перепутать."
  ],
  talkEN: "Call runs f in a goroutine and waits in a select for its result or for the derived context to be done. The context carries the deadline, so a cooperative f can stop, and Call cancels it on return, after success too. Stopping the wait does not stop the work: if f ignores its context it keeps running, so the result channel has a buffer of one — the late send never blocks and the goroutine exits. On timeout I return context.DeadlineExceeded, not my own error, so callers can use errors.Is.",
  invariantsRU: [
    "`context.WithTimeout` и `defer cancel()`: f получает дедлайн, отмена — на любом пути выхода.",
    "Канал результата — `make(chan result, 1)`: опоздавшая f отправит и выйдет.",
    "Ждать в `select` результат и `<-ctx.Done()`; по таймауту вернуть `ctx.Err()`."
  ],
  pitfalls: [
    "Небуферизованный канал результата → после таймаута горутина f навсегда висит на отправке.",
    "Свой errTimeout вместо ctx.Err() → вызывающий не отличит дедлайн от отмены через errors.Is.",
    "time.After(d) вместо ctx с дедлайном → f не узнаёт о таймауте; а без <-ctx.Done() родителя в том же select и отмена родителя не прерывает ожидание.",
    "Нет cancel после успеха → таймер и всё, что f запустила с этим ctx, живут до дедлайна.",
    "Ждать, что обёртка прервёт работу → она лишь перестаёт ждать; остановится только f, которая слушает ctx."
  ],
  followUps: [
    "Верни причину отмены: `context.WithTimeoutCause` и `context.Cause(ctx)`.",
    "Сделай Call без дженериков для `func(context.Context) error` — что упростится?"
  ],
  fixture: "docs/verification/fixtures/practice/timeout",
  files: files("docs/verification/fixtures/practice/timeout", "timeout")
};

const fanout = {
  id: "p-fanout", code: "W6-4", week: 6,
  title: "Fan-out по ключу", titleEN: "Fan-out by key",
  goalRU: "Разложить поток значений по N выходам так, чтобы значения с одним ключом шли в один выход и в порядке поступления — как сообщения по партициям Kafka.",
  contractRU: [
    "n < 1 считается как 1; Route возвращает ровно n выходов.",
    "Значения с одним ключом всегда идут в один и тот же выход и в порядке поступления; разные ключи расходятся по выходам.",
    "До отмены каждое значение доставляется ровно один раз; значение в пути при отмене отбрасывается.",
    "Все выходы закрываются после закрытия in или отмены ctx — и те, в которые ничего не пришло.",
    "Пока выход не читают, Route ждёт: медленный читатель тормозит всех, значения не копятся в памяти; отмена прерывает и это ожидание.",
    "in принадлежит отправителю: Route его не закрывает."
  ],
  contractEN: [
    "n < 1 means 1; Route returns exactly n outputs.",
    "Values with the same key always go to the same output, in arrival order; different keys spread over the outputs.",
    "Until cancellation every value is delivered exactly once; a value in flight at cancellation is dropped.",
    "All outputs are closed after in is closed or ctx is done — including outputs that got nothing.",
    "While an output is not read, Route waits: a slow reader holds back all of them and values do not pile up in memory; cancellation ends that wait too.",
    "in belongs to its sender: Route never closes it."
  ],
  planTasks: ["w6-sat-6"],
  links: ["c13", "c18", "sim3"],
  katas: ["k3-2"],
  hints: [
    "Одна горутина-маршрутизатор: читает in, считает номер выхода по ключу, отправляет. Раз горутина одна, порядок внутри ключа сохраняется сам.",
    "Номер выхода — хеш ключа по модулю n: hash/fnv (fnv.New32a) даёт одно и то же число для одного ключа.",
    "Закрывает выходы тот, кто в них пишет: в маршрутизаторе — defer с циклом close.",
    "Обе точки ожидания — чтение in и отправка в выход — в select с <-ctx.Done()."
  ],
  talkEN: "Route has one goroutine that reads the input, hashes each value's key with FNV and sends the value to output hash mod n. A key always lands on the same output, and with a single router it keeps its order — the same idea as Kafka partitions. The router owns the outputs and closes all of them on any exit, including outputs that never got a value. Both waits, reading the input and sending, sit in a select with ctx.Done(). The trade-off is head-of-line blocking: a slow reader holds back every output; dropping instead would need a select with default and a drop counter.",
  invariantsRU: [
    "Один маршрутизатор: номер выхода — хеш ключа `% n`, `n < 1` → 1.",
    "Чтение `in` и отправка в выход — в `select` с `<-ctx.Done()`.",
    "Маршрутизатор закрывает все выходы в `defer`, пустые тоже; `in` не закрывать."
  ],
  pitfalls: [
    "Горутина на значение для отправки → порядок внутри ключа теряется.",
    "Round-robin вместо ключа → один ключ попадает в разные выходы.",
    "Закрыть только выходы, куда что-то пришло → читатель пустого выхода ждёт вечно.",
    "Отправка без select → после отмены читатель ушёл, маршрутизатор висит навсегда.",
    "Новый maphash.Seed на каждое значение → у одного ключа разные номера выхода."
  ],
  followUps: [
    "Медленного получателя — отбрасывать: select с default и счётчик потерь на выход. Какие гарантии останутся?",
    "Fan-out в смысле Cox-Buday — N стадий читают один вход: когда нужен он, когда маршрутизация, а когда хватит обычного пула?",
    "Число выходов меняется на ходу: почему хеш по модулю тогда перемешивает ключи и что делает consistent hashing?"
  ],
  fixture: "docs/verification/fixtures/practice/fanout",
  files: files("docs/verification/fixtures/practice/fanout", "fanout")
};

const tee = {
  id: "p-tee", code: "W9-1", week: 9,
  title: "Tee и or-done", titleEN: "Tee and or-done",
  goalRU: "Прекратить чтение канала по отмене (or-done) и раздать каждое значение всем N читателям в том же порядке (tee) — без утечек горутин, даже когда читатели ушли.",
  contractRU: [
    "OrDone пересылает значения in, пока in не закрыт и ctx не отменён, и закрывает выход в обоих случаях; in не закрывает.",
    "Если читатель ушёл после отмены, горутина OrDone не остаётся висеть на отправке.",
    "Tee: n < 1 считается как 1; каждый из n выходов получает каждое значение ровно один раз, в порядке in.",
    "Следующее значение читается, только когда текущее дошло до всех выходов: медленный читатель тормозит остальных.",
    "Все выходы закрываются после закрытия in или отмены ctx; после отмены не остаётся горутин, даже если выходы никто не читает."
  ],
  contractEN: [
    "OrDone forwards values from in until in is closed or ctx is done, and closes its output in both cases; it never closes in.",
    "If the reader left after cancelling, the OrDone goroutine does not stay blocked on its send.",
    "Tee: n < 1 means 1; each of the n outputs gets every value exactly once, in the order of in.",
    "The next value is read only after the current one has reached every output: a slow reader holds back the others.",
    "All outputs are closed after in is closed or ctx is done; after cancellation no goroutine is left, even if nobody reads the outputs."
  ],
  planTasks: ["w9-sat-2"],
  links: ["c13", "c18"],
  katas: ["k3-3", "k3-7"],
  hints: [
    "OrDone — for-select по in и <-ctx.Done(), а отправка — в своём select с <-ctx.Done().",
    "Tee читает через OrDone: for v := range OrDone(ctx, in) — отмена на чтении уже учтена.",
    "На каждое значение — по горутине на выход и sync.WaitGroup; wg.Wait() до следующего значения: никто не убежит вперёд, порядок сохранится.",
    "Книжный вариант на двух выходах: копия out1, out2 один раз на значение, отправленный канал — в nil (nil-канал в select никогда не готов)."
  ],
  talkEN: "OrDone wraps a channel so a reader can range over it and still stop on cancellation: the forwarding goroutine selects on the input and ctx.Done(), and the send has its own select, otherwise a reader that left would leave it blocked forever. Tee reads through OrDone and, for each value, starts one goroutine per output and waits for all of them before reading the next value. Every output keeps the input order and moves in step, so a slow reader slows the others — that is the contract of tee. If readers need independent speed, I'd use per-reader buffers or pub/sub, not tee.",
  invariantsRU: [
    "Отправка в OrDone — в своём `select` с `<-ctx.Done()`; выход закрывается в `defer`.",
    "Tee: `wg.Wait()` по всем выходам до следующего значения — никто не уходит вперёд.",
    "`n < 1` → 1; все выходы закрывает Tee после `in` или отмены; `in` не закрывать."
  ],
  pitfalls: [
    "Отправка в OrDone без select → читатель отменил и ушёл, горутина висит навсегда.",
    "Горутина на значение без ожидания («быстрый» tee) → порядок в выходах теряется.",
    "Копия out1, out2 внутри внутреннего цикла → один выход получает значение дважды, другой — ни разу.",
    "Закрыть выходы, пока горутины ещё отправляют → panic: send on closed channel."
  ],
  followUps: [
    "Напиши книжный Tee на двух выходах через nil-каналы, без горутин на выход. Что проще, что ограниченнее?",
    "Читателям нужна независимая скорость: буфер на выход и политика переполнения — почему это уже не tee?"
  ],
  fixture: "docs/verification/fixtures/practice/tee",
  files: files("docs/verification/fixtures/practice/tee", "tee")
};

// Changed conditions: the kata of the track, shown as a variation block; contract and followUps stay.
for (const [id, kata] of [["p-workerpool", "k3-5"], ["p-fanin", "k3-1"], ["p-parallelfetch", "k3-8"], ["p-leak", "k2-7"]]) {
  const t = byId(id);
  if (t.katas) throw new Error(`${id} already has katas`);
  // Insert after followUps to keep the existing key order of the task.
  const entries = Object.entries(t);
  const at = entries.findIndex(([key]) => key === "followUps") + 1;
  entries.splice(at, 0, ["katas", [kata]]);
  Object.keys(t).forEach(key => delete t[key]);
  Object.assign(t, Object.fromEntries(entries));
}

// New tasks in week order: after the last task of their week.
function insertAfterWeek(task) {
  if (tasks.some(t => t.id === task.id)) throw new Error(`${task.id} exists`);
  let at = tasks.length;
  for (let i = tasks.length - 1; i >= 0; i--) if (tasks[i].week <= task.week) { at = i + 1; break; }
  tasks.splice(at, 0, task);
}
[timeout, fanout, tee].forEach(insertAfterWeek);

fs.writeFileSync(file, src.slice(0, start + marker.length) + JSON.stringify(tasks, null, 2) + src.slice(end + 1));
console.log(tasks.map(t => `${t.code}:${t.id}`).join(" "));
