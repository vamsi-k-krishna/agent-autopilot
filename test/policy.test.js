'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { decideAction, resolvePolicy } = require('../src/policy');

test('unknown actions are ignored', () => {
  assert.equal(resolvePolicy(null), 'ignore');
  assert.equal(resolvePolicy({ policy: 'anything' }), 'ignore');
});

test('allow policy does not invoke terminal inspection', () => {
  const result = decideAction(
    { policy: 'allow' },
    null,
    {},
    () => { throw new Error('inspection should not run'); }
  );

  assert.deepEqual(result, { decision: 'allow', reason: 'action-policy' });
});

test('inspect without a command asks the user', () => {
  const result = decideAction({ policy: 'inspect' }, '', {}, () => null);
  assert.deepEqual(result, { decision: 'ask', reason: 'missing-command' });
});
