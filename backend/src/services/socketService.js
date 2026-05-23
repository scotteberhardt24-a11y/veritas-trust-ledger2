let io = null;

function setIO(instance) {
  io = instance;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
}

module.exports = {
  setIO,
  getIO,
};
