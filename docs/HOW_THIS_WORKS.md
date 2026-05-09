# How This Base Works

## Goal

This base is a deterministic project scaffolder. Run a CLI, answer two questions, get a clean project ready for an AI agent (or a human) to flesh out. The same toolchain and conventions apply across all three presets so context-switching is minimal.

## Pieces

```
_ProjectInitiation/
├── AGENTS.md                   # rules for agents editing this base
├── README.md                   # human-facing usage
├── package.json                # for running the scaffolder
├── scripts/                    # the scaffolder
│   ├── init.ts                 # CLI entry point
│   ├── test-scaffold.ts        # smoke test that materialises every preset
│   └── lib/
│       ├── presets.ts          # reads presets.json
│       ├── prompts.ts          # interactive prompts + slugify
│       └── copy.ts             # template tree copy + variable rendering
├── initial_config/
│   ├── presets.json            # source of truth for what each preset includes
│   ├── _shared/                # files copied into every preset
│   ├── client-only/            # static React app
│   ├── hono-cloudflare/        # pnpm monorepo, Hono on Workers + Vite web
│   └── express-fullstack/      # pnpm monorepo, Express 5 + Socket.io + Vite web
└── docs/                       # docs about this base
```

## Scaffold flow

The CLI supports two modes:

- **Non-interactive** (agents, CI): `--name "..." --preset <id> --docker-namespace <ns> --yes`. All required flags must be present.
- **Interactive** (humans at a terminal): no flags, prompts walk through each value.

You can mix — any flag passed is used, anything missing is prompted for, but only when stdin is a TTY. If stdin is not a TTY and a flag is missing, the scaffolder exits with code 2 and a message listing what's missing. Likewise, a non-TTY run without `--yes` exits because the confirmation prompt cannot be satisfied.

Steps after flag parsing:

1. The CLI checks the target is empty (ignoring `.git`).
2. It collects `projectName`, `presetId`, `dockerNamespace` from flags or prompts.
3. It builds a variables map: `project_name`, `project_slug`, `docker_namespace`, `preset_id`, `preset_label`, `deploy_targets`, `year`.
4. It confirms (or skips confirmation if `--yes`).
5. It copies `initial_config/_shared/` first, then `initial_config/<preset>/` over the top. Files ending `.tmpl` are rendered through a `{{variable}}` substituter; files without `.tmpl` are copied verbatim.
6. It prints next steps.

### Why dual-mode

A single interactive flow looks human-friendly but breaks in agent sessions: piped stdin races against the prompt library, characters get merged across fields (the `y` of a confirmation prompt collides with the previous text input). The non-interactive path bypasses the prompt library entirely and is the only deterministic option for agents and CI.

## Template rules

- **Use `.tmpl` only when the file body contains `{{variables}}`.** Plain files copy verbatim. This avoids accidentally rendering JSX expressions or other curly-brace patterns.
- **Variables** are listed in `presets.json#variables`. Add new variables to that list and to `scripts/init.ts` together.
- **`_shared/` is overlaid first**, then the preset overlays it. So a preset can override a `_shared/` file by providing the same path.

## Adding files to a preset

1. Drop the file into `initial_config/<preset>/<path>`.
2. Add `.tmpl` if it contains `{{variables}}`.
3. Run `pnpm run test:scaffold` to verify materialisation.
4. Update `docs/ADDING_A_PRESET.md` if the change affects how presets are composed.

## Required files contract

`scripts/test-scaffold.ts` enforces a small list of required files (AGENTS.md, README, docs set, prettier config, gitignore, renovate). If you change the per-project layout, update that list.

## Variables

| Variable           | Source                              |
| ------------------ | ----------------------------------- |
| `project_name`     | First prompt answer                 |
| `project_slug`     | `slugify(project_name)`             |
| `docker_namespace` | Prompt, defaults to `jdcb4`         |
| `preset_id`        | Selected preset                     |
| `preset_label`     | `presets.json#presets.<id>.vars`    |
| `deploy_targets`   | `presets.json#presets.<id>.vars`    |
| `year`             | Current calendar year               |

## Preset boundaries

Tooling consistency rules:

- All presets use pnpm 9, Node 22 LTS, TypeScript strict, ESLint flat + Prettier, Vitest + RTL, Zod, Tailwind + shadcn-style components, Renovate.
- Diverge only where justified (Wrangler for Cloudflare, Socket.io + Express middleware stack for fullstack, etc.).
- Document every divergence in the per-project `docs/DECISIONS.md` template.

## Testing the base

```bash
pnpm install
pnpm run test:scaffold
```

This materialises every preset into a temp folder and checks the required-files contract. It does **not** run `pnpm install` inside the materialised projects (that's slow and bandwidth-heavy). To run the full chain manually, scaffold into a real folder, then run `pnpm install` and `pnpm run verify` (separately, since the local dev shell is Windows PowerShell which doesn't support `&&` chains).
