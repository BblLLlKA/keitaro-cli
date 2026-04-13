# Keitaro Automation CLI

Расширяемый CLI-инструмент на Node.js для автоматизаций в Keitaro Admin API.

Поддерживает:

- получение списков сущностей (`list`)
- получение сущности по id (`get`)
- создание сущности (`create`)
- обновление сущности (`update`)
- удаление сущности (`delete`)

Изначально оптимизирован под домены, но архитектура сделана универсальной для дальнейшего расширения: офферы, пользователи, кампании и другие ресурсы Keitaro.

## Основные возможности

- OOP-архитектура с разделением ответственности (SOLID-подход)
- Понятные логи с уровнями (`error`, `warn`, `info`, `debug`)
- Отказоустойчивый HTTP-клиент с обработкой ошибок API
- Поддержка конфигурации через `.env`
- Переопределение любых конфигов через CLI-аргументы
- Вывод списков в консоль
- Единая логика выборки поля для любых сущностей через `--value`

## Какие ошибки API обрабатываются явно

Для статусов `400`, `401`, `402`, `500`:

- читается поле `error` из тела ответа
- сообщение печатается в формате `Keitaro API error <status>: <error>`

Если поле `error` отсутствует, используется безопасный fallback.

## Структура проекта

- `index.js` — точка входа
- `src/app/AutomationApp.js` — orchestration и маршрутизация команд
- `src/config/AppConfig.js` — загрузка и валидация конфигурации
- `src/core/Logger.js` — логирование
- `src/core/KeitaroApiClient.js` — клиент Keitaro API
- `src/cli/CommandParser.js` — парсинг команд и опций
- `src/services/AutomationService.js` — бизнес-операции

## Требования

- Node.js 18+
- npm 9+
- доступ к Keitaro Admin API

## Установка

```bash
npm install
```

## Конфигурация через .env

Создайте `.env` на основе примера `.env.example`:

```env
KEITARO_BASE_URL=http://example.com
KEITARO_API_KEY=your-api-key
KEITARO_TIMEOUT_MS=30000
KEITARO_RETRIES=1
LOG_LEVEL=info
```

## CLI: команды

Общий формат:

```bash
npm start -- <command> <resource> [id] [options]
```

### list

```bash
npm start -- list domains
npm start -- list offers
npm start -- list users
```

Опции (глобальные, применяются ко всем командам):

- `--value <name>` — вернуть только это поле из ответа команды
- `--field <name>` — алиас для `--value`
- `--output <path>` — сохранить вывод в файл

Примеры:

```bash
npm start -- list domains --field name --output domains.txt
npm start -- list offers --field name --output offers.txt
npm start -- list users --value id
```

Поведение:

- если `--value` (или `--field`) не передан, возвращается полный JSON-ответ от Keitaro;
- если `--value` передан, возвращается только указанное поле (по одному значению на строку).

Это поведение единообразно для `list`, `get`, `create`, `update`, `delete`.

### get

```bash
npm start -- get users 42
npm start -- get offers 680 --value name
npm start -- get offers 680 --output offer_680.json
```

### create

```bash
npm start -- create users --data '{"name":"John","role":"admin"}'
npm start -- create users --data '{"name":"John","role":"admin"}' --value id
```

### update

```bash
npm start -- update users 42 --data '{"name":"John Updated"}'
npm start -- update users 42 --data '{"name":"John Updated"}' --output updated_user.json
```

### delete

```bash
npm start -- delete users 42
npm start -- delete users 42 --output delete_result.json
```

## Переопределение .env через CLI

Можно передать параметры явно:

```bash
npm start -- list domains --base-url http://example.com --api-key your-api-key
```

Доступные опции:

- `--base-url <url>`
- `--api-key <key>`
- `--timeout-ms <number>`
- `--retries <number>`
- `--log-level <error|warn|info|debug>`
- `--output <path>`
- `--value <name>`
- `--field <name>`
- `--data <json>`
- `--help`

## Режим совместимости

Старый формат запуска тоже поддерживается:

```bash
npm start -- http://example.com your-api-key
npm start -- http://example.com your-api-key domains.txt
```

В этом режиме команда автоматически интерпретируется как `list domains`.

## Что выводит скрипт

- Бизнес-результат в stdout (список строк или JSON)
- Диагностические сообщения в stderr/stdout с префиксом уровня и времени

Powered with Github Copilot
