const contractService = require("../services/contractService");
const basicTemplate = require("../templates/contracts/basicServiceTemplate");

async function createContract(req, res) {

  try {

    const {
      job_id,
      worker_id,
      title,
      description,
      total_amount,
      milestones
    } = req.body;

    const contractText = basicTemplate({
      title,
      client_name: req.user.email,
      worker_name: worker_id,
      description,
      total_amount,
      milestones
    });

    const contract = await contractService.createContract({
      job_id,
      client_id: req.user.userId,
      worker_id,
      title,
      description,
      total_amount,
      contract_text: contractText
    });

    res.status(201).json({
      success: true,
      contract
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      error: "Failed to create contract"
    });
  }
}

module.exports = {
  createContract
};