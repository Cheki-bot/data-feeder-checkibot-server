import { createServer } from 'http';
import app from './app.js';
import { env } from './config/index.js';
import { initializeDatabase, closeDatabase } from './config/database.js';

const PORT = env.PORT || 3000;

async function startServer() {
  try {
    const db = await initializeDatabase();

    app.locals.db = db;

    const server = createServer(app);

    server.listen(PORT, () => {
      console.log(`✓ Server listening on port ${PORT}`);
      console.log(`✓ Environment: ${env.NODE_ENV || 'development'}`);
      console.log('\nServer is ready to accept requests!\n');
    });

    process.on('SIGTERM', async () => {
      console.log('\nSIGTERM received, shutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('\nSIGINT received, shutting down gracefully...');
      server.close(async () => {
        await closeDatabase();
        console.log('✓ Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('unhandledRejection', reason => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
