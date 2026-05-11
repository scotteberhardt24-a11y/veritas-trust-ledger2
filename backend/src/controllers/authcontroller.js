const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db/db");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d";

function generateToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES,
    }
  );
}

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All required fields must be completed.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters.",
      });
    }

    const existing = await db.query(
      "SELECT user_id FROM users WHERE email=$1",
      [email.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const result = await db.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password_hash,
        role,
        verification_token,
        is_verified
      )
      VALUES ($1,$2,$3,$4,$5,false)
      RETURNING *
      `,
      [
        name,
        email.toLowerCase(),
        passwordHash,
        role || "worker",
        verifyToken,
      ]
    );

    const user = result.rows[0];

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please verify your email.",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      error: "Registration failed.",
    });
  }
};

exports.login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const result = await db.query(
      `
      SELECT *
      FROM users
      WHERE email=$1
      `,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "No account found with this email.",
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Incorrect password.",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        truscore: user.truscore,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    return res.status(500).json({
      error: "Login failed.",
    });
  }
};

exports.me = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        user_id,
        name,
        email,
        role,
        tier,
        truscore,
        serial,
        jobs_completed,
        success_rate,
        avg_rating,
        balance,
        total_earned,
        is_verified,
        avatar_url
      FROM users
      WHERE user_id=$1
      `,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found.",
      });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error("ME ERROR:", err);

    return res.status(500).json({
      error: "Failed to load profile.",
    });
  }
};
