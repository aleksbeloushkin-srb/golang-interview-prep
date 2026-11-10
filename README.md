English | [Русский](README.ru.md)

# Go Interview Prep

[![Go](https://img.shields.io/badge/examples_tested_on_Go-1.24.7_%7C_1.27.3-00ADD8?style=flat-square&logo=go)](https://aleksbeloushkin-srb.github.io/golang-interview-prep/)
[![Cards](https://img.shields.io/badge/cards-72-38bdf8?style=flat-square)](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/cards)
[![Diagrams](https://img.shields.io/badge/diagrams-12-a855f7?style=flat-square)](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/simulators)
[![Quiz](https://img.shields.io/badge/quiz-55-f59e0b?style=flat-square)](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/quiz)
[![Practice](https://img.shields.io/badge/practice_tasks-26-ef4444?style=flat-square)](https://aleksbeloushkin-srb.github.io/golang-interview-prep/#/practice)
[![No build](https://img.shields.io/badge/build_step-none-22c55e?style=flat-square)](#run-locally)

A study site for Go backend interviews: runtime internals, concurrency, idioms, service design and coding tasks with tests. Plain HTML, CSS and JavaScript, with no build step and no runtime dependencies.

**Site:** https://aleksbeloushkin-srb.github.io/golang-interview-prep/

The interface is in Russian. Answers are in English, written to be said out loud, with a Russian explanation next to each.

## Sections

On a desktop the sections are header tabs; on a phone, Plan, Cards and Diagrams are in the bottom bar and the rest under "More".

| Section | Route | What it does |
|---|---|---|
| Plan | `#/plan` | 13 weeks, 189 tasks by day, each linked to its material |
| Cards | `#/cards` | 72 questions in 10 modules, answered from memory, with a review schedule |
| Diagrams | `#/simulators` | 12 step-by-step diagrams, 95 steps |
| Quiz | `#/quiz` | 55 code traps: what it prints, where the bug is, how to fix it |
| Practice | `#/practice` | 26 coding tasks with tests, the `go-prep` repository guide, a guide on comparable types and map keys, the "Channels and context" track |
| Knowledge base | `#/wiki` | all card topics on one page and two reference projects |
| Cheat sheet | `#/cheatsheet` | 22 rows: how each mechanism works and the numbers worth naming |

### Plan

- Weeks 1–4: the language and concurrency. Weeks 5–8: a practice project, a ledger service. Weeks 9–13: interview formats — take-home and code review, system design, behavioral, mock interviews.
- The calendar starts on your own date (the Monday of week 1) and can be shifted by a week; it highlights today and what is left for the day.
- Tasks are checked off with a counter per week. Many have a "Done when" criterion; LeetCode problems have a hint to open after your attempt; some tasks have a model answer in English. Plan marks can be exported and imported as JSON.
- Talk-through trainer: Clarify → Approach → Complexity → Edge cases, a timer per step, a model answer, a self-rating and your weak steps.

### Cards

- 28 Base, 35 Senior and 9 Deep Dive cards. Filters: module, level, search, "To review", "With practice".
- Recall first: say the first sentence out loud and answer in your own words; if stuck, open the anchors (`H`); then compare and rate yourself: "didn't answer", "with anchors" or "on my own".
- The rating sets the next review: tomorrow, in 2 days, or in 4, 8, 16 and then 30 days for answers on your own in a row. "Continue session" takes up to 10 cards: overdue first, then unchecked cards of the current plan week.
- A card has a short English answer, "If asked about Java and Kotlin" (70 cards), how it works in English with a Russian translation, where it matters in practice, code, a version note with sources, an exercise, and links to its diagram and quiz questions.
- Keys: `H` anchors, `Space` answer, `←`/`→` navigate, `L` listen, `1` on my own, `2` with anchors, `3` didn't answer.

| # | Module | Topics | Cards |
|---|---|---|---|
| 1 | Goroutines & Stack | goroutines vs threads, data race vs race condition, goroutine start, stack growth, resuming a goroutine | 6 |
| 2 | GMP Scheduler | G, M, P and `GOMAXPROCS`, preemption, work stealing, netpoll, syscalls and cgo, `runnext`, leaks | 6 |
| 3 | Channels, Select & Sync | channel states, channel or mutex, `hchan` and `sudog`, `selectgo`, CAS, `sync.Mutex`, WaitGroup, Once, Context, deadlock, `sync.Cond` | 12 |
| 4 | Memory, Allocator & GC | stack vs heap, escape analysis, `mcache`/`mcentral`/`mheap`, tri-color GC, `GOGC`, `GOMEMLIMIT`, write barrier | 6 |
| 5 | Maps, Interfaces & Go 1.25+ | slices and strings, Swiss Tables, interfaces and typed nil, method sets, `defer`, `weak`, `unique`, iterators, `synctest`, `FlightRecorder` | 10 |
| 6 | Go Idioms | errors and `errors.Is`/`As`/`Join`, zero values, strings and runes, generics, modules, table-driven tests, embedding | 7 |
| 7 | Go Service: HTTP, Errors, SQL, Logs | `net/http` and server timeouts, domain errors as HTTP codes, `database/sql`, `log/slog` | 4 |
| 8 | Data Consistency | isolation levels, transfers without deadlocks, idempotent payments, outbox, Kafka consumers, slow queries | 6 |
| 9 | Go Service Architecture | layout, dependency injection, shutdown, REST and OpenAPI, gRPC, long polling, channel patterns, library stack | 8 |
| 10 | Reliability and Data | a PostgreSQL task queue, transactions across repositories, unknown-outcome calls, caching and Redis locks, Temporal, log redaction, `context` | 7 |

### Diagrams

Stacks and registers, the GMP scheduler, channels, `select`, CAS, the allocator and GC, maps, `sync.Mutex`, bit operations, an HTTP request in `net/http`, deadlock and livelock, and a channel-or-mutex decision tree. Each step is a board of lanes and tokens: changed tokens are marked Δ, a "What changed" list follows, and the step ends with a self-check question. On 35 steps you predict the result first. Steps have their own links (`#/simulators/sim9/3`), and each diagram lists its cards.

### Quiz

A snippet, four to six options, an explanation in Russian, an answer to say in English, corrected code for 40 questions, and links to the cards. "Answer first" mode hides the options until you have written your own answer.

### Practice

- 26 tasks for weeks 1–6 and 9: money and errors, `defer`, generics, a CSV tool, worker pool, pipeline, fan-in and fan-out, errgroup, token bucket, graceful shutdown, a goroutine leak, escape analysis, pprof, an HTTP API, a timeout wrapper, parallel transfers, idempotency, outbox, tee and or-done.
- Each has a contract in English and Russian, a starter, tests for `go test -race`, hints one at a time, a reference solution, a one-minute English explanation, common mistakes and variations; 15 also have "3 checks before you submit".
- "Check on server" runs your pasted solution against the same tests with `-race` on Go 1.27.3, without network access; it needs sign-in.
- Reference solutions and tests are in `docs/verification/fixtures/practice/`; the tests were checked against deliberately broken solutions.
- **Your `go-prep` repository** (`#/practice/go-prep`): one module with a package per task, drills for run, build, vet and test, CI on GitHub Actions, compiler and assembly output (`-S`, `-m`, `GOSSAFUNC`, objdump), a command reference, and where Go keeps its files: `GOROOT`, `GOPATH` and the caches.
- **"Channels and context" track** (`#/practice/track-channels`): 28 katas in 5 blocks, from channel basics through `select`, `context` and leaks to fan-in, fan-out, pipelines, bounded concurrency, errgroup and rate limiting, with code-review exercises and a table of Go version differences. The katas also appear in plan days of weeks 4–12; a kata is done when its plan task is checked.

### Knowledge base

All 72 card topics on one page, and two reference projects with a reading order through the code:

- [go-payments-reference](https://github.com/aleksbeloushkin-srb/go-payments-reference): a payment service with idempotent payment creation, a PostgreSQL task queue (`SKIP LOCKED` and leases), outbox, webhooks, long polling, graceful shutdown and a failing fake gateway.
- [pinkponies-bank](https://github.com/aleksbeloushkin-srb/pinkponies-bank): three services — a gRPC ledger with double-entry accounts and holds, transfers as an orchestrated saga with an outbox to Kafka, and an idempotent Kafka consumer with a dead-letter topic.

### Audio

148 English recordings (Kokoro TTS, voices Michael and a slower Heart): short answers and Java comparisons for 52 cards, plan model answers for weeks 1–3, and explanations for 12 practice tasks. The "Listen" button appears only if the recording matches the current text.

## Sign-in and progress

- "Sign in with Google" goes through Amazon Cognito (authorization code with PKCE); tokens stay in memory. Card ratings, plan marks and start date, trainer results and solved tasks sync to the server, so every device shows the same progress. If two devices disagree, you can merge them or keep one side.
- Without sign-in the site is read-only: all material, the quiz and starters are open, but marks are not saved.
- For now only test accounts can sign in: the Google OAuth app is in testing mode.
- Backend: [golang-interview-prep-api](https://github.com/aleksbeloushkin-srb/golang-interview-prep-api) — Go AWS Lambda functions, Cognito, progress with optimistic locking, and a runner for `go test -race` without network access.

## Go versions

The site treats Go 1.27.3 as current. Examples and practice tests are checked on Go 1.24.7 and 1.27.3. Where releases differ, the material says what changed and when: `sync.WaitGroup.Go` arrived in 1.25; the goroutine leak profile was experimental in 1.26 and is on by default in 1.27. Every card and quiz question has a version note and sources.

## Run locally

```bash
git clone https://github.com/aleksbeloushkin-srb/golang-interview-prep.git
cd golang-interview-prep
python3 -m http.server 8000 --bind 127.0.0.1
```

Open `http://127.0.0.1:8000`; stop with Ctrl+C. `js/config.js` points at the public backend, so this copy is read-only. To keep progress in the browser instead, serve it without the backend: `python3 docs/verification/browser/serve.py 8765 --root . --no-backend`.

## Checks

| Command | What it checks |
|---|---|
| `node scripts/check-content.mjs --base <commit>` | data syntax and structure, IDs, links, practice code against fixtures, audio freshness, Liquid syntax in tracked `.md` files |
| `node --test` | `scripts/*.test.mjs`: the checker, the Go source registry, progress merging, the review schedule |
| `go vet ./... && go test -race -count=1 ./...` | practice reference solutions, run in `docs/verification/fixtures/practice` |
| `docs/verification/browser/check-*.js` | Playwright suites; see [their README](docs/verification/browser/README.md) |

They do not replace a review of the Go content. The review process is in [VERIFICATION_WORKFLOW_RU.md](VERIFICATION_WORKFLOW_RU.md); rules for contributors and coding agents are in [AGENTS.md](AGENTS.md).

## Repository layout

```text
index.html         page shell and navigation
css/style.css      styles
js/                app.js (routing, cards, quiz, diagrams, knowledge base, cheat sheet),
                   plan-view.js, practice-view.js, review-queue.js, talk-trainer.js,
                   audio.js, auth.js (sign-in and sync), progress-merge.js,
                   config.js (public backend addresses, not secrets)
data/              cards.js, quiz.js, simulators.js (diagrams and cheat sheet), plan.js,
                   practice.js, guides.js, tracks.js, audio.js (recording manifest)
audio/en/          recordings
scripts/           content checker, tests, audio generation, Go source registry
docs/verification/ Go fixtures, browser suites, check reports
```

Files ending in `_RU.md` in the root and in `docs/` are internal working notes in Russian (handoff, audits, review reports); release history is in [CLAUDE_CHANGE_LOG_RU.md](CLAUDE_CHANGE_LOG_RU.md).
