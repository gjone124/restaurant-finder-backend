const { MONGO_SERVER_ADDRESS } = require("./utils/config");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { errors } = require("celebrate");
const helmet = require("helmet");
const rateLimiter = require("./middlewares/rateLimiter");

const fetchData = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const mainRouter = require("./routes/index");
const errorHandler = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect(MONGO_SERVER_ADDRESS)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch(console.error);

app.use(helmet());
app.use(rateLimiter);
app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use("/", mainRouter);

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.post("/api/proxy", async (req, res) => {
  try {
    const { url } = req.body;
    const response = await fetchData(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});

// https://github.com/gjone124/restaurant-finder-frontend/tree/stage-1
// https://github.com/gjone124/restaurant-finder-backend/tree/stage-2

// https://discord.com/channels/1078663743568883783/1184956225637597194/1204145014746251395

// sudo cp /etc/nginx/restaurant-finder.theoceanforest.com/default /etc/nginx/restaurant-finder.theoceanforest.com/final-project
