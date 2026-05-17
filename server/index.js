import express from "express";
import http from "http";
import cors from "cors";
import { createWSServer } from "./ws.js";
import { startChainListener } from "./chainListener.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

// --------------------------
// WS SYSTEM
// --------------------------
const ws = createWSServer(server);

// --------------------------
// BLOCKCHAIN LISTENER
// --------------------------
startChainListener(ws.broadcast);

// --------------------------
// OPTIONAL HEALTH CHECK
// --------------------------
app.get("/", (req, res) => {
  res.json({
    status: "Veritas Chain Listener Active",
  });
});

server.listen(4000, () => {
  console.log("🚀 Veritas Live System running on :4000");
});