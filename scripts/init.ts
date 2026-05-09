#!/usr/bin/env tsx
/**
 * Project Initiation scaffolder.
 *
 * Two modes:
 *
 * 1. Non-interactive (recommended for agents and CI):
 *
 *      pnpm dlx tsx <base>/scripts/init.ts \
 *        --name "My Project" \
 *        --preset client-only \
 *        --docker-namespace jdcb4 \
 *        --yes
 *
 *    All required flags must be present. Exits non-zero with an explanatory
 *    error if any are missing and stdin is not a TTY.
 *
 * 2. Interactive (humans):
 *
 *      pnpm dlx tsx <base>/scripts/init.ts
 *
 *    Prompts for any flags not already passed. `--yes` still skips the final
 *    confirmation.
 */

import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import prompts from "prompts";

import { loadPresets, type PresetConfig } from "./lib/presets.ts";
import { copyTree } from "./lib/copy.ts";
import { slugify } from "./lib/prompts.ts";

const baseDir = resolve(fileURLToPath(import.meta.url), "..", "..");
const initialConfigDir = resolve(baseDir, "initial_config");

interface CliFlags {
  name: string | undefined;
  preset: string | undefined;
  dockerNamespace: string | undefined;
  repoName: string | undefined;
  yes: boolean;
  help: boolean;
}

