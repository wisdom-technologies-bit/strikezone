/**
 * Lighthouse (mobile) on the pages that matter.
 *
 * Runs against an already-running server, prints the four category scores and
 * fails if performance is under 90 or accessibility is under 100.
 *
 * Usage: node scripts/lighthouse.mjs [baseUrl]
 * For /dev/ui the server must be started with GALLERY_PREVIEW=1, because the
 * gallery answers 404 in a normal production build.
 */
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const BASE = process.argv[2] ?? process.env.AUDIT_BASE ?? "http://127.0.0.1:3100";
const ROUTES = ["/", "/dev/ui"];
const THRESHOLDS = { performance: 90, accessibility: 100 };

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
});

let failed = false;

for (const route of ROUTES) {
  const result = await lighthouse(`${BASE}${route}`, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
  });

  if (!result) {
    console.error(`${route}: no result`);
    failed = true;
    continue;
  }

  const scores = result.lhr.categories;
  const line = Object.entries(scores)
    .map(([key, category]) => `${key} ${Math.round((category.score ?? 0) * 100)}`)
    .join("  ");

  const performance = Math.round((scores.performance?.score ?? 0) * 100);
  const accessibility = Math.round((scores.accessibility?.score ?? 0) * 100);
  const verdict =
    performance >= THRESHOLDS.performance && accessibility >= THRESHOLDS.accessibility
      ? "pass"
      : "FAIL";

  if (verdict === "FAIL") failed = true;
  console.log(`${route.padEnd(10)} ${line}   ${verdict}`);

  const failures = Object.values(result.lhr.audits)
    .filter(
      (audit) => audit.score !== null && audit.score < 1 && audit.scoreDisplayMode === "binary",
    )
    .map((audit) => audit.id);
  if (failures.length > 0) {
    console.log(`           failed audits: ${failures.join(", ")}`);
  }
}

await chrome.kill();

if (failed) {
  console.error(
    `\nBelow the bar: performance must be >= ${THRESHOLDS.performance} and accessibility ${THRESHOLDS.accessibility}.`,
  );
  process.exit(1);
}
console.log(`\nAll pages pass: performance >= ${THRESHOLDS.performance}, accessibility 100.`);
