const transitions = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['TODO', 'REVIEW'],
  REVIEW: ['IN_PROGRESS', 'DONE'],
  DONE: ['REVIEW'],
};

const canMove = (from, to) => transitions[from]?.includes(to) ?? false;

module.exports = { transitions, canMove };