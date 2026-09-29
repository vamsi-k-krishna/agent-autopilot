'use strict';

const VALID_POLICIES = new Set(['allow', 'inspect', 'ask', 'ignore']);

function resolvePolicy(action) {
  if (!action || !VALID_POLICIES.has(action.policy)) {
    return 'ignore';
  }

  return action.policy;
}

function decideAction(action, command, config, inspectCommand) {
  const policy = resolvePolicy(action);

  if (policy !== 'inspect') {
    return { decision: policy, reason: 'action-policy' };
  }

  if (!command) {
    return { decision: 'ask', reason: 'missing-command' };
  }

  return inspectCommand(command, config);
}

module.exports = { VALID_POLICIES, decideAction, resolvePolicy };
