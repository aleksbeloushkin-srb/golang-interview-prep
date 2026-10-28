<!-- {% raw %} -->
**Рецепт: вход через Google, сервер на AWS и деплой из GitHub Actions**

28 октября 2026, обновлено после регистрации. Пошаговое продолжение [`DEPLOYMENT_PROPOSAL_RU.md`](DEPLOYMENT_PROPOSAL_RU.md). Ничего не развёрнуто. Цены — порядок величин, перед запуском проверить в AWS Pricing Calculator. Версии GitHub Actions и CDK — по состоянию на эту дату.

**Аккаунт создан в новом формате AWS** («Sign up for AWS (new)», с проектами): проект «Sky is the Limit», регион Europe (Stockholm) `eu-north-1`, Free plan до 28.04.2027, кредиты $100. Ниже всё под этот формат.

## 0. Чем новый формат отличается и что это меняет

| Свойство нового формата | Что это значит для нас |
|---|---|
| Регион задан по адресу и не меняется: Stockholm `eu-north-1` (служебно разрешены ещё us-east-1 и us-west-2) | Всё разворачиваем в `eu-north-1`. Cognito, Lambda, API Gateway, DynamoDB, ECR там есть |
| Root-пользователя нет, аккаунтом владеет Builder ID; IAM Identity Center и Organizations не поддерживаются | Шаги про root и Identity Center не нужны. Терминал — CloudShell в консоли или `aws login` |
| IAM-роли и IAM-пользователи разрешены только для программного доступа | Для деплоя из GitHub подходит IAM-пользователь с ключом |
| Политика AWS запрещает `iam:*Provider*` и в Free, и в Paid plan | **OIDC-провайдер GitHub создать нельзя.** Деплой — по ключу IAM-пользователя с минимальными правами (6.1) |
| Free plan: $100 + до $100 за задания, 6 месяцев | До 28.04.2027 перейти на Paid (settings.aws.com → Billing → Upgrade) и поставить лимит расходов проекта (от $20). Переход необратим |
| «Activate advanced features» — после Paid, необратимо, снимает лимит расходов | Не включать: нам это не нужно. Включение дало бы OIDC и выбор региона, но без лимита расходов |

## 1. Аккаунт (≈10 минут)

1. **Вход.** Если вход через Google — включите в Google двухэтапную проверку. Если по почте и паролю — меню справа вверху → Profile → добавьте MFA (приложение-аутентификатор или passkey).
2. **Бюджет:** в блоке «Explore AWS» задание «Set up a cost budget using AWS Budgets» (дают $20 кредитов) или поиск `Budgets` → Create budget → Monthly cost budget, $5 → письма при 50, 80, 100% факта и 100% прогноза. В «Advanced options» снять учёт кредитов (Credits): иначе кредиты гасят расходы, и бюджет молчит.
3. **Не нажимать:** «Host my website» (сайт остаётся на GitHub Pages: у AWS-проекта есть срок Free plan и пауза при лимите), «Upgrade plan» (позже), «Activate advanced features».
4. **Терминал:** значок `>_` (CloudShell) в верхней панели консоли. AWS CLI там уже вошёл в ваш проект. Альтернатива — AWS CLI v2 на компьютере и `aws login --profile prep`: доступ на 12 часов, продление до 90 дней.

## 2. Вход через Google

1. **Префикс домена Cognito** выбрать заранее, например `go-prep-aleks` → домен входа `https://go-prep-aleks.auth.eu-north-1.amazoncognito.com`. Слова aws, amazon и cognito в префиксе запрещены.
2. **Google Cloud Console** → новый проект `golang-runtime-prep` → Google Auth Platform:
   - Branding: имя приложения, адрес поддержки.
   - Audience: External, статус Testing, в Test users — свой Gmail. В режиме Testing войти могут только перечисленные тестовые пользователи: это удобная защита, пока сайт личный.
   - Clients → Create client → Web application. Authorized JavaScript origins: домен входа из п. 1. Authorized redirect URIs: тот же домен + `/oauth2/idpresponse`.
