/* =========================================================
   AUTH CONTROLLER (STABLE BOOT VERSION)
========================================================= */

exports.register = async (req, res) => {
  const { name, email } = req.body;

  return res.json({
    success: true,
    message: "User registered",
    user: {
      id: "user_001",
      name: name || "demo",
      email: email || "demo@email.com",
    },
  });
};

exports.login = async (req, res) => {
  const { email } = req.body;

  return res.json({
    success: true,
    token: "mock_jwt_token",
    user: {
      id: "user_001",
      email: email || "demo@email.com",
    },
  });
};

exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user || {
      id: "demo_user",
      email: "demo@email.com",
    },
  });
};
