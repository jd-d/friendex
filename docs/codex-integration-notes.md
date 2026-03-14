# Codex CLI Integration Notes

Verified against Codex CLI on Windows (MSYS/bash), 2026-03-13.

## How to invoke

```sh
codex exec --json --skip-git-repo-check "your prompt here"
```

```sh
printf '%s' "your prompt here" | codex exec --json --skip-git-repo-check -
```

- `--json` streams JSONL events to stdout (one JSON object per line).
- `--skip-git-repo-check` allows running outside a git repo.
- `--full-auto` skips approval prompts (uses `workspace-write` sandbox).
- `--sandbox read-only|workspace-write|danger-full-access` controls sandboxing.
- `-C` / `--cd` sets working directory but **did not work** in MSYS bash
  (argument parsing issue). Use `cwd` in `child_process.spawn` instead.
- `PROMPT` can be `-` to read from stdin. For Windows app integrations,
  prefer stdin over a quoted CLI prompt to avoid shell argument splitting.

## Approval behavior in `codex exec`

Verified again on Windows, 2026-03-14, with real local probes.

- `codex exec` is non-interactive by design. Official docs describe it as the
  CLI path for scripted or CI-style runs that should finish without human
  interaction.
- In the current `exec --json` path, approval-needed actions do **not** surface
  as a machine-readable "pause for approval" event.
- When a task would require extra permission, Codex currently tends to finish
  the run with explanatory `agent_message` text instead, for example:
  - the workspace is read-only
  - the target path is outside the writable root
  - the session cannot request approval escalation
- In local probes, these blocked runs still ended with `turn.completed`, so the
  desktop app must not assume exit code `0` means the requested action was
  actually allowed.
- Practical product consequence for Friendex:
  - the current desktop integration should explain that the task was blocked by
    permissions
  - it should **not** promise a live approval dialog in the current `exec`
    integration unless a future architecture change proves that path exists

## JSONL event format

Every line of stdout is a self-contained JSON object with a `type` field.

### Top-level event types

| type | payload | meaning |
|------|---------|---------|
| `thread.started` | `thread_id` | session created |
| `turn.started` | (none) | agent begins a turn |
| `item.started` | `item: {id, type, ...}` | an item begins |
| `item.completed` | `item: {id, type, ...}` | an item finishes |
| `turn.completed` | `usage: {input_tokens, cached_input_tokens, output_tokens}` | turn done |
| `turn.failed` | (assumed, not yet observed) | turn errored |
| `error` | (varies) | fatal error |

### Item types (nested in `item.type`)

| item.type | fields | notes |
|-----------|--------|-------|
| `agent_message` | `text` | agent explanation / thinking |
| `command_execution` | `command`, `aggregated_output`, `exit_code`, `status` | shell command |
| `apply_patch` | (not yet observed) | file edits |
| `web_search` | (not yet observed) | web lookups |

### Item status values

- `in_progress` (on `item.started`)
- `completed` (on `item.completed`, success)
- `failed` (on `item.completed`, failure — `exit_code` is `-1`)

## Key gotchas

1. `turn.completed` does **not** have `output_text`. The final answer is the
   last `agent_message` before the turn ends.
2. Stderr contains MCP server noise (auth errors, timeouts) that is unrelated
   to the task. Filter or ignore it in the UI.
3. On Windows, Codex wraps commands in PowerShell. The `aggregated_output`
   may contain PowerShell profile loading errors — this is normal.
4. Commands may be `rejected: blocked by policy` when sandbox policy prevents
   execution. These show `exit_code: -1` and `status: "failed"`.
5. Some permission-blocked runs may not emit `command_execution` at all; they
   can finish as explanatory `agent_message` items plus `turn.completed`.

## Known stderr noise to filter from the desktop UI

These lines are useful for deep local debugging but are confusing in the normal
desktop experience because they do not describe the user task itself:

- stale feature-flag warnings such as
  `unknown feature key in config: rmcp_client`
- PowerShell shell-snapshot warnings such as
  `Failed to create shell snapshot for powershell`
- MCP OAuth refresh failures from unrelated configured connectors, for example
  `TokenRefreshFailed(... invalid_grant ...)`

Friendex should treat those as debug noise unless a future task explicitly
depends on those connectors.

## Friendex runtime overrides

For the initial Friendex product, local file tasks do not need MCP servers or
app connectors to be enabled on each run.

Friendex therefore applies per-run Codex overrides:

- `-c mcp_servers={}`
- `-c features.apps=false`

This keeps Friendex from intentionally loading the user's configured MCP/app
surface for ordinary file-task runs.

Important caveat from local probes:

- these overrides reduce Friendex's intended capability surface
- however, they did **not** fully eliminate one remaining local `rmcp`
  transport auth warning on this machine
- so Friendex still filters known `rmcp`/connector noise in the desktop UI
  rather than assuming config overrides alone will silence every line

## Test fixture

A sanitized real session is saved at
`packages/core/test/fixtures/real-session.jsonl`.
