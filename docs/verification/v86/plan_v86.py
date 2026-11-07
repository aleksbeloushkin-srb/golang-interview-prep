#!/usr/bin/env python3
"""One-off edit of data/plan.js for v86 (channels by week). Each fragment must occur exactly once."""
import pathlib
p = pathlib.Path(__file__).resolve().parents[3] / "data" / "plan.js"
s = p.read_text()

def once(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"{n} matches for: {old[:80]}"
    s = s.replace(old, new)

def friday(lc_line):
    return f"""        {{
          label: "Пт", minutes: 45, tasks: [
            {lc_line.strip()}
          ]
        }},
"""

once('revision: "2026-10-29e",', 'revision: "2026-11-07",')

# Week 4, Saturday: the live coding task is the "final boss" with a leak test.
once('{ id: "w4-sat-5", text: "Виртуальный live coding (Claude как интервьюер): одна задача на конкурентность, проговор по-английски, разбор" }',
     '{ id: "w4-sat-5", text: "Виртуальный live coding (Claude как интервьюер): «финальный босс» — processParallel(in, out, 5) за 5 с с тестом на утечки; проговор по-английски, разбор. В воскресный резерв — каты блоков 1–2 трека (К1.2, К2.2, К2.4 обязательно)", links: ["k2-6", "p-workerpool", "k1", "k2"] }')
once('"w4-sat-5": { accept: "Задача решена вслух за 40 минут; получен разбор; три слабых места записаны." },',
     '"w4-sat-5": { accept: "«Финальный босс» решён вслух за 40 минут, тест на утечки зелёный (что это значит — в шаге К2.6); получен разбор; три слабых места записаны." },')
once('пройдены контрольный квиз и виртуальный live coding;', 'пройдены контрольный квиз и виртуальный live coding («финальный босс» с тестом на утечки);')

# Weeks 5–8: LeetCode moves from Saturday to a new Friday (same task ID: it keys the saved mark),
# Saturday gets one task per kata.
weeks = [
    ("w5", '            { id: "w5-sat-3", text: "LeetCode 215. Kth Largest Element in an Array (heap) + проговор", lc: 215 }\n',
     ['{ id: "w5-sat-4", text: "Ката К2.5 (20 мин): обёртка с таймаутом — три версии, утечку находит тест", links: ["k2-5", "p-timeout"] }',
      '{ id: "w5-sat-5", text: "Ката К2.7 (20 мин): одна утечка — три детектора: goleak, профиль goroutineleak, synctest", links: ["k2-7", "p-leak"] }'],
     "Создание счёта и перевод работают через curl на docker compose up; есть ADR-001 на английском.", "К2.5 и К2.7"),
    ("w6", '            { id: "w6-sat-3", text: "LeetCode 435. Non-overlapping Intervals + проговор", lc: 435 },\n',
     ['{ id: "w6-sat-5", text: "Ката К3.1 (10 мин): fan-in на время — Merge(ctx, ins...) с чистого листа", links: ["k3-1", "p-fanin"] }',
      '{ id: "w6-sat-6", text: "Ката К3.2 (25 мин): fan-out по ключу — как партиции Kafka этой недели", links: ["k3-2", "p-fanout"] }'],
     "Тест: 100 параллельных переводов, сумма балансов неизменна, -race чистый; повтор с тем же idempotency key возвращает исходный результат.", "К3.1 и К3.2"),
    ("w7", '            { id: "w7-sat-3", text: "LeetCode 994. Rotting Oranges + проговор", lc: 994 }\n',
     ['{ id: "w7-sat-4", text: "Ката К3.5 (30 мин): ограничение работы в полёте — задача W3-1 пулом, семафором и errgroup.SetLimit", links: ["k3-5", "p-workerpool"] }',
      '{ id: "w7-sat-5", text: "Ката К3.8 (25 мин): errgroup на каналах и sync.Once; сравнить с x/sync/errgroup", links: ["k3-8", "p-parallelfetch"] }'],
     "Интеграционные тесты на testcontainers зелёные в CI; есть один бенчмарк с объяснением результатов.", "К3.5 и К3.8"),
    ("w8", '            { id: "w8-sat-2", text: "LeetCode 743. Network Delay Time (Dijkstra) + проговор", lc: 743 },\n',
     ['{ id: "w8-sat-5", text: "Ката К3.6 (25 мин): остановка — done-канал и Shutdown, повторный вызов безопасен", links: ["k3-6", "p-shutdown"] }',
      '{ id: "w8-sat-6", text: "Ката К3.9 (25 мин): rate limiter — leaky bucket против token bucket", links: ["k3-9", "p-ratelimit"] }'],
     "Публичный репозиторий; README объясняет архитектуру и компромиссы; пройден виртуальный Craft Deep-Dive по проекту на английском.", "К3.6 и К3.9"),
]
for week, lc_line, katas, done, names in weeks:
    sat_head = '        {\n          label: "Сб", minutes: 240, tasks: [\n'
    # The Saturday of this week: the LeetCode line sits inside it.
    i = s.index(lc_line)
    j = s.rindex(sat_head, 0, i)
    k = s.index("          ]\n        }", i)
    sat = s[j:k]
    assert sat.count(lc_line) == 1 and f'id: "{week}-sat-1"' in sat, week
    body = sat.replace(lc_line, "")
    body = body.rstrip().rstrip(",") + ",\n" + ",\n".join(f"            {t}" for t in katas) + "\n"
    s = s[:j] + friday(lc_line.rstrip().rstrip(",")) + body + s[k:]
    once(f'done: "{done}"', f'done: "{done[:-1]}; каты {names} решены на время, тесты зелёные."')

# Week 8, Saturday: two questions about the channel tricks of the reference code in the Deep-Dive.
once('{ id: "w8-sat-1", text: "Виртуальный Craft Deep-Dive (Claude как интервьюер): 30 минут вопросов по проекту на английском", talk: "deep-dive" }',
     '{ id: "w8-sat-1", text: "Виртуальный Craft Deep-Dive (Claude как интервьюер): 30 минут вопросов по проекту на английском; среди них — два о каналах в эталонном коде: К4.1 и К4.2", links: ["k4-1", "k4-2"], talk: "deep-dive" }')

# Week 9: one of the foreign PRs is channel code from the track.
once('{ id: "w9-sat-2", text: "Ещё 1 чужой PR в формате 40 минут" }',
     '{ id: "w9-sat-2", text: "Ещё 1 чужой PR в формате 40 минут — код с каналами из трека: tee с копией внутри цикла и «быстрый» tee (К3.3), or-done без select (К3.7), «решение без утечек» финального босса (К2.6)", links: ["k3-3", "k3-7", "p-tee"] }')

# Week 12, Saturday: the slot for two repeated tasks takes the first two katas of the timed run.
once('{ id: "w12-sat-2", text: "2 повторные задачи LeetCode из слабых тем" }',
     '{ id: "w12-sat-2", text: "Прогон на время, часть 1: каты К2.5 и К2.6 вслух, по 20–30 мин; остальные восемь — в воскресный резерв до мока 1", links: ["k5-1"] }')

p.write_text(s)
print("ok")
