"use client";

export function NavBar() {
  return (
    <header
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(7,17,31,0.92)",
        backdropFilter: "blur(20px)",
      }}
      className="w-full px-8 py-5 flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <img
          src="/veritas-shield.png"
          alt="VERITAS"
          style={{
            width: 52,
            height: 52,
            objectFit: "contain",
          }}
        />

        <div
          style={{
            fontSize: "2rem",
            fontStyle: "italic",
            fontWeight: 700,
            color: "#d4af37",
            letterSpacing: "0.08em",
          }}
        >
          VERITAS
        </div>
      </div>

      <nav className="flex items-center gap-8 text-sm">
        <span>Marketplace</span>
        <span>Escrow</span>
        <span>Trust Score</span>
        <span>AI Protection</span>

        <button
          className="veritas-glow"
          style={{
            background: "#d4af37",
            color: "#07111f",
            border: "none",
            padding: "12px 22px",
            borderRadius: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
      </nav>
    </header>
  );
}
