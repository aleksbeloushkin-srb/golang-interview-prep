# Фикстура: учебный модуль go-prep

Код со страницы практикума «Свой репозиторий go-prep» (`data/guides.js`, `#/practice/go-prep`): `week1/hello`, `week1/calc` — неделя 1; `week2/asm`, `week2/cmd/sumdemo` — тренировка с ассемблером; `ci.yml` — файл CI (в репозитории пользователя он лежит в `.github/workflows/`). Путь модуля здесь `github.com/you/go-prep`, на странице — `github.com/<ник>/go-prep`; совпадение файлов проверяет `scripts/check-content.test.mjs`.

Проверка: `go vet ./... && go test -race -count=1 ./...` на Go 1.24.7 и последней; выводы тренировки (ассемблер amd64 и arm64, `-m`, `objdump`, `GOSSAFUNC`) сверены 6 ноября 2026 на 1.24.7 и 1.27.3.
