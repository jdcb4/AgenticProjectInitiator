# Decisions

Durable decisions about the Project Initiation base itself. ADR-lite format. Newest decisions append to the bottom.

## 2026-05-10: Separate `repo_name` from `project_slug`

**Decision:** Added a `repo_name` template variable (and a `--repo-name` CLI flag / interactive prompt) distinct from `project_slug`. `repo_name` is case-preserving and defaults to the slug; it is used in `vite.config.ts` for the GitHub Pages `base` URL and in the deployment doc's example URL. `project_slug` remains lowercase kebab-case for npm package names and Docker image tags.

**Reasoning:** GitHub Pages serves projects at `https://<user>.github.io/<RepoName>/` — case-sensitive, exact match required. The lowercase slug works for npm/Docker but caused Pages assets to 404 whenever the user named their repo with mixed case (e.g. `AgenticProjectInitiator`). Splitting the two concepts lets each subsystem get the casing it actually needs.

**Rejected alternatives:**
- *Force the user to pick a single slug that works for all subsystems.* Loses the human-friendly mixed-case repo names the user prefers, and Docker still requires lowercase regardless.
- *Auto-derive `repo_name` from the project name's casing.* Fragile — there's no reliable way to convert "Word Game" to the user's actual GitHub repo (could be `WordGame`, `word-game`, `Word_Game`, etc.).

## 2026-05-09: Single-base CLI scaffolder, three presets

**Decision:** One template repo at `_ProjectInitiation/` with a CLI scaffolder (`scripts/init.ts`) that materialises one of three presets (`client-only`, `hono-cloudflare`, `express-fullstack`) into a target folder.

**Reasoning:** A CLI keeps scaffolding deterministic and removes "copy and prune" errors. Three presets cover the realistic project shapes (static client app, small backend, full backend) without the overhead of a fourth.

**Rejected alternatives:**
- *Three separate template repos.* Tripled the maintenance surface and made shared `_shared/` impossible without symlinks.
- *Single folder copied wholesale, agent prunes.* Pruning is error-prone; agents leave residue or delete too much.

## 2026-05-09: Toolchain locked across presets

**Decision:** All presets use pnpm 9, Node 22 LTS, TypeScript strict (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), ESLint flat + Prettier, Vitest + RTL, Zod, Tailwind + shadcn-style components, Renovate, Fallow.

**Reasoning:** Reduces context-switching for the user and the agent. A consistent toolchain means muscle memory ports between projects, and Renovate / Fallow / verify scripts behave identically.

**Rejected alternatives:** Per-preset choices were rejected; divergence is allowed only when the preset's deploy target demands it (Wrangler for Cloudflare, Express middleware for fullstack, etc.) and must be documented in the per-project DECISIONS.md.

## 2026-05-09: Persistence ladder — JSON first, then SQLite, then Postgres

**Decision:** Per-project default is JSON files in `src/data/`, validated with Zod on read. Move to Drizzle + SQLite when JSON stops being suitable, then to Postgres when concurrency or scale demand it.

**Reasoning:** Most agentically-driven projects are small and don't need a database. Starting with JSON keeps the scaffold lean; Drizzle gives a clean migration path that works with both SQLite and Postgres.

**Rejected alternatives:** Defaulting to SQLite (overkill for the small-app default), Prisma (heavier client, less SQL-transparent than Drizzle).

## 2026-05-09: No auth in scaffolds

**Decision:** No preset ships with authentication. The per-project `AGENTS.md.tmpl` includes a hard rule: do not implement auth unless the user explicitly asks for it.

**Reasoning:** Auth materially changes the security surface, the data model, and deployment. The agent should raise the question rather than make the choice. This keeps every scaffold genuinely minimal.

**Rejected alternatives:** Including a default auth library (Better Auth, Lucia, Clerk) — would make every scaffold opinionated in a high-blast-radius way the user might not want.

## 2026-05-09: AGENTS.md split — short ruleset + on-demand reference

**Decision:** Per-project `AGENTS.md` is short (~80 lines) and contains only every-turn rules. Detailed reference (deterministic tools, dependency policy, deep modularity rules) lives in `docs/AGENT_REFERENCE.md` and is loaded only when relevant.

**Reasoning:** Token cost. AGENTS.md is read on every turn; the reference is read when the agent needs it. Splitting cuts steady-state token cost without losing depth.

**Rejected alternatives:** Single 250+ line AGENTS.md — paid per-turn forever and tends to be skimmed rather than read.

## 2026-05-09: Renovate over Dependabot

**Decision:** Per-project `renovate.json` is shipped in `_shared/`. Renovate is installed once at the GitHub account level.

**Reasoning:** Renovate's grouping (all `@types/*` in one PR, weekly dev-dep batch, auto-merge for patches) materially reduces PR churn vs Dependabot. One-time GitHub App install applies to all current and future repos.

**Rejected alternatives:** Dependabot (no third-party install, but no grouping or auto-merge of patches by default — more PR churn for an agent-driven workflow).

