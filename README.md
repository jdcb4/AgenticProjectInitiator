# Project Initiation Base

A template base for agentically-driven web development projects. It scaffolds one of three project presets via a small CLI:

| Preset                | Use for                                                     | Deploys to              |
| --------------------- | ----------------------------------------------------------- | ----------------------- |
| `client-only`         | static apps, dashboards, small games, browser-only tools    | GitHub Pages, Docker    |
| `hono-cloudflare`     | small APIs, lightweight CRUD, webhook receivers             | Cloudflare Workers      |
| `express-fullstack`   | real-time multiplayer, larger backends, Socket.io apps      | Railway, Docker         |

## Prerequisites

- Node.js 22 LTS (`.nvmrc` provided)
- pnpm 9+
- Docker Desktop (only if you intend to build images)
- A GitHub account with the [Renovate app](https://github.com/apps/renovate) installed once at the account level (it auto-applies to all current and future repos)

## Scaffolding a new project

```powershell
# 1. Create and enter the target folder
mkdir C:\CodingProjects\my-new-app
cd C:\CodingProjects\my-new-app

# 2. Run the scaffolder from this base
pnpm dlx tsx C:\CodingProjects\_ProjectInitiation\scripts\init.ts

# 3. Answer the two prompts (project name, preset)
# 4. Install and verify
pnpm install
pnpm run verify
```

## Scaffolding via an agent

The fastest path is to paste the bootstrap prompt from `docs/BOOTSTRAP_PROMPT.md` into a fresh Claude Code session opened in the target folder. The agent reads the prompt, runs the scaffolder, and then customizes the project per your spec.

## What the base contains

```
_ProjectInitiation/
├── AGENTS.md                # rules for agents editing this base
├── README.md                # this file
├── package.json             # for running the scaffolder
├── scripts/                 # the CLI scaffolder
├── initial_config/
│   ├── presets.json         # source of truth for preset composition
│   ├── _shared/             # files copied into every preset
│   ├── client-only/
│   ├── hono-cloudflare/
│   └── express-fullstack/
└── docs/                    # docs about this base
    ├── HOW_THIS_WORKS.md
    ├── ADDING_A_PRESET.md
    ├── BOOTSTRAP_PROMPT.md
    └── DECISIONS.md
```

## Modifying or extending the base

See `docs/HOW_THIS_WORKS.md` for the design and `docs/ADDING_A_PRESET.md` for how to add a fourth preset (don't, unless you have a clear reason).
