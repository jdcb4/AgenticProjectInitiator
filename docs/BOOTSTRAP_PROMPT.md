# Bootstrap Prompt

Paste the prompt below into a fresh Claude Code session opened in the **target project folder** (an empty directory you want to become your new project). The agent reads it, runs the scaffolder, then customises the project per your spec.

> Replace the placeholders in `<<…>>` with your actual answers before pasting.

---

```text
You are starting a new project from an empty folder.

Step 1 — Scaffold

Run:

  pnpm dlx tsx C:\CodingProjects\_ProjectInitiation\scripts\init.ts

Answer the prompts:

- Project name: <<project name, e.g. "Word Game">>
- Preset: <<one of: client-only | hono-cloudflare | express-fullstack>>
- Docker Hub namespace: <<your docker namespace, default "jdcb4">>

After the scaffolder completes, the working directory contains a complete project. Do NOT rerun the scaffolder.

Step 2 — Verify the scaffold

Run:

  pnpm install
  pnpm run verify

If anything fails, fix it before proceeding.

Step 3 — Read the project's own AGENTS.md

It contains the rules you must obey from this point on, including:

- No auth without explicit request.
- No new top-level dependencies without a docs/DECISIONS.md entry.
- Default to JSON file persistence; document any move to a database.
- Bump the version on behaviour-affecting changes; update docs/CHANGELOG.md.
- Run `pnpm run verify` before claiming a task is complete.

Step 4 — Customise

Spec for this project:

<<paste a one-paragraph description of the product, plus 3–6 bullet points covering the core features, target users, key constraints, and any non-default tooling decisions you've already made>>

Customisation rules:

- Stay within the scaffolded module boundaries (see docs/ARCHITECTURE.md).
- Update docs/PROJECT_INDEX.md when you add real folders, real commands, or real top-level concepts.
- Add or update tests for any domain logic.
- Update docs/CHANGELOG.md and bump the version once each meaningful piece is in.
- Stop and ask before adding auth, a database, a real-time layer (Socket.io / WebSockets / SSE), or a new framework.

When you finish customising, run `pnpm run verify` and report:

- Files created and changed.
- Checks run and their results.
- Version decision and CHANGELOG entry.
- Anything blocked or deferred.
```

---

## Tips

- **Keep the spec short.** A paragraph plus a few bullets gives the agent enough; longer specs lead to drift.
- **Pick the preset deliberately.** Reread `README.md` if unsure. Picking the wrong preset is more painful than starting over.
- **Open the new folder in a fresh editor window** before running the prompt so the agent's context is the project, not the base.
- **The scaffolder refuses to run on a non-empty folder** (`.git` is the one exception). If you've already initialised git, that's fine.
