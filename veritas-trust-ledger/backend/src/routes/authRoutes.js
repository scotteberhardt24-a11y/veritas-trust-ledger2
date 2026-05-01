const express = require("express"), router = express.Router(), bcrypt = require("bcryptjs"), jwt = require("jsonwebtoken"), db = require("../db/db"), auth = require("../middleware/auth")
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production", JWT_EXPIRES = process.env.JWT_EXPIRES_IN || "7d"

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email, and password required" })
    const existing = await db.query("SELECT user_id FROM users WHERE email=$1", [email])
    if (existing.rows.length > 0) return res.status(409).json({ error: "Email already registered" })
    const hashed = await bcrypt.hash(password, 12)
    const result = await db.query(`INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id, name, email, role, tier, serial`, [name, email, hashed, role || "worker"])
    const user = result.rows[0]
    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    res.status(201).json({ token, userId: user.user_id, name: user.name, email: user.email, role: user.role, tier: user.tier || "Starter", serial: user.serial })
  } catch (err) { console.error("Register error:", err); res.status(500).json({ error: "Registration failed" }) }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: "Email and password required" })
    const result = await db.query("SELECT user_id, name, email, password_hash, role, tier, serial FROM users WHERE email=$1", [email])
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" })
    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: "Invalid credentials" })
    const token = jwt.sign({ userId: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
    res.json({ token, userId: user.user_id, name: user.name, email: user.email, role: user.role, tier: user.tier || "Starter", serial: user.serial })
  } catch (err) { console.error("Login error:", err); res.status(500).json({ error: "Login failed" }) }
})

router.get("/me", auth, async (req, res) => {
  try {
    const result = await db.query(`SELECT user_id, name, email, role, tier, truscore, serial, jobs_completed, success_rate, avg_rating, balance, total_earned, is_verified, avatar_url FROM users WHERE user_id=$1`, [req.user.userId])
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" })
    res.json(result.rows[0])
  } catch (err) { console.error("Me error:", err); res.status(500).json({ error: "Failed to fetch profile" }) }
})
module.exports = router
