const workflow = require("../config/jobWorkflow");

function canTransition(current, next) {
  return workflow[current]?.includes(next);
}

module.exports = {
  canTransition
};
