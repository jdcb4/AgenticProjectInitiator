import { mkdir, copyFile, readdir, readFile, writeFile, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const TEMPLATE_SUFFIX = ".tmpl";
const TEXT_EXTENSIONS = new Set([
  ".md",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".yml",
  ".yaml",
  ".html",
  ".css",
  ".toml",
  ".conf",
  ".sh",
  ".env",
  ".gitignore",
  ".editorconfig",
  ".nvmrc",
  ".npmrc",
  ".prettierrc",
  ".prettierignore",
  ".eslintrc",
  ".dockerignore",
  ".tmpl",
]);

function isTextFile(name: string): boolean {
  if (TEXT_EXTENSIONS.has(name)) return true;
  const dot = name.lastIndexOf(".");
  if (dot === -1) return false;
  return TEXT_EXTENSIONS.has(name.slice(dot));
}

function render(content: string, vars: Record<string, string>): string {
  return content.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_, key: string) => {
    if (key in vars) return vars[key]!;
    return `{{${key}}}`;
  });
}

function destFileName(srcName: string): string {
  if (srcName.endsWith(TEMPLATE_SUFFIX)) {
    return srcName.slice(0, -TEMPLATE_SUFFIX.length);
  }
  return srcName;
}

export async function copyTree(
  srcRoot: string,
  destRoot: string,
  vars: Record<string, string>,
): Promise<void> {
  await walk(srcRoot, srcRoot, destRoot, vars);
}

async function walk(
  rootSrc: string,
  currentSrc: string,
  destRoot: string,
  vars: Record<string, string>,
): Promise<void> {
  const entries = await readdir(currentSrc, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(currentSrc, entry.name);
    const rel = relative(rootSrc, srcPath);
    if (entry.isDirectory()) {
      await walk(rootSrc, srcPath, destRoot, vars);
      continue;
    }

    const destRel = applyDestNameTransform(rel);
    const destPath = join(destRoot, destRel);
    await mkdir(dirname(destPath), { recursive: true });

    const isTemplate = entry.name.endsWith(TEMPLATE_SUFFIX);
    if (isTemplate || isTextFile(entry.name)) {
      const content = await readFile(srcPath, "utf8");
      const rendered = isTemplate ? render(content, vars) : maybeRender(content, vars);
      await writeFile(destPath, rendered, "utf8");
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

function applyDestNameTransform(rel: string): string {
  // strip .tmpl from the basename only
  const slash = Math.max(rel.lastIndexOf("/"), rel.lastIndexOf("\\"));
  const dir = slash >= 0 ? rel.slice(0, slash + 1) : "";
  const base = slash >= 0 ? rel.slice(slash + 1) : rel;
  return dir + destFileName(base);
}

/**
 * Non-.tmpl text files are copied verbatim. We do not render variables in
 * regular files because that risks accidentally substituting curly-brace
 * patterns inside source code (e.g., JSX expressions).
 */
function maybeRender(content: string, _vars: Record<string, string>): string {
  return content;
}

// Convenience for tests
export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
