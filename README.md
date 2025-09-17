# Data Feeder Server

Base API built with Express.

## Requirements
- Node.js >= 18

## Installation
```bash
npm install
```

## Environment variables
Copy `.env.example` to `.env` and adjust values.

```bash
cp .env.example .env
```

## Scripts
- `npm run dev` starts the server with auto-reload (nodemon)
- `npm start` starts in production mode

## Structure
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
