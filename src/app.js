import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './config/server.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// All routes are now managed through server.routes.js
app.use('/api', routes);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// General error handler
app.use(errorHandler);

export default app;
