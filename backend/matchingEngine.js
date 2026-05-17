import { db } from "./db.js";

// ------------------------------------
// SKILL MATCH SCORE
// ------------------------------------
function calculateSkillScore(
  workerSkills,
  requiredSkills
) {
  if (!workerSkills) return 0;

  let matches = 0;

  for (const skill of requiredSkills) {
    if (workerSkills.includes(skill)) {
      matches++;
    }
  }

  return matches * 20;
}

// ------------------------------------
// PRICE SCORE
// ------------------------------------
function calculatePriceScore(
  workerRate,
  budget
) {
  if (workerRate <= budget) {
    return 20;
  }

  return Math.max(
    0,
    20 - (workerRate - budget)
  );
}

// ------------------------------------
// RESPONSE SCORE
// ------------------------------------
function calculateResponseScore(
  responseTime
) {
  return Math.max(
    0,
    20 - responseTime
  );
}

// ------------------------------------
// MAIN AI MATCHER
// ------------------------------------
export async function matchWorkers({
  skills,
  budget,
}) {
  const result = await db.query(`
    SELECT *
    FROM workers
    WHERE availability = true
    AND flagged = false
  `);

  const workers = result.rows;

  const ranked = workers.map((worker) => {
    const skillScore =
      calculateSkillScore(
        worker.skills,
        skills
      );

    const priceScore =
      calculatePriceScore(
        worker.hourly_rate,
        budget
      );

    const responseScore =
      calculateResponseScore(
        worker.response_time
      );

    const trustScore =
      worker.trust_score || 0;

    const completedScore =
      worker.completed_jobs || 0;

    const totalScore =
      skillScore +
      priceScore +
      responseScore +
      trustScore +
      completedScore;

    return {
      ...worker,
      ai_score: totalScore,
    };
  });

  ranked.sort(
    (a, b) => b.ai_score - a.ai_score
  );

  return ranked.slice(0, 3);
}