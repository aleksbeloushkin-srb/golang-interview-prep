<!-- {% raw %} -->
**Рецепт: вход через Google, сервер на AWS и деплой из GitHub Actions**

28 октября 2026. Пошаговое продолжение [`DEPLOYMENT_PROPOSAL_RU.md`](DEPLOYMENT_PROPOSAL_RU.md). Ничего не развёрнуто. Цены — порядок величин, перед запуском проверить в AWS Pricing Calculator. Версии GitHub Actions и CDK — по состоянию на эту дату.

## 0. Кто что делает

| Шаг | Делает | Зачем так |
|---|---|---|
| Аккаунт AWS, MFA, бюджет, админ-пользователь | Вы, вручную (≈1 час) | Только владелец может открыть аккаунт и привязать оплату |
| OAuth-клиент Google, секрет в Secrets Manager | Вы, по командам ниже (≈15 мин) | Секрет не должен попадать в чат, код или GitHub |
| Роль GitHub → AWS (OIDC), `cdk bootstrap` | Вы, по командам ниже (≈15 мин) | Одноразово; дальше ключи AWS не нужны никому |
| Код бэкенда, CDK, workflows, кнопка входа на сайте | Claude, через PR | Деплой идёт из GitHub Actions, у Claude нет доступа к AWS |

## 1. Аккаунт AWS

1. **Подготовить:** отдельный адрес для root (например, алиас `имя+aws@gmail.com`), телефон для SMS или звонка, карту Visa или Mastercard с разрешёнными онлайн-платежами за рубеж (банк может попросить подтверждение 3-D Secure).
2. **Регистрация** на aws.amazon.com → «Create an AWS account»: адрес и имя аккаунта (`golang-runtime-prep`) → код из письма → пароль root (в менеджер паролей) → контакты: Personal, адрес в Сербии → проверка телефона → Basic support (бесплатно).
3. **План — Paid.** Free plan заканчивается через 6 месяцев или когда закончатся кредиты; затем аккаунт приостанавливается, данные хранятся 90 дней, без перехода на Paid аккаунт удаляется. Кроме того, подключение AWS Organizations (нужно для IAM Identity Center, шаг 6) переводит аккаунт на Paid, и вернуться нельзя. Кредиты $100 при регистрации и до $100 за задания доступны в обоих планах. Если при регистрации предложат месячный лимит расходов проекта — поставить минимальный ($20).
4. **MFA для root — сразу.** AWS требует MFA для root. Passkey или приложение TOTP; root дальше нужен только для оплаты и аварий. Ключи доступа для root не создавать.
5. **Бюджет:** Billing and Cost Management → Budgets → Create budget → Monthly cost budget, $5 → оповещения на почту при 50, 80, 100% фактических и 100% прогноза. В «Advanced options» снять учёт кредитов (Credits): иначе кредиты гасят расходы, и бюджет молчит, пока они тают. В Billing preferences включить письма Free Tier alerts. Ловушки цены: NAT Gateway — десятки долларов в месяц даже без трафика, публичный IPv4 — около $3.6 в месяц; в нашей схеме их нет.
6. **Админ без root:** в консоли выбрать регион Europe (Frankfurt) eu-central-1 → IAM Identity Center → Enable (включит AWS Organizations, это бесплатно) → Users → Add user (ваш email) → Permission sets → AdministratorAccess, сессия 8 часов → AWS accounts → назначить пользователя на аккаунт. Принять приглашение из письма, задать пароль и MFA. Ссылка на портал (вида `https://d-xxxxxxxxxx.awsapps.com/start`) — в Settings.
7. **AWS CLI v2 на компьютере:**
   ```bash
   aws configure sso            # session: prep, start URL из шага 6, регион eu-central-1
                                # профиль назвать prep-admin
   aws sso login --profile prep-admin
   aws sts get-caller-identity --profile prep-admin   # должен показать ваш аккаунт
   ```

## 2. Вход через Google

1. **Префикс домена Cognito** выбрать заранее, например `go-prep-aleks` → домен входа `https://go-prep-aleks.auth.eu-central-1.amazoncognito.com`. Слова aws, amazon и cognito в префиксе запрещены.
2. **Google Cloud Console** → новый проект `golang-runtime-prep` → Google Auth Platform:
   - Branding: имя приложения, адрес поддержки.
   - Audience: External, статус Testing, в Test users — свой Gmail. В режиме Testing войти могут только перечисленные тестовые пользователи: это удобная защита, пока сайт личный.
   - Clients → Create client → Web application. Authorized JavaScript origins: домен входа из п. 1. Authorized redirect URIs: тот же домен + `/oauth2/idpresponse`.
3. **Секрет — сразу в AWS**, не пересылая его никуда:
   ```bash
   aws secretsmanager create-secret --profile prep-admin --region eu-central-1 \
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
| Api | Lambda `provided.al2023`, arm64, 256 МБ, 10 с; HTTP API | JWT-авторизатор: issuer `https://cognito-idp.eu-central-1.amazonaws.com/<poolId>`, audience — id клиента (у access-токена Cognito нет `aud`, API Gateway проверяет `client_id`); CORS только для `https://aleksbeloushkin-srb.github.io` и `http://localhost:8000`; throttling стадии; логи 14 дней |
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

