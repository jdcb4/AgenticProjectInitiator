#!/usr/bin/env tsx
/**
 * Project Initiation scaffolder.
 *
 * Asks for a project name and a preset, then materialises a new project in the
 * current working directory by copying:
 *   1. initial_config/_shared/   (rendered templates)
 *   2. initial_config/<preset>/  (preset-specific files)
 */

import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import prompts from "prompts";

import { loadPresets } from "./lib/presets.ts";
import { copyTree } from "./lib/copy.ts";
import { confirmDestination, slugify } from "./lib/prompts.ts";

const baseDir = resolve(fileURLToPath(import.meta.url), "..", "..");
const initialConfigDir = resolve(baseDir, "initial_config");

async function main(): Promise<void> {
  const presets = loadPresets(initialConfigDir);
  const targetDir = process.cwd();

  console.log("\nProject Initiation scaffolder\n");
  console.log(`  Base:    ${baseDir}`);
  console.log(`  Target:  ${targetDir}\n`);

  if (!isEmptyEnough(targetDir)) {
    console.error(
      "Refusing to scaffold: target directory is not empty (ignoring .git).\n" +
        "Run the scaffolder from a fresh, empty directory.",
    );
    process.exit(1);
  }

  const answers = await prompts(
    [
      {
        type: "text",
        name: "projectName",
        message: "Project name (human-readable):",
        validate: (value: string) =>
          value.trim().length >= 2 || "At least 2 characters",
      },
      {
        type: "select",
        name: "presetId",
        message: "Pick a preset:",
        choices: Object.entries(presets).map(([id, preset]) => ({
          title: id,
          description: preset.description,
          value: id,
        })),
      },
      {
        type: "text",
        name: "dockerNamespace",
        message: "Docker Hub namespace (used for image tags):",
        initial: "jdcb4",
      },
    ],
    {
      onCancel: () => {
        console.log("\nAborted.");
        process.exit(1);
      },
    },
  );

  const preset = presets[answers.presetId];
  if (!preset) {
    console.error(`Unknown preset: ${answers.presetId}`);
    process.exit(1);
  }

  const projectName: string = answers.projectName.trim();
  const projectSlug = slugify(projectName);

  const variables: Record<string, string> = {
    project_name: projectName,
    project_slug: projectSlug,
    docker_namespace: answers.dockerNamespace,
    preset_id: answers.presetId,
    preset_label: preset.vars.preset_label,
    deploy_targets: preset.vars.deploy_targets,
    year: String(new Date().getFullYear()),
  };

  if (!(await confirmDestination(targetDir, projectName, answers.presetId))) {
    console.log("Aborted.");
    process.exit(1);
  }

  if (preset.shared) {
    const sharedDir = resolve(initialConfigDir, "_shared");
    console.log(`\nCopying shared templates from ${relativeFromBase(sharedDir)}...`);
    await copyTree(sharedDir, targetDir, variables);
  }

  const presetDir = resolve(initialConfigDir, preset.source);
  console.log(`Copying preset files from ${relativeFromBase(presetDir)}...`);
  await copyTree(presetDir, targetDir, variables);

  console.log("\nDone. Next steps:\n");
  console.log("  pnpm install");
  console.log("  pnpm run verify");
  console.log("\nThen open the project in your editor and read AGENTS.md.\n");
}

function isEmptyEnough(dir: string): boolean {
  if (!existsSync(dir)) return true;
  const entries = readdirSync(dir).filter((name) => name !== ".git");
  return entries.length === 0;
}

function relativeFromBase(p: string): string {
  return p.replace(baseDir + "\\", "").replace(baseDir + "/", "");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
