require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const http = require("http");
const { Server } = require("socket.io");

// ROUTES
const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const trustRoutes = require("./routes/trustRoutes");
const escrowRoutes = require("./routes/escrowRoutes");
const jobRoutes = require("./routes/jobRoutes");
const contractRoutes = require("./routes/contractRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const passportRoutes = require("./routes/passportRoutes");
const referralRoutes = require("./routes/referralRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");

// CONTROLLERS
const { getFeed } = require("./controllers/claimController");

// SOCKET SERVICE
const { setIO } = require("./services/socketService");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

/* =========================================================
   SOCKET.IO
========================================================= */

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

// make io globally accessible
setIO(io);

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  // USER ROOM
  socket.on("join:user", (userId) => {
    socket.join(`user:${userId}`);

    console.log(
      `👤 Socket ${socket.id} joined user room: user:${userId}`
    );
  });

  // ESCROW ROOM
  socket.on("join:escrow", (escrowId) => {
    socket.join(`escrow:${escrowId}`);

    console.log(
      `💰 Socket ${socket.id} joined escrow room: escrow:${escrowId}`
    );
  });

  // CHAT ROOM
  socket.on("join:chat", (chatId) => {
    socket.join(`chat:${chatId}`);

    console.log(
      `💬 Socket ${socket.id} joined chat room: chat:${chatId}`
    );
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(compression());

app.use(cookieParser());

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

// Stripe webhook RAW parser BEFORE express.json
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);

// JSON parser
app.use(express.json({ limit: "10mb" }));

// URL encoded parser
app.use(express.urlencoded({ extended: true }));

// RATE LIMITER
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Veritas Trust Ledger API",
    status: "running",
  });
});

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/trust", trustRoutes);

app.use("/api/escrow", escrowRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/contracts", contractRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/ledger", ledgerRoutes);

app.use("/api/stripe", stripeRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/passport", passportRoutes);

app.use("/api/referrals", referralRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/marketplace", marketplaceRoutes);

app.get("/api/feed", getFeed);

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:");
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/* =========================================================
   START SERVER
========================================================= */

server.listen(PORT, "0.0.0.0", () => {
  console.log("\n======================================");
  console.log("🛡 VERITAS TRUST LEDGER API RUNNING");
  console.log("======================================");
  console.log(`🌍 PORT: ${PORT}`);
  console.log(
    `⚙️ ENV: ${process.env.NODE_ENV || "development"}`
  );
  console.log("🔌 SOCKET.IO ENABLED");
  console.log("======================================\n");
});

module.exports = {
  app,
  server,
  io,
};
