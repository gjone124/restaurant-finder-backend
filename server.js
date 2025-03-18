// server.js
//const express = require("express");
import express from "express";
//const cors = require("cors");
import cors from "cors";
//const fetch = require("node-fetch");
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/proxy", async (req, res) => {
  try {
    const { url } = req.body;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4002, () => {
  console.log("Proxy server running on port 4002");
});

// https://github.com/gjone124/restaurant-finder-frontend/tree/stage-1
// https://github.com/gjone124/restaurant-finder-backend/tree/stage-2
