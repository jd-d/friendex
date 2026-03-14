import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { mapCodexEventToStatus } from './status.js';

export class CodexRunner extends EventEmitter {
  constructor(options = {}) {
    super();
    this.codexCommand = options.codexCommand || 'codex';
    this.cwd = options.cwd || process.cwd();
    this.spawn = options.spawn || spawn;
    this.child = null;
    this.lastAgentMessage = null;
  }

  startRun(prompt, options = {}) {
    const args = ['exec', '--json'];
    const promptText = typeof prompt === 'string' ? prompt : String(prompt ?? '');

    if (options.skipGitRepoCheck) {
      args.push('--skip-git-repo-check');
    }

    if (options.sandbox) {
      args.push('--sandbox', options.sandbox);
    }

    if (options.fullAuto) {
      args.push('--full-auto');
    }

    for (const override of options.configOverrides || []) {
      if (override) {
        args.push('-c', override);
      }
    }

    args.push('-');

    this.lastAgentMessage = null;

    this.child = this.spawn(this.codexCommand, args, {
      cwd: options.cwd || this.cwd,
      shell: true,
      env: process.env
    });

    if (this.child.stdin) {
      this.child.stdin.on('error', (error) => {
        if (error.code !== 'EPIPE' && error.code !== 'ERR_STREAM_DESTROYED') {
          this.emit('error', error);
        }
      });
      this.child.stdin.end(promptText);
    }

    let stdoutBuffer = '';
    let stderrBuffer = '';

    this.child.stdout.on('data', (chunk) => {
      stdoutBuffer += chunk.toString();
      const lines = stdoutBuffer.split(/\r?\n/);
      stdoutBuffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        this.#handleJsonLine(line);
      }
    });

    this.child.stderr.on('data', (chunk) => {
      stderrBuffer += chunk.toString();
      this.emit('stderr', chunk.toString());
    });

    this.child.on('close', (code) => {
      this.emit('close', { code, stderr: stderrBuffer });
    });

    this.child.on('error', (error) => {
      this.emit('error', error);
    });
  }

  cancel() {
    if (this.child) {
      this.child.kill();
    }
  }

  #handleJsonLine(line) {
    try {
      const event = JSON.parse(line);
      this.emit('event', event);
      this.emit('status', mapCodexEventToStatus(event));

      // Agent messages: emit as they arrive
      if (event.type === 'item.completed' && event.item?.type === 'agent_message' && event.item.text) {
        this.lastAgentMessage = event.item.text;
        this.emit('message', event.item.text);
      }

      // Command execution events
      if (event.item?.type === 'command_execution') {
        this.emit('command', {
          id: event.item.id,
          command: event.item.command,
          phase: event.type === 'item.started' ? 'started' : 'completed',
          exitCode: event.item.exit_code,
          output: event.item.aggregated_output,
          status: event.item.status
        });
      }

      // Turn completed: emit the last agent message as final output
      if (event.type === 'turn.completed') {
        this.emit('final', this.lastAgentMessage || '');
        if (event.usage) {
          this.emit('usage', event.usage);
        }
      }
    } catch {
      this.emit('raw', line);
      this.emit('status', 'Working...');
    }
  }
}
