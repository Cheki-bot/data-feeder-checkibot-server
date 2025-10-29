import { createServer } from 'http';
import app from './app';
import { initializeDatabase } from './config/database.js';
import { env } from './config/index';

const PORT: number = Number(env.PORT) || 3000;

initializeDatabase()
  .then((db: import('mongodb').Db) => {
    app.locals.db = db;
    const server = createServer(app);
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
