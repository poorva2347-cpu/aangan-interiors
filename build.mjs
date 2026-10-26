// AANGAN build script — run after editing partials/ or data/projects.json:  node build.mjs
// 1. Syncs partials/header.html + footer.html into every page (between the header:start/end markers)
// 2. Regenerates data/projects.js from data/projects.json
// 3. Copies the finished site to dist/ for deployment
import { readFile, writeFile, mkdir, cp, rm, readdir } from "node:fs/promises";

const header = (await readFile("partials/header.html", "utf8")).trim();
const footer = (await readFile("partials/footer.html", "utf8")).trim();
const block = (name, html) => new RegExp(`(<!-- ${name}:start[^>]*-->)[\\s\\S]*?(<!-- ${name}:end -->)`);

const pages = (await readdir(".")).filter((f) => f.endsWith(".html"));
for (const file of pages) {
  let html = await readFile(file, "utf8");
  const page = html.match(/data-page="([^"]+)"/)?.[1];
  const h = page ? header.replaceAll(`data-nav="${page}"`, `data-nav="${page}" aria-current="page"`) : header;
  html = html.replace(block("header"), `$1\n${h}\n  $2`).replace(block("footer"), `$1\n${footer}\n  $2`);
  await writeFile(file, html);
}
console.log(`Synced header/footer into ${pages.length} pages`);

const { projects } = JSON.parse(await readFile("data/projects.json", "utf8"));
await writeFile("data/projects.js", `// Generated from data/projects.json — edit the JSON, then run: node build.mjs\nwindow.AANGAN_PROJECTS = ${JSON.stringify(projects, null, 2)};\n`);
console.log(`Generated data/projects.js (${projects.length} projects)`);

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const f of [...pages, "build.mjs"].filter((f) => f !== "build.mjs")) await cp(f, `dist/${f}`);
for (const dir of ["css", "js", "data", "assets"]) await cp(dir, `dist/${dir}`, { recursive: true });
console.log("Copied site to dist/ — deploy this folder.");
