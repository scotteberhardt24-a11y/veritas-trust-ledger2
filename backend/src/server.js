require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { setIO } = require("./services/socketService");

const PORT = process.env.PORT || 4000;
const passportRoutes =require("./routes/passportRoutes");
const server = http.createServer(app);
app.use(
  "/api/passport",
  passportRoutes
);
/* =========================================================
   SOCKET.IO
========================================================= */

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },
});

setIO(io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join:user", (id) => socket.join(`user:${id}`));
  socket.on("join:chat", (id) => socket.join(`chat:${id}`));
  socket.on("join:escrow", (id) => socket.join(`escrow:${id}`));

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* =========================================================
   START SERVER
========================================================= */

server.listen(PORT, () => {
  console.log("==================================");
  console.log("🚀 VERITAS API v1 RUNNING");
  console.log("PORT:", PORT);
  console.log("ENV:", process.env.NODE_ENV);
  console.log("==================================");
});