3. **Секрет — сразу в AWS** (в CloudShell), не пересылая его никуда:
   ```bash
   aws secretsmanager create-secret --region eu-north-1 \
     --name prep/google-oauth \
     --secret-string '{"clientId":"<ID>.apps.googleusercontent.com","clientSecret":"<SECRET>"}'
   ```
   Хранение секрета ≈ $0.40 в месяц.
4. **Cognito** создаст CDK (раздел 4): пул пользователей (уровень Essentials по умолчанию; 10 000 активных пользователей в месяц бесплатно без срока), Google как внешний провайдер со scope `openid email profile`, клиент без секрета с Authorization Code + PKCE, callback и logout — `https://aleksbeloushkin-srb.github.io/golang-runtime-prep/` и `http://localhost:8000/`.
5. **На сайте** (отдельный PR, `js/auth.js` и `js/config.js` с публичными значениями): кнопка «Войти через Google» ведёт на `/oauth2/authorize` с `identity_provider=Google` (страница Cognito пропускается), `code_challenge` (S256) и `state`. После возврата скрипт меняет `?code=` на токены через `/oauth2/token`, убирает код из адреса (`history.replaceState`, маршрут после `#` сохраняется) и держит access-токен в памяти. Без входа всё работает как сейчас на localStorage.

## 3. Репозиторий бэкенда `golang-runtime-prep-api`

Создайте пустой репозиторий (публичный или приватный) и подключите его к сессии Claude. Структура:

```
cmd/api/        Lambda API: GET /me, GET и PUT /progress, POST /runs
cmd/runner/     Lambda-раннер: проверка кода и go test
internal/store/ DynamoDB: PK USER#<sub>, SK PROFILE | PROGRESS | ATTEMPT#… | RUN#…
internal/runner/ временный каталог, лимиты, разбор go test -json
tasks/<id>/     условие EN/RU, заготовка, открытые и скрытые тесты
infra/          CDK-приложение на Go: стеки Auth, Data, Api, Runner
runner.Dockerfile
.github/workflows/ci.yml, deploy.yml
```

## 4. Ресурсы (CDK v2 на Go, `aws-cdk-lib` 2.275, CLI `aws-cdk` 2.1146)

| Стек | Ресурс | Ключевые настройки |
|---|---|---|
| Auth | Cognito User Pool, домен, Google IdP, клиент | Секрет Google — из `prep/google-oauth`; вход только через Google; access-токен 1 ч |
| Data | DynamoDB `TableV2` | `PK`/`SK`, on-demand, `RemovalPolicy.RETAIN`, TTL для счётчиков частоты |
| Api | Lambda `provided.al2023`, arm64, 256 МБ, 10 с; HTTP API | JWT-авторизатор: issuer `https://cognito-idp.eu-north-1.amazonaws.com/<poolId>`, audience — id клиента (у access-токена Cognito нет `aud`, API Gateway проверяет `client_id`); CORS только для `https://aleksbeloushkin-srb.github.io` и `http://localhost:8000`; throttling стадии; логи 14 дней |
| Runner | Lambda из образа, x86_64, 2048 МБ, таймаут 25 с, `/tmp` 2048 МБ | VPC без NAT, только изолированные подсети: выхода в интернет нет; вызывает только API-Lambda (`grantInvoke`) |

Сборка API-Lambda: `GOOS=linux GOARCH=arm64 CGO_ENABLED=0 go build -tags lambda.norpc -o bootstrap ./cmd/api`.

## 5. Раннер кода: что важно

