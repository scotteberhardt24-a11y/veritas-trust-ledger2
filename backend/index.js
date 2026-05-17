import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import matchRoutes from "./routes/match.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ----------------------------
// ROUTES
// ----------------------------
app.use("/match", matchRoutes);

// ----------------------------
// HEALTH CHECK
// ----------------------------
app.get("/", (req, res) => {
  res.json({
    status: "Veritas Backend Running",
  });
});

// ----------------------------
// START SERVER
// ----------------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `🚀 Veritas backend running on port ${PORT}`
  );
});