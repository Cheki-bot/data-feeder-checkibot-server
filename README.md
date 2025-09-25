# Data Feeder Server

Base API built with Express.

## Requirements

- Node.js >= 18

## Installation

```bash
npm install
```

## Environment variables

Copy `.env.example` to `.env` and adjust the values.

```bash
cp .env.example .env
```

## Available scripts

- `npm run dev`: start the server with auto-reload (nodemon)
- `npm start`: start in production mode
- `npm run lint`: run ESLint
- `npm run lint:fix`: auto-fix ESLint issues
- `npm run format`: format code with Prettier
- `npm run format:check`: check formatting without writing changes

## Code style and quality

- ESLint (Flat Config) configured for Node ESM
- Prettier as the code formatter
- ESLint + Prettier integration to avoid conflicts
- Husky + lint-staged run checks on each commit

When you run `npm install`, Husky initializes automatically via the `prepare` script.

### Git hooks

- `pre-commit`: runs `lint-staged` to lint/format staged files.

If you’re on CI or Docker and don’t want to install hooks, you can disable Husky with `HUSKY=0`.

## Project structure

```
src/
  app.js
  server.js
  config/
    index.js
  routes/
    index.js
    health.js
  middleware/
    errorHandler.js
```

## Health endpoint

GET `/api/health`

Sample response:

```json
{
  "status": "ok",
  "service": "data-feeder-server",
  "timestamp": "2025-09-16T12:34:56.000Z",
  "env": "development"
}
```

## Editor recommendations (optional)

In VS Code, enable format on save and ESLint fixes:

```jsonc
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true,
  },
}
```