- **`-race` требует cgo** (проверено: `CGO_ENABLED=0 go test -race` → «go: -race requires cgo»). Поэтому в образе есть gcc и `CGO_ENABLED=1`, а код пользователя с `import "C"` отклоняется до запуска.
- **Предел HTTP API — 30 с на интеграцию**, и он не увеличивается. Значит: Lambda-раннер 25 с, `go test -timeout=15s`, убийство всей группы процессов через 20 с. Кеш сборки стандартной библиотеки с `-race` прогревается при сборке образа (`/opt/gocache`) и копируется в `/tmp` при холодном старте; цель — ответ быстрее 10 с на тёплом экземпляре.
- **Образ (набросок):**
  ```dockerfile
  FROM public.ecr.aws/lambda/provided:al2023
  RUN dnf install -y gcc tar gzip && dnf clean all
  ARG GO_VERSION
  RUN curl -fsSL https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz | tar -C /usr/local -xz
  ENV PATH=/usr/local/go/bin:$PATH GOTOOLCHAIN=local GOPROXY=off CGO_ENABLED=1 \
      HOME=/tmp GOPATH=/tmp/gopath GOCACHE=/tmp/gocache
  COPY warm/ /opt/warm/
  RUN cd /opt/warm && GOCACHE=/opt/gocache go test -race -count=1 ./...
  COPY runner /opt/runner
  ENTRYPOINT ["/opt/runner"]
  ```
- **Каждый запуск:** новый каталог в `/tmp`, `go.mod` без зависимостей, файл решения и скрытые тесты; `go vet` и `go test -race -count=1 -json`; дочерний процесс с чистым окружением (без переменных `AWS_*`); результат — имена тестов, статус и обрезанный вывод (до 32 КБ); каталог удаляется. Код — до 64 КБ, частота — например, 60 запусков в час на пользователя (счётчик в DynamoDB с TTL).
- **Граница изоляции.** Код пользователя исполняется под тем же пользователем Linux, что и обработчик, и теоретически может прочитать временные ключи роли раннера. Поэтому у роли раннера только служебные права Lambda (логи и сетевой интерфейс VPC), сети нет, а запуск доступен лишь вошедшим (в режиме Testing — только вашим Google-аккаунтам). Перед открытием сайта другим — пересмотреть изоляцию (отдельная задача Fargate на запуск или песочница вроде gVisor).

## 6. GitHub Actions

### 6.1 Доступ GitHub к AWS (один раз, в CloudShell)

Обычный путь — OIDC без ключей — в новом формате закрыт: управляющая политика AWS запрещает `iam:*Provider*`. Поэтому деплой идёт по ключу отдельного IAM-пользователя, который умеет только одно — принять роли CDK.

1. **Подготовка CDK** (создаёт роли `cdk-hnb659fds-*`, бакет и репозиторий образов):
   ```bash
   ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
   npx --yes aws-cdk@2.1146.1 bootstrap aws://$ACCOUNT/eu-north-1
   ```
2. **Пользователь для GitHub:**
   ```bash
   aws iam create-user --user-name gh-deploy-prep
   aws iam put-user-policy --user-name gh-deploy-prep --policy-name assume-cdk-roles \
     --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":\"sts:AssumeRole\",\"Resource\":\"arn:aws:iam::$ACCOUNT:role/cdk-hnb659fds-*-$ACCOUNT-eu-north-1\"}]}"
   aws iam create-access-key --user-name gh-deploy-prep
   ```
   Последняя команда покажет `AccessKeyId` и `SecretAccessKey` один раз.
3. **GitHub** → репозиторий API → Settings → Environments → `prod`: деплой только из `main`. В секреты окружения: `AWS_ACCESS_KEY_ID` и `AWS_SECRET_ACCESS_KEY` — вставить прямо туда, никуда больше не пересылая.
4. **Гигиена ключа:** ключ лежит только в секретах окружения `prod`; менять раз в 90 дней (`create-access-key`, обновить секреты, `delete-access-key` для старого); при подозрении на утечку — сразу `delete-access-key`. Если однажды включите advanced features, перейти на OIDC и удалить пользователя.

### 6.2 Workflows репозитория API

`ci.yml` — на каждый PR: `go vet ./...`, `go test -race ./...`, `cdk synth` (без доступа к AWS: в стеках нет lookup-запросов).

`deploy.yml` — после merge в `main`:

