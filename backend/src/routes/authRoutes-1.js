// Enhanced Auth Routes with Email Verification & Better Error Messages
// backend/src/routes/authRoutes.js - UPGRADED VERSION

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { Resend } = require('resend');

const router = express.Router();
const pool = require('../db/db');
const resend = new Resend(process.env.RESEND_API_KEY);

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function generateToken(userId, email, role) {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function generateVerificationToken(userId, email) {
  return jwt.sign(
    { userId, email, type: 'email_verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

async function sendVerificationEmail(email, name, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: '🛡️ Verify Your Veritas Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .logo { font-size: 32px; text-align: center; margin-bottom: 10px; }
            .title { font-size: 24px; font-weight: 600; color: #0A2540; text-align: center; margin-bottom: 10px; }
            .subtitle { font-size: 14px; color: #6B7280; text-align: center; margin-bottom: 30px; }
            .button { display: inline-block; background: #00D4AA; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
            .button:hover { background: #00BF99; }
            .footer { font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
            .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 20px 0; border-radius: 4px; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🛡️</div>
            <h1 class="title">Welcome to Veritas, ${name}!</h1>
            <p class="subtitle">VERITAS TRUST LEDGER</p>
            
            <p>Thanks for joining the future of portable reputation. To get started, please verify your email address:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify My Email</a>
            </div>
            
            <div class="warning">
              ⏰ <strong>This link expires in 24 hours.</strong> If you didn't create this account, you can safely ignore this email.
            </div>
            
            <p style="font-size: 14px; color: #6B7280;">
              Or copy and paste this link into your browser:<br>
              <code style="background: #F3F4F6; padding: 8px; border-radius: 4px; font-size: 12px; word-break: break-all;">${verificationUrl}</code>
            </p>
            
            <div class="footer">
              <p>🛡️ Truth Becomes Trust</p>
              <p>Veritas Trust Ledger • ${process.env.FRONTEND_URL}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// TURNSTILE VERIFICATION
// ═══════════════════════════════════════════════════════════════

async function verifyTurnstile(token) {
  if (!process.env.CLOUDFLARE_TURNSTILE_SECRET) {
    console.warn('⚠️ Turnstile not configured, skipping verification');
    return true; // Skip if not configured
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.CLOUDFLARE_TURNSTILE_SECRET,
        response: token,
      }),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// REGISTRATION with ENHANCED ERROR MESSAGES
// ═══════════════════════════════════════════════════════════════

router.post('/register', async (req, res) => {
  const { name, email, password, role = 'worker', phone, turnstileToken } = req.body;

  try {
    // ──────────────────────────────────────────────────────────
    // VALIDATION with SPECIFIC ERROR MESSAGES
    // ──────────────────────────────────────────────────────────
    
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        status: 'error',
        error: 'Please fill out all required fields (name, email, password, phone)',
        field: !name ? 'name' : !email ? 'email' : !password ? 'password' : 'phone'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        error: 'Please enter a valid email address (example: name@domain.com)',
        field: 'email'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        status: 'error',
        error: 'Password must be at least 8 characters long for security',
        field: 'password'
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        status: 'error',
        error: 'Password must contain at least one number (0-9)',
        field: 'password'
      });
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({
        status: 'error',
        error: 'Password must contain at least one special character (!@#$%^&*)',
        field: 'password'
      });
    }

    // Phone validation (basic)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({
        status: 'error',
        error: 'Please enter a valid phone number (at least 10 digits)',
        field: 'phone'
      });
    }

    // ──────────────────────────────────────────────────────────
    // TURNSTILE VERIFICATION (Bot Protection)
    // ──────────────────────────────────────────────────────────
    
    if (turnstileToken) {
      const isHuman = await verifyTurnstile(turnstileToken);
      if (!isHuman) {
        return res.status(400).json({
          status: 'error',
          error: 'Bot verification failed. Please try again.',
          field: 'turnstile'
        });
      }
    }

    // ──────────────────────────────────────────────────────────
    // CHECK IF EMAIL ALREADY EXISTS
    // ──────────────────────────────────────────────────────────
    
    const existingUser = await pool.query(
      'SELECT user_id, email_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (user.email_verified) {
        return res.status(409).json({
          status: 'error',
          error: 'This email is already registered. Try logging in instead.',
          action: 'login',
          field: 'email'
        });
      } else {
        return res.status(409).json({
          status: 'error',
          error: 'This email is registered but not verified. Check your inbox or request a new verification email.',
          action: 'resend_verification',
          userId: user.user_id,
          field: 'email'
        });
      }
    }

    // ──────────────────────────────────────────────────────────
    // CREATE USER ACCOUNT
    // ──────────────────────────────────────────────────────────
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, email_verified, truscore, tier, created_at)
       VALUES ($1, $2, $3, $4, $5, false, 0, 'Starter', NOW())
       RETURNING user_id, name, email, role, truscore, tier`,
      [name, email.toLowerCase(), hashedPassword, role, phone]
    );

    const newUser = result.rows[0];

    // ──────────────────────────────────────────────────────────
    // SEND VERIFICATION EMAIL
    // ──────────────────────────────────────────────────────────
    
    const verificationToken = generateVerificationToken(newUser.user_id, newUser.email);
    const emailSent = await sendVerificationEmail(newUser.email, newUser.name, verificationToken);

    if (!emailSent) {
      console.error('⚠️ Failed to send verification email, but account created');
    }

    // ──────────────────────────────────────────────────────────
    // RESPONSE
    // ──────────────────────────────────────────────────────────
    
    return res.status(201).json({
      status: 'success',
      message: `Account created! We sent a verification email to ${email}. Please check your inbox (and spam folder) to verify your account before logging in.`,
      data: {
        userId: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        requiresVerification: true,
        emailSent
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Database constraint errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        status: 'error',
        error: 'This email is already registered. Try logging in instead.',
        action: 'login',
        field: 'email'
      });
    }

    return res.status(500).json({
      status: 'error',
      error: 'Unable to create account. Please try again in a moment.',
      technical: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// EMAIL VERIFICATION
// ═══════════════════════════════════════════════════════════════

router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid verification token'
      });
    }

    // Update user as verified
    const result = await pool.query(
      `UPDATE users 
       SET email_verified = true, updated_at = NOW() 
       WHERE user_id = $1 AND email = $2
       RETURNING user_id, name, email, role`,
      [decoded.userId, decoded.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: 'User not found or email already verified'
      });
    }

    const user = result.rows[0];

    // Generate login token
    const loginToken = generateToken(user.user_id, user.email, user.role);

    return res.status(200).json({
      status: 'success',
      message: '🎉 Email verified! Your account is now active.',
      data: {
        token: loginToken,
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        status: 'error',
        error: 'Verification link has expired. Please request a new one.',
        action: 'resend_verification'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        status: 'error',
        error: 'Invalid verification link. Please request a new one.',
        action: 'resend_verification'
      });
    }

    console.error('Email verification error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Unable to verify email. Please try again.'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// RESEND VERIFICATION EMAIL
// ═══════════════════════════════════════════════════════════════

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        status: 'error',
        error: 'Email address is required'
      });
    }

    const result = await pool.query(
      'SELECT user_id, name, email, email_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not (security)
      return res.status(200).json({
        status: 'success',
        message: 'If this email is registered, a verification link has been sent.'
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        status: 'error',
        error: 'This email is already verified. You can log in now!',
        action: 'login'
      });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken(user.user_id, user.email);
    const emailSent = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (!emailSent) {
      return res.status(500).json({
        status: 'error',
        error: 'Unable to send verification email. Please try again.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `Verification email sent to ${email}. Please check your inbox (and spam folder).`
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Unable to resend verification email. Please try again.'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// LOGIN with ENHANCED ERROR MESSAGES
// ═══════════════════════════════════════════════════════════════

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // ──────────────────────────────────────────────────────────
    // VALIDATION
    // ──────────────────────────────────────────────────────────
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        error: 'Please enter both email and password',
        field: !email ? 'email' : 'password'
      });
    }

    // ──────────────────────────────────────────────────────────
    // CHECK IF USER EXISTS
    // ──────────────────────────────────────────────────────────
    
    const result = await pool.query(
      `SELECT user_id, name, email, password_hash, role, email_verified, 
              truscore, tier, suspended, suspension_reason
       FROM users 
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        error: 'No account found with this email. Would you like to sign up?',
        action: 'register',
        field: 'email'
      });
    }

    const user = result.rows[0];

    // ──────────────────────────────────────────────────────────
    // CHECK IF ACCOUNT IS SUSPENDED
    // ──────────────────────────────────────────────────────────
    
    if (user.suspended) {
      return res.status(403).json({
        status: 'error',
        error: `Account suspended: ${user.suspension_reason || 'Policy violation'}. Contact support for assistance.`,
        action: 'contact_support'
      });
    }

    // ──────────────────────────────────────────────────────────
    // VERIFY PASSWORD
    // ──────────────────────────────────────────────────────────
    
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({
        status: 'error',
        error: 'Incorrect password. Forgot your password?',
        action: 'forgot_password',
        field: 'password'
      });
    }

    // ──────────────────────────────────────────────────────────
    // CHECK EMAIL VERIFICATION
    // ──────────────────────────────────────────────────────────
    
    if (!user.email_verified) {
      return res.status(403).json({
        status: 'error',
        error: 'Please verify your email before logging in. Check your inbox or request a new verification email.',
        action: 'resend_verification',
        userId: user.user_id,
        email: user.email
      });
    }

    // ──────────────────────────────────────────────────────────
    // SUCCESSFUL LOGIN
    // ──────────────────────────────────────────────────────────
    
    const token = generateToken(user.user_id, user.email, user.role);

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE user_id = $1',
      [user.user_id]
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful! Welcome back.',
      data: {
        token,
        user: {
          userId: user.user_id,
          name: user.name,
          email: user.email,
          role: user.role,
          truscore: Number(user.truscore),
          tier: user.tier
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Unable to log in. Please check your connection and try again.',
      technical: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// CHECK AUTH STATUS (for frontend to verify token)
// ═══════════════════════════════════════════════════════════════

router.get('/status', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      status: 'error',
      error: 'No authentication token provided',
      authenticated: false
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const result = await pool.query(
      'SELECT user_id, name, email, role, truscore, tier, email_verified FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'error',
        error: 'User not found',
        authenticated: false
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      status: 'success',
      authenticated: true,
      data: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        truscore: Number(user.truscore),
        tier: user.tier,
        emailVerified: user.email_verified
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        error: 'Session expired. Please log in again.',
        authenticated: false,
        action: 'login'
      });
    }

    return res.status(401).json({
      status: 'error',
      error: 'Invalid authentication token',
      authenticated: false
    });
  }
});

module.exports = router;
