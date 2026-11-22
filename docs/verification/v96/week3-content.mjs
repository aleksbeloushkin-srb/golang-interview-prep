// v96: the content of the new week 3 «Биты и закрепление» — plan, practice, guides, quiz, card.
// add-week3.mjs inserts it into the data files; the texts live here so the insertion stays mechanical.

export const WEEK3_PLAN = {
  id: 'w3',
  title: 'Биты и закрепление недель 1–2',
  goal: 'Читать и менять биты без подсказки — операторы, сдвиги, маски, с результатом в битах до запуска — и закрепить недели 1–2 на Money, Account и двух разборах.',
  done: 'W3-1…W3-3 решены на сервере; LC 191, 231, 136, 268 и 338 — на Go; вариация Account с валютой и ParseMoney лежат в go-prep с тестами; оба разбора пройдены, ошибки названы до ответа. Самопроверка недели проговорена вслух по-английски без подсказок.',
  days: [
    { label: 'Пн', minutes: 90, tasks: [
      { id: 'w3-mon-4', text: 'Биты, часть 1: справка «Биты в Go», разделы 1–3 — как читать биты, переполнение и отрицательные числа, операторы & | ^ &^; у каждой строки сначала назови биты результата, потом сверь', links: ['g-go-bits', 'c73'] },
      { id: 'w3-mon-5', text: 'Quiz q56 и q57 — ответ до вариантов: переполнение uint8, сдвиг и деление отрицательного числа', links: ['q56', 'q57'] },
      { id: 'w3-mon-6', text: 'LeetCode 191. Number of 1 Bits + проговор: два решения — x & (x-1) и bits.OnesCount32', lc: 191, talk: 'lc191' }
    ] },
    { label: 'Вт', minutes: 90, tasks: [
      { id: 'w3-tue-6', text: 'Биты, часть 2: справка, разделы 4–5 — сдвиги без маски и по маске: проверить, поставить, снять, переключить бит, вырезать и записать поле; результат каждой строки — до сверки', links: ['g-go-bits-shifts', 'g-go-bits-masks'] },
      'w3-tue-5',
      { id: 'w3-tue-7', text: 'W3-1 Флаги прав Perm: 1 << iota, Has, Add, Remove через &^, Toggle, String и Parse «rwx». Проговор', links: ['p-perm'], talk: 'w3-1' },
      { id: 'w3-tue-8', text: 'LeetCode 231. Power of Two (≈10 мин): n > 0 && n&(n-1) == 0 — почему это работает, на 64 и 96 в битах', lc: 231 }
    ] },
    { label: 'Ср', minutes: 90, tasks: [
      { id: 'w3-wed-4', text: 'Биты, часть 3: справка, разделы 6–7 — x&(x-1), x&-x, XOR и math/bits; вывод примеров из раздела «Код и тренировка» — до запуска', links: ['g-go-bits-tricks'] },
      { id: 'w3-wed-5', text: 'W3-2 Битовое множество на []uint64: Add, Has, Remove, Len через bits.OnesCount64, Union и Elems по возрастанию. Проговор', links: ['p-bitset'], talk: 'w3-2' },
      { id: 'w3-wed-6', text: 'LeetCode 136. Single Number и 268. Missing Number — оба через XOR + проговор 136', lc: 136, talk: 'lc136' }
    ] },
    { label: 'Чт', minutes: 90, tasks: [
      { id: 'w3-thu-6', text: 'W3-3 Money.Allocate: раздел суммы на n частей без потери цента — вариация W1-1 на закрепление. Проговор', links: ['p-allocate', 'p-money'], talk: 'w3-3' },
      { id: 'w3-thu-7', text: 'Вариация Account на зачёт (≈40 мин): счёт хранит Money с валютой (W1-1 + W1-2); Deposit, Withdraw и Transfer в другой валюте — ErrCurrencyMismatch через %w; table-driven тест: валюта совпала, не совпала, не хватает средств', links: ['p-account', 'p-money', 'g-go-testing-table'] }
    ] },
    { label: 'Сб', minutes: 240, tasks: [
      { id: 'w3-sat-8', text: 'Разбор 1 (≈45 мин): чужой код с шестью ошибками недель 1–2 — причины назвать до ответа, исправить, тесты зелёные', links: ['g-week3-review-1'] },
      { id: 'w3-sat-9', text: 'Разбор 2 (≈30 мин): эталон W1-2 и альтернативы — по каждому решению «так, потому что… — иначе, если…»', links: ['g-week3-review-2', 'p-account'] },
      { id: 'w3-sat-10', text: 'Базовая задача (≈40 мин): ParseMoney("12.50 EUR") → Money; ошибка-тип *ParseError с полями Input и Reason, вызывающий достаёт её через errors.As; table-driven тест: целые, центы, JPY без дробной части, отрицательные, мусор', links: ['p-money', 'c33', 'g-go-testing-table'] },
      { id: 'w3-sat-11', text: 'LeetCode 338. Counting Bits + проговор: dp[i] = dp[i>>1] + i&1 — почему так', lc: 338, talk: 'lc338' },
      { id: 'w3-sat-12', text: 'Дополнительно: LeetCode 371. Sum of Two Integers — сложение через XOR и перенос', lc: 371, optional: true },
      { id: 'w3-sat-13', text: 'Карточка c73 — «Коротко по-английски» вслух; quiz q58 — поле из знакового байта по маске и без', links: ['c73', 'q58'] },
      { id: 'w3-sat-14', text: 'Самопроверка недели вслух по-английски: блоки «Самопроверка недели» и «Проговорить по-английски» внизу страницы' }
    ] }
  ],
  leetcode: [191, 231, 136, 268, 338],
  english: [
    'What does the AND NOT operator do in Go?',
    'How do you test, set and clear a bit with a mask?',
    'How do signed and unsigned right shifts differ in Go?',
    'Why does x & (x-1) clear the lowest set bit?'
  ],
  selfCheck: [
    'Чем a &^ b отличается от a & ^b и от a ^ b?',
    'Что напечатает -7 >> 1 и почему не -3?',
    'Как одним выражением проверить, что n — степень двойки?',
    'Как вырезать биты 4–7 из uint16 и почему у знакового числа маска нужна после сдвига?',
    'Почему u += 100 для u := uint8(200) даёт 44, а var b uint8 = 300 не компилируется?'
  ]
};

