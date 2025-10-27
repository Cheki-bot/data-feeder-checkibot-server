import { createServer } from 'http';
import app from './app.js';
import { initializeDatabase } from './config/database.js';
import { env } from './config/index.js';

const PORT = env.PORT || 3000;

initializeDatabase()
  .then(db => {
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

process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
