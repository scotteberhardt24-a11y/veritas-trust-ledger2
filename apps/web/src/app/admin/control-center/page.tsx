"use client";

import {
  trustScore,
  calculateRisk,
} from "@/lib/adminMetrics";

const USERS = [
  {
    id: 1,
    name: "Alice",
    completed_jobs: 22,
    disputes_lost: 1,
    avg_rating: 4.8,
    verification_level: "advanced",
  },
  {
    id: 2,
    name: "Bob",
    completed_jobs: 8,
    disputes_lost: 3,
    avg_rating: 3.9,
    verification_level: "basic",
  },
];

export default function AdminControlCenterPage() {
  const totalTrust = USERS.reduce(
    (acc, user) => acc + trustScore(user),
    0
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        padding: 32,
      }}
    >
      <h1
        style={{
          fontSize: 42,
          fontWeight: 900,
          marginBottom: 30,
        }}
      >
        Admin Control Center
      </h1>

      <div
        style={{
          marginBottom: 40,
          padding: 24,
          borderRadius: 16,
          background: "#111827",
          border: "1px solid #1f2937",
        }}
      >
        <div
          style={{
            fontSize: 14,
            opacity: 0.7,
            marginBottom: 8,
          }}
        >
          Platform Trust Score
        </div>

        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
          }}
        >
          {totalTrust}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 20,
        }}
      >
        {USERS.map((user) => {
          const score = trustScore(user);
          const risk = calculateRisk(user);

          return (
            <div
              key={user.id}
              style={{
                background: "#111827",
                border: "1px solid #1f2937",
                borderRadius: 18,
                padding: 24,
              }}
            >
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                {user.name}
              </h2>

              <div style={{ marginBottom: 8 }}>
                Trust Score: {score}
              </div>

              <div style={{ marginBottom: 8 }}>
                Risk Level: {risk}
              </div>

              <div>
                Verification: {user.verification_level}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
