module.exports = {
  draft: ["pending_review"],
  pending_review: ["open", "cancelled"],
  open: ["workers_selected", "cancelled"],
  workers_selected: ["interviewing"],
  interviewing: ["worker_chosen"],
  worker_chosen: ["contract_pending"],
  contract_pending: ["contract_signed"],
  contract_signed: ["escrow_pending"],
  escrow_pending: ["active"],
  active: ["milestone_1", "disputed"],
  milestone_1: ["milestone_2", "revision_requested", "disputed"],
  milestone_2: ["submitted", "disputed"],
  submitted: ["completed", "revision_requested", "disputed"],
  revision_requested: ["submitted"],
  disputed: ["completed", "cancelled"],
  completed: [],
  cancelled: []
};
