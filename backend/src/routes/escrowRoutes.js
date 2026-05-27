const express = require("express");
const router = express.Router();

const escrowController = require("../controllers/escrowController");
const auth = require("../middleware/auth");

/* =========================================================
   ESCROW ROUTES
========================================================= */

router.post("/create", auth, escrowController.createEscrow);

router.get("/user/:userId", auth, escrowController.getUserEscrows);

router.get("/:escrowId", auth, escrowController.getEscrow);

router.post("/:escrowId/release", auth, escrowController.releaseEscrow);

router.post("/:escrowId/dispute", auth, escrowController.disputeEscrow);

module.exports = router;
