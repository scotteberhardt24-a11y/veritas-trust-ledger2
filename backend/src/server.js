require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const morgan   = require("morgan");
const rateLimit = require("express-rate-limit");
const http     = require("http");
const { Server } = require("socket.io");

// Routes
const ledgerRoutes       = require("./routes/ledgerRoutes");
const stripeRoutes       = require("./routes/stripeRoutes");
const authRoutes         = require("./routes/authRoutes");
const trustRoutes        = require("./routes/trustRoutes");
const escrowRoutes       = require("./routes/escrowRoutes");
const jobRoutes          = require("./routes/jobRoutes");
const messageRoutes      = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const healthRoutes       = require("./routes/healthRoutes");
const { getFeed }        = require("./controllers/claimController");

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 4000;

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"],
  },
});

// Make io available to routes
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);

  socket.on("join:user", (userId) => {
    socket.join(`user:${userId}`);
    console.log(`  → ${socket.id} joined room user:${userId}`);
  });

  socket.on("join:escrow", (escrowId) => {
    socket.join(`escrow:${escrowId}`);
  });

  socket.on("disconnect", () => {
    console.log(`⚡ Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Stripe webhook needs raw body — mount BEFORE express.json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Routes
app.use("/api/health",        healthRoutes);
app.use("/api/auth",          authRoutes);
app.use("/api/trust",         trustRoutes);
app.use("/api/escrow",        escrowRoutes);
app.use("/api/jobs",          jobRoutes);
app.use("/api/messages",      messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ledger",        ledgerRoutes);
app.use("/api/stripe",        stripeRoutes);
app.get("/api/feed",          getFeed);

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🛡  Veritas API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Socket.io:   enabled\n`);
});

module.exports = { app, server, io };

// ─── New Routes (v2) ──────────────────────────────────────
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/passport", require("./routes/passportRoutes"));
app.use("/api/referrals", require("./routes/referralRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/marketplace", require("./routes/marketplaceRoutes"));
