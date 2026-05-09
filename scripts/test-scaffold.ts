#!/usr/bin/env tsx
/**
 * Smoke test for the scaffolder. Materialises each preset into a throwaway
 * directory under the system temp folder and verifies that key files exist.
 *
 * Run with:  pnpm run test:scaffold
 */

import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadPresets } from "./lib/presets.ts";
import { copyTree } from "./lib/copy.ts";

const baseDir = resolve(fileURLToPath(import.meta.url), "..", "..");
const initialConfigDir = resolve(baseDir, "initial_config");

const REQUIRED_FILES = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package.json",
  "docs/PROJECT_INDEX.md",
  "docs/ARCHITECTURE.md",
  "docs/DECISIONS.md",
  "docs/CHANGELOG.md",
  "docs/AGENT_REFERENCE.md",
  ".prettierrc.json",
  ".gitignore",
  "renovate.json",
];

async function main(): Promise<void> {
  const presets = loadPresets(initialConfigDir);
  let failed = 0;
  for (const [presetId, preset] of Object.entries(presets)) {
    const target = await mkdtemp(join(tmpdir(), `scaffold-${presetId}-`));
    try {
      const vars = {
        project_name: "Smoke Test",
        project_slug: "smoke-test",
        docker_namespace: "test",
        preset_id: presetId,
        preset_label: preset.vars.preset_label,
        deploy_targets: preset.vars.deploy_targets,
        year: String(new Date().getFullYear()),
      };
      if (preset.shared) {
        await copyTree(resolve(initialConfigDir, "_shared"), target, vars);
      }
      await copyTree(resolve(initialConfigDir, preset.source), target, vars);

      for (const required of REQUIRED_FILES) {
        const path = join(target, required);
        try {
          await stat(path);
        } catch {
          console.error(`  [${presetId}] missing: ${required}`);
          failed++;
        }
      }
      console.log(`  [${presetId}] OK`);
    } finally {
      await rm(target, { recursive: true, force: true });
    }
  }
  if (failed > 0) {
    console.error(`\n${failed} missing file(s).`);
    process.exit(1);
  }
  console.log("\nAll presets scaffolded successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
