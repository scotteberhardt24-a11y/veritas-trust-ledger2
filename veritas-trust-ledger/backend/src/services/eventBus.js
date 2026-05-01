const crypto = require("crypto");
const redis  = require("../redis/redis");

async function publishEvent(type, payload) {
  const event = {
    event_id:   crypto.randomUUID(),
    event_type: type,
    payload:    typeof payload === "string" ? payload : JSON.stringify(payload),
    timestamp:  Date.now(),
  };

  await redis.xadd("veritas-stream", "*", "event", JSON.stringify(event));
  console.log(`✓ Event published: ${type}`);
  return event;
}

async function publishToChannel(channel, data) {
  await redis.publish(channel, JSON.stringify(data));
}

module.exports = { publishEvent, publishToChannel };