export const W3_TUE_5 = { from: 'Битовые операции (≈30 мин): диаграмма 9', to: 'Битовые операции (≈20 мин): диаграмма 9' };

export const ACCEPTANCE = {
  'w3-mon-4': 'Без подсказки: сколько стоит бит k; 1011_0110 прочитано как 182 и как −74; почему переполнение переменной не паникует; что делает &^ — с битами результата для a = 1100_1010 и b = 1010_0110.',
  'w3-mon-5': 'q56 и q57 — ответ до вариантов; объяснено, почему сдвиг вправо округляет вниз, а деление — к нулю.',
  'w3-mon-6': 'Два решения — через x & (x-1) и через bits.OnesCount32 — со сложностью: O(число единиц) и O(1); проговор по 4 шагам за 5 минут.',
  'w3-tue-6': 'Все строки разделов 4–5 предсказаны до сверки; объяснено, почему int8(-74) >> 4 даёт −5, а с маской 0x0F — 11.',
  'w3-tue-5': 'Шаги диаграммы 9 с вопросом — ответ вслух до раскрытия; объяснено, почему x&1 == 0 в Go не требует скобок.',
  'w3-tue-7': 'Тесты W3-1 на сервере зелёные; без подсказки: почему Has — это p&q == q, а не != 0, и почему Remove — &^, а не ^. Проговор W3-1 — вслух по шагам.',
  'w3-tue-8': 'n > 0 && n&(n-1) == 0 объяснено на 64 и 96 в битах.',
  'w3-wed-4': 'x&(x-1), x&-x и сокращение пар через XOR объяснены на 1011_0110; вывод Example_tricks и Example_mathBits назван до запуска.',
  'w3-wed-5': 'Тесты W3-2 на сервере зелёные; без подсказки: почему слово — i>>6, а бит — i&63, и как Elems обходит биты через TrailingZeros64 и w &= w-1. Проговор W3-2.',
  'w3-wed-6': 'LC 136 и 268 решены через XOR за O(n) времени и O(1) памяти; объяснено, почему пары сокращаются.',
  'w3-thu-6': 'Тесты W3-3 на сервере зелёные, включая отрицательные суммы и math.MaxInt64; по-английски одной фразой: почему не float64 и куда уходит остаток.',
  'w3-thu-7': 'Тест: операции одной валюты проходят; для другой errors.Is(err, ErrCurrencyMismatch) истинно, а errors.Is(err, ErrInsufficientFunds) — ложно; после отказа балансы прежние; go test -race проходит.',
  'w3-sat-8': 'Шесть причин названы до ответа; после шести правок go test ./week3/review зелёный; седьмое замечание — float64 для денег — названо.',
  'w3-sat-9': 'По каждой из семи строк — своя фраза «так, потому что… — иначе, если…»; одна проговорена по-английски.',
  'w3-sat-10': 'ParseMoney разбирает «12.50 EUR», «5 JPY», «-0.05 EUR»; на «12.5.0 EUR», «12.50», «abc EUR», а также «12.5 EUR» и «12.505 EUR» (цифр после точки столько, сколько у валюты, — W1-1) возвращает *ParseError, который достаёт errors.As; table-driven тест проходит под -race.',
  'w3-sat-11': 'dp[i] = dp[i>>1] + (i & 1) объяснено: сдвиг убирает младший бит, i&1 — это он сам; O(n).',
  'w3-sat-13': 'c73 — короткий ответ вслух за минуту; q58 — до вариантов.',
  'w3-sat-14': 'Все вопросы обоих блоков — ответ по-английски без подсказки, до минуты на вопрос; ошибочные отмечены для повтора.'
};

