# Friendex

A Windows-first project that makes Codex feel less daunting and more useful for non-technical users on their own PC.

The core idea is simple: expose the power of the local Windows machine, including tasks that often feel trapped behind Command Prompt or PowerShell, without making the user deal with the terminal directly.

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
- find a file, app, or setting
- ask what a Windows setting does
- get guided through configuration changes more safely
- ask for help with ordinary PC tasks, not only code repos

File and folder work is an important early wedge, but it is not the whole product boundary.

The user should feel like they are using a helpful Windows assistant, not a developer tool.

In practice, that means Friendex is not trying to replace Codex so much as wrap it:

- remove the scary terminal barrier
- keep the power of local tools available
- decide carefully when to pass Codex through directly
- decide carefully when to translate or simplify it for safety and clarity

## Product principles

- **Friendly**: plain language, calm UI, readable defaults
- **Safe**: approvals remain on by default
- **Windows-first**: optimise for ordinary Windows users and folders
- **Practical**: files, search, settings, and ordinary local PC tasks
- **Transparent**: show what is happening in human language
- **Flexible**: keep room to change architecture as we learn

## Core concept

Treat Codex as the **agent engine** and this project as the **experience layer**.

Codex provides:

- planning
- tool usage
- local task execution
- execution

This project provides:

- a gentler UI
- friendlier activity/status text
- a safer default workflow
- launchers and wrappers
- translation of technical behavior into normal language

One of the main product decisions over time will be this boundary:

- when Friendex should pass Codex's message through mostly as-is
- when Friendex should reframe or simplify it
- when Friendex should add its own guardrails, prompts, or warnings

Where possible, Friendex should prefer lightweight prompt shaping over brittle post-processing, but only after that behavior is verified against real Codex runs.

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
- fixed or chosen safe folder when the task needs one
- optional desktop shortcut
- optional app-like open-and-close behavior

### Track B: desktop app

Run Codex behind the scenes and present a normal app interface:

- user chooses a folder when relevant or starts from a safe default
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
- Reading your files
- Searching your PC
- Checking a setting
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
- the app should work on ordinary folders and broader local PC tasks, not just repos

If Codex integration details differ on a real machine, adapt the implementation instead of forcing the repo to match assumptions.

## Suggested near-term milestones

1. Make the PowerShell launcher feel genuinely friendly
2. Verify Codex event parsing against a real installed Codex version
3. Connect the desktop app to real Codex output
4. Add safe, high-value everyday Windows flows starting with files, finding things, and settings guidance
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
- no promise of perfect autonomous PC management
- no removal of approval prompts as a default path

## Direction

This repo should remain easy for coding agents to work with.

It is acceptable to change the stack, folder layout, or integration approach if testing shows a better path. What should stay constant is the product intent:

**make Codex feel safer, friendlier, and more useful for ordinary Windows tasks on a user's PC.**
