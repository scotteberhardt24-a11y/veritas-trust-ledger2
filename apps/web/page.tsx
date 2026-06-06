"use client";

import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        position: "relative",
      }}
    >
      <motion.div
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "rgba(212,175,55,0.08)",
          filter: "blur(120px)",
        }}
      />

      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 1,
        }}
        className="glass"
        style={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 32,
          padding: 48,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          <motion.img
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
            src="/veritas-shield.png"
            alt="VERITAS"
            className="gold-glow"
            style={{
              width: 130,
              marginBottom: 24,
            }}
          />

          <div className="veritas-title">
            VERITAS
          </div>

          <p
            style={{
              marginTop: 18,
              fontSize: "1.05rem",
              opacity: 0.82,
              maxWidth: 420,
              lineHeight: 1.7,
            }}
          >
            Welcome to the next generation trust infrastructure platform.
            Secure escrow. AI protection. Verified reputation systems.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 28,
          }}
        >
          <button
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontWeight: 700,
            }}
          >
            Sign In
          </button>

          <button
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(212,175,55,0.4)",
              background: "rgba(212,175,55,0.12)",
              color: "#d4af37",
              fontWeight: 700,
            }}
          >
            Sign Up
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <input
            className="auth-input"
            placeholder="Full Name"
          />

          <input
            className="auth-input"
            placeholder="Email Address"
          />

          <input
            className="auth-input"
            placeholder="Username"
          />

          <input
            className="auth-input"
            placeholder="Password"
            type="password"
          />

          <button className="auth-button">
            ENTER VERITAS
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 22,
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          <span
            style={{
              cursor: "pointer",
            }}
          >
            Forgot Password?
          </span>

          <span
            style={{
              cursor: "pointer",
            }}
          >
            Forgot Username?
          </span>
        </div>

        <div
          style={{
            marginTop: 36,
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            justifyContent: "space-around",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                color: "#d4af37",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              AI
            </div>

            <div
              style={{
                opacity: 0.65,
                fontSize: 13,
              }}
            >
              Protection
            </div>
          </div>

          <div>
            <div
              style={{
                color: "#d4af37",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              24/7
            </div>

            <div
              style={{
                opacity: 0.65,
                fontSize: 13,
              }}
            >
              Escrow
            </div>
          </div>

          <div>
            <div
              style={{
                color: "#d4af37",
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              LIVE
            </div>

            <div
              style={{
                opacity: 0.65,
                fontSize: 13,
              }}
            >
              Verification
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
