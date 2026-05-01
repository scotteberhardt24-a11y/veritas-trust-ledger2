const { exec } = require("child_process");
const path = require("path");

const COBOL_PATH = path.resolve(__dirname, "../../cobol/ledger");

function runCobolLedger(eventId) {
  exec(`${COBOL_PATH} ${eventId}`, { timeout: 5000 }, (err, stdout, stderr) => {
    if (err) {
      console.error("COBOL worker error:", err.message);
      return;
    }
    console.log(`✓ COBOL ledger verified: ${stdout.trim()}`);
  });
}

module.exports = runCobolLedger;
