'use strict';

const BUILTIN_RULES = Object.freeze([
  { id: 'filesystem-root-delete', pattern: /\brm\s+-[^\n]*r[^\n]*f[^\n]*\s+(?:\/|~|\*)\b/i },
  { id: 'disk-overwrite', pattern: /\bdd\b[^\n]*\bif=\/dev\/(?:zero|random|urandom)\b/i },
  { id: 'fork-bomb', pattern: /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/ },
  { id: 'kill-all', pattern: /\bkill\s+-9\s+-1\b/i },
  { id: 'git-force-push', pattern: /\bgit\s+push\b[^\n]*(?:--force(?!-with-lease)|(?:^|\s)-f(?:\s|$))/i },
  { id: 'git-hard-reset', pattern: /\bgit\s+reset\s+--hard\b/i },
  { id: 'git-destructive-clean', pattern: /\bgit\s+clean\b[^\n]*-[a-z]*f[a-z]*d[a-z]*x/i },
  { id: 'database-drop', pattern: /\bdrop\s+database\b/i },
  { id: 'database-truncate', pattern: /\btruncate\s+table\b/i },
  { id: 'pipe-to-shell', pattern: /\b(?:curl|wget)\b[^\n|]*\|\s*(?:sudo\s+)?(?:bash|sh|zsh)\b/i },
  { id: 'docker-system-prune', pattern: /\bdocker\s+system\s+prune\b[^\n]*(?:-a|--all)[^\n]*--volumes\b/i },
  { id: 'windows-registry-delete', pattern: /\breg\s+delete\s+hk(?:lm|cu|cr|u|cc)\\/i },
  { id: 'windows-shadow-delete', pattern: /\bvssadmin\s+delete\s+shadows\b/i },
  { id: 'powershell-execution-bypass', pattern: /\bpowershell(?:\.exe)?\b[^\n]*(?:-executionpolicy|-ep)\s+bypass\b/i },
  { id: 'root-shell', pattern: /(?:^|[;&|]\s*)su\s+(?:-|root)(?:\s|$)/i }
]);

function splitCommands(commandText) {
  return String(commandText || '')
    .split(/\r?\n|\|+/)
    .map(command => command.trim())
    .filter(Boolean);
}

function startsWithKeyword(command, keyword) {
  const normalizedCommand = String(command || '').trim().toLowerCase();
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();

  if (!normalizedKeyword) {
    return false;
  }

  return normalizedCommand === normalizedKeyword
    || normalizedCommand.startsWith(normalizedKeyword + ' ');
}

function findMatchingKeyword(command, keywords = []) {
  return keywords.find(keyword => startsWithKeyword(command, keyword)) || null;
}

function matchesCustomBlacklist(command, blacklist = []) {
  const lowerCaseCommand = command.toLowerCase();

  for (const blacklistEntry of blacklist) {
    const entry = String(blacklistEntry || '').trim();
    if (!entry) {
      continue;
    }

    // Text wrapped in /.../flags is treated as a regular expression.
    if (entry.startsWith('/') && entry.lastIndexOf('/') > 0) {
      const lastSlash = entry.lastIndexOf('/');

      try {
        const pattern = new RegExp(entry.slice(1, lastSlash), entry.slice(lastSlash + 1));
        if (pattern.test(command)) {
          return blacklistEntry;
        }
      } catch {
        // Invalid user regex should not crash or disable the extension.
      }

      continue;
    }

    if (lowerCaseCommand.includes(entry.toLowerCase())) {
      return blacklistEntry;
    }
  }

  return null;
}

function inspectSingleCommand(command, config) {
  for (const rule of BUILTIN_RULES) {
    if (rule.pattern.test(command)) {
      return { decision: 'ask', reason: 'builtin-safety-rule', rule: rule.id, command };
    }
  }

  const blacklistMatch = matchesCustomBlacklist(command, config.terminalBlacklist);
  if (blacklistMatch) {
    return { decision: 'ask', reason: 'custom-safety-rule', rule: blacklistMatch, command };
  }

  const blockedKeyword = findMatchingKeyword(command, config.terminalBlockKeywords);
  if (blockedKeyword) {
    return { decision: 'ask', reason: 'blocked-keyword', rule: blockedKeyword, command };
  }

  const allowedKeyword = findMatchingKeyword(command, config.terminalAllowKeywords);
  if (allowedKeyword) {
    return { decision: 'allow', reason: 'allowed-keyword', rule: allowedKeyword, command };
  }

  return {
    decision: config.terminalDefaultPolicy === 'ask' ? 'ask' : 'allow',
    reason: 'terminal-default-policy',
    command
  };
}

function inspectCommand(commandText, config = {}) {
  const commands = splitCommands(commandText);

  if (commands.length === 0) {
    return { decision: 'ask', reason: 'missing-command' };
  }

  const results = [];

  for (const command of commands) {
    const result = inspectSingleCommand(command, config);
    results.push(result);

    // One unsafe command makes the complete pipeline or multiline action unsafe to auto-approve.
    if (result.decision !== 'allow') {
      return { ...result, commands, results };
    }
  }

  const usedAllowedKeyword = results.some(result => result.reason === 'allowed-keyword');

  return {
    decision: 'allow',
    reason: usedAllowedKeyword ? 'allowed-keyword' : 'terminal-default-policy',
    commands,
    results
  };
}

module.exports = {
  BUILTIN_RULES,
  findMatchingKeyword,
  inspectCommand,
  matchesCustomBlacklist,
  splitCommands,
  startsWithKeyword
};