function parseFlags(): CliFlags {
  const { values } = parseArgs({
    options: {
      name: { type: "string" },
      preset: { type: "string" },
      "docker-namespace": { type: "string" },
      "repo-name": { type: "string" },
      yes: { type: "boolean", short: "y", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
    allowPositionals: false,
  });
  return {
    name: values.name as string | undefined,
    preset: values.preset as string | undefined,
    dockerNamespace: values["docker-namespace"] as string | undefined,
    repoName: values["repo-name"] as string | undefined,
    yes: Boolean(values.yes),
    help: Boolean(values.help),
  };
}

const REPO_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

function validateRepoName(value: string): true | string {
  if (!REPO_NAME_PATTERN.test(value)) {
    return "Use letters, digits, hyphens, underscores, or periods. Must start with a letter or digit.";
  }
  return true;
}

function printUsage(presets: Record<string, PresetConfig>): void {
  const presetIds = Object.keys(presets).join(" | ");
  console.log(`
Project Initiation scaffolder

Usage:
  init.ts [options]

Options:
  --name <string>              Project name (human-readable). Required if non-interactive.
  --preset <id>                One of: ${presetIds}. Required if non-interactive.
  --docker-namespace <string>  Docker Hub namespace for image tags. Default: jdcb4.
  --repo-name <string>         GitHub repo name (case-preserving). Default: the lowercase slug.
                               Used for the GitHub Pages base URL — must match the actual repo name.
  --yes, -y                    Skip the final confirmation prompt.
  --help, -h                   Show this help.

Run with no flags for an interactive session (humans).
Pass all required flags for a non-interactive session (agents, CI).
`);
}

async function main(): Promise<void> {
  const flags = parseFlags();
  const presets = loadPresets(initialConfigDir);

  if (flags.help) {
    printUsage(presets);
    return;
  }

  const targetDir = process.cwd();
  const isTTY = Boolean(process.stdin.isTTY);

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

  const presetIds = Object.keys(presets);

  // Validate any pre-supplied preset against the registry.
  if (flags.preset && !presets[flags.preset]) {
    console.error(
      `Unknown preset: ${flags.preset}\nAvailable: ${presetIds.join(", ")}`,
    );
    process.exit(1);
  }

  // Non-interactive path: all required flags must be present.
  const missing: string[] = [];
  if (!flags.name) missing.push("--name");
  if (!flags.preset) missing.push("--preset");

  let projectName = flags.name?.trim();
  let presetId = flags.preset;
  let dockerNamespace = flags.dockerNamespace?.trim();
  let repoName = flags.repoName?.trim();

  if (repoName && validateRepoName(repoName) !== true) {
    console.error(`Invalid --repo-name: ${validateRepoName(repoName)}`);
    process.exit(1);
  }

  if (missing.length > 0) {
    if (!isTTY) {
      console.error(
        `Missing required flag(s): ${missing.join(", ")}\n` +
          `\nNon-interactive mode is required when stdin is not a TTY.\n` +
          `Re-run with all of:\n` +
          `  --name "<project name>"\n` +
          `  --preset <${presetIds.join(" | ")}>\n` +
          `  --docker-namespace <namespace>   (optional, default: jdcb4)\n` +
          `  --repo-name <name>               (optional, default: lowercase slug; must match real GitHub repo for Pages)\n` +
          `  --yes                            (optional, skips confirmation)\n`,
      );
      process.exit(2);
    }

    // Compute the suggested repo-name default once we know the project name.
    const slugSoFar = projectName ? slugify(projectName) : "";

    const answers = await prompts(
      [
        flags.name === undefined && {
          type: "text",
          name: "projectName",
          message: "Project name (human-readable):",
          validate: (value: string) =>
            value.trim().length >= 2 || "At least 2 characters",
        },
        flags.preset === undefined && {
          type: "select",
          name: "presetId",
          message: "Pick a preset:",
          choices: Object.entries(presets).map(([id, preset]) => ({
            title: id,
            description: preset.description,
            value: id,
          })),
        },
        flags.dockerNamespace === undefined && {
          type: "text",
          name: "dockerNamespace",
          message: "Docker Hub namespace (used for image tags):",
          initial: "jdcb4",
        },
        flags.repoName === undefined && {
          type: "text",
          name: "repoName",
          message:
            "GitHub repo name (case-preserving — must match the real repo for Pages):",
          initial: (_prev: unknown, values: prompts.Answers<string>) => {
            const fromName = values.projectName as string | undefined;
            return slugify((fromName ?? projectName ?? "") || slugSoFar);
          },
          validate: validateRepoName,
        },
      ].filter(Boolean) as prompts.PromptObject[],
      {
        onCancel: () => {
          console.log("\nAborted.");
          process.exit(1);
        },
      },
    );

    projectName = projectName ?? (answers.projectName as string).trim();
    presetId = presetId ?? (answers.presetId as string);
    dockerNamespace = dockerNamespace ?? (answers.dockerNamespace as string);
    repoName = repoName ?? (answers.repoName as string)?.trim();
  }

  // Default the docker namespace if it was never supplied.
  if (!dockerNamespace) dockerNamespace = "jdcb4";

  if (!projectName || projectName.length < 2) {
    console.error("Project name must be at least 2 characters.");
    process.exit(1);
  }

  const preset = presets[presetId!];
  if (!preset) {
    console.error(`Unknown preset: ${presetId}`);
    process.exit(1);
  }

  const projectSlug = slugify(projectName);
  // Default repoName to the slug when not supplied (e.g., non-interactive run
  // without --repo-name). Users with mixed-case GitHub repos must pass --repo-name.
  if (!repoName) repoName = projectSlug;

  const variables: Record<string, string> = {
    project_name: projectName,
    project_slug: projectSlug,
    repo_name: repoName,
    docker_namespace: dockerNamespace,
    preset_id: presetId!,
    preset_label: preset.vars.preset_label,
    deploy_targets: preset.vars.deploy_targets,
    year: String(new Date().getFullYear()),
  };

  // Confirmation: ask interactively unless --yes was passed.
  if (!flags.yes) {
    if (!isTTY) {
      console.error(
        "Non-interactive run requires --yes to confirm scaffolding.",
      );
      process.exit(2);
    }
    const ok = await prompts({
      type: "confirm",
      name: "ok",
      message: `Scaffold "${projectName}" using preset "${presetId}" into ${targetDir}?`,
      initial: true,
    });
    if (!ok.ok) {
      console.log("Aborted.");
      process.exit(1);
    }
  } else {
    console.log(
      `Scaffolding "${projectName}" using preset "${presetId}" into ${targetDir}.`,
    );
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
