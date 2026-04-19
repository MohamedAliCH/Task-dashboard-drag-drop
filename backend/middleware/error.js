const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}`);
  console.error(err.stack);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || "Internal Server Error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  res.status(statusCode).json({
    error: {
      message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    },
  });
};

module.exports = errorHandler;
