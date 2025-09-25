// 404 handler
export function notFoundHandler(req, res, _next) {
  res.status(404).json({ error: 'Resource not found' });
}

// General error handler
export function errorHandler(err, req, res, _next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
}
