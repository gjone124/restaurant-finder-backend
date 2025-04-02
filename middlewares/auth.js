const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const UnauthorizedError = require("../utils/errors/UnauthorizedError");

const auth = (request, response, next) => {
  const { authorization } = request.headers;

  if (!authorization) {
    return next(new UnauthorizedError("Authorization required."));
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError("Invalid token."));
  }

  request.user = payload;
  return next();
};

module.exports = auth;
