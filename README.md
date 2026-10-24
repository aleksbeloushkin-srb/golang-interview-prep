# ⚡ Go Runtime & Concurrency — Interactive Interview Wiki

![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat-square&logo=go)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-22c55e?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

Интерактивная база знаний, шпаргалка и тренажёр по внутреннему устройству рантайма Go (планировщик GMP, управление стеками, регистры CPU, каналы, `select`, атомики `CAS` и сборщик мусора). 

Спроектировано для глубокой подготовки к **Middle / Senior / Staff Go Backend** интервью — с разбором исходного кода рантайма (`src/runtime/`) и ассемблерных вставок (`asm_amd64.s`).

🔗 **[Открыть интерактивный тренажёр (Live Demo)](https://<your-username>.github.io/<repo-name>/)**

---

## ✨ Возможности

* 🗂 **14 глубоких карточек Q&A (на английском + перевод вопросов):** Структурированные ответы в формате `Short Interview Answer` + `Key Details to Mention` + реальные вырезки из исходников рантайма Go.
* 🔬 **3 пошаговых интерактивных симулятора:**
  1. **Путь горутины и регистры CPU:** `go fn()` $\rightarrow$ `newproc1` на стеке `g0` $\rightarrow$ трюк с `runtime.goexit` $\rightarrow$ LIFO-слот `P.runnext` $\rightarrow$ переключение регистров `R14`, `RSP` и `RIP` в `runtime.gogo`.
  2. **Каналы (`hchan`) и `selectgo`:** парковка через `sudog` и `gopark(chanparkcommit)` на стеке `g0`, прямое копирование между стеками (`sendDirect`), `pollorder` / `lockorder` и атомарная гонка пробуждений `g.selectDone`.
  3. **Escape Analysis и Tri-Color GC:** фазы трёхцветной разметки Дейкстры (White $\rightarrow$ Grey $\rightarrow$ Black), работа `Hybrid Write Barrier` и настройка `GOGC` / `GOMEMLIMIT`.
* 💾 **Сохранение прогресса (`localStorage`):** Отмечай карточки как «Знаю отлично» или «Повторить ещё» — прогресс сохраняется прямо в браузере.
* ⌨️ **Keyboard-First навигация:** Полное управление с клавиатуры без мыши.
* 📦 **Zero Dependencies (Single-File Architecture):** Весь проект — это один самодостаточный файл `index.html` на чистом HTML/CSS/JS. Работает офлайн на любом устройстве.

---

## 📚 Архитектура колоды (4 модуля)

### Модуль 1: Горутины, Стек и Регистры CPU
* **Q1:** Определение горутины в коде и рантайме (`runtime.g`, `runtime.newproc`).
* **Q2:** Почему у горутин намеренно нет `ID` или дескриптора (`Thread` handle) в пользовательском коде.
* **Q3:** Где живёт горутина в памяти и как работает динамический рост/сжатие стека (`stackguard0`, `morestack`, `copystack`, сдвиг указателей `adjustpointers`).
* **Q4:** Как поток ОС (`M`) физически исполняет горутину и подменяет регистры (`g0`, `gobuf`, `runtime.mcall`, `runtime.gogo`, `runtime.goexit`).

### Модуль 2: Планировщик GMP, Вытеснение и Work Stealing
* **Q5:** Устройство модели планировщика `G-M-P` и мультиплексирование $M:N$.
* **Q6:** Зачем каждому процессору `P` нужен одноэлементный LIFO-стек `runnext` перед FIFO-очередью `runq[256]` (L1/L2 CPU cache locality).
* **Q7:** Гибридное вытеснение горутин (кооперативное через `stackPreempt` и асинхронное через `sysmon` + сигнал `SIGURG` каждые 10 мс).
* **Q8:** Алгоритм поиска работы (`runtime.findrunnable`), правило каждого 61-го тика, `Work Stealing` (кража 50% очереди) и разница между `netpoller` и блокирующим `syscall
