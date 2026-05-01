const { exec } = require("child_process");
const { encrypt } = require("../encryption");
const path = require("path");

const COBOL_PATH = path.resolve(__dirname, "../../..", "cobol", "ledger");

function runLedger(a, b, callback) {
  exec(`${COBOL_PATH} ${a} ${b}`, { timeout: 5000 }, (err, stdout, stderr) => {
    if (err) return callback(new Error("COBOL engine error: " + (err.message || "unknown")));
    if (stderr) console.warn("COBOL stderr:", stderr);
    const result = stdout.trim();
    callback(null, result);
  });
}

function encryptResult(result) {
  return encrypt(result.toString());
}

module.exports = { runLedger, encryptResult };
