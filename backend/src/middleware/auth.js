const jwt = require("jsonwebtoken");

/* =========================================================
   AUTH MIDDLEWARE (STEP 3)
========================================================= */
const authMiddleware = (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

module.exports = {
  authMiddleware,
};