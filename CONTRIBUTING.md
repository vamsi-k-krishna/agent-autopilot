# Contributing

Thanks for contributing to Agent Autopilot.

## Principles

Changes should keep the project:

- focused on reducing routine coding-agent approval friction;
- configurable instead of hard-coded where practical;
- event-driven and lightweight;
- dependency-light;
- local and privacy-preserving;
- easy to audit and test.

Avoid adding dashboards, telemetry, remote services, automatic learning, model routing, or unrelated agent features unless the project's scope is intentionally changed through discussion first.

## Development

1. Fork or clone the repository.
2. Create a focused branch.
3. Run `npm install`.
4. Make the smallest clear change that solves the problem.
5. Add or update tests.
6. Run `npm test`.
7. Open a pull request explaining the behavior change and any configuration impact.

## Code style

Use straightforward JavaScript and Node.js built-ins where possible. Prefer small modules with explicit responsibilities over framework-heavy abstractions.

## Licensing

By contributing, you agree that your contributions may be distributed under the project's dual MIT OR Apache-2.0 license.
