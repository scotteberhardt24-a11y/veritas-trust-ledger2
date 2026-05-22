require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

// Route imports
const ledgerRoutes = require("./routes/ledgerRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const authRoutes = require("./routes/authRoutes");
const trustRoutes = require("./routes/trustRoutes");
const escrowRoutes = require("./routes/escrowRoutes");
const jobRoutes = require("./routes/jobRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const healthRoutes = require("./routes/healthRoutes");

// v2 routes
const adminRoutes = require("./routes/adminRoutes");
const passportRoutes = require("./routes/passportRoutes");
const referralRoutes = require("./routes/referralRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const marketplaceRoutes = require("./routes/marketplaceRoutes");

// Controllers
const { getFeed } = require("./controllers/claimController");

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

// Make socket.io accessible in routes/controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on("join:user", (userId) => {
    socket.join(`user:${userId}`);
    console.log(`→ ${socket.id} joined user:${userId}`);
  });

  socket.on("join:escrow", (escrowId) => {
    socket.join(`escrow:${escrowId}`);
    console.log(`→ ${socket.id} joined escrow:${escrowId}`);
  });

  socket.on("disconnect", () => {
    console.log(`⚡ Socket disconnected: ${socket.id}`);
  });
});

/* =========================================================
   SECURITY + CORE MIDDLEWARE
========================================================= */

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

/* =========================================================
   STRIPE WEBHOOK
   MUST COME BEFORE express.json()
========================================================= */

app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

/* =========================================================
   RATE LIMITING
========================================================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "Veritas Trust Ledger API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    status: "online",
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
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/stripe", stripeRoutes);

// v2 routes
app.use("/api/admin", adminRoutes);
app.use("/api/passport", passportRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/marketplace", marketplaceRoutes);

/* =========================================================
   FEED ROUTE
========================================================= */

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
  console.error("❌ Unhandled error:", err);

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
  console.log("\n🛡 Veritas Trust Ledger API");
  console.log("================================");
  console.log(`🚀 Server:      http://localhost:${PORT}`);
  console.log(`🌎 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⚡ Socket.IO:   enabled`);
  console.log("================================\n");
});

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  app,
  server,
  io,
};
