const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication token missing.",
    });
  }

  try {
    const token = header.split(" ")[1];

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Session expired. Please login again.",
      });
    }

    return res.status(401).json({
      error: "Invalid authentication token.",
    });
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;

  if (
    header &&
    header.startsWith("Bearer ")
  ) {
    try {
      req.user = jwt.verify(
        header.split(" ")[1],
        JWT_SECRET
      );
    } catch (err) {}
  }

  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Insufficient permissions.",
      });
    }

    next();
  };
}

module.exports = authMiddleware;

module.exports.optionalAuth = optionalAuth;

module.exports.requireRole = requireRole;
