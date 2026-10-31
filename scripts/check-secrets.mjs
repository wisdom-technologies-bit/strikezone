/**
 * Fails when a server-only secret is named outside a file that opens with
 * `import "server-only"`. Cheap, and it catches the mistake that matters.
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const SERVER_ONLY = ["SUPABASE_SERVICE_ROLE_KEY", "ADMIN_API_KEY", "RESULT_SIGNING_SECRET"];
const ROOT = "src";

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(ts|tsx)$/.test(entry.name)) yield path;
  }
}

const problems = [];
for await (const file of walk(ROOT)) {
  // The env module names the variables to read them; the guard covers the rest.
  if (file.endsWith("src/lib/server-env.ts")) continue;
  const text = await readFile(file, "utf8");
  for (const name of SERVER_ONLY) {
    if (!text.includes(name)) continue;
    if (!text.trimStart().startsWith('import "server-only"')) {
      problems.push(`${file} names ${name} without import "server-only"`);
    }
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("No server-only secret is reachable from a client module.");
