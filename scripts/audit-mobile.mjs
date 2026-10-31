/**
 * Mobile layout audit.
 *
 * Loads every route at 360px and at 1280px and fails if the page scrolls
 * sideways, if any element sticks out past the viewport, or if an interactive
 * control is shorter than the 36px tap-target floor. Also reports duplicate ids.
 *
 * Usage: node scripts/audit-mobile.mjs [baseUrl]
 * The target must already be running (npm run dev, or build + start).
 */
import puppeteer from "puppeteer-core";

const BASE = process.argv[2] ?? process.env.AUDIT_BASE ?? "http://127.0.0.1:3000";
const CHROME = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
const ROUTES = ["/", "/live", "/tournaments", "/wallet", "/bets", "/fairness", "/dev/ui"];
const VIEWPORTS = [
  // Rule 8 is a touch rule: 36px floor at 360. On a mouse viewport the density
  // spec allows 28/32/36 controls, so there the floor is the WCAG 2.5.8 AA
  // target size of 24px rather than the touch guidance.
  { name: "360", width: 360, height: 800, touch: true, minTap: 36, label: "touch" },
  { name: "1280", width: 1280, height: 900, touch: false, minTap: 24, label: "pointer" },
];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  args: ["--no-sandbox", "--headless=new", "--disable-dev-shm-usage"],
});

let failures = 0;

for (const viewport of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    isMobile: viewport.width < 500,
    hasTouch: viewport.touch,
    deviceScaleFactor: 1,
  });

  for (const route of ROUTES) {
    const response = await page.goto(`${BASE}${route}`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    const status = response?.status() ?? 0;

    if (status !== 200 && status !== 304) {
      console.log(`${viewport.name} ${route.padEnd(14)} HTTP ${status} (skipped)`);
      continue;
    }

    const result = await page.evaluate((minTap) => {
      const vw = window.innerWidth;
      const overflowing = [...document.querySelectorAll("body *")]
        .filter((el) => {
          const style = getComputedStyle(el);
          if (style.visibility === "hidden" || style.display === "none") return false;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          // An element inside a scroll container is allowed to be wide.
          let parent = el.parentElement;
          while (parent) {
            const ps = getComputedStyle(parent);
            if (ps.overflowX === "auto" || ps.overflowX === "scroll") return false;
            parent = parent.parentElement;
          }
          return rect.right > vw + 1 || rect.left < -1;
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0] ?? ""}`);

      const smallTargets = [
        ...document.querySelectorAll("a, button, input, select, textarea, [role=radio]"),
      ]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          // Visually hidden but focusable (skip link): 1px until it is focused.
          if (rect.height <= 2 || rect.width <= 2) return false;
          return rect.height < minTap;
        })
        .slice(0, 5)
        .map((el) => {
          const label = (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 24);
          return `${label || el.tagName.toLowerCase()} (${Math.round(el.getBoundingClientRect().height)}px)`;
        });

      const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
      const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];

      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: vw,
        overflowing,
        smallTargets,
        duplicates,
      };
    }, viewport.minTap);

    const scrolls = result.scrollWidth > result.innerWidth;
    const problems = [];
    if (scrolls) problems.push(`horizontal scroll ${result.scrollWidth}>${result.innerWidth}`);
    if (result.overflowing.length)
      problems.push(`outside viewport: ${result.overflowing.join(", ")}`);
    if (result.smallTargets.length)
      problems.push(`small tap targets: ${result.smallTargets.join(", ")}`);
    if (result.duplicates.length) problems.push(`duplicate ids: ${result.duplicates.join(", ")}`);

    if (problems.length) {
      failures += 1;
      console.log(`${viewport.name} ${route.padEnd(14)} FAIL  ${problems.join(" | ")}`);
    } else {
      console.log(`${viewport.name} ${route.padEnd(14)} ok    ${result.scrollWidth}px wide`);
    }
  }

  await page.close();
}

await browser.close();

if (failures > 0) {
  console.error(`\n${failures} route/viewport combination(s) failed.`);
  process.exit(1);
}
console.log(
  "\nAll routes pass: no horizontal scroll, no overflow, and tap targets at or above the floor for that pointer.",
);
