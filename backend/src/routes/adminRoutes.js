const express = require("express");
const router = express.Router();

/* =========================================================
   SAFE ROLE MIDDLEWARE (INLINE FIX)
========================================================= */

function requireRole(role) {
  return (req, res, next) => {
    // If no user (auth middleware not attached), block
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // mock role system (replace later with DB roles)
    const userRole = req.user.role || "user";

    if (userRole !== role) {
      return res.status(403).json({
        error: "Forbidden: insufficient role",
      });
    }

    next();
  };
}

/* =========================================================
   ADMIN ROUTES
========================================================= */

router.use(requireRole("admin"));

router.get("/dashboard", (req, res) => {
  res.json({
    success: true,
    message: "Admin dashboard",
  });
});

router.get("/users", (req, res) => {
  res.json({
    success: true,
    users: [],
  });
});

module.exports = router;
