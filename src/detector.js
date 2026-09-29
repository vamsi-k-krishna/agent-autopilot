'use strict';

const { findAgentForSurface } = require('./agents');

function normalizeLabel(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function detectAgentAction(surfaceIdentity, buttonLabel, config) {
  const agent = findAgentForSurface(surfaceIdentity, config.agents);

  // Unknown surfaces never enter approval policy. This prevents unrelated VS Code
  // buttons with labels such as "Accept" or "Run" from being auto-clicked.
  if (!agent) {
    return null;
  }

  const label = normalizeLabel(buttonLabel);
  if (!Object.prototype.hasOwnProperty.call(config.actions, label)) {
    return null;
  }

  return {
    agent,
    label,
    policy: config.actions[label]
  };
}

module.exports = { detectAgentAction, normalizeLabel };
