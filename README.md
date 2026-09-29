# Agent Autopilot

A lightweight, configurable VS Code extension for keeping coding agents moving through routine approval prompts while retaining explicit safety controls for terminal execution.

Agent Autopilot is intentionally small. Its job is to detect agent approval actions, apply user-defined policy, inspect terminal commands when required, and approve safe actions without repeated manual clicks.

## Goals

- Reduce repetitive `Accept`, `Allow`, `Run`, `Execute`, and similar approval clicks.
- Keep terminal execution behind a configurable safety policy.
- Make behavior transparent and highly configurable.
- Prefer event-driven work over aggressive polling.
- Keep CPU and memory usage low.
- Stay local: no telemetry, analytics, accounts, or remote service.
- Remain easy to understand, audit, modify, and contribute to.

## Design

```text
UI change
   |
   v
Detector
   |
   v
Policy ---------> ask / ignore
   |
   +---- allow -----------------> Clicker
   |
   +---- inspect -> Safety -----+-> Clicker
                         |
                         +--------> block
```

The extension uses four policy decisions:

| Policy | Behavior |
| --- | --- |
| `allow` | Automatically approve the action. |
| `inspect` | Inspect the associated operation before approval. |
| `ask` | Leave the action for the user. |
| `ignore` | Do not interact with the action. |

## Initial project structure

```text
agent-autopilot/
├── src/
│   ├── extension.js
│   ├── config.js
│   ├── detector.js
│   ├── policy.js
│   └── safety.js
├── test/
│   ├── policy.test.js
│   └── safety.test.js
├── .gitignore
├── .vscodeignore
├── CONTRIBUTING.md
├── LICENSE
├── LICENSE-APACHE
├── LICENSE-MIT
├── NOTICE
├── package.json
└── README.md
```

The first scaffold focuses on the policy and safety foundation. DOM/CDP observation and clicking will be added as small isolated modules rather than coupling browser automation to policy decisions.

## Configuration

All behavior is intended to be configurable through VS Code settings. Defaults favor automatic approval of routine actions and inspection of terminal execution.

```json
{
  "agentAutopilot.enabled": true,
  "agentAutopilot.dryRun": false,
  "agentAutopilot.actions": {
    "Accept": "allow",
    "Accept All": "allow",
    "Retry": "allow",
    "Proceed": "allow",
    "Run": "inspect",
    "Run Task": "inspect",
    "Execute": "inspect",
    "Approve": "allow",
    "Allow": "allow",
    "Allow Once": "allow",
    "Always Allow": "allow",
    "Allow in Workspace": "allow"
  },
  "agentAutopilot.terminalDefaultPolicy": "allow",
  "agentAutopilot.terminalBlacklist": [],\n  "agentAutopilot.terminalAllowKeywords": ["npm", "bun", "./gradlew"],\n  "agentAutopilot.terminalBlockKeywords": ["terraform", "kubectl"]
}
```

Settings are read when decisions are made so users can tune behavior without maintaining a fork.

## Safety model

Terminal actions configured as `inspect` are checked before approval. Built-in rules identify commands with a high potential for destructive or irreversible effects, including destructive filesystem operations, disk writes, fork bombs, broad process termination, dangerous Git operations, destructive database statements, pipe-to-shell execution, destructive Docker cleanup, and selected Windows system operations.

A matched terminal rule returns `ask`: Agent Autopilot does not click the approval button and leaves the decision to the user.

Custom terminal blacklist entries support plain substrings and `/regex/flags` syntax.\n\n### Command-start keyword rules\n\nUsers can configure command-start keywords that are automatically allowed or kept for manual approval. Keyword matching is case-insensitive and applies only at the start of each trimmed command segment.\n\nPipelines and multiline terminal text are evaluated as separate commands. For example, `npm test | grep ERROR` is evaluated as `npm test` and `grep ERROR`; `npm test
echo done` is evaluated as two commands. If any segment is blocked, matches a safety rule, or otherwise requires confirmation, Agent Autopilot does not automatically approve the overall terminal action.\n\nSafety precedence is: **built-in safety rules -> custom blacklist -> blocked keywords -> allowed keywords -> terminal default policy**. This means an allow keyword cannot override a destructive built-in safety rule.

This is a guardrail, not a sandbox. Commands can be composed in many ways, and no pattern matcher can prove that an arbitrary command is safe.

## Code philosophy

Agent Autopilot favors readable, beginner-friendly JavaScript over clever abstractions. Code should use self-explanatory names, simple control flow, Node.js and VS Code built-ins where practical, and event-driven work that keeps idle CPU and memory use low.

Contributors should avoid unnecessary dependencies and extraction. Documentation and tests are considered part of a feature. See [CONTRIBUTING.md](CONTRIBUTING.md) for the complete engineering guidelines.

## Development

Requires Node.js 20+.

```bash
npm install
npm test
```

Press `F5` from VS Code to launch an Extension Development Host once dependencies are installed.

## Scope

Agent Autopilot is deliberately not an agent framework. It does not provide model routing, dashboards, telemetry, command-history databases, automatic learning, remote control, or AI-based command classification.

The project should remain focused on one workflow:

**detect -> decide -> inspect when needed -> approve or leave for the user**

## Contributing

Contributions are welcome. Please keep changes focused, dependency-light, configurable, and easy to audit. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Agent Autopilot is dual-licensed under your choice of:

- MIT License
- Apache License 2.0

See [LICENSE](LICENSE), [LICENSE-MIT](LICENSE-MIT), and [LICENSE-APACHE](LICENSE-APACHE).

---

<sub>Inspired by [Grav](https://github.com/anlvdt/grav). Agent Autopilot is an independent project and is not affiliated with or endorsed by Grav or its maintainers.</sub>
