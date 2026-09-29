'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { findAgentForSurface } = require('../src/agents');
const { detectAgentAction } = require('../src/detector');

const config = {
  agents: {
    antigravity: true,
    codex: true,
    copilot: true,
    devin: true,
    windsurf: true
  },
  actions: {
    Accept: 'allow',
    Run: 'inspect'
  }
};

test('recognizes supported coding-agent surfaces', () => {
  assert.equal(findAgentForSurface('extension://github.copilot-chat/panel', config.agents), 'copilot');
  assert.equal(findAgentForSurface('webview://windsurf/agent', config.agents), 'windsurf');
  assert.equal(findAgentForSurface('extension://openai.codex/chat', config.agents), 'codex');
});

test('ignores ordinary VS Code surfaces even when button text matches', () => {
  assert.equal(
    detectAgentAction('vscode://source-control/merge-editor', 'Accept', config),
    null
  );
  assert.equal(
    detectAgentAction('vscode://tasks', 'Run', config),
    null
  );
});

test('ignores unknown extension webviews', () => {
  assert.equal(
    detectAgentAction('extension://some.other-extension/panel', 'Accept', config),
    null
  );
});

test('ignores a supported agent when the user disables it', () => {
  const disabledCopilot = {
    ...config,
    agents: { ...config.agents, copilot: false }
  };

  assert.equal(
    detectAgentAction('extension://github.copilot-chat/panel', 'Accept', disabledCopilot),
    null
  );
});

test('returns agent identity only after surface and action both match', () => {
  assert.deepEqual(
    detectAgentAction('extension://github.copilot-chat/panel', '  Accept  ', config),
    { agent: 'copilot', label: 'Accept', policy: 'allow' }
  );
});
