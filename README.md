# ChatGPT File Assistant

A Windows-first project that makes the Codex CLI feel less daunting for non-technical users.

This repo intentionally supports **two product tracks at once**:

1. **Wrapped terminal track**
   - a friendly PowerShell / Windows Terminal launcher
   - fast to prototype
   - useful immediately
2. **Desktop app track**
   - a proper GUI that runs Codex behind the scenes
   - better for mainstream users
   - can reuse the same core logic

The aim is not to throw away the terminal work later. The terminal wrapper and the desktop app should share the same backend concepts wherever practical.

## What problem this project solves

Codex is powerful, but the default experience can feel developer-oriented.

This project explores a gentler layer on top of Codex so a user can do things like:

- organise their Pictures folder
- clean Downloads
- rename files more clearly
- sort images by year or event
- find duplicates
- ask for help with ordinary folders, not only code repos

The user should feel like they are using a helpful Windows assistant, not a developer tool.

## Product principles

- **Friendly**: plain language, calm UI, readable defaults
- **Safe**: approvals remain on by default
- **Windows-first**: optimise for ordinary Windows users and folders
- **Practical**: home folders, Pictures, Downloads, Documents
- **Transparent**: show what is happening in human language
- **Flexible**: keep room to change architecture as we learn

## Core concept

Treat Codex as the **agent engine** and this project as the **experience layer**.

Codex provides:

- planning
- tool usage
- filesystem actions
- execution

This project provides:

- a gentler UI
- friendlier activity/status text
- a safer default workflow
- launchers and wrappers
- translation of technical behavior into normal language

## Current repository structure

```text
apps/
  desktop/          Minimal desktop shell
packages/
  core/             Shared Codex runner + status mapping
scripts/
  launch-chatgpt.ps1
  install-shortcut-notes.txt
docs/
  roadmap.md
AGENTS.md
TODO.md
README.md
```

## What exists already

This starter repo already includes:

- a shared core package for Codex process handling
- an early status mapping layer
- a PowerShell launcher
- a very small Electron desktop shell
- a roadmap for the next phases

## Intended development path

### Track A: wrapped terminal

Use PowerShell / Windows Terminal to create a friendlier shell experience:

- light theme
- larger readable font
- calm startup text
- fixed or chosen safe folder
- optional desktop shortcut
- optional app-like open-and-close behavior

### Track B: desktop app

Run Codex behind the scenes and present a normal app interface:

- user chooses or starts in a folder
- user enters a task in plain language
- app launches Codex as a subprocess
- app reads structured events
- app shows friendly status text
- app presents approvals in simpler language

## Shared architecture goal

Both tracks should reuse the same core where possible.

Example shared responsibilities:

- launching Codex
- capturing stdout/stderr
- parsing structured events
- mapping raw events to small human-readable states
- exposing final response and error handling

That keeps the terminal wrapper from becoming throwaway work.

## Status model

The UI should **not** expose raw hidden reasoning.

Instead, it should show a small number of user-friendly states derived from real Codex activity, for example:

- Starting assistant
- Reading your folder
- Preparing changes
- Looking something up
- Waiting for approval
- Applying approved changes
- Finished
- Something went wrong

Keep this vocabulary small and stable.

## Current technical assumptions

These are working assumptions, not hard commitments:

- Windows is the primary target
- Codex CLI is installed and available on PATH as `codex`
- the initial backend likely uses `codex exec --json`
- approvals stay enabled by default
- no YOLO mode by default
- the app should work on ordinary folders, not just repos

If Codex integration details differ on a real machine, adapt the implementation instead of forcing the repo to match assumptions.

## Suggested near-term milestones

1. Make the PowerShell launcher feel genuinely friendly
2. Verify Codex event parsing against a real installed Codex version
3. Connect the desktop app to real Codex output
4. Add safe folder/task flows for Pictures and Downloads
5. Improve approval UX and action previews

## Running the current desktop shell

From repo root:

```bash
npm install
npm run start:desktop
```

## Early non-goals

For now, avoid overbuilding:

- no giant framework migration before the proof of concept works
- no full undo engine before basic task flow works
- no promise of perfect autonomous file management
- no removal of approval prompts as a default path

## Direction

This repo should remain easy for coding agents to work with.

It is acceptable to change the stack, folder layout, or integration approach if testing shows a better path. What should stay constant is the product intent:

**make Codex feel safer, friendlier, and more useful for ordinary Windows file tasks.**
