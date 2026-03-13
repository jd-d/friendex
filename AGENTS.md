# AGENTS.md

This file guides coding agents working on this repository.

## 1. What this project is

This project is exploring a friendlier Windows-first experience on top of Codex.

The product goal is to help non-technical or less confident users use Codex for ordinary file and folder tasks, especially in places like:

- home folder
- Pictures
- Downloads
- Documents

This is **not** primarily a coding-project shell, even though Codex comes from a developer-oriented context.

## 2. Product intent

When making decisions, optimise for this outcome:

**Make Codex feel safer, calmer, and more understandable for ordinary Windows users.**

Good examples of target tasks:

- organise photos by year
- clean up Downloads
- rename files clearly
- summarise what is in a folder
- find duplicates

## 3. Current strategic approach

We are deliberately pursuing **two tracks in one repo**:

1. **wrapped terminal**
2. **desktop app**

These should share backend logic wherever practical.

Do not treat the terminal path as throwaway unless there is a strong reason.

## 4. Current technical assumptions

These are assumptions, not unchangeable truths:

- Windows is the primary target
- Codex CLI is installed and callable as `codex`
- initial integration likely uses `codex exec --json`
- approvals should remain enabled by default
- ordinary folders are valid workspaces
- the current desktop starter uses Electron because it is easy to evolve quickly

If reality on the target machine differs from these assumptions, adapt the implementation.

## 5. Architecture guidance

Prefer a shared core for:

- launching Codex
- setting working directory
- reading stdout/stderr
- parsing machine-readable events
- mapping raw events to friendly statuses
- cancellation
- error handling

The core should be reusable by:

- PowerShell / terminal launcher
- desktop app
- future alternative frontends

Avoid coupling core logic directly to Electron.

## 6. UX guidance

The user-facing experience should feel:

- friendly
- plain-English
- calm
- not overly technical
- explicit about safety

Prefer:

- short labels
- simple status text
- readable defaults
- minimal jargon

Avoid:

- exposing raw internal event names directly to users
- exposing hidden reasoning as if it were status
- overwhelming the user with verbose logs by default

## 7. Status philosophy

Status should be grounded in real Codex activity, but translated into normal language.

Examples of acceptable user-facing statuses:

- Starting assistant
- Reading your folder
- Preparing changes
- Waiting for approval
- Applying approved changes
- Finished
- Something went wrong

Keep the vocabulary small unless testing shows users need more granularity.

## 8. Safety stance

Safety is central to the product.

Default expectations:

- approvals remain on
- no YOLO-style default
- bulk edits should be treated carefully
- risky actions should be explained simply
- the user should understand what is about to happen before changes are made when feasible

Do not optimise for maximum autonomy at the expense of clarity or safety.

## 9. Folder/task assumptions

Optimise first for real household and ordinary-computer workflows, not developer workflows.

Prioritise support for:

- Pictures
- Downloads
- Documents
- user home directory

Do not assume the selected folder is a git repo.

## 10. Flexibility allowed

You may change:

- stack
- framework
- file layout
- runner implementation details
- event mapping approach
- desktop technology choice

You should preserve:

- the product intent
- the shared-core philosophy where practical
- the friendly/safe-by-default direction
- the focus on non-technical Windows users

## 11. What to verify instead of assuming

Before building deeply around an integration detail, verify:

- actual Codex CLI flags and behavior
- actual JSON output format
- how approvals surface in real runs
- behavior in a normal non-git folder
- process lifecycle and cancellation behavior on Windows

If you learn something that differs from repo assumptions, update docs.

## 12. Development style

Prefer:

- incremental changes
- small clear commits
- comments only where useful
- code that is easy for other agents to reshape
- low-friction setup

Avoid:

- premature abstraction
- overengineering before the proof of concept works
- silently baking fragile assumptions into many layers

## 13. Documentation obligations

If you materially change architecture or direction, update at least the relevant parts of:

- `README.md`
- `TODO.md`
- `AGENTS.md`

If you discover important integration facts, add or update docs under `docs/`.

## 14. Early priorities for agents

In roughly this order:

1. verify Codex integration on a real machine
2. solidify shared core runner/parser
3. improve terminal launcher UX
4. connect desktop app to real Codex output
5. improve approvals and safety UX
6. add a few strong task-focused flows

## 15. Definition of a good change

A good contribution makes the product more:

- understandable
- safe
- genuinely usable on Windows
- reusable across terminal and desktop paths
- grounded in real Codex behavior rather than guesswork

## 16. Current ambiguity

Some decisions are intentionally still open.

Examples:

- final product name
- Electron vs Tauri vs another shell
- exact desktop approval UX
- how much status detail is ideal
- whether a future long-running backend replaces one-off subprocess runs

Agents should not treat these as settled unless the repo later makes them explicit.

## 17. Bias for action

When in doubt, prefer the smallest useful step that:

- increases realism
- improves shared-core reuse
- reduces guesswork
- makes the project more testable on a real Windows machine
