import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import test from 'node:test';
import { CodexRunner } from '../src/codexRunner.js';

class FakeStdin extends EventEmitter {
  constructor() {
    super();
    this.value = '';
  }

  end(chunk = '') {
    this.value += chunk;
  }
}

class FakeChildProcess extends EventEmitter {
  constructor() {
    super();
    this.stdin = new FakeStdin();
    this.stdout = new EventEmitter();
    this.stderr = new EventEmitter();
  }
}

test('CodexRunner sends prompts through stdin instead of CLI arguments', () => {
  const child = new FakeChildProcess();
  const calls = [];
  const runner = new CodexRunner({
    cwd: 'C:\\workspace',
    spawn(command, args, options) {
      calls.push({ command, args, options });
      return child;
    }
  });

  runner.startRun('you should not be split by spaces', {
    skipGitRepoCheck: true,
    sandbox: 'read-only',
    fullAuto: true
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, 'codex');
  assert.deepEqual(calls[0].args, [
    'exec',
    '--json',
    '--skip-git-repo-check',
    '--sandbox',
    'read-only',
    '--full-auto',
    '-'
  ]);
  assert.equal(calls[0].options.cwd, 'C:\\workspace');
  assert.equal(calls[0].options.shell, true);
  assert.equal(child.stdin.value, 'you should not be split by spaces');
});
