let io: any;
let socket: any;

try {
  const socketIO = require("socket.io-client");
  io = socketIO.io;
} catch (e) {
  console.warn("socket.io-client not installed");
}

const URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(
    "/api",
    ""
  ) || "http://localhost:4000";

export const socket = io ? io(URL, {
  autoConnect: false,
  transports: ["websocket"],
}) : null;