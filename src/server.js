import { createServer } from 'http';
import app from './app.js';
import { env } from './config/index.js';

const PORT = env.PORT || 3000;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
