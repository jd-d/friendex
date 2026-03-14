# TODO

This is the single active roadmap and delivery backlog for Friendex.

## Operating rules

- Every new request should be mapped to an existing item here or added here before it is considered fully planned.
- Prioritize in this order: `0. critical usability bugs`, `1. robustness`, `2. UX`, `3. later bets`.
- Keep both desktop and wrapped-terminal tracks visible unless the project deliberately changes direction.
- Treat file and folder help as an important starting wedge, not the full product boundary.
- Merge overlapping requests into existing workstreams instead of creating duplicate backlog items.
- Add technical debt and refactor follow-ups explicitly instead of burying them inside feature work.
- For user-facing behavior changes, explicitly evaluate whether `README.md` should be updated in the same change window.

## Recommended next wave

1. `1A.1` through `1A.5`: unify persisted settings, add max query-size protection, and cover the new desktop state model with tests.
2. `1B.1` through `1B.5`: add query history safely, including deletion and clear-all behavior with confirmation.
3. `1C.1` through `1C.4`: verify Codex input and memory surfaces before building clipboard, attachments, and memory-management UX on assumptions.
4. `2C.1` and `2C.4`: expand the first example flows so Friendex does not stay implicitly file-only once the current safety foundation is in place.
5. `2A.1` through `2A.7`: build memory-management UX only after the real memory surfaces are verified.
6. Pull `3D.6` and `1D.6` forward before building heavy-handed response rewriting, so the pass-through versus translation boundary is defined on purpose.
7. Pull the smallest necessary `3A` and other `3D` slices forward only when they clearly reduce risk or prevent misleading product framing in the active wave.

---

## 0. Critical usability bugs

### Workstream `0A`: Live run trust and control

Goal: make the desktop app understandable and trustworthy while a task is running.

Dependencies: none.

- [x] `0A.1` Make approval-required runs understandable.
  - Current shipped behavior in the desktop app:
    - detect permission-blocked runs from the actual `exec` output patterns
    - explain that the run was blocked by current Codex permissions
    - avoid suggesting a live approval dialog where the current integration does not actually provide one
- [x] `0A.2` Document how approvals actually surface in the current `codex exec` path.
  - Verify whether approval completion happens in-app, in a terminal/Codex UI, in browser/system UI, or some mix depending on the flow.
  - Write down the current truth in `docs/` so future UX work stays grounded.
- [x] `0A.3` Add an authorization and reauthorization entry point in the desktop app.
- [x] `0A.4` Verify the current Codex auth flow against official docs and local Windows behavior.
  - Current scope verified: `codex login`, `codex login status`, browser flow, and device-auth flow.
  - Revisit if logout or token-state behavior becomes user-facing in-app.
- [x] `0A.5` Move status into a bottom status bar and allow hiding it in Settings.
- [x] `0A.6` Move the settings affordance to the header and show the `Settings` label when there is enough space.
- [x] `0A.7` Move quick example tasks beside the `Go!` action and stop burning a full extra section on them.
- [x] `0A.8` Add debug visibility modes: hidden, docked in the main window, or popped out into a separate window, and persist the choice.
- [x] `0A.9` Disable nonessential MCP servers for Friendex-run Codex sessions by default until a specific shipped feature needs them.
  - Why: they currently add connector auth noise, startup clutter, and capability surface that the initial Friendex local-helper flows do not need.
  - Important: do this as a per-run Friendex override rather than changing the user's normal Codex setup globally.

---

## 1. Robustness

### Workstream `1A`: Settings and input safety foundation

Goal: make desktop state predictable, persisted, and safe under ordinary user mistakes.

Dependencies: `0A` baseline is in place.

- [ ] `1A.1` Persist all user-facing settings in one coherent schema.
  - Current known settings: working folder, status-bar visibility, debug visibility/pop-out, and future max query size.
  - Keep the schema ready for history and memory-related settings rather than scattering new keys ad hoc.