export const MODEL_ANSWERS = {
  'w3-mon-4': {
    hook: 'Bits from the right; two\'s complement; variables wrap; &^ clears.',
    en: 'An integer is a row of bits numbered from the right, and bit k is worth two to the power k. Negative numbers use two\'s complement: minus x is x with every bit flipped, plus one, so minus one has every bit set, and the byte 1011_0110 reads as 182 unsigned and minus 74 signed. Arithmetic on variables wraps around instead of panicking: a uint8 holding 200 plus 100 is 44. AND keeps common bits, OR merges them, XOR keeps differing bits, and Go\'s AND NOT clears the bits of the right operand.'
  },
  'w3-tue-6': {
    hook: 'Left shift multiplies; signed right shift copies the sign; shift then mask cuts a field.',
    en: 'A left shift moves bits up and multiplies by two per step until bits fall off the top. A right shift divides by two and rounds down: an unsigned value gets zeros from the left, a signed one gets copies of the sign bit, so minus seven shifted right by one is minus four. A mask selects positions: OR sets a bit, AND NOT clears it, XOR toggles it, and AND tests it. To cut a field from a signed value I shift and then mask, because the shift alone drags the sign bits along.'
  },
  'w3-sat-14': {
    hook: '&^ clears; signed >> rounds down; n&(n-1) == 0; shift then mask; constants are checked, variables wrap.',
    en: 'a &^ b clears in a the bits set in b; it equals a & ^b, while a ^ b would also set the bits a did not have. Minus seven shifted right by one is minus four, because a signed right shift copies the sign bit and rounds down, while division truncates toward zero. A positive n is a power of two when n & (n-1) is zero. To cut bits four to seven, I shift right by four and mask with 0x0F; for a signed value the mask removes the copied sign bits. A variable wraps: 200 plus 100 in a uint8 is 44, but the constant 300 does not fit a uint8, so the compiler rejects it.'
  }
};

export const LEETCODE = {
  136: { title: 'Single Number', slug: 'single-number', pattern: 'Bit manipulation', key: 'XOR everything: pairs cancel, the single value remains.' },
  191: { title: 'Number of 1 Bits', slug: 'number-of-1-bits', pattern: 'Bit manipulation', key: 'x & (x-1) clears the lowest set bit; count the steps, or call bits.OnesCount32.' },
  231: { title: 'Power of Two', slug: 'power-of-two', pattern: 'Bit manipulation', key: 'n > 0 && n & (n-1) == 0: a power of two has exactly one set bit.' },
  268: { title: 'Missing Number', slug: 'missing-number', pattern: 'Bit manipulation', key: 'XOR the indices 0..n with the values: everything pairs up except the missing number.' },
  338: { title: 'Counting Bits', slug: 'counting-bits', pattern: 'DP + bits', key: 'dp[i] = dp[i >> 1] + (i & 1): the shift drops the lowest bit, i & 1 is that bit.' },
  371: { title: 'Sum of Two Integers', slug: 'sum-of-two-integers', pattern: 'Bit manipulation', key: 'sum = a ^ b, carry = (a & b) << 1; repeat until the carry is zero, on a fixed-width type.' }
};

export const TALKS_LC = {
  lc191: {
    title: 'LC 191. Number of 1 Bits',
    clarify: 'Is n a positive int up to 2^31 − 1, as in the current problem, or any uint32? Is the function called many times?',
    approach: 'x & (x-1) clears the lowest set bit, so I count how many times I can do it before x becomes zero — one step per set bit. In production Go I would call bits.OnesCount32, which the compiler turns into a machine instruction where the CPU has one.',
    complexity: 'O(k) for k set bits, at most 32; bits.OnesCount32 is O(1).',
    edge: 'n = 1 gives 1 and 2^31 − 1 gives 31; for a general uint32, 0 gives 0 and 0xFFFFFFFF gives 32.',
    followUp: 'What if it is called millions of times? — bits.OnesCount32, or a 256-entry table indexed by each byte.'
  },
  lc136: {
    title: 'LC 136. Single Number',
    clarify: 'Does every other number appear exactly twice? Must the extra memory be O(1)?',
    approach: 'I XOR all the numbers: a ^ a is zero, a ^ 0 is a, and the order does not matter, so the pairs cancel and the single number remains.',
    complexity: 'O(n) time, O(1) memory.',
    edge: 'One element; negative numbers work the same way, because XOR works on bits.',
    followUp: 'LC 268 Missing Number? — XOR the indices 0..n with the values; everything pairs up except the missing number.'
  },
  lc338: {
    title: 'LC 338. Counting Bits',
    clarify: 'Return the count for every i from 0 to n — can I do it in one pass?',
    approach: 'i >> 1 drops the lowest bit and i & 1 is that bit, so dp[i] = dp[i >> 1] + (i & 1), computed from small numbers to large ones.',
    complexity: 'O(n) time and O(n) memory for the answer.',
    edge: 'n = 0 gives [0]; every power of two has exactly one set bit.',
    followUp: 'Another recurrence? — dp[i] = dp[i & (i-1)] + 1: clearing the lowest set bit removes exactly one.'
  }
};

