# Contributing

Thanks for contributing to Agent Autopilot.

The project has a deliberately small goal: remove routine coding-agent approval clicks while keeping user-defined safety boundaries understandable and configurable.

## Engineering philosophy

Code in this repository should be easy to read before it is clever.

A beginner who knows basic JavaScript should be able to follow the normal execution path without learning a framework, tracing unnecessary abstractions, or jumping through many files.

When two implementations solve the same problem, prefer the one that is:

1. easier to understand;
2. smaller;
3. faster on the normal path;
4. lower in memory and CPU usage;
5. easier to configure and test.

Optimization should make the code simpler or measurably cheaper. Do not trade readability for theoretical micro-optimizations.

## Naming

Names should explain their purpose without requiring a comment.

Prefer:

```js
splitCommands(commandText)
startsWithKeyword(command, keyword)
inspectCommand(commandText, config)
blockedKeyword
allowedKeyword
```

Avoid vague names such as:

```js
process()
handle()
doCheck()
data
item
x
```

Short names are fine for familiar local concepts, but important functions, configuration values, and state should be self-explanatory.

## Keep the code straightforward

Do not extract code merely to make functions shorter.

Create a function or module when it gives a real concept a clear name, removes meaningful duplication, makes testing easier, or separates a genuinely different responsibility.

Prefer simple control flow:

```js
for (const rule of rules) {
  if (rule.matches(command)) {
    return decision;
  }
}
```

over layers of factories, classes, callbacks, wrappers, or generic helpers that make the same behavior harder to follow.

Use early returns when they make decisions obvious.

## Dependencies

Use JavaScript, Node.js, and VS Code APIs first.

An external dependency should be added only when it solves a substantial problem better than a small, maintainable local implementation. Every new runtime dependency increases install size, startup work, security surface, and maintenance cost.

A pull request adding a dependency should explain why the built-in APIs are insufficient.

## Performance

Agent Autopilot may run for the entire editor session, so idle cost matters.

Prefer:

- event-driven observation over frequent polling;
- inspecting changed elements instead of rescanning an entire document;
- one pass over a command when practical;
- bounded temporary state;
- lazy work only when an approval candidate appears;
- one shared connection instead of repeated connections.

Avoid:

- tight timers;
- repeated full-DOM scans;
- parsing the same command several times;
- unbounded caches or history;
- background work when nothing has changed.

Do not add complexity for performance without evidence that the simpler implementation is insufficient.

## Safety code

Safety behavior must be predictable and documented.

The current terminal decision order is:

1. built-in safety rules;
2. user custom blacklist;
3. blocked command-start keywords;
4. allowed command-start keywords;
5. terminal default policy.

A more permissive rule must not silently bypass an earlier safety rule.

Pipeline-delimited and multiline terminal input is treated as separate commands. If any command needs confirmation, the complete terminal action must remain with the user.

Changes to safety precedence or command splitting require tests and README updates in the same pull request.

## Configuration

Prefer configuration over hard-coded personal preferences, but do not create a configuration framework for its own sake.

New settings should have:

- a useful default;
- a clear name;
- a short VS Code setting description;
- a README example when the behavior is not obvious;
- tests when they affect decisions or safety.

## Comments and documentation

Comments should explain **why**, not translate JavaScript into English.

Good:

```js
// A single unsafe pipeline command makes the whole terminal action unsafe to auto-approve.
```

Unhelpful:

```js
// Loop through the commands.
for (const command of commands) {
```

Public configuration and important behavior belong in the README. Complicated compatibility behavior should be documented close to the code as well.

Tests are also documentation. Test names should describe behavior, for example:

```text
blocked keyword in one pipeline command prevents automatic approval
```

## Scope

Keep changes focused on reducing routine coding-agent approval friction.

Do not add dashboards, telemetry, remote services, automatic learning, model routing, command-history databases, AI command classification, or unrelated agent features unless the project intentionally changes scope first.

## Development

1. Fork or clone the repository.
2. Create a focused branch.
3. Run `npm install`.
4. Make the smallest clear change that solves the problem.
5. Add or update tests.
6. Run `npm test`.
7. Update documentation when behavior or configuration changes.
8. Open a pull request explaining the behavior change, configuration impact, and any performance tradeoffs.

## Pull request checklist

Before opening a pull request, verify:

- the code is understandable without unnecessary indirection;
- names explain their purpose;
- no dependency was added unnecessarily;
- idle CPU or memory work was not increased without reason;
- safety changes have tests;
- user-facing behavior is documented;
- `npm test` passes.

## Licensing

By contributing, you agree that your contributions may be distributed under the project's dual MIT OR Apache-2.0 license.
