const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const DB = process.env.MONGO_URL;
//"mongodb+srv://ecommerce:xGJEgASN8vpYnSC5@ecommerce.u5g95rd.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB);
