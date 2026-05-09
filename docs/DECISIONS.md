# Decisions

Durable decisions about the Project Initiation base itself. ADR-lite format. Newest decisions append to the bottom.

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

## 2026-05-09: Versioning + Docker tag pattern universal

**Decision:** All presets enforce `MAJOR.MINOR.PATCH` bumps for behaviour-affecting changes and tag Docker images as both `<docker_namespace>/<project_slug>:<version>` and `:latest`.

**Reasoning:** A universal rule beats remembering per-preset rules. The version-bump discipline is also a forcing function that makes the agent think about whether a change actually changes behaviour.
