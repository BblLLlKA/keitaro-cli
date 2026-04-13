# Keitaro Automation CLI

An extensible Node.js CLI tool for automation with the Keitaro Admin API.

Supported operations:

- list entities (`list`)
- get an entity by id (`get`)
- create an entity (`create`)
- update an entity (`update`)
- delete an entity (`delete`)

Originally optimized for domains, but designed as a generic architecture that can be extended for offers, users, campaigns, and other Keitaro resources.

## Key Features

- OOP architecture with clear separation of responsibilities (SOLID approach)
- Human-friendly logs with levels (`error`, `warn`, `info`, `debug`)
- Resilient HTTP client with API error handling
- Configuration via `.env`
- Any config can be overridden with CLI arguments
- Console output for responses
- Unified field selection for any entity via `--value`

## Explicit API Error Handling

For statuses `400`, `401`, `402`, `500`:

- reads the `error` field from the response body
- prints messages in the format `Keitaro API error <status>: <error>`

If the `error` field is missing, a safe fallback message is used.

## Project Structure

- `index.js` - entry point
- `src/app/AutomationApp.js` - orchestration and command routing
- `src/config/AppConfig.js` - config loading and validation
- `src/core/Logger.js` - logging
- `src/core/KeitaroApiClient.js` - Keitaro API client
- `src/cli/CommandParser.js` - command and option parsing
- `src/services/AutomationService.js` - business operations

## Requirements

- Node.js 18+
- npm 9+
- access to Keitaro Admin API

## Installation

```bash
npm install
```

## Configuration via .env

Create a `.env` file based on `.env.example`:

```env
KEITARO_BASE_URL=http://example.com
KEITARO_API_KEY=your-api-key
KEITARO_TIMEOUT_MS=30000
KEITARO_RETRIES=1
LOG_LEVEL=info
```

## CLI Commands

General format:

```bash
npm start -- <command> <resource> [id] [options]
```

### list

```bash
npm start -- list domains
npm start -- list offers
npm start -- list users
```

Options (global, apply to all commands):

- `--value <name>` - return only this field from command response
- `--field <name>` - alias for `--value`
- `--output <path>` - save output to file

Examples:

```bash
npm start -- list domains --field name --output domains.txt
npm start -- list offers --field name --output offers.txt
npm start -- list users --value id
```

Behavior:

- if `--value` (or `--field`) is not provided, the full JSON response from Keitaro is returned;
- if `--value` is provided, only that field is returned (one value per line).

This behavior is consistent for `list`, `get`, `create`, `update`, `delete`.

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

## Override .env via CLI

You can pass parameters explicitly:

```bash
npm start -- list domains --base-url http://example.com --api-key your-api-key
```

Available options:

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

## Compatibility Mode

Legacy launch format is still supported:

```bash
npm start -- http://example.com your-api-key
npm start -- http://example.com your-api-key domains.txt
```

In this mode, the command is automatically interpreted as `list domains`.

## Script Output

- Business result to stdout (line list or JSON)
- Diagnostic logs to stderr/stdout with timestamp and log level

Powered by GitHub Copilot
