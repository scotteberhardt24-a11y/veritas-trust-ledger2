const express = require("express");
const router = express.Router();

const {
  getNonce,
  verifySignature,
  me,
} = require("../controllers/authController");

const {
  authMiddleware,
} = require("../middleware/auth");

/* =========================================================
   STEP 2 ROUTES
========================================================= */
router.get("/nonce/:address", getNonce);
router.post("/verify", verifySignature);

/* =========================================================
   STEP 3 TEST PROTECTED ROUTE
========================================================= */
router.get("/me", authMiddleware, me);

module.exports = router;