## 2026-05-09: Scaffolder is dual-mode (CLI flags primary, prompts fallback)

**Decision:** `scripts/init.ts` accepts `--name`, `--preset`, `--docker-namespace`, and `--yes` flags. When stdin is not a TTY, all required flags must be present or the script exits with code 2. When stdin is a TTY, missing values are prompted for one at a time.

**Reasoning:** Initial test-drive showed an agent fumbling for many minutes trying to feed the interactive `prompts` library via piped stdin (race conditions corrupted the project name as `NewLaunchery` because the trailing `y` of the confirmation merged into the name field). CLI flags bypass the prompt library entirely and give agents a deterministic single-command contract. Humans at a terminal still get the friendly interactive flow.

**Rejected alternatives:**
- *Just better-document the prompts.* Documentation can't fix a TTY-shaped API; the underlying race remains.
- *Flags only, no prompts.* Hostile to humans for first-run discovery; no compelling reason to remove the interactive path.

## 2026-05-09: Scaffold reliability fixes from first real test-drive

**Decision:** Five fixes applied after the launcher project surfaced real friction:

1. **Workflows** — Removed `with: version: 9` from `pnpm/action-setup` (combined with `package.json#packageManager` it now triggers `ERR_PNPM_BAD_PM_VERSION`; the action reads `packageManager` from package.json). Added workflow-level `env: FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` so Node 20 deprecation warnings stop blocking. Bumped only `actions/checkout@v5` (latest confirmed major); left `pnpm/action-setup` and `actions/setup-node` at `@v4` for stability — Renovate will bump them as new majors stabilise.
2. **Lint script** — Dropped `--max-warnings=0` from all three presets. With `simple-import-sort` set at "warn" severity, that flag turned every styling drift into a CI failure. Errors block CI; warnings stay informational.
3. **Build project graph** — Removed `vitest.config.ts` from `tsconfig.node.json#include` (client-only) and the equivalent web `tsconfig.json#include` (hono, express). Vite 6 plugin types vs Vitest 2 plugin types disagree there during `tsc -b`; Vitest typechecks its own config at test time so the build doesn't need to.
4. **RTL cleanup** — Extended every preset's `setupTests.ts` to register an explicit `afterEach(cleanup)`. RTL's auto-cleanup with Vitest is historically flaky and surfaced as "duplicate elements" in tests on the first real test-drive.

**Reasoning:** All four trace back to scaffold templates or default settings, not to project customisation. Catching them now means the next scaffold doesn't repeat the work.

**Rejected alternatives:** More aggressive action-version bumps (the launcher project bumped setup-node and pnpm/action-setup to `@v6`, but those majors aren't confirmed stable in our reference — chose conservative + Renovate over speculative bumps).

## 2026-05-09: Fallow 2.x config schema

**Decision:** `_shared/.fallowrc.json` now uses Fallow 2.x's accepted keys: `entry` (replacing `entrypoints` and folding in the old `tests` and `scripts` lists) and `ignorePatterns` (replacing `ignore`). Documented in `docs/VERIFICATION.md`.

**Reasoning:** Fallow 2.x renamed and reshaped these keys. The old config produces a hard parser failure ("unknown field `entrypoints`") which surfaced when a scaffolded project tried `pnpm dlx fallow`. The fix is mechanical — the parser error itself lists the accepted keys.

**Why we don't pin a Fallow version:** Pinning (e.g., `pnpm dlx fallow@2.68.0`) trades one problem for another — projects scaffolded today would stay frozen on 2.68.0 forever. Better to track `latest` and rely on Renovate to surface major bumps for review. VERIFICATION.md now warns the agent that Fallow major bumps may need a small `.fallowrc.json` migration.

## 2026-05-09: Local dev shell is Windows PowerShell

**Decision:** Templates and per-project agent rules call out that local dev runs on Windows PowerShell (5.1 or 7). The per-project `AGENTS.md` includes a hard rule banning `&&`/`||` chains and bash-only env-var syntax in interactively-run commands. `docs/AGENT_REFERENCE.md` carries the bash↔PowerShell cheatsheet.

**Reasoning:** Agents kept generating bash command chains that fail in PowerShell 5.1, costing the user time during local dev. Making the platform constraint explicit at the every-turn ruleset level (with the cheatsheet on demand) prevents the failure mode without adding much token cost.

**Scope:** Applies to commands run interactively at the local dev shell. Commands inside `Dockerfile`, `.github/workflows/*.yml`, and `package.json` scripts can keep bash syntax — they execute in Linux containers / via npm's cmd.exe shell, which both support `&&`.

## 2026-05-09: Versioning + Docker tag pattern universal

**Decision:** All presets enforce `MAJOR.MINOR.PATCH` bumps for behaviour-affecting changes and tag Docker images as both `<docker_namespace>/<project_slug>:<version>` and `:latest`.

**Reasoning:** A universal rule beats remembering per-preset rules. The version-bump discipline is also a forcing function that makes the agent think about whether a change actually changes behaviour.