### 6.1 Связь GitHub → AWS без ключей (OIDC), один раз

1. IAM → Identity providers → Add provider → OpenID Connect: URL `https://token.actions.githubusercontent.com`, audience `sts.amazonaws.com`.
2. `cdk bootstrap aws://<ACCOUNT_ID>/eu-central-1 --profile prep-admin` — создаёт роли `cdk-hnb659fds-*`, бакет и репозиторий образов.
3. Роль `gh-deploy-prep`. Репозитории, созданные после 15 июля 2026, получают в claim `sub` неизменяемые ID владельца и репозитория. ID узнать так: `gh api repos/aleksbeloushkin-srb/golang-runtime-prep-api --jq '.owner.id, .id'` (у владельца — `257011880`). Доверие только окружению `prod` этого репозитория:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": { "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com" },
       "Action": "sts:AssumeRoleWithWebIdentity",
       "Condition": { "StringEquals": {
         "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
         "token.actions.githubusercontent.com:sub": "repo:aleksbeloushkin-srb@257011880/golang-runtime-prep-api@<REPO_ID>:environment:prod"
       } }
     }]
   }
   ```
   Права роли — только принять роли CDK, остальное делает CloudFormation:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": "sts:AssumeRole",
       "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/cdk-hnb659fds-*-<ACCOUNT_ID>-eu-central-1"
     }]
   }
   ```
   Если `AssumeRoleWithWebIdentity` отклонён — сверить точный `sub` с документацией GitHub и поправить строку.
4. GitHub → репозиторий API → Settings → Environments → `prod`: деплой только из `main` (по желанию — ручное подтверждение). Переменная окружения `AWS_DEPLOY_ROLE_ARN` (это не секрет).

### 6.2 Workflows репозитория API

`ci.yml` — на каждый PR: `go vet ./...`, `go test -race ./...`, `cdk synth` (без доступа к AWS: в стеках нет lookup-запросов).

`deploy.yml` — после merge в `main`:

```yaml
name: deploy
on:
  push:
    branches: [main]
permissions:
  id-token: write
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
          role-to-assume: ${{ vars.AWS_DEPLOY_ROLE_ARN }}
          aws-region: eu-central-1
      - run: cdk deploy --all --require-approval never
        working-directory: infra
```

Действия закреплены по SHA коммита: тег можно переписать, SHA — нет. Образ раннера собирается для x86_64 на обычном раннере GitHub без эмуляции; API-Lambda для arm64 собирается кросс-компиляцией Go.

### 6.3 Workflow для этого репозитория (сайт)

`checks.yml` — на каждый PR и push в `main`: Node 22, `node scripts/check-content.mjs --base <база PR>`, `node --test scripts/check-content.test.mjs`. Сейчас эти проверки запускаются только вручную. Публикация остаётся встроенной в GitHub Pages. Отдельное решение: файл `.nojekyll` отключит обработку Jekyll и Liquid целиком (Markdown-документы перестанут превращаться в HTML на Pages, сайту они не нужны).

## 7. Цена в месяц для личного использования

| Что | Оценка |
|---|---|
| Lambda, API Gateway, DynamoDB, Cognito (до 10 000 пользователей) | ≈ $0 в бесплатных лимитах |
| Secrets Manager (1 секрет) | $0.40 |
| ECR (образ раннера ≈ 1 ГБ), бакет CDK, логи | ≈ $0.10–0.30 |
| Итого | ≈ $0.5–1, покрывается кредитами |

## 8. Порядок работ

| Этап | Что | Результат |
|---|---|---|
| 0 | Разделы 1, 2.1–2.3, 6.1; пустой репозиторий API | `aws sts get-caller-identity` работает, секрет и роль созданы |
| 1 | Auth + Data + Api, кнопка входа, синхронизация отметок | Вход Google на сайте, отметки на телефоне и компьютере одинаковые |
| 2 | Runner, первые 3 задачи практикума, затем все 11 | Код из браузера проходит скрытые тесты с `-race` |
| 3 | История попыток и интервальное повторение на сервере | Формат согласован с Астрой и с предложением агента Google |

Источники: [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/), [The $0 AWS account in 2026](https://builder.aws.com/content/3Kkt4kNiDSUnO3n6db2weSNubzE/the-dollar0-aws-account-in-2026-free-plan-credits-guardrails), [MFA для root во всех типах аккаунтов](https://aws.amazon.com/about-aws/whats-new/2025/06/aws-iam-mfa-root-users-across-all-account-types), [IAM Identity Center: экземпляры организации и аккаунта](https://docs.aws.amazon.com/singlesignon/latest/userguide/identity-center-instances.html), [Cognito pricing](https://aws.amazon.com/cognito/pricing/), [JWT-авторизатор HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-jwt-authorizer.html), [квоты HTTP API](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-quotas.html), [OIDC GitHub в AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws). Версии actions — теги репозиториев на 28.10.2026; версии CDK — npm.
<!-- {% endraw %} -->
