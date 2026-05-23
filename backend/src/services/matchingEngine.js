const db = require("../db/db");

/*
|--------------------------------------------------------------------------
| Skill Match Score
|--------------------------------------------------------------------------
*/

function skillScore(workerSkills = [], jobSkills = []) {

  if (!Array.isArray(workerSkills)) workerSkills = [];
  if (!Array.isArray(jobSkills)) jobSkills = [];

  if (jobSkills.length === 0) return 0;

  const matched = jobSkills.filter(skill =>
    workerSkills.includes(skill)
  );

  return matched.length / jobSkills.length;
}

/*
|--------------------------------------------------------------------------
| Trust Score
|--------------------------------------------------------------------------
*/

function trustScore(truscore = 50) {
  return Number(truscore) / 100;
}

/*
|--------------------------------------------------------------------------
| Availability Score
|--------------------------------------------------------------------------
*/

function availabilityScore(status = "available") {

  switch (status) {

    case "available":
      return 1;

    case "busy":
      return 0.5;

    case "offline":
      return 0.2;

    default:
      return 0.3;
  }
}

/*
|--------------------------------------------------------------------------
| Dispute Score
|--------------------------------------------------------------------------
*/

function disputeScore(won = 0, lost = 0) {

  const total = won + lost;

  if (total === 0) {
    return 1;
  }

  return won / total;
}

/*
|--------------------------------------------------------------------------
| Final Match Score
|--------------------------------------------------------------------------
*/

function calculateScore(worker, job) {

  const score = (

    skillScore(worker.skills, job.skills) * 0.30 +

    trustScore(worker.truscore) * 0.20 +

    Math.min(worker.completed_jobs / 100, 1) * 0.15 +

    availabilityScore(worker.availability_status) * 0.10 +

    disputeScore(
      worker.disputes_won,
      worker.disputes_lost
    ) * 0.05 +

    (worker.verification_level === "verified" ? 1 : 0.5) * 0.05

  );

  return Number(score.toFixed(4));
}

/*
|--------------------------------------------------------------------------
| Rank Workers
|--------------------------------------------------------------------------
*/

async function rankWorkers(job) {

  const result = await db.query(`
    SELECT
      user_id,
      name,
      role,
      skills,
      truscore,
      completed_jobs,
      disputes_won,
      disputes_lost,
      availability_status,
      verification_level
    FROM users
    WHERE role = 'worker'
  `);

  const workers = result.rows;

  const ranked = workers.map(worker => {

    const match_score = calculateScore(worker, job);

    return {
      user_id: worker.user_id,
      name: worker.name,
      skills: worker.skills,
      truscore: worker.truscore,
      completed_jobs: worker.completed_jobs,
      availability_status: worker.availability_status,
      verification_level: worker.verification_level,
      match_score
    };

  });

  ranked.sort((a, b) => b.match_score - a.match_score);

  return ranked.slice(0, 3);
}

module.exports = {
  rankWorkers
};