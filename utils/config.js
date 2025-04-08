const { JWT_SECRET = "super-strong-secret" } = process.env;

const MONGO_SERVER_ADDRESS = "mongodb://127.0.0.1:27017/restaurant_finder_db";

module.exports = { JWT_SECRET, MONGO_SERVER_ADDRESS };
