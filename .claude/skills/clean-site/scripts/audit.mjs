/**
 * Responsive + type/color audit for any website.
 *
 * For each page and screen width it saves a full-page screenshot and prints:
 *   - sideways scroll (and which elements stick out)
 *   - where the first heading of the main content lands (is the work above the fold?)
 *   - whether the footer floats above the bottom of a tall screen
 *   - every font family, size/weight combo and text color in use
 *
 * Usage (run from the project folder, so Playwright resolves from its node_modules):
 *   node <path-to-skill>/scripts/audit.mjs --url http://localhost:3000 \
 *     --paths /,/about --widths 1920,1440,1280,1024,820,390 --out ./audit
 *
 * Options:
 *   --url      base URL (required)
 *   --paths    comma-separated paths (default "/")
 *   --widths   comma-separated viewport widths (default 1920,1440,1280,1024,820,390)
 *   --out      folder for screenshots (default ./audit)
 *   --fold     selector for "the first piece of work" to measure (default "main h2")
 * Env:
 *   CHROMIUM_PATH   use an existing Chrome/Chromium instead of Playwright's download
 *   HTTPS_PROXY     route through a proxy (needed for external sites in some sandboxes)
 */
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const require = createRequire(process.cwd() + "/");
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  console.error("✗ Playwright not found. Run `npm i -D playwright` in this project, then try again.");
  process.exit(1);
}

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
if (!args.url) {
  console.error("✗ Pass --url, e.g. --url http://localhost:3000");
  process.exit(1);
}
const paths = (args.paths ?? "/").split(",");
const widths = (args.widths ?? "1920,1440,1280,1024,820,390").split(",").map(Number);
const out = args.out ?? "./audit";
const foldSel = args.fold ?? "main h2";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  ...(process.env.HTTPS_PROXY && !args.url.includes("localhost") ? { proxy: { server: process.env.HTTPS_PROXY } } : {}),
});

const problems = [];
const inventory = { fam: {}, size: {}, color: {} };

for (const path of paths) {
  for (const w of widths) {
    const h = w >= 1600 ? 1190 : w >= 1200 ? 900 : w >= 700 ? 1100 : 844; // typical screen heights
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(args.url + path, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(800);
    // scroll through once so lazy images load
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += 600) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);

    const m = await page.evaluate((foldSel) => {
      const vw = innerWidth;
      const vh = innerHeight;
      const doc = document.documentElement;
      const sticksOut = [...document.querySelectorAll("body *")]
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && (r.right > vw + 1 || r.left < -1) && getComputedStyle(e).position !== "fixed";
        })
        .filter((e) => !e.parentElement || getComputedStyle(e.parentElement).overflowX === "visible")
        .slice(0, 3)
        .map((e) => `<${e.tagName.toLowerCase()} class="${String(e.className).slice(0, 40)}">`);
      const fold = document.querySelector(foldSel);
      const footer = document.querySelector("footer");
      const fam = {}, size = {}, color = {};
      for (const e of document.querySelectorAll("body *")) {
        if (!e.offsetParent || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
        const cs = getComputedStyle(e);
        const f = cs.fontFamily.split(",")[0].replaceAll('"', "").trim();
        fam[f] = (fam[f] || 0) + 1;
        size[`${f} ${cs.fontSize}/${cs.fontWeight}`] = (size[`${f} ${cs.fontSize}/${cs.fontWeight}`] || 0) + 1;
        color[cs.color] = (color[cs.color] || 0) + 1;
      }
      return {
        sideways: doc.scrollWidth > vw,
        sticksOut,
        foldTop: fold ? Math.round(fold.getBoundingClientRect().top) : null,
        vh,
        footerGap: footer && doc.scrollHeight <= vh ? Math.round(vh - footer.getBoundingClientRect().bottom) : 0,
        fam, size, color,
      };
    }, foldSel);

    const tag = `${path} @${w}`;
    const notes = [];
    if (m.sideways) notes.push(`scrolls sideways (${m.sticksOut.join(", ") || "unknown element"})`);
    if (m.foldTop !== null && w >= 1024 && m.foldTop > m.vh) notes.push(`first work (${foldSel}) starts at ${m.foldTop}px, below the ${m.vh}px screen`);
    if (m.footerGap > 24) notes.push(`footer floats ${m.footerGap}px above the bottom of the screen`);
    notes.forEach((n) => problems.push(`${tag}: ${n}`));
    console.log(`${notes.length ? "✗" : "✓"} ${tag}${m.foldTop !== null ? `  first work at ${m.foldTop}px` : ""}`);

    for (const k of ["fam", "size", "color"]) for (const [key, n] of Object.entries(m[k])) inventory[k][key] = (inventory[k][key] || 0) + n;
    const name = `${path === "/" ? "home" : path.replace(/\//g, "_").replace(/^_/, "")}-${w}.png`;
    await page.screenshot({ path: `${out}/${name}`, fullPage: true });
    await page.close();
  }
}
await browser.close();

const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).map(([k, n]) => `  ${k}  ×${n}`).join("\n");
console.log(`\nFont families (${Object.keys(inventory.fam).length}):\n${top(inventory.fam)}`);
console.log(`\nSize/weight combos (${Object.keys(inventory.size).length}):\n${top(inventory.size)}`);
console.log(`\nText colors (${Object.keys(inventory.color).length}):\n${top(inventory.color)}`);
console.log(problems.length ? `\nProblems (${problems.length}):\n  ${problems.join("\n  ")}` : "\nNo layout problems found.");
console.log(`\nScreenshots saved to ${out}/`);
