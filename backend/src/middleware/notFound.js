function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
}

module.exports = notFound;
