const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const chat = require("./routes/chat");
const player = require("./routes/player");
const { Server } = require("socket.io");
// const mongoose = require("mongoose");
const Playlist = require("./db/data.model");
const room = 1111;
require("./db/connection");
var songPlaying = "";
var songPosition = "0";
var playing = false;
var playlist = [];

// app.use(cors());
app.use(express.json());
app.use(chat);
app.use(player);

const server = require("http").createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

setInterval(async () => {
  const data = songPlaying;
  const data2 = songPosition;
  const data3 = await Playlist.find();
  playlist = data3;
  io.to(room).emit("fetch_song", data);
  io.to(room).emit("fetch_position", data2);
  io.to(room).emit("playlist_update", data3);
}, 5000);

//functions
async function updatePlaylist(user, song, duration, title) {
  console.log("updating playlist");
  try {
    await Playlist.create({
      name: user,
      song: song,
      duration: duration,
      title: title,
    });
    const data = await Playlist.find();
    io.to(room).emit("playlist_update", data);
    await checkPlay();
    // playSong(song, duration);
    // io.to(room).emit("update_song");
    res.status(201).send("Playlist updated");
  } catch (error) {}
}

async function checkPlay() {
  console.log("checking play");
  if (!playing) {
    console.log("not playing");
    const data = await Playlist.findOne();
    console.log(data);
    if (data) {
      console.log("playing song", data.song, data.duration);
      io.to(room).emit("update_song");
      playSong(data.song, data.duration);
    } else {
      console.log("no song");
    }
  }
}

async function playSong(song, duration) {
  playing = true;
  duration = duration + 5;
  console.log("playing song");
  var count = 0;
  songPlaying = song;
  let interval = setInterval(async () => {
    count += 1;
    songPosition = `${count}`;
    console.log("playing song", count);
    if (count === duration) {
      songPosition = "0";
      clearInterval(interval);
    }
  }, 1000);
  setTimeout(async () => {
    songPlaying = "";
    songPosition = "0";
    io.to(room).emit("update_song");
    console.log("deleting song");
    await Playlist.deleteOne({}, { sort: { _id: 1 } });
    playing = false;
    checkPlay();
    console.log("song ended");
    const data = await Playlist.find();
    io.to(room).emit("playlist_update", data);
  }, duration * 1000);
}

//playlist

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("join", async () => {
    await socket.join(room);
    console.log(socket.id, "joined room", room);
  });
  socket.on("message", (data) => {
    console.log(`User: ${data[0]} sent message: ${data[1]}`);
    io.to(room).emit("recieve_message", data);
  });

  socket.on("send_song", (data) => {
    console.log(
      `User: ${data[0]} sent song: ${data[1]} of duration: ${data[2]} title: ${data[3]}`
    );
    //update playlist
    updatePlaylist(data[0], data[1], data[2], data[3]);

    // song = data[1];
    // io.to(room).emit("update_song");
  });
  socket.on("playlist", () => {
    console.log("playlist requested");
    io.to(room).emit("playlist_update", playlist);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// routes ======================================================================

// player.get("/api/song", async (req, res) => {
//   const data = await Playlist.find();
//   var songData = { song: songPlaying, position: songPosition, playlist: data };
//   console.log("song requested");
//   res.send(songData);
// });

// player.get("/api/playlist", async (req, res) => {
//   const data = await Playlist.find();
//   res.send(data);
// });

// listen (start app with node server.js) ======================================
server.listen(port, () => {
  console.log("App listening on port " + port);
});
