require("dotenv").config();

const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");

// In-memory nonce store (replace with Redis/DB later in production)
const nonces = new Map();

/* =========================================================
   STEP 2A: GET NONCE
========================================================= */
const getNonce = (req, res) => {
  const { address } = req.params;

  if (!address) {
    return res.status(400).json({ error: "Address required" });
  }

  const nonce = Math.floor(Math.random() * 1000000).toString();

  nonces.set(address.toLowerCase(), nonce);

  return res.json({
    address,
    nonce,
  });
};

/* =========================================================
   STEP 2B: VERIFY SIGNATURE + ISSUE JWT
========================================================= */
const verifySignature = async (req, res) => {
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res.status(400).json({
      error: "Address and signature required",
    });
  }

  const nonce = nonces.get(address.toLowerCase());

  if (!nonce) {
    return res.status(400).json({
      error: "Nonce not found or expired",
    });
  }

  const message = `Login to Veritas Trust Ledger\nNonce: ${nonce}`;

  try {
    const recovered = ethers.verifyMessage(message, signature);

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({
        error: "Invalid signature",
      });
    }

    const token = jwt.sign(
      {
        address,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    nonces.delete(address.toLowerCase());

    return res.json({
      success: true,
      token,
    });
  } catch (err) {
    console.error("verifySignature error:", err);

    return res.status(500).json({
      error: "Signature verification failed",
    });
  }
};

/* =========================================================
   STEP 4 TEST ENDPOINT (WHO AM I)
========================================================= */
const me = (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};

module.exports = {
  getNonce,
  verifySignature,
  me,
};