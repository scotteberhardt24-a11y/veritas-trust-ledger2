const db = require("../db/db");
const { v4: uuidv4 } = require("uuid");

async function createContract(data) {

  const contractId = uuidv4();

  const result = await db.query(
    `
    INSERT INTO contracts (
      contract_id,
      job_id,
      client_id,
      worker_id,
      title,
      description,
      total_amount,
      contract_text
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
    `,
    [
      contractId,
      data.job_id,
      data.client_id,
      data.worker_id,
      data.title,
      data.description,
      data.total_amount,
      data.contract_text
    ]
  );

  return result.rows[0];
}

module.exports = {
  createContract
};