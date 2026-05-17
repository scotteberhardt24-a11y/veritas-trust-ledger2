import { db } from "./db.js";

// -----------------------------------
// SCORE RULES
// -----------------------------------
const RULES = {
  JOB_CREATED: 1,
  JOB_FUNDED: 2,
  JOB_COMPLETED: 5,
  PAYMENT_RELEASED: 10,
  JOB_DISPUTED: -20,
  WORKER_FLAGGED: -40,
};

// -----------------------------------
// APPLY TRUST UPDATE
// -----------------------------------
export async function updateTrustScore(
  workerId,
  eventType
) {
  const delta = RULES[eventType] || 0;

  // ensure worker exists
  await db.query(
    `
    INSERT INTO workers(id)
    VALUES($1)
    ON CONFLICT (id) DO NOTHING
  `,
    [workerId]
  );

  // update score
  await db.query(
    `
    UPDATE workers
    SET trust_score = trust_score + $1
    WHERE id = $2
  `,
    [delta, workerId]
  );

  // get updated worker
  const result = await db.query(
    `
    SELECT *
    FROM workers
    WHERE id = $1
  `,
    [workerId]
  );

  const worker = result.rows[0];

  // auto-flag risky workers
  if (worker.trust_score < 0) {
    await db.query(
      `
      UPDATE workers
      SET flagged = true,
          risk_score = 100
      WHERE id = $1
    `,
      [workerId]
    );

    console.log(
      `🚨 Worker auto-flagged: ${workerId}`
    );
  }

  console.log(
    `🧠 Trust Updated → ${workerId}: ${worker.trust_score}`
  );

  return worker;
}