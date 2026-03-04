import fs from "fs";
import path from "path";

const ANALYSIS_DIR = path.resolve("analysis");
const SRC_ROOT = path.resolve("src");

const movePlan = JSON.parse(fs.readFileSync(path.join(ANALYSIS_DIR, "move-plan.json"), "utf8"));
const importPlan = JSON.parse(fs.readFileSync(path.join(ANALYSIS_DIR, "import-rewrite-plan.json"), "utf8"));

function abs(p) {
  return path.join(SRC_ROOT, p);
}

function ensureDirExists(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function applyMoves() {
  console.log("Applying file renames/moves…");

  for (const entry of movePlan) {
    const fromAbs = abs(entry.from);
    const toAbs = abs(entry.to);

    if (!fs.existsSync(fromAbs)) {
      console.warn(`SKIP: Source missing: ${entry.from}`);
      continue;
    }

    if (fs.existsSync(toAbs)) {
      console.warn(`SKIP: Target already exists: ${entry.to}`);
      continue;
    }

    ensureDirExists(toAbs);
    fs.renameSync(fromAbs, toAbs);
    console.log(`RENAMED: ${entry.from} → ${entry.to}`);
  }
}

function applyImportRewrites() {
  console.log("\nRewriting imports…");

  for (const entry of importPlan) {
    const fileAbs = abs(entry.file);

    if (!fs.existsSync(fileAbs)) {
      console.warn(`SKIP: File missing: ${entry.file}`);
      continue;
    }

    let code = fs.readFileSync(fileAbs, "utf8");

    if (!code.includes(entry.old)) {
      console.warn(`SKIP: Import not found in ${entry.file}: ${entry.old}`);
      continue;
    }

    const backup = fileAbs + ".bak";
    fs.writeFileSync(backup, code, "utf8");

    const updated = code.replace(entry.old, entry.new);
    fs.writeFileSync(fileAbs, updated, "utf8");

    console.log(`UPDATED: ${entry.file}: ${entry.old} → ${entry.new}`);
  }
}

console.log("=== APPLYING ANALYZER PLAN ===");
applyMoves();
applyImportRewrites();
console.log("\nDONE. Backups created for all modified files.");