- [ ] `1A.2` Add a configurable max query size with a sensible default.
- [ ] `1A.3` When the query exceeds the configured limit, block submission and show a red warning explaining that the limit protects the app from hanging on extremely large input.
- [ ] `1A.4` Decide whether the limit is measured in characters, bytes, or both, and document the rule in the UI and docs.
- [ ] `1A.5` Add tests for settings persistence, query-limit validation, and debug-window lifecycle.

### Workstream `1B`: Query history

Goal: keep user-entered task history visible and manageable without turning it into an opaque data sink.

Dependencies: `1A`.

- [ ] `1B.1` Store every submitted query locally.
- [ ] `1B.2` Expose query history in Settings.
- [ ] `1B.3` Allow deleting individual history items.
- [ ] `1B.4` Allow clearing all history with confirmation.
- [ ] `1B.5` Decide and document whether history stores only prompt text or also working folder, timestamp, and attachments.

### Workstream `1C`: Codex capability verification and safe rich-input support

Goal: only promise inputs and memory surfaces that the current Codex integration really supports.

Dependencies: none, but complete this before shipping attachment and memory-management UX.

- [ ] `1C.1` Verify the current `codex exec` support for image attachments and any relevant file-attachment path for this app.
- [ ] `1C.2` Add clipboard and file-picker input support only for input types the active Codex integration actually supports.
- [ ] `1C.3` If non-image file attachment is not supported in the current `codex exec` path, provide a clear fallback instead of pretending it works.
- [ ] `1C.4` Verify what local artifacts should count as app-visible "memory."
  - Candidate surfaces: global `~/.codex` guidance, repo-local `AGENTS.md`, session transcripts under `~/.codex/sessions`, and any other confirmed persistence surfaces.
- [ ] `1C.5` Revisit MCP only when a concrete Friendex feature genuinely needs it.
  - Examples that might justify re-enabling a specific MCP server later:
    - external calendar/task integrations
    - structured forms/workflows
    - other clearly user-facing capabilities that go beyond the core local helper path

### Workstream `1D`: Shared core and runner hardening

Goal: keep desktop and terminal surfaces grounded on one reliable core instead of duplicating behavior.

Dependencies: none.

- [ ] `1D.1` Stabilize `packages/core` as a reusable runner API for desktop and terminal surfaces.
- [ ] `1D.2` Separate raw event parsing from friendly status mapping.
- [ ] `1D.3` Add fixtures-based coverage for stdout, stderr, exit codes, cancellation, and timeouts.
- [ ] `1D.4` Capture and document real Windows approval, auth, and non-git-folder behavior.
- [ ] `1D.5` Ensure the shared core never depends on Electron-specific APIs.
- [ ] `1D.6` Evaluate a lightweight Friendex prompt layer before building heavier post-processing of Codex responses.
  - Prefer prompt shaping when it reliably produces calmer, clearer output.
  - Do not rely on it until real runs show it behaves predictably across common task types.

---

## 2. UX

### Workstream `2A`: Memory and instruction management

Goal: let users explicitly manage what Codex should remember, and make that scope understandable.

Dependencies: `1C.4` should verify the real memory surfaces first.

- [ ] `2A.1` Add a `Remember this` action under Friendly output.
- [ ] `2A.2` Add a quick example bubble labeled `Tell me what to remember`.
- [ ] `2A.3` Make that example populate a memory-capture prompt like `Always remember this preference or instruction: ...`.
- [ ] `2A.4` Build a memory and instruction manager UI that shows all confirmed Codex memory sources relevant to the current run.
- [ ] `2A.5` Show global and local sources separately, with clear labels about scope and impact.
- [ ] `2A.6` Allow deleting memories or instructions from supported sources, with confirmation and clear warnings where deletion is destructive.
- [ ] `2A.7` Explain the difference between global guidance, repo-local guidance, and per-session history in plain English.

### Workstream `2B`: Desktop shell polish

Goal: make the shell feel calm, readable, and intentional without hiding important control points.

Dependencies: `0A` baseline is in place.

- [x] `2B.1` Collapse the desktop header copy into one compact product line to reduce wasted vertical space.
- [ ] `2B.2` Keep the header calm and readable on narrow windows while preserving the right-aligned settings action.
- [ ] `2B.3` Make the bottom status bar and popped-out debug window behave well across restart, resize, and multi-monitor use.
- [ ] `2B.4` Improve first-run empty states for auth, folder selection, debug visibility, and history.

