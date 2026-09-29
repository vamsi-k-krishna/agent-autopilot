'use strict';

function normalizeLabel(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function detectAction(label, actions) {
  const normalized = normalizeLabel(label);
  return Object.prototype.hasOwnProperty.call(actions, normalized)
    ? { label: normalized, policy: actions[normalized] }
    : null;
}

module.exports = { detectAction, normalizeLabel };
