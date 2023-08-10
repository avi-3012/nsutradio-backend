const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const DB = process.env.MONGO_URL;


mongoose.connect(DB);