export const TALKS_W = {
  'w3-1': {
    title: 'W3-1. Permission flags',
    clarify: 'Are the values fixed as in chmod — read 4, write 2, execute 1? Should String ignore bits beyond the three rights?',
    approach: 'Each right is one bit, declared with 1 << iota, and a set of rights is a bitwise OR. Has checks p & q == q, so every right of q must be there. Remove uses AND NOT, Toggle uses XOR, and String and Parse walk one fixed order: r, w, x.',
    complexity: 'Has, Add, Remove and Toggle are O(1), one bitwise instruction each; String and Parse handle three characters, also constant time.',
    edge: 'Has(0) is true; removing an absent right keeps it absent; Parse rejects a wrong length, a letter in the wrong position and any other character, and wraps ErrBadPerm with the input.',
    followUp: 'How would you print 0755 like chmod? — Three groups of three bits: owner shifted by six, group by three, other as is, each printed as one octal digit.'
  },
  'w3-2': {
    title: 'W3-2. Bit set',
    clarify: 'Are the numbers non-negative and is the upper bound unknown? Must the zero value be usable?',
    approach: 'Number i lives in word i >> 6 at bit i & 63. Add grows the slice and sets the bit with OR, Remove clears it with AND NOT, Has tests it and returns false beyond the slice. Len sums OnesCount64, and Elems takes TrailingZeros64 and clears the lowest bit with w &= w - 1.',
    complexity: 'Has and Remove are O(1); Add is O(1) when the word exists and otherwise grows the slice to i/64 words; Len, Union and Elems are O(number of words); memory is one bit per number up to the largest one.',
    edge: 'Numbers 63, 64 and 127 on word boundaries; Has far beyond the slice; removing an absent number; Union with a longer set; a negative number panics in Add.',
    followUp: 'When is map[int]struct{} better? — When the numbers are sparse and large, like IDs up to a billion: a bit set would need a bit for every possible number.'
  },
  'w3-3': {
    title: 'W3-3. Money.Allocate',
    clarify: 'Should the extra cents go to the first parts? What about a negative amount and n of zero?',
    approach: 'I split in integer minor units: q and r from division and remainder. Go truncates toward zero, so r has the sign of the amount. Every part gets q, and the first |r| parts get one more unit with the sign of the amount.',
    complexity: 'O(n) time and memory for n parts.',
    edge: 'Fewer cents than parts gives zeros at the end; negative amounts; math.MaxInt64; n of zero or below returns an error that wraps ErrBadParts.',
    followUp: 'How do you split by ratios like 70/30? — Each share is the amount times its weight divided by the total, in integers — with a 128-bit product, bits.Mul64, when amounts are large; the leftover units go out one by one so the sum stays exact.'
  }
};

