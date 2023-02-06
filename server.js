const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const cors = require("cors");
const chat = require("./routes/chat");
const player = require("./routes/player");
const { Server } = require("socket.io");
// const mongoose = require("mongoose");
const Playlist = require("./db/data.model");
const room = 1111;
require("./db/connection");
var songPlaying = "";
var playing = false;

app.use(cors());
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

//functions
async function updatePlaylist(user, song, duration) {
  console.log("updating playlist");
  try {
    await Playlist.create({
      name: user,
      song: song,
      duration: duration,
    });
    await checkPlay();
    // playSong(song, duration);
    // io.to(room).emit("update_song");
    res.status(201).send("Playlist updated");
  } catch (error) {}
}

async function checkPlay() {
  songPlaying = "";
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
  duration = duration;
  console.log("playing song");
  var count = 0;
  songPlaying = song;
  let interval = setInterval(async () => {
    count += 1;
    console.log("playing song", count);
    if (count === duration) {
      clearInterval(interval);
    }
  }, 1000);
  setTimeout(async () => {
    songPlaying = "";
    io.to(room).emit("update_song");
    console.log("deleting song");
    await Playlist.deleteOne({}, { sort: { _id: 1 } });
    playing = false;
    checkPlay();
    console.log("song ended");
  }, duration * 1000);
}

//playlist

io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("join", () => {
    socket.join(room);
    console.log(socket.id, "joined room", room);
  });
  socket.on("message", (data) => {
    console.log(`User: ${data[0]} sent message: ${data[1]}`);
    io.to(room).emit("recieve_message", data);
  });

  socket.on("send_song", (data) => {
    console.log(
      `User: ${data[0]} sent song: ${data[1]} of duration: ${data[2]}`
    );
    //update playlist
    updatePlaylist(data[0], data[1], data[2]);

    song = data[1];
    // io.to(room).emit("update_song");
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

// routes ======================================================================

player.get("/api/song", (req, res) => {
  console.log("song requested");
  console.log(songPlaying);
  res.send(songPlaying);
});

// listen (start app with node server.js) ======================================
server.listen(port, () => {
  console.log("App listening on port " + port);
});
