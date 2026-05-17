import { WebSocketServer } from "ws";

export function createWSServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  const clients = new Set();

  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  function broadcast(event, data) {
    const payload = JSON.stringify({
      event,
      data,
      timestamp: Date.now(),
    });

    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(payload);
      }
    }
  }

  return {
    broadcast,
  };
}