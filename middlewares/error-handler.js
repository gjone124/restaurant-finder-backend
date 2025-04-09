const errorHandler = (error, request, response, next) => {
  // log error to console
  console.error(error.stack);

  // set status code based on error, default to 500
  const { statusCode = 500, message } = error;

  // send error response
  response.status(statusCode).send({
    message: statusCode === 500 ? "Internal Server Error" : message,
  });
  next();
};

module.exports = errorHandler;
