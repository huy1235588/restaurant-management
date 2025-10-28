# Migration Plan — Next.js (web) to Tauri (desktop)

Objective
---------
Migrate the Restaurant Management web application (Next.js) into a Tauri desktop application. This PR provides the initial scaffold (src-tauri/) and a detailed plan for the migration.

High-level phases and next actionable subtasks
----------------------------------------------
1) Audit (1 week)
   - Inventory all runtime dependencies in the Next.js app (API routes, external services, Node APIs, filesystem usage).
   - Identify web-only patterns that need replacement (server-side rendering, Next.js APIs, environment variables).
   - Produce an "audit report" listing compatibility issues and recommended approaches.

2) UI design & packaging approach (1-2 weeks)
   - Decide on rendering strategy for desktop: keep a webview that serves the existing Next.js build or port UI to a bundled frontend (e.g., React + Vite).
   - Create a mockup of desktop windows/menus and a minimal UX for offline usage.
   - Choose packaging targets (Windows/macOS/Linux) and CI/CD packaging strategy.

3) Port core application logic (2-3 weeks)
   - Port platform-agnostic business logic (TypeScript modules) into a shared location for desktop use.
   - For logic that depends on Node-specific APIs, extract and replace with Rust or Tauri APIs or provide a small Node runtime if needed.
   - Implement Tauri commands for native capabilities (filesystem, notifications, system dialogs).

4) UI integration & iteration (2-4 weeks)
   - Wire frontend to Tauri commands and adjust API calls.
   - Iterate on UI to fit desktop patterns (menus, window size, single/multi-window behavior).
   - Add automated UI smoke tests.

5) Tests & CI (1-2 weeks)
   - Add unit tests for migrated logic and integration tests for Tauri commands.
   - Add CI steps to build and run tests in headless environments.

6) Packaging & distribution (1-2 weeks)
   - Configure Tauri bundler settings, code signing (macOS/Windows), and create distributable artifacts.
   - Create release automation for producing installers and release notes.

Suggested overall timeline: 2–3 months for a complete and well-tested migration, depending on team size and priority. The plan should be broken down further into sprint-sized issues.

Initial actionable tasks (what to do next in the repo)
-----------------------------------------------------
- Create issues for Audit, UI design decision, Core logic port, Tauri command prototypes, Tests/CI, Packaging (label with migration & priority).
- Assign an owner for the audit and schedule a kickoff meeting.
- Iterate on the Tauri scaffold (src-tauri/) to wire secure commands needed by the app.

Notes & constraints
-------------------
- This PR intentionally does not remove or modify existing web app code beyond a short README note. The scaffold is minimal so maintainers can iterate safely.
- Prefer incremental PRs for each migration subtask (audit findings, porting modules, UI adjustments).

References
----------
- Original issue: Migration from Web App (Next.js) to Tauri Desktop Application (#11)
