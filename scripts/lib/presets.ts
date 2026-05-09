import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface PresetConfig {
  description: string;
  shared: boolean;
  source: string;
  vars: {
    preset_label: string;
    preset_id: string;
    deploy_targets: string;
  };
}

interface PresetsFile {
  presets: Record<string, PresetConfig>;
  templateExtension: string;
  variables: string[];
}

export function loadPresets(initialConfigDir: string): Record<string, PresetConfig> {
  const path = resolve(initialConfigDir, "presets.json");
  const raw = readFileSync(path, "utf8");
  const parsed = JSON.parse(raw) as PresetsFile;
  return parsed.presets;
}