export const PRACTICE = [
  {
    id: 'p-perm', code: 'W3-1', week: 3,
    title: 'Флаги прав: Perm на битах', titleEN: 'Permission flags on bits',
    goalRU: 'Набор прав r, w, x в одном байте: константы через 1 << iota, проверка, добавление, снятие и переключение прав масками, печать и разбор строки «rwx».',
    contractRU: [
      'Тип Perm uint8 и константы Exec = 1, Write = 2, Read = 4, как в chmod; в заготовке они уже объявлены через 1 << iota.',
      'Has(q) — true, только если у p есть все права из q: (Read|Write).Has(Read) — true, Read.Has(Read|Write) — false, Has(0) — true.',
      'Add(q) добавляет права q, Remove(q) снимает их — право, которого не было, не появляется; Toggle(q) переключает. Все три возвращают новое значение.',
      'String печатает «rwx» с «-» на месте отсутствующего права: Read|Exec — «r-x», 0 — «---»; другие биты не печатаются.',
      'Parse читает то, что печатает String: «r-x» → Read|Exec. Любой другой текст — неверная длина, буква не на своём месте («wrx»), чужой символ — ошибка, которая оборачивает ErrBadPerm через %w и цитирует вход в кавычках, как %q.'
    ],
    contractEN: [
      'Type Perm uint8 and the constants Exec = 1, Write = 2, Read = 4, as in chmod; the starter already declares them with 1 << iota.',
      'Has(q) is true only if p has every right of q: (Read|Write).Has(Read) is true, Read.Has(Read|Write) is false, Has(0) is true.',
      'Add(q) gives the rights of q, Remove(q) takes them away — a right that was absent does not appear; Toggle(q) flips them. All three return the new value.',
      'String prints "rwx" with "-" for a missing right: Read|Exec is "r-x", 0 is "---"; other bits are not printed.',
      'Parse reads what String prints: "r-x" → Read|Exec. Any other text — a wrong length, a letter in the wrong place ("wrx"), a foreign character — is an error that wraps ErrBadPerm with %w and quotes the input in double quotes, as %q does.'
    ],
    planTasks: ['w3-tue-7'],
    links: ['c73', 'q56'],
    hints: [
      'Has: у p есть все биты q, когда p & q == q. Условие p & q != 0 значит «хотя бы одно право».',
      'Remove — оператор &^ (AND NOT): снимает биты q и не трогает остальные. p ^ q здесь не годится: он добавит право, которого не было.',
      'String и Parse удобно писать по одной таблице порядка: {Read, \'r\'}, {Write, \'w\'}, {Exec, \'x\'}.'
    ],
    talkEN: 'Rights are bits in one byte, as in chmod: read is 4, write is 2, execute is 1, and 1 << iota gives these values without typing them. A set of rights is a bitwise OR. Has checks p & q == q, so every right of q must be present, not just one. Remove uses AND NOT, p &^ q, which clears those bits and keeps the rest; XOR would add a right that was missing. String walks a fixed order, r, w, x, and Parse reads the same three positions back and wraps ErrBadPerm with the input when a character is wrong.',
    pitfalls: [
      'Has через p&q != 0 → Read.Has(Read|Write) даёт true, хотя права записи нет.',
      'Remove через ^ → снятие права, которого не было, его добавляет.',
      'Порядок битов в String не совпадает с Parse → права после круга «печать → разбор» переставлены.',
      'Ошибка Parse без %w → errors.Is(err, ErrBadPerm) ложно.'
    ],
    followUps: [
      'Добавь печать в восьмеричном виде, как chmod: 0755 для трёх групп owner, group, other — где нужен сдвиг на 3 и на 6?',
      'Сделай Perm uint16 и добавь setuid (04000): что изменится в String и Parse?',
      'Как хранить права пользователя в базе — битовой маской в одном столбце или строками в отдельной таблице? Плюсы и минусы.'
    ],
    fixture: 'docs/verification/fixtures/practice/perm',
    names: { starter: 'perm.go', tests: 'perm_test.go', solution: 'perm.go' }
  },
  {
    id: 'p-bitset', code: 'W3-2', week: 3,
    title: 'Битовое множество на []uint64', titleEN: 'A bit set on []uint64',
    goalRU: 'Множество неотрицательных чисел, где число i — бит i&63 в слове i>>6: добавить, проверить, удалить, посчитать через math/bits, объединить и перечислить по возрастанию.',
    contractRU: [
      'Нулевое значение Set — пустое множество, готовое к работе; число i хранится битом i&63 в слове i>>6 среза words.',
      'Add(i) добавляет i и при необходимости удлиняет срез; повторный Add ничего не меняет; отрицательный i — паника.',
      'Has(i) — false для отрицательного i и для числа за последним словом; Remove(i) убирает i, а для отсутствующего, отрицательного или лежащего за последним словом числа ничего не делает. Ни Has, ни Remove не паникуют.',
      'Len — число элементов (bits.OnesCount64 по словам); Elems — элементы по возрастанию: после Add 130, 5, 64, 0, 63, 129 — [0 5 63 64 129 130].',
      'Union(t) добавляет в s все элементы t, даже если t длиннее; t не меняется и не делит слова с s.'
    ],
    contractEN: [
      'The zero value of Set is an empty set ready to use; number i is stored as bit i&63 of word i>>6 of the words slice.',
      'Add(i) puts i in and grows the slice when needed; adding again changes nothing; a negative i panics.',
      'Has(i) is false for a negative i and for a number beyond the last word; Remove(i) takes i out and does nothing for an absent, negative or too large number. Neither Has nor Remove panics.',
      'Len is the number of elements (bits.OnesCount64 over the words); Elems returns the elements in ascending order: after Add 130, 5, 64, 0, 63, 129 it is [0 5 63 64 129 130].',
      'Union(t) adds every element of t to s, even when t is longer; t does not change and shares no words with s.'
    ],
    planTasks: ['w3-wed-5'],
    links: ['c73'],
    hints: [
      'Слово — i >> 6 (деление на 64), бит в слове — i & 63 (остаток); бит ставит s.words[w] |= 1 << (i & 63).',
      'Elems: пока слово не ноль, bits.TrailingZeros64(w) даёт номер младшего единичного бита, а w &= w - 1 его снимает.',
      'Union: сначала дорасти s до длины t, потом OR по словам; append копирует значения, поэтому слова t не станут общими.'
    ],
    talkEN: 'A bit set stores number i as one bit: word i shifted right by six, bit i and sixty-three. Add grows the slice when needed and sets the bit with OR; Remove clears it with AND NOT, so removing an absent number does nothing. Has is a mask test and returns false beyond the slice instead of panicking. Len sums bits.OnesCount64 over the words, and Elems walks each word with TrailingZeros64 and clears the lowest bit with w and w minus one. It costs one bit per possible number instead of a map entry per element.',
    pitfalls: [
      'Маска i & 31 вместо i & 63 → числа 32–63 попадают не в свои биты.',
      'Remove через ^= → удаление отсутствующего числа его добавляет.',
      'Has без проверки длины → паника на числе за последним словом.',
      'Union без роста s → элементы t за длиной s пропадают.'
    ],
    followUps: [
      'Добавь Intersect и Difference: какой оператор нужен для каждой и что делать с разной длиной?',
      'Сравни память: Set с числами до миллиона и map[int]struct{} с теми же числами — посчитай и проверь через runtime.MemStats.',
      'Сделай Set безопасным для нескольких горутин: где хватит мьютекса, а где можно atomic.Uint64 на слово?'
    ],
    fixture: 'docs/verification/fixtures/practice/bitset',
    names: { starter: 'bitset.go', tests: 'bitset_test.go', solution: 'bitset.go' }
  },
  {
    id: 'p-allocate', code: 'W3-3', week: 3,
    title: 'Money.Allocate: раздел без потери цента', titleEN: 'Money.Allocate without losing a cent',
    goalRU: 'Разделить сумму на n частей так, чтобы части в сумме давали ровно исходную, отличались не больше чем на минорную единицу, а лишние центы достались первым частям; вариация W1-1 на закрепление.',
    contractRU: [
      'Money{Minor int64, Currency string}, как в W1-1; Allocate(n) возвращает n частей той же валюты.',
      'Сумма частей равна m.Minor ровно, части отличаются не больше чем на 1, лишние единицы — первым частям: 10.00 EUR на 3 — 3.34, 3.33, 3.33; 0.02 на 3 — 0.01, 0.01, 0.00.',
      'Отрицательная сумма делится так же, со своим знаком: −10.00 на 3 — −3.34, −3.33, −3.33.',
      'Никакого float64: math.MaxInt64 на 2 — 4611686018427387904 и 4611686018427387903.',
      'n ≤ 0 — nil и ошибка, которая оборачивает ErrBadParts через %w; в её тексте — «into N parts» с этим n.'
    ],
    contractEN: [
      'Money{Minor int64, Currency string}, as in W1-1; Allocate(n) returns n parts in the same currency.',
      'The parts add up to m.Minor exactly, differ by at most 1, and the extra units go to the first parts: 10.00 EUR into 3 is 3.34, 3.33, 3.33; 0.02 into 3 is 0.01, 0.01, 0.00.',
      'A negative amount splits the same way, with its sign: −10.00 into 3 is −3.34, −3.33, −3.33.',
      'No float64: math.MaxInt64 into 2 is 4611686018427387904 and 4611686018427387903.',
      'n ≤ 0 returns nil and an error that wraps ErrBadParts with %w; its text says "into N parts" with that n.'
    ],
    planTasks: ['w3-thu-6'],
    links: ['c39'],
    hints: [
      'Целая часть и остаток: q, r := m.Minor / int64(n), m.Minor % int64(n). В Go деление отбрасывает дробь к нулю, и у остатка знак делимого: −1000 % 3 = −1.',
      'Первые |r| частей получают q ± 1: +1 для положительной суммы, −1 для отрицательной.',
      'Инвариант проверь циклом в тесте: для набора сумм и n от 1 до 12 части складываются ровно и отличаются не больше чем на 1.'
    ],
    talkEN: 'Splitting money must not lose or invent a cent, so I work in integer minor units. I take the quotient and the remainder of the amount divided by n; Go truncates toward zero, so the remainder has the sign of the amount. Every part gets the quotient, and the first parts get one extra unit each, with the sign of the amount, until the remainder is used up. A test loops over many amounts and part counts and checks the invariant: the parts add up exactly and differ by at most one.',
    pitfalls: [
      'float64 → на больших суммах части не складываются в исходную.',
      'Весь остаток последней части → она больше остальных на r, а не на 1.',
      'Отрицательный остаток не обработан → части не складываются в отрицательную сумму.',
      'n = 0 не проверен → деление на ноль, паника.'
    ],
    followUps: [
      'Раздели по долям, например 70/30 или 1:2:3: Allocate([]int{70, 30}) — как раздать остаток, чтобы сумма сошлась?',
      'Кому отдавать лишний цент — первым частям или по кругу между вызовами? Где это важно: комиссии, налоги?',
      'Добавь Money.Add из вариации недели 1 и проверь в тесте: сумма частей через Add даёт исходную сумму.'
    ],
    fixture: 'docs/verification/fixtures/practice/allocate',
    names: { starter: 'allocate.go', tests: 'allocate_test.go', solution: 'allocate.go' }
  }
];

