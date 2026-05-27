const jwt = require("jsonwebtoken");

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      error: "Authorization header missing",
    });
  }

  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev_secret"
    );

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid token",
    });
  }
}

module.exports = authMiddleware;
