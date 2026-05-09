# Agent Instructions — Project Initiation Base

This repository is a **template base**. It is not itself a deployable app. Its job is to scaffold new agentically-driven web projects from one of three presets via a CLI.

If you are an agent working **inside this base** (editing the templates, the scaffolder, or the docs), this file applies to you.

If you are an agent working **inside a project that was scaffolded from this base**, the scaffolded project has its own `AGENTS.md` — read that one instead.

## What this base produces

Three project presets, selected at scaffold time:

- `client-only` — Vite + React + TS, deploys to GitHub Pages and/or Docker/Nginx.
- `hono-cloudflare` — pnpm monorepo, Vite frontend + Hono API on Cloudflare Workers, shared Zod schemas.
- `express-fullstack` — pnpm monorepo, Vite frontend + Express 5 backend (Socket.io ready), Railway/Docker deploy.

The shared toolchain across all presets:

- TypeScript strict, pnpm, ESLint + Prettier, Vitest + RTL, Zod, Tailwind + shadcn-style components, Fallow for deterministic code-quality analysis, Renovate for dependency updates.

## How scaffolding works

A user (or an agent acting on a user's instruction) runs the scaffolder from the target project directory:

```bash
pnpm dlx tsx <path-to-this-base>/scripts/init.ts
```

The scaffolder asks for project name and preset, then copies:

1. Files from `initial_config/_shared/` (rendered with `{{project_name}}` etc.).
2. Files from `initial_config/<preset>/`.

The result is a self-sufficient project with its own `AGENTS.md`, `/docs`, `package.json`, and version control.

## Rules when working in this base

1. **Do not break the scaffold contract.** `presets.json` is the source of truth for what each preset includes. Update it when you add or remove template files.
2. **Templates use `.tmpl` suffix only when they contain `{{variables}}`.** Files without variables are copied as-is.
3. **Keep AGENTS.md (this file and the per-project template) short.** Detailed reference material lives in `docs/AGENT_REFERENCE.md` so it is not paid on every turn.
4. **Do not add a fourth preset, change the toolchain default, or introduce a new shared library** without a documented decision in `docs/DECISIONS.md`.
5. **Test the scaffolder after meaningful changes** by running it into a throwaway folder and verifying the result installs, typechecks, lints, tests, and builds.

## First-step orientation when editing this base

1. Read this file.
2. Read `docs/HOW_THIS_WORKS.md`.
3. Read `initial_config/presets.json`.
4. Look at the template you intend to change before changing it.

## Documentation map

- `docs/HOW_THIS_WORKS.md` — architecture of the base itself.
- `docs/ADDING_A_PRESET.md` — how to add a new preset.
- `docs/BOOTSTRAP_PROMPT.md` — the prompt to paste into a fresh Claude Code session when starting a new project.
- `docs/DECISIONS.md` — durable decisions about this base.

## Per-project agent rules

The agent rules that apply **inside scaffolded projects** live in:

- `initial_config/_shared/AGENTS.md.tmpl` — the short, every-turn ruleset.
- `initial_config/_shared/docs/AGENT_REFERENCE.md` — the detailed reference.

If you change those templates, also update `docs/DECISIONS.md` here so the rationale is recorded.
