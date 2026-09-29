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

function parseCustomPattern(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  if (text.startsWith('/') && text.lastIndexOf('/') > 0) {
    const end = text.lastIndexOf('/');
    try {
      return new RegExp(text.slice(1, end), text.slice(end + 1));
    } catch {
      return null;
    }
  }

  return text.toLowerCase();
}

function splitCommands(value) {
  return String(value || '')
    .split(/\r?\n|\|+/)
    .map(command => command.trim())
    .filter(Boolean);
}

function startsWithKeyword(command, keyword) {
  const text = String(command || '').trim().toLowerCase();
  const prefix = String(keyword || '').trim().toLowerCase();
  if (!prefix) return false;

  return text === prefix || text.startsWith(prefix + ' ');
}

function findKeyword(command, keywords) {
  return (keywords || []).find(keyword => startsWithKeyword(command, keyword)) || null;
}

function inspectSegment(command, config) {
  for (const rule of BUILTIN_RULES) {
    if (rule.pattern.test(command)) {
      return { decision: 'ask', reason: 'builtin-safety-rule', rule: rule.id, command };
    }
  }

  for (const raw of config.terminalBlacklist || []) {
    const pattern = parseCustomPattern(raw);
    const matched = pattern instanceof RegExp
      ? pattern.test(command)
      : pattern && command.toLowerCase().includes(pattern);

    if (matched) {
      return { decision: 'ask', reason: 'custom-safety-rule', rule: raw, command };
    }
  }

  const blockedKeyword = findKeyword(command, config.terminalBlockKeywords);
  if (blockedKeyword) {
    return { decision: 'ask', reason: 'blocked-keyword', rule: blockedKeyword, command };
  }

  const allowedKeyword = findKeyword(command, config.terminalAllowKeywords);
  if (allowedKeyword) {
    return { decision: 'allow', reason: 'allowed-keyword', rule: allowedKeyword, command };
  }

  return {
    decision: config.terminalDefaultPolicy === 'ask' ? 'ask' : 'allow',
    reason: 'terminal-default-policy',
    command
  };
}

function inspectCommand(command, config = {}) {
  const commands = splitCommands(command);
  if (!commands.length) {
    return { decision: 'ask', reason: 'missing-command' };
  }

  const results = commands.map(segment => inspectSegment(segment, config));
  const blocked = results.find(result => result.decision !== 'allow');

  return blocked
    ? { ...blocked, commands, results }
    : { decision: 'allow', reason: results.some(r => r.reason === 'allowed-keyword') ? 'allowed-keyword' : 'terminal-default-policy', commands, results };
}

module.exports = {
  BUILTIN_RULES,
  findKeyword,
  inspectCommand,
  parseCustomPattern,
  splitCommands,
  startsWithKeyword
};
