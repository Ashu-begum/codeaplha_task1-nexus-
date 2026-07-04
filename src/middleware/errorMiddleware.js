function notFound(req, res, next) {
  const error = new Error(`Not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Something went wrong. Please try again.' : err.message;

  res.status(statusCode).json({
    message,
    errors: err.errors || undefined
  });
}

module.exports = { notFound, errorHandler };
