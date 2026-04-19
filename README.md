### Hexlet tests and linter status:
[![Actions Status](https://github.com/effgenij/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/effgenij/ai-for-developers-project-386/actions)

# Calendar Booking

Система бронирования календаря. Владелец создаёт типы событий, гости бронируют свободные слоты без регистрации.

## Роли

- **Владелец** — один заранее заданный профиль. Создаёт типы событий, просматривает и отменяет бронирования.
- **Гость** — выбирает тип события, находит свободный слот и бронирует его без создания аккаунта.

> На одно и то же время нельзя создать две записи, даже для разных типов событий.

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | React 19, Vite |
| Backend | Fastify 5, Node.js 22 |
| API Spec | TypeSpec → OpenAPI 3.0 |
| Monorepo | Turborepo, npm workspaces |
| Dev Tools | mise (tool + task manager) |

## Структура проекта

```
├── apps/
│   ├── frontend/          React + Vite (порт 5173)
│   └── backend/           Fastify (порт 3000)
├── packages/
│   ├── api-spec/          TypeSpec спецификация → OpenAPI
│   └── typescript-config/ Общие конфиги TypeScript
├── turbo.json             Turborepo pipeline
└── mise.toml              Окружение и задачи
```

## Требования

- [mise](https://mise.jdx.dev/) — менеджер окружения (установит Node.js автоматически)

## Установка

```bash
git clone git@github.com:effgenij/ai-for-developers-project-386.git
cd ai-for-developers-project-386
mise install        # установит Node.js 22.22.2
mise run install    # установит зависимости всех пакетов
```

## Команды

```bash
mise run dev            # запустить frontend + backend
mise run dev:frontend   # только frontend (Vite, порт 5173)
mise run dev:backend    # только backend (Fastify, порт 3000)
mise run build          # собрать все пакеты
mise run check          # проверка типов
mise run lint           # линтинг
mise run test           # тесты
mise run spec           # сгенерировать OpenAPI из TypeSpec
mise run spec:watch     # автогенерация OpenAPI при изменениях
```

## API

Спецификация описана в `packages/api-spec/main.tsp` (TypeSpec). Сгенерированный OpenAPI файл: `packages/api-spec/tsp-output/openapi.yaml`.

### Event Types

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/event-types` | Список типов событий |
| POST | `/api/event-types` | Создать тип события |
| GET | `/api/event-types/:id` | Получить тип события |
| PATCH | `/api/event-types/:id` | Обновить тип события |
| DELETE | `/api/event-types/:id` | Удалить тип события |
| GET | `/api/event-types/:id/available-slots?date=YYYY-MM-DD` | Свободные слоты на дату |

### Bookings

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/bookings` | Предстоящие бронирования |
| POST | `/api/bookings` | Создать бронирование |
| DELETE | `/api/bookings/:id` | Отменить бронирование |

## Frontend UI

- `/` — каталог типов событий с выбором даты и слота для бронирования
- `/booking/:eventTypeId` — мастер бронирования (3 шага: выбор слота → данные гостя → подтверждение)
- `/admin` — панель администратора: CRUD типов событий (drawer), бронирования сгруппированы по дате

## Разработка с Prism (Mock API)

Prism позволяет разрабатывать фронтенд без запущенного бэкенда — он эмулирует API по OpenAPI-спецификации.

```bash
mise run dev:prism          # запустить mock-сервер на порту 4010
mise run dev:frontend:mock  # запустить frontend с прокси на Prism (порт 5173)
```

Переменные окружения фронтенда (см. `apps/frontend/.env.example`):

- `VITE_API_BASE_URL` — базовый URL API (по умолчанию пустой, используется прокси)
- `VITE_API_PROXY_TARGET` — адрес бэкенда для прокси Vite (по умолчанию `http://localhost:3000`)
