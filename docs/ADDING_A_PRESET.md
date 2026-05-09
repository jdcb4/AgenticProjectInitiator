# Adding a Preset

Don't add a fourth preset unless there is a clear reason the existing three cannot serve. Document the reason in `docs/DECISIONS.md` before you begin.

If the reason holds:

1. **Pick a short id** — kebab-case, e.g. `next-app`, `tauri-desktop`. Used as folder name.
2. **Create the folder** at `initial_config/<id>/` containing the preset-specific files.
3. **Reuse `_shared/`** by setting `"shared": true` in `presets.json`. Override individual `_shared/` files by mirroring the same path in your preset folder.
4. **Add an entry** to `initial_config/presets.json#presets`:
   ```json
   "<id>": {
     "description": "<one-line description shown in the picker>",
     "shared": true,
     "source": "<id>",
     "vars": {
       "preset_label": "<human-friendly label>",
       "preset_id": "<id>",
       "deploy_targets": "<deploy targets, comma-separated>"
     }
   }
   ```
5. **Add deploy docs** at `initial_config/<id>/docs/DEPLOYMENT.md.tmpl`.
6. **Run the smoke test:** `pnpm run test:scaffold`. Add new required-file expectations if your preset introduces them.
7. **Manually scaffold** into a throwaway folder, then run `pnpm install` followed by `pnpm run verify` (separately — local dev is Windows PowerShell, no `&&` chains).
8. **Document the decision** in `docs/DECISIONS.md` here in the base — what the preset is for, why the existing three were insufficient, what tooling diverges and why.

## Things to keep consistent

- pnpm 9, Node 22 LTS (`.nvmrc`).
- TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`.
- ESLint flat config + Prettier.
- Vitest + RTL.
- Zod for validation.
- Renovate for dependency updates.
- The doc set: `AGENTS.md`, `SECURITY.md`, and the seven docs under `/docs`.
- The `pnpm run verify` script as the commit gate.
- Versioning rules from `docs/VERSIONING.md`.
- Docker tag pattern `<docker_namespace>/<project_slug>:<version>` plus `:latest`.

## Things you can reasonably diverge on

- Build tool (e.g., Wrangler for Cloudflare, Tauri for desktop).
- Deploy target.
- Backend framework if there is a real reason.
- Routing library if the framework dictates.
- Optional add-ons (TanStack Query, Socket.io, Drizzle).

Every divergence belongs in `docs/DECISIONS.md`.
