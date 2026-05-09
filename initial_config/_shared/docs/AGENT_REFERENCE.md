# Agent Reference

Detailed reference for AI agents working in this project. Load on demand — not on every turn. The short, every-turn ruleset is in `AGENTS.md`.

## Toolchain defaults

- **TypeScript** strict mode, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`. Path alias `@/*` → `src/*`.
- **Package manager** pnpm 9+. Do not switch to npm or yarn without a `docs/DECISIONS.md` entry.
- **Build** Vite (or framework-specific equivalent — Cloudflare Workers uses Wrangler).
- **Lint/format** ESLint flat config + Prettier. Errors fail CI; warnings should be cleaned before merge.
- **Test** Vitest + React Testing Library. `jsdom` for component tests; `node` for domain/server tests.
- **Validation** Zod everywhere external input lands.
- **Styling** Tailwind CSS + shadcn-style components.
- **Code quality** Fallow for dead code, duplication, complexity. Knip / ts-prune / jscpd as on-demand investigations.
- **Deps** Renovate keeps things current; merge PRs promptly after CI passes.

## Modularity rules

- Domain code is framework-independent. No React, no IO, no DB imports.
- UI components do not own persistence or network calls.
- IO sits behind service modules so it can be mocked in tests.
- Feature orchestration is separate from pure domain rules.
- Inject time, randomness, IDs, and external services for deterministic tests.

## Reducing duplication

Before adding new code:

1. Search for existing functions, hooks, components, schemas, constants, and types that already solve part of the problem.
2. Prefer extending an existing module over creating a parallel implementation.
3. Extract shared logic only after **at least two real call sites** exist, unless the boundary is already obvious.
4. Keep shared utilities small and dependency-light.
5. Avoid catch-all `utils` files that mix unrelated concerns.

Duplication policy:

- Domain rules have one canonical implementation.
- Validation schemas are reused by UI, API, tests, and persistence where practical.
- Constants and defaults live in named config modules, not inline across screens.
- Test helpers do not reimplement production logic in a way that can mask bugs.

## Deterministic codebase analysis

```bash
# Dead code, duplication, complexity (primary)
pnpm dlx fallow --no-cache --format human

# Exported symbols / module surface area
pnpm dlx ts-prune

# Unused files, dependencies, exports
pnpm dlx knip

# Duplicate or near-duplicate code
pnpm dlx jscpd .

# Dependency tree
pnpm ls --depth=0

# AST-aware structural search
pnpm dlx ast-grep --pattern 'PATTERN' src
```

Do not blindly follow these tools. False positives are common for framework entrypoints, plugin-loaded files, generated files, and runtime-only deps. Document false positives near the relevant config.

## Persistence policy

1. **Default to JSON files** in `src/data/`. Validate on read with a Zod schema. This covers most small projects.
2. **Move to SQLite + Drizzle** when relational queries, transactions, or larger datasets become awkward in JSON.
3. **Move to Postgres + Drizzle** when concurrency, advanced queries, or production scale demand it.

Every move between tiers needs a `docs/DECISIONS.md` entry and migration logic that handles existing data.

## Persistence and schema changes

When changing persisted data, database schema, local storage, or public data formats:

1. Document current and new schema.
2. Add or update migration logic.
3. Add tests for old data loading into the new version.
4. Increment `MAJOR` if old data cannot be migrated.
5. Update `docs/ARCHITECTURE.md`, `docs/VERSIONING.md`, and `docs/CHANGELOG.md`.

## Dependency policy

Before adding a dependency:

1. Check whether the platform or existing dependencies already solve the problem.
2. Prefer small, well-maintained packages with TypeScript support.
3. Avoid dependencies for trivial helpers.
4. Document meaningful new dependencies in `docs/DECISIONS.md`.
5. Run dependency checks after installation.

## Auth policy

**Do not implement authentication unless the user explicitly asks for it.**

If a task seems to need auth, raise the question rather than building it. Auth materially changes the security surface, the data model, and the deployment shape, so the choice belongs to the user.

## Git hygiene

Do not commit:

- `node_modules`
- build output (`dist`, `.next`, `coverage`, generated native folders, compiled artifacts) unless intentionally tracked
- local environment files (`.env`, `.env.local`)
- signing credentials, API keys, tokens, secrets
- editor caches and OS metadata

Before committing:

```bash
git status --short
git diff --check
git diff --stat
```

## Token-efficient agent workflow

- `docs/PROJECT_INDEX.md` is the navigation entry point. Keep it current.
- Maintain short module-level notes for complex folders.
- Prefer small files with clear names over large files mixing concerns.
- Use descriptive commit messages that include version impact.
- When completing a task, leave a concise summary in the PR/commit notes: changed files, checks run, version decision, docs updated.
- Don't paste large generated outputs into docs. Link to scripts or source files.
- Avoid broad rewrites when a focused change will do.
- Keep public APIs narrow and documented.

## When blocked

1. Make the smallest safe improvement available.
2. Document what remains blocked and why.
3. Include exact commands run and exact failures.
4. Do not claim checks passed unless they were run successfully.
