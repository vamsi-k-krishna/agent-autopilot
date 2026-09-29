'use strict';

// These markers identify coding-agent surfaces before Agent Autopilot looks for approval buttons.
// Keep markers specific enough that ordinary VS Code views do not accidentally match.
const SUPPORTED_AGENTS = Object.freeze({
  antigravity: ['antigravity'],
  codex: ['openai.chatgpt', 'openai.codex', 'codex'],
  copilot: ['github.copilot', 'github.copilot-chat'],
  devin: ['cognition.devin', 'devin'],
  windsurf: ['codeium.windsurf', 'windsurf', 'codeium']
});

function findAgentForSurface(surfaceIdentity, enabledAgents = {}) {
  const identity = String(surfaceIdentity || '').toLowerCase();

  if (!identity) {
    return null;
  }

  for (const [agentName, markers] of Object.entries(SUPPORTED_AGENTS)) {
    if (enabledAgents[agentName] === false) {
      continue;
    }

    if (markers.some(marker => identity.includes(marker))) {
      return agentName;
    }
  }

  return null;
}

module.exports = { SUPPORTED_AGENTS, findAgentForSurface };
