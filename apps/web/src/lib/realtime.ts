"use client";

type Callback = (data: any) => void;

class RealtimeClient {
  socket: WebSocket | null = null;
  listeners: Record<string, Callback[]> = {};

  connect() {
    this.socket = new WebSocket("ws://localhost:4000");

    this.socket.onmessage = (msg) => {
      const parsed = JSON.parse(msg.data);

      const callbacks = this.listeners[parsed.event] || [];

      callbacks.forEach((cb) => cb(parsed.data));
    };
  }

  on(event: string, cb: Callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(cb);
  }

  disconnect() {
    this.socket?.close();
  }
}

export const realtime = new RealtimeClient();