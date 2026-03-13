import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { mapCodexEventToStatus } from './status.js';

export class CodexRunner extends EventEmitter {
  constructor(options = {}) {
    super();
    this.codexCommand = options.codexCommand || 'codex';
    this.cwd = options.cwd || process.cwd();
    this.child = null;
  }

  startRun(prompt, options = {}) {
    const args = ['exec', '--json'];

    if (options.skipGitRepoCheck) {
      args.push('--skip-git-repo-check');
    }

    args.push(prompt);

    this.child = spawn(this.codexCommand, args, {
      cwd: options.cwd || this.cwd,
      shell: true,
      env: process.env
    });

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

      if (event.type === 'turn.completed' && event.output_text) {
        this.emit('final', event.output_text);
      }

      if (event.type === 'message' && event.role === 'assistant' && event.content) {
        this.emit('final', event.content);
      }
    } catch {
      this.emit('raw', line);
      this.emit('status', 'Working…');
    }
  }
}
