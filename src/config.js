'use strict';

const DEFAULT_ACTIONS = Object.freeze({
  'Accept': 'allow',
  'Accept All': 'allow',
  'Retry': 'allow',
  'Proceed': 'allow',
  'Run': 'inspect',
  'Run Task': 'inspect',
  'Execute': 'inspect',
  'Approve': 'allow',
  'Allow': 'allow',
  'Allow Once': 'allow',
  'Always Allow': 'allow',
  'Allow in Workspace': 'allow'
});

const DEFAULT_AGENTS = Object.freeze({
  antigravity: true,
  codex: true,
  copilot: true,
  devin: true,
  windsurf: true
});

function readConfig(vscode) {
  const config = vscode.workspace.getConfiguration('agentAutopilot');

  return {
    enabled: config.get('enabled', true),
    dryRun: config.get('dryRun', false),
    agents: { ...DEFAULT_AGENTS, ...config.get('agents', {}) },
    actions: { ...DEFAULT_ACTIONS, ...config.get('actions', {}) },
    terminalDefaultPolicy: config.get('terminalDefaultPolicy', 'allow'),
    terminalBlacklist: config.get('terminalBlacklist', []),
    terminalAllowKeywords: config.get('terminalAllowKeywords', []),
    terminalBlockKeywords: config.get('terminalBlockKeywords', [])
  };
}

module.exports = { DEFAULT_ACTIONS, DEFAULT_AGENTS, readConfig };
