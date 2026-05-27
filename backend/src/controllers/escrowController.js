/* =========================================================
   ESCROW CONTROLLER (SAFE MOCK)
========================================================= */

exports.createEscrow = async (req, res) => {
  return res.json({
    success: true,
    escrow: {
      id: "escrow_001",
      status: "created",
    },
  });
};

exports.getEscrow = async (req, res) => {
  return res.json({
    success: true,
    escrowId: req.params.escrowId,
  });
};

exports.releaseEscrow = async (req, res) => {
  return res.json({
    success: true,
    message: "Escrow released",
  });
};

exports.disputeEscrow = async (req, res) => {
  return res.json({
    success: true,
    message: "Dispute created",
  });
};

exports.getUserEscrows = async (req, res) => {
  return res.json({
    success: true,
    escrows: [],
  });
};
