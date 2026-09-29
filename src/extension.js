'use strict';

const vscode = require('vscode');
const { readConfig } = require('./config');

let lastDecision = null;

function activate(context) {
  const output = vscode.window.createOutputChannel('Agent Autopilot');

  context.subscriptions.push(
    output,
    vscode.commands.registerCommand('agentAutopilot.toggle', async () => {
      const config = vscode.workspace.getConfiguration('agentAutopilot');
      const enabled = config.get('enabled', true);
      await config.update('enabled', !enabled, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Agent Autopilot: ${enabled ? 'disabled' : 'enabled'}.`);
    }),
    vscode.commands.registerCommand('agentAutopilot.explainLastDecision', () => {
      if (!lastDecision) {
        vscode.window.showInformationMessage('Agent Autopilot has not made a decision yet.');
        return;
      }

      output.appendLine(JSON.stringify(lastDecision, null, 2));
      output.show(true);
    })
  );

  if (readConfig(vscode).enabled) {
    output.appendLine('Agent Autopilot activated.');
  }
}

function recordDecision(decision) {
  lastDecision = {
    ...decision,
    timestamp: new Date().toISOString()
  };
}

function deactivate() {}

module.exports = { activate, deactivate, recordDecision };