// Plan tasks that use an existing practice task too (its page lists them under «В плане»).
export const PLAN_TASKS_ADD = { 'p-money': ['w3-thu-6', 'w3-thu-7', 'w3-sat-10'], 'p-account': ['w3-thu-7', 'w3-sat-9'] };

export const QUIZ = [
  {
    id: 'q56',
    title: 'Задача 56: uint8 и переполнение',
    ru: 'Что напечатает программа?',
    en: 'What does the program print?',
    code: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tvar stock uint8 = 200\n\tstock += 100\n\tfmt.Println(stock)\n}',
    options: ['300', '44', '255 — значение упирается в максимум', 'panic: integer overflow', 'Ошибка компиляции: 300 не помещается в uint8', '0'],
    correct: 1,
    explanationRU: 'Сложение целых во время работы идёт по модулю 2^8 для uint8: 300 − 256 = 44. Go не паникует на переполнении и не «упирает» значение в 255. Компилятор проверяет только константы: var stock uint8 = 300 не скомпилируется («overflows»), а stock += 100 — уже вычисление над переменной. Если переполнение — ошибка, берут тип шире или проверяют границу до сложения: if n > math.MaxUint8-stock { … }.',
    speechEN: 'Arithmetic on a uint8 wraps around modulo two hundred fifty-six, so two hundred plus one hundred is forty-four. Go does not panic on overflow and does not stop at two hundred fifty-five; only constants are checked at compile time.',
    correctedCode: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n\t"math"\n)\n\nfunc add(stock, n uint8) (uint8, error) {\n\tif n > math.MaxUint8-stock {\n\t\treturn stock, errors.New("stock overflow")\n\t}\n\treturn stock + n, nil\n}\n\nfunc main() {\n\tfmt.Println(add(200, 100)) // 200 stock overflow\n}',
    versionNote: 'Поведение не менялось; проверено на Go 1.24.7 и 1.27.3.',
    sources: [{ title: 'Go specification: integer overflow', url: 'https://go.dev/ref/spec#Integer_overflow' }, { title: 'Go specification: constant expressions', url: 'https://go.dev/ref/spec#Constant_expressions' }],
    cardIds: ['c73']
  },
  {
    id: 'q57',
    title: 'Задача 57: сдвиг и деление отрицательного числа',
    ru: 'Что напечатает программа?',
    en: 'What does the program print?',
    code: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tx := -7\n\tfmt.Println(x>>1, x/2)\n}',
    options: ['-3 -3', '-4 -3', '-4 -4', '9223372036854775804 -3 — сдвиг логический', '-3 -4', 'Ошибка компиляции: сдвиг знакового числа'],
    correct: 1,
    explanationRU: 'У знакового числа >> арифметический: слева приходят копии знакового бита, и результат — деление на 2 с округлением вниз: −3,5 → −4. Деление / в Go отбрасывает дробь к нулю: −3,5 → −3. Логического сдвига >>> из Java в Go нет; нужен — приводят к беззнаковому типу: uint(x) >> 1.',
    speechEN: 'A right shift of a signed number copies the sign bit and rounds down, so minus seven shifted by one is minus four, while division truncates toward zero and gives minus three.',
    correctedCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tx := -7\n\tfmt.Println(x>>1, x/2)          // -4 -3\n\tfmt.Println(uint8(int8(x)) >> 1) // 124: logical shift of the same byte 1111_1001\n}',
    versionNote: 'Поведение не менялось; проверено на Go 1.24.7 и 1.27.3.',
    sources: [{ title: 'Go specification: arithmetic operators (shifts, integer division)', url: 'https://go.dev/ref/spec#Arithmetic_operators' }],
    cardIds: ['c73']
  },
  {
    id: 'q58',
    title: 'Задача 58: поле из знакового байта — по маске и без',
    ru: 'Что напечатает программа?',
    en: 'What does the program print?',
    code: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tvar b int8 = -74 // 1011_0110\n\tfmt.Println(b>>4, (b>>4)&0x0F)\n}',
    options: ['11 11', '-5 11', '-5 -5', '251 11', '11 -5', 'Ошибка компиляции: 0x0F не помещается в int8'],
    correct: 1,
    explanationRU: 'b >> 4 у знакового — арифметический сдвиг: слева четыре копии знакового бита, 1111_1011 = −5. Маска 0x0F после сдвига оставляет только младшие четыре бита — поле 1011 = 11. Маска после сдвига нужна, когда поле вырезают из знакового значения: без неё знак «размножается». Другой путь — привести к беззнаковому: uint8(b) >> 4 = 11.',
    speechEN: 'A signed right shift drags copies of the sign bit in from the left, so minus seventy-four shifted by four is minus five; masking with 0x0F keeps only the field, which is eleven.',
    correctedCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tvar b int8 = -74 // 1011_0110\n\tfmt.Println((b>>4)&0x0F, uint8(b)>>4) // 11 11\n}',
    versionNote: 'Поведение не менялось; проверено на Go 1.24.7 и 1.27.3.',
    sources: [{ title: 'Go specification: arithmetic operators (shifts)', url: 'https://go.dev/ref/spec#Arithmetic_operators' }],
    cardIds: ['c73']
  }
];