```yaml
name: deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
concurrency: deploy-prod
jobs:
  deploy:
    runs-on: ubuntu-24.04
    environment: prod
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1          # v7.0.1
      - uses: actions/setup-go@b7ad1dad31e06c5925ef5d2fc7ad053ef454303e          # v7.0.0
        with: { go-version-file: go.mod }
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1        # v7.1.0
        with: { node-version: 22 }
      - run: npm install -g aws-cdk@2.1146.1
      - run: go test -race ./...
      - uses: aws-actions/configure-aws-credentials@e1253824e5c10ff9df46874f81ed3ec929e19cfd  # v6.3.0
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: eu-north-1
      - run: cdk deploy --all --require-approval never
        working-directory: infra
```

CDK сам принимает роли `cdk-hnb659fds-*`, поэтому самому пользователю других прав не нужно. Действия закреплены по SHA коммита: тег можно переписать, SHA — нет. Образ раннера собирается для x86_64 на обычном раннере GitHub без эмуляции; API-Lambda для arm64 собирается кросс-компиляцией Go.

### 6.3 Workflow для этого репозитория (сайт)

`checks.yml` — на каждый PR и push в `main`: Node 22, `node scripts/check-content.mjs --base <база PR>`, `node --test scripts/check-content.test.mjs`. Сейчас эти проверки запускаются только вручную. Публикация остаётся встроенной в GitHub Pages. Отдельное решение: файл `.nojekyll` отключит обработку Jekyll и Liquid целиком (Markdown-документы перестанут превращаться в HTML на Pages, сайту они не нужны).

## 7. Цена в месяц для личного использования

| Что | Оценка |
|---|---|
| Lambda, API Gateway, DynamoDB, Cognito (до 10 000 пользователей) | ≈ $0 в бесплатных лимитах |
| Secrets Manager (1 секрет) | $0.40 |
| ECR (образ раннера ≈ 1 ГБ), бакет CDK, логи | ≈ $0.10–0.30 |
| Итого | ≈ $0.5–1, покрывается кредитами |

Ловушки цены: NAT Gateway — десятки долларов в месяц даже без трафика, публичный IPv4 — около $3.6 в месяц; в нашей схеме их нет.

## 8. Порядок работ

| Этап | Что | Результат |
|---|---|---|
| 0 | Раздел 1; 2.1–2.3; 6.1; пустой репозиторий API | Бюджет есть, секрет Google в AWS, ключ деплоя в GitHub |
| 1 | Auth + Data + Api, кнопка входа, синхронизация отметок | Вход Google на сайте, отметки на телефоне и компьютере одинаковые |
| 2 | Runner, первые 3 задачи практикума, затем все 11 | Код из браузера проходит скрытые тесты с `-race` |
| 3 | История попыток и интервальное повторение на сервере | Формат согласован с Астрой и с предложением агента Google |
| До 28.04.2027 | Upgrade на Paid и лимит расходов проекта | Сервис не остановится по окончании Free plan |

Источники: [Sign up for AWS (new)](https://docs.aws.amazon.com/accounts/latest/reference/sign-in-new.html), [сравнение форматов регистрации](https://docs.aws.amazon.com/accounts/latest/reference/sign-up-for-aws.html), [поддерживаемые сервисы](https://docs.aws.amazon.com/accounts/latest/reference/supported-services-sign-up-new.html), [управляющие политики проектов (SCP и RCP)](https://docs.aws.amazon.com/accounts/latest/reference/scps-and-rcps-for-projects.html), [переход на Paid](https://docs.aws.amazon.com/accounts/latest/reference/upgrade-account.html), [advanced features](https://docs.aws.amazon.com/accounts/latest/reference/activate-advanced-features.html), [подключение инструментов и `aws login`](https://docs.aws.amazon.com/accounts/latest/reference/connect-ai-coding-tool.html), [Cognito в Stockholm](https://aws.amazon.com/about-aws/whats-new/2020/11/amazon-cognito-available-stockholm-paris), [Cognito pricing](https://aws.amazon.com/cognito/pricing/), [JWT-авторизатор HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html), [квоты HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-quotas.html). Версии actions — теги репозиториев на 28.10.2026; версии CDK — npm.
<!-- {% endraw %} -->
