const { JWT_SECRET = "super-strong-secret" } = process.env;

const { MONGO_SERVER_ADDRESS } = process.env;

module.exports = { JWT_SECRET, MONGO_SERVER_ADDRESS };
