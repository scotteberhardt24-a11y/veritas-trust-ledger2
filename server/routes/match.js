import express from "express";
import { matchWorkers } from "../../backend/matchingEngine.js";

const router = express.Router();

// ------------------------------------
// AI MATCH ROUTE
// ------------------------------------
router.post("/", async (req, res) => {
  try {
    const { skills, budget } = req.body;

    const matches = await matchWorkers({
      skills,
      budget,
    });

    res.json({
      success: true,
      matches,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "AI matching failed",
    });
  }
});

export default router;