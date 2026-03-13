# TODO

This file is the working execution list for the project.

The repo is intentionally pursuing **two tracks in parallel**:

- wrapped terminal
- desktop app

Both should build on a shared core whenever sensible.

---

## 0. Project framing

- [ ] Finalise project name for repo, app window, and shortcut labels
- [ ] Decide whether "ChatGPT" remains internal shorthand, external label, or is replaced with a more neutral product name
- [ ] Add a short product statement that fits GitHub, issues, and future landing pages
- [ ] Write down the main user persona(s)
- [ ] Define the first 3 to 5 user tasks we are explicitly optimising for

Suggested first task set:
- organise Pictures
- clean Downloads
- rename files clearly
- find duplicates
- help me understand what is in this folder

---

## 1. Reality-check Codex integration

- [ ] Verify installed Codex CLI commands and flags on a real Windows machine
- [ ] Confirm whether `codex exec --json` works exactly as assumed
- [ ] Capture real sample output from Codex runs
- [ ] Save sample JSONL events for testing/parsing fixtures
- [ ] Check how approvals are surfaced in CLI mode
- [ ] Confirm behavior when starting in a normal non-git folder
- [ ] Confirm best way to set working directory for subprocess runs
- [ ] Decide whether near-term integration stays on `codex exec` or moves toward a longer-running approach later

Deliverable:
- a short `docs/codex-integration-notes.md`

---

## 2. Shared core package

Goal: one reusable backend layer for both terminal and desktop surfaces.

- [ ] Clean up `packages/core` API surface
- [ ] Define a stable runner contract
- [ ] Separate raw event parsing from friendly status mapping
- [ ] Add support for stdout, stderr, exit codes, cancellation, and timeouts
- [ ] Create fixtures-based parser tests using real captured Codex output
- [ ] Add a very small event/state model document
- [ ] Ensure the core never depends on Electron-specific APIs

Possible API shape:
- `startRun()`
- `cancelRun()`
- `onRawEvent()`
- `onStatus()`
- `onFinalMessage()`
- `onError()`

---

## 3. Friendly status system

Goal: convert technical runtime behavior into a tiny, calm vocabulary.

- [ ] Define initial status vocabulary
- [ ] Map real Codex events onto friendly statuses
- [ ] Avoid exposing raw hidden reasoning
- [ ] Add fallback behavior for unknown events
- [ ] Add logging that preserves raw events for debugging without showing them to end users
- [ ] Decide whether multi-line progress details are needed, or only a single current state

Candidate statuses:
- Starting assistant
- Reading your folder
- Understanding your request
- Preparing changes
- Waiting for approval
- Applying approved changes
- Finished
- Something went wrong

---

## 4. Wrapped terminal track

Goal: make the terminal route viable and friendly quickly.

- [ ] Improve `launch-chatgpt.ps1`
- [ ] Set friendly startup location behavior
- [ ] Add optional folder argument
- [ ] Add readable startup banner/help text
- [ ] Add optional app-like mode that closes when Codex exits
- [ ] Add optional stay-open mode for debugging
- [ ] Add shortcut creation script or installer notes
- [ ] Test in PowerShell 7 and Windows Terminal
- [ ] Explore light theme / larger font / calm colors via Terminal profile guidance
- [ ] Decide whether to create a custom Windows Terminal profile automatically or document it manually

Nice-to-have:
- [ ] one-click desktop shortcut
- [ ] Start Menu shortcut
- [ ] launcher mode for Pictures / Downloads / Documents

---

## 5. Desktop app track

Goal: create a genuine desktop app that feels less technical.

- [ ] Confirm whether Electron remains the best starter stack
- [ ] Clean up app shell structure
- [ ] Replace placeholder frontend logic with real core integration
- [ ] Add folder chooser
- [ ] Add current workspace display
- [ ] Add task input box and conversation area
- [ ] Stream friendly status from the shared core
- [ ] Show final answer cleanly
- [ ] Surface approval requests in plain language
- [ ] Add cancel button
- [ ] Add restart/new task flow
- [ ] Improve empty state for first-time users

Decision point later:
- [ ] stay on Electron
- [ ] move to Tauri
- [ ] move to local web app + native launcher

---

## 6. Safety and approval UX

This is central to the product.

- [ ] Document the default safety stance
- [ ] Keep approvals on by default
- [ ] Translate technical approval prompts into plain English
- [ ] Add pre-action summary where feasible
- [ ] Distinguish read-only tasks from edit tasks
- [ ] Add a visible warning before bulk file operations
- [ ] Define what the app should do when Codex asks for something unclear or risky
- [ ] Create a simple “safer defaults” checklist for future contributors

---

## 7. First task-focused workflows

Start narrow. Make a few workflows work well.

### Pictures
- [ ] Organise by year/month
- [ ] Group screenshots separately
- [ ] Suggest better names for unlabeled images
- [ ] Preview proposed folder structure before applying

### Downloads
- [ ] Group by file type
- [ ] Identify old installers / duplicates / archives
- [ ] Suggest cleanup candidates instead of deleting automatically

### General folder help
- [ ] Summarise what is in a folder
- [ ] Find the largest files
- [ ] Find likely duplicates
- [ ] Suggest a clean structure

---

## 8. UX writing

- [ ] Decide on voice/tone for non-technical users
- [ ] Keep prompts and statuses short and plain
- [ ] Remove developer jargon where possible
- [ ] Create friendly examples for first launch
- [ ] Write approval text in normal language
- [ ] Create error copy that tells the user what to do next

---

## 9. Testing

- [ ] Add parser tests for event samples
- [ ] Add smoke test for runner startup
- [ ] Add manual test checklist for terminal launcher
- [ ] Add manual test checklist for desktop app
- [ ] Test with ordinary folders containing mixed file types
- [ ] Test failure cases: missing Codex, denied approval, malformed output, closed process

---

## 10. Documentation

- [ ] Keep `README.md` in sync with reality
- [ ] Keep `AGENTS.md` in sync with reality
- [ ] Add `docs/codex-integration-notes.md`
- [ ] Add `docs/status-model.md`
- [ ] Add `docs/safety.md`
- [ ] Add screenshots or GIFs once the UI is presentable

---

## 11. GitHub setup

- [ ] Add `.gitignore` if needed
- [ ] Add license
- [ ] Add issue templates
- [ ] Add milestones for Phase 1 / 2 / 3
- [ ] Add labels such as `terminal`, `desktop`, `safety`, `ux`, `core`, `codex-integration`
- [ ] Add a short project description for the repo homepage

---

## 12. Open questions

- [ ] What should the product be called externally?
- [ ] Should the terminal wrapper and desktop app ship from the same package or as separate entry points?
- [ ] How much status detail is helpful before it becomes noisy?
- [ ] Should task templates be explicit buttons, starter prompts, or both?
- [ ] How should approvals be represented in the desktop UI?
- [ ] What is the cleanest fallback if Codex JSON output changes between versions?
- [ ] Is there a path later toward a long-running backend instead of spawning one run per task?

---

## 13. Nice-to-have later

- [ ] session history
- [ ] export run log
- [ ] dry-run mode for file tasks
- [ ] side-by-side action preview
- [ ] undo support where feasible
- [ ] task presets for common household use cases
- [ ] accessibility pass
- [ ] optional local analytics/debug logs for development only