export const CARD = {
  id: 'c73', mod: 'm6', simId: 'sim9',
  qEN: 'How do bitwise operators and shifts work in Go, and what do &^ and a signed right shift do?',
  qRU: 'Как работают побитовые операторы и сдвиги в Go, что делают &^ и сдвиг знакового числа вправо?',
  shortEN: 'Bitwise operators let you pack flags and small fields into one integer and test them cheaply. Go works on each bit position: & keeps common bits, | merges them, ^ keeps the differing ones, and &^, AND NOT, clears the bits of the right operand. A mask picks positions: x | 1<<k sets bit k, x &^ (1<<k) clears it, x&(1<<k) != 0 tests it. A left shift multiplies by two; a signed right shift copies the sign bit, so -7 >> 1 is -4. Overflow wraps silently.',
  anchorsEN: ['& | ^ per bit; &^ clears bits', 'mask: | sets, &^ clears, & tests', 'signed >> copies the sign: -7>>1 = -4', 'overflow wraps, no panic'],
  jvmEN: 'Java writes NOT as ~x and has no AND NOT: a & ~b. Java\'s >> is arithmetic like Go\'s on signed types, and >>> is a logical shift; Go has no >>>, you convert to an unsigned type instead. Java has no unsigned byte, short, int or long — byte is -128 to 127 — while Go has uint8 to uint64. In Java, x & 1 == 0 does not compile without parentheses; in Go it means (x & 1) == 0.',
  shortRU: 'Побитовые операторы позволяют упаковать флаги и короткие поля в одно целое и дёшево их проверять. Go работает с каждой позицией бита: & оставляет общие биты, | объединяет, ^ оставляет различающиеся, а &^, AND NOT, снимает биты правого операнда. Маска выбирает позиции: x | 1<<k ставит бит k, x &^ (1<<k) снимает его, x&(1<<k) != 0 проверяет. Сдвиг влево умножает на два; сдвиг знакового вправо копирует знаковый бит, поэтому -7 >> 1 — это -4. Переполнение молча заворачивается.',
  jvmRU: 'В Java NOT пишется ~x, а AND NOT нет: a & ~b. >> в Java арифметический, как в Go у знаковых типов, а >>> — логический сдвиг; в Go >>> нет, вместо него приводят к беззнаковому типу. Беззнаковых byte, short, int и long в Java нет — byte от -128 до 127, — а в Go есть uint8…uint64. В Java x & 1 == 0 без скобок не компилируется; в Go это (x & 1) == 0.',
  detailsEN: [
    'Two\'s complement: -x is ^x + 1, so -1 has every bit set, and the bits that read as 182 in a uint8 read as -74 in an int8.',
    'The shift count may be signed since Go 1.13; a negative count panics at run time, and a count at or above the width gives 0, or -1 for a negative signed value shifted right.',
    'x & (x-1) clears the lowest set bit, x & -x keeps only that bit, and XOR cancels pairs: a ^ a is 0.',
    'math/bits OnesCount64, LeadingZeros and TrailingZeros compile to machine instructions such as POPCNT, LZCNT and TZCNT on amd64; the 8-bit OnesCount8 and Reverse8 are table lookups there.',
    'Constants are checked at compile time: var b uint8 = 256 does not compile; arithmetic on variables wraps modulo 2^n.'
  ],
  detailsRU: [
    'Дополнительный код: -x — это ^x + 1, поэтому у -1 все биты единичные, а биты, которые в uint8 читаются как 182, в int8 читаются как -74.',
    'Счётчик сдвига может быть знаковым с Go 1.13; отрицательный счётчик во время работы — паника, а счётчик не меньше ширины типа даёт 0, а у отрицательного знакового при сдвиге вправо — -1.',
    'x & (x-1) снимает младший единичный бит, x & -x оставляет только его, а XOR сокращает пары: a ^ a равно 0.',
    'OnesCount64, LeadingZeros и TrailingZeros из math/bits компилируются в машинные инструкции — на amd64 это POPCNT, LZCNT и TZCNT; 8-битные OnesCount8 и Reverse8 там — поиск по таблице.',
    'Константы проверяет компилятор: var b uint8 = 256 не скомпилируется; арифметика над переменными заворачивается по модулю 2^n.'
  ],
  practicalRU: 'Неделя 3: флаги прав W3-1 и битовое множество W3-2, LC 191, 231 и 136; справка «Биты в Go». На интервью флаги объявляют через 1 << iota, а проверка всех прав — p&q == q.',
  code: 'package main\n\nimport "fmt"\n\ntype Perm uint8\n\nconst (\n\tExec  Perm = 1 << iota // 001\n\tWrite                  // 010\n\tRead                   // 100\n)\n\nfunc main() {\n\tp := Read | Write\n\tfmt.Println(p&Write != 0, p&Exec != 0) // true false\n\tp &^= Write\n\tfmt.Printf("%03b\\n", p) // 100\n\tstock := uint8(250)\n\tfmt.Println(-7>>1, stock+10) // -4 4\n}',
  versionNote: 'Знаковый счётчик сдвига и литералы 0b, 0o и с подчёркиваниями — с Go 1.13; остальное не менялось. Пример выполнен на Go 1.24.7 и 1.27.3.',
  sources: [
    { title: 'Go specification: arithmetic operators', url: 'https://go.dev/ref/spec#Arithmetic_operators' },
    { title: 'Go specification: operator precedence', url: 'https://go.dev/ref/spec#Operator_precedence' },
    { title: 'Go specification: integer overflow', url: 'https://go.dev/ref/spec#Integer_overflow' },
    { title: 'Package math/bits', url: 'https://pkg.go.dev/math/bits' },
    { title: 'Go specification: language versions (Go 1.13)', url: 'https://go.dev/ref/spec#Go_1.13' }
  ],
  practice: {
    kind: 'Предскажи результат',
    promptEN: 'A byte holds 1011_0110. Without running the code, give the bits after: x & 0x0F, x | 1<<3, x &^ (1<<2), x >> 4, and the same byte as int8 shifted right by 4. Then explain the last two.',
    promptRU: 'В байте 1011_0110. Не запуская код, назови биты после: x & 0x0F, x | 1<<3, x &^ (1<<2), x >> 4 и тот же байт как int8, сдвинутый вправо на 4. Объясни два последних.',
    pointsEN: ['x & 0x0F = 0000_0110: the mask keeps the low four bits.', 'x | 1<<3 = 1011_1110; x &^ (1<<2) = 1011_0010.', 'As uint8, x >> 4 = 0000_1011 (11): zeros come in from the left.', 'As int8 (-74), x >> 4 = 1111_1011 (-5): copies of the sign bit come in; mask with 0x0F to get 11.'],
    pointsRU: ['x & 0x0F = 0000_0110: маска оставляет младшие четыре бита.', 'x | 1<<3 = 1011_1110; x &^ (1<<2) = 1011_0010.', 'Как uint8, x >> 4 = 0000_1011 (11): слева приходят нули.', 'Как int8 (-74), x >> 4 = 1111_1011 (-5): слева приходят копии знакового бита; маска 0x0F даёт 11.'],
    followUpEN: 'How do you get a logical right shift of a signed value in Go, where Java would use >>>?',
    followUpRU: 'Как в Go получить логический сдвиг знакового значения вправо — там, где в Java пишут >>>?'
  },
  quizIds: ['q56', 'q57', 'q58']
};
