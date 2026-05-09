import prompts from "prompts";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function confirmDestination(
  targetDir: string,
  projectName: string,
  presetId: string,
): Promise<boolean> {
  const answer = await prompts({
    type: "confirm",
    name: "ok",
    message: `Scaffold "${projectName}" using preset "${presetId}" into ${targetDir}?`,
    initial: true,
  });
  return answer.ok === true;
}
