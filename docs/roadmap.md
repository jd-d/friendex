# Roadmap

## Phase 1

Goal: friendly terminal wrapper.

- Improve PowerShell styling
- Add desktop shortcut installer
- Add working-directory chooser
- Add fixed safe startup folders
- Add plain-English helper text

## Phase 2

Goal: real desktop shell over Codex.

- Stream `codex exec --json`
- Parse status events
- Display friendly progress
- Show final answer cleanly
- Preserve approvals

## Phase 3

Goal: task-focused UX.

- Templates for common household file tasks
- Preview of planned actions
- Dry-run mode for risky tasks
- Better error language
- Activity log export

## Core design idea

The shared core should treat Codex as a backend process and expose:

- `startRun()`
- `onEvent()`
- `onStatus()`
- `onFinalMessage()`
- `cancel()`

That lets terminal and desktop UIs sit on top of the same engine.
