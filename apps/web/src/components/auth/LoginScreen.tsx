"use client";

export function LoginScreen() {
  return (
    <div
      className="w-full min-h-screen flex items-center justify-center 
px-6"
      style={{
        background:
          "radial-gradient(circle at top, #12233f 0%, #07111f 60%)",
      }}
    >
      <div
        className="veritas-card veritas-glow"
        style={{
          width: 460,
          padding: 40,
        }}
      >
        <div className="flex flex-col items-center mb-8">
          <img
            src="/veritas-shield.png"
            alt="Veritas"
            style={{
              width: 110,
              marginBottom: 20,
            }}
          />

          <h1
            style={{
              color: "#d4af37",
              fontSize: "2.4rem",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            VERITAS
          </h1>

          <p
            style={{
              opacity: 0.7,
              marginTop: 10,
            }}
          >
            Trust Infrastructure Platform
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <input
            placeholder="Email"
            className="p-4 rounded-xl bg-black/30 border border-white/10"
          />

          <input
            type="password"
            placeholder="Password"
            className="p-4 rounded-xl bg-black/30 border border-white/10"
          />

          <button
            className="veritas-glow"
            style={{
              background: "#d4af37",
              color: "#07111f",
              border: "none",
              padding: "16px",
              borderRadius: "14px",
              fontWeight: 800,
              marginTop: 10,
              cursor: "pointer",
            }}
          >
            ENTER VERITAS
          </button>
        </div>
      </div>
    </div>
  );
}
