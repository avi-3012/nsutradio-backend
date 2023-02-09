const mongoose = require("mongoose");

const playlist = new mongoose.Schema(
  {
    name: { type: String, required: true },
    song: { type: String, required: true },
    duration: { type: Number, required: true },
    title: { type: String, required: true },
  },
  { collection: "playlist-data" }
);

const model = mongoose.model("PlaylistData", playlist);

module.exports = model;
