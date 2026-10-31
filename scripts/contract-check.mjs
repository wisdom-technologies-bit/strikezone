/**
 * The contract is copied verbatim from the server. This check fails when the copy
 * drifts, so the two never disagree about a frame shape without someone noticing.
 *
 * It compares against the server's file when the server repo is next to this one
 * (or `STRIKEZONE_SERVER_CONTRACT` points at it). On a machine that only has this
 * repo, it says so and checks that the file is present, rather than failing the
 * build on an absence it cannot fix.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const localPath = join(root, "src/contract/contract.ts");

const candidates = [
  process.env.STRIKEZONE_SERVER_CONTRACT,
  join(root, "../strikezone-server/src/api/contract.ts"),
  join(root, "../../6ae3b551707ef780407c4b7b/work/strikezone-server/src/api/contract.ts"),
].filter((value) => typeof value === "string" && value.length > 0);

/** The web copy may carry a provenance header above the verbatim body. */
const bodyOf = (text) => {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let start = 0;
  while (start < lines.length && (lines[start].startsWith("//") || lines[start].trim() === "")) {
    start += 1;
  }
  return { header: lines.slice(0, start), body: lines.slice(start) };
};

const digest = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);

const local = bodyOf(await readFile(localPath, "utf8"));
const localDigest = digest(local.body.join("\n"));
console.log(`contract: ${localPath}`);
console.log(
  `contract: sha256 ${localDigest} (${local.body.length} body lines, ${local.header.length} header lines)`,
);

const serverPath = candidates.find((path) => existsSync(path));
if (!serverPath) {
  console.log(
    "contract: server copy not found beside this repo, so the byte comparison was skipped.",
  );
  console.log("contract: set STRIKEZONE_SERVER_CONTRACT to compare against it.");
  process.exit(0);
}

const server = bodyOf(await readFile(serverPath, "utf8"));
const serverDigest = digest(server.body.join("\n"));
if (serverDigest !== localDigest) {
  const localLines = local.body;
  const serverLines = server.body;
  const at = localLines.findIndex((line, index) => line !== serverLines[index]);
  const line = at === -1 ? Math.min(localLines.length, serverLines.length) : at + 1;
  console.error(`contract: drifted from ${serverPath} at line ${line}`);
  console.error(`contract: local  ${JSON.stringify(localLines[at] ?? "")}`);
  console.error(`contract: server ${JSON.stringify(serverLines[at] ?? "")}`);
  process.exit(1);
}

console.log(`contract: identical to ${serverPath}`);
