const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const rateLimit = require("./middleware/rateLimit");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

/* ROUTES */
const authRoutes = require("./routes/authRoutes");
const escrowRoutes = require("./routes/escrowRoutes");
const messageRoutes = require("./routes/messageRoutes");
const jobRoutes = require("./routes/jobRoutes");
const trustRoutes = require("./routes/trustRoutes");
const adminRoutes = require("./routes/adminRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

/* =========================================================
   GLOBAL MIDDLEWARE
========================================================= */

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true 
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", rateLimit);

/* =========================================================
   ROUTES
========================================================= */

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/trust", trustRoutes);
app.use("/api/admin", adminRoutes);

/* =========================================================
   ROOT
========================================================= */

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    name: "Veritas API v1",
  });
});

/* =========================================================
   ERRORS
========================================================= */

app.use(notFound);
app.use(errorHandler);

module.exports = app;