### Workstream `2C`: First task flows

Goal: make the first few high-value everyday Windows tasks feel obvious and safe.

Dependencies: `0A` and `2A` where relevant.

- [ ] `2C.1` Continue tightening the first example flows for ordinary Windows tasks:
  - organize folder
  - safe cleanup
  - rename files clearly
  - find a file, app, or setting
  - help me change a Windows setting safely
  - tell me what to remember
- [ ] `2C.2` Add safer plain-English approval copy before edits and bulk operations.
- [ ] `2C.3` Add clearer explanations for what the app remembers automatically versus only when the user explicitly chooses `Remember this`.
- [ ] `2C.4` Separate search/explain/help-me-find tasks from change-making tasks so the UI does not imply every request is an edit flow.
- [ ] `2C.5` Define which classes of Codex output should be passed through directly, lightly reframed, or actively translated in the everyday task flows.

---

## 3. Later bets, technical debt, and strategy

### Workstream `3A`: Desktop maintainability and delivery-risk reduction

Goal: keep the current desktop implementation from becoming too tangled to extend safely.

Dependencies: pull these forward when they clearly reduce risk for the active wave.

- [ ] `3A.1` Extract desktop settings and persistence logic into a dedicated module instead of continuing to grow `apps/desktop/main.js`.
- [ ] `3A.2` Extract auth state checks and debug-window lifecycle management out of `apps/desktop/main.js` before history and memory features make it harder to reason about.
- [ ] `3A.3` Split renderer UI logic into smaller modules once settings, history, memory, and debug-window features land.
- [ ] `3A.4` Define a stable desktop state model for docked versus popped-out debug views, status-bar visibility, query history, and later memory-management state.
- [ ] `3A.5` Add regression coverage for the settings menu, auth entry points, memory manager, and history deletion flows.

### Workstream `3B`: Docs and architecture capture

Goal: keep durable technical and product context from leaking out of the repo.

Dependencies: none.

- [ ] `3B.1` Add a small architecture note describing how shared core, desktop UI, persisted settings, and Codex-local files interact.
- [ ] `3B.2` Create a lightweight reusable knowledge log (`WIKI.md` or equivalent) once repeated Codex/Windows findings start accumulating enough that chat-only explanations are not durable enough.
- [ ] `3B.3` Decide whether external research needs stronger repo-level guardrails beyond `AGENTS.md` guidance, and document the chosen web-source hygiene approach.

### Workstream `3C`: Wrapped terminal track

Goal: keep the terminal route viable for ordinary Windows users across everyday PC tasks rather than letting the desktop app become the only serious path.

Dependencies: none.

- [ ] `3C.1` Improve launcher UX, startup location behavior, help text, and shortcut creation.
- [ ] `3C.2` Keep the terminal route viable for ordinary Windows tasks, not just repos.

### Workstream `3D`: Product framing

Goal: reduce ambiguity about what this product is called and who it is for, without letting naming work displace trust/robustness work.

Dependencies: none. Do not let this displace `0A` or `1A-1D` unless the user explicitly reprioritizes it.

- [ ] `3D.1` Decide whether `Friendex` is now the product name everywhere, or only a desktop-shell label while the broader naming decision remains open.
- [ ] `3D.2` Finalize the external product name and retire `ChatGPT File Helper` when appropriate.
- [ ] `3D.3` Write down the first 5 to 7 everyday Windows workflows the product explicitly optimizes for across files, search, settings/configuration help, and general local-tool help.
- [ ] `3D.4` Decide how much status detail is actually helpful before it becomes noise.
- [x] `3D.5` Reframe the repo docs so Friendex is positioned as a broader everyday-PC helper rather than only a file-task assistant.
- [ ] `3D.6` Define the Friendex interaction boundary:
  - what should pass through from Codex mostly unchanged
  - what should be lightly translated
  - what should be actively interpreted, summarized, or guarded
