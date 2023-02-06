const express = require("express");
const app = express();

const chat = express.Router();

chat.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = chat;
