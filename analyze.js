// analyze.js (ESM)
// Plan-only analyzer for sound-lab.
//
// - Builds a dependency graph from src/app/main.js
// - Detects unused files and unused exports (coarse but safe)
// - Applies explicit file/module rename rules
// - Generates:
//     analysis/rename-plan.json
//     analysis/move-plan.json
//     analysis/import-rewrite-plan.json
//     analysis/delete-plan.json
// - Refuses to run if any of those files already exist
// - DOES NOT modify any source files.

import fs from "fs";
import path from "path";
import * as acorn from "acorn";
import * as walk from "acorn-walk";


const PROJECT_ROOT = process.cwd();
const SRC_ROOT = path.resolve(PROJECT_ROOT, "src");
const ANALYSIS_DIR = path.resolve(PROJECT_ROOT, "analysis");

const RENAME_PLAN_PATH = path.join(ANALYSIS_DIR, "rename-plan.json");
const MOVE_PLAN_PATH = path.join(ANALYSIS_DIR, "move-plan.json");
const IMPORT_REWRITE_PLAN_PATH = path.join(
  ANALYSIS_DIR,
  "import-rewrite-plan.json"
);
const DELETE_PLAN_PATH = path.join(ANALYSIS_DIR, "delete-plan.json");

const ENTRY_POINT = path.join(SRC_ROOT, "app", "main.js");

// ---------- helpers ----------

function ensureAnalysisDirEmptyOrExit() {
  if (!fs.existsSync(ANALYSIS_DIR)) {
    fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
    return;
  }

  const existing = [];
  if (fs.existsSync(RENAME_PLAN_PATH)) existing.push("rename-plan.json");
  if (fs.existsSync(MOVE_PLAN_PATH)) existing.push("move-plan.json");
  if (fs.existsSync(IMPORT_REWRITE_PLAN_PATH))
    existing.push("import-rewrite-plan.json");
  if (fs.existsSync(DELETE_PLAN_PATH)) existing.push("delete-plan.json");

  if (existing.length > 0) {
    console.error(
      `Refusing to run: the following files already exist in /analysis/: ${existing.join(
        ", "
      )}`
    );
    console.error("Delete or move them, then run this script again.");
    process.exit(1);
  }
}

function walkJsFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJsFiles(full, acc);
    } else if (entry.isFile() && full.endsWith(".js")) {
      acc.push(full);
    }
  }
  return acc;
}

function toSrcRelative(p) {
  return path.relative(SRC_ROOT, p).split(path.sep).join("/");
}

function normalizeImportPath(fromFileAbs, toFileAbs) {
  const fromDir = path.dirname(fromFileAbs);
  let rel = path.relative(fromDir, toFileAbs).split(path.sep).join("/");
  if (!rel.startsWith(".")) {
    rel = "./" + rel;
  }
  return rel;
}

function parseJs(code, filePath) {
  return acorn.parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    locations: false,
    allowHashBang: true,
  });
}

// ---------- analysis: imports/exports & dependency graph ----------

function analyzeFiles(jsFiles) {
  const importsByFile = new Map(); // fileAbs -> [{specifier, isExportFrom}]
  const exportsByFile = new Map(); // fileAbs -> { named: Set, hasDefault: bool }
  const graph = new Map(); // fileAbs -> Set<importedFileAbs>

  for (const file of jsFiles) {
    const code = fs.readFileSync(file, "utf8");
    let ast;
    try {
      ast = parseJs(code, file);
    } catch (e) {
      console.error(`Failed to parse ${file}:`, e.message);
      continue;
    }

    const fileImports = [];
    const fileExports = { named: new Set(), hasDefault: false };
    const deps = new Set();

    walk.simple(ast, {
      ImportDeclaration(node) {
        if (node.source && typeof node.source.value === "string") {
          fileImports.push({ specifier: node.source.value, isExportFrom: false });
        }
      },
      ExportNamedDeclaration(node) {
        if (node.source && typeof node.source.value === "string") {
          fileImports.push({ specifier: node.source.value, isExportFrom: true });
        }
        if (node.declaration) {
          if (node.declaration.id && node.declaration.id.name) {
            fileExports.named.add(node.declaration.id.name);
          } else if (node.declaration.declarations) {
            for (const d of node.declaration.declarations) {
              if (d.id && d.id.name) {
                fileExports.named.add(d.id.name);
              }
            }
          }
        }
        if (node.specifiers) {
          for (const s of node.specifiers) {
            if (s.exported && s.exported.name) {
              fileExports.named.add(s.exported.name);
            }
          }
        }
      },
      ExportDefaultDeclaration() {
        fileExports.hasDefault = true;
      },
    });

    // resolve relative imports into graph
    for (const imp of fileImports) {
      const spec = imp.specifier;
      if (!spec.startsWith(".")) continue; // only relative
      const resolved = path.resolve(path.dirname(file), spec);
      deps.add(resolved);
    }

    importsByFile.set(file, fileImports);
    exportsByFile.set(file, fileExports);
    graph.set(file, deps);
  }

  return { importsByFile, exportsByFile, graph };
}

// ---------- reachability & unused files/exports ----------

function computeReachable(graph) {
  const reachable = new Set();
  const stack = [];

  if (fs.existsSync(ENTRY_POINT)) {
    stack.push(ENTRY_POINT);
  } else {
    console.error(`Entry point not found: ${ENTRY_POINT}`);
    process.exit(1);
  }

  while (stack.length > 0) {
    const file = stack.pop();
    if (reachable.has(file)) continue;
    reachable.add(file);
    const deps = graph.get(file);
    if (!deps) continue;
    for (const dep of deps) {
      if (graph.has(dep)) {
        stack.push(dep);
      }
    }
  }

  return reachable;
}

function computeUnusedFiles(jsFiles, reachable) {
  const unused = [];
  for (const file of jsFiles) {
    if (!reachable.has(file)) {
      unused.push(file);
    }
  }
  return unused;
}

function computeUnusedExports(exportsByFile, importsByFile) {
  const importedNamesByFile = new Map(); // fileAbs -> Set<"*">

  for (const [file, imports] of importsByFile.entries()) {
    const fromDir = path.dirname(file);
    for (const imp of imports) {
      const spec = imp.specifier;
      if (!spec.startsWith(".")) continue;
      const resolved = path.resolve(fromDir, spec);
      let set = importedNamesByFile.get(resolved);
      if (!set) {
        set = new Set();
        importedNamesByFile.set(resolved, set);
      }
      set.add("*");
    }
  }

  const unusedExports = [];

  for (const [file, exp] of exportsByFile.entries()) {
    const importedNames = importedNamesByFile.get(file) || new Set();
    if (exp.named.size === 0 && !exp.hasDefault) continue;

    if (importedNames.size === 0) {
      if (exp.named.size > 0) {
        unusedExports.push({
          file: toSrcRelative(file),
          exports: Array.from(exp.named),
        });
      }
      if (exp.hasDefault) {
        unusedExports.push({
          file: toSrcRelative(file),
          exports: ["default"],
        });
      }
    }
  }

  return unusedExports;
}

// ---------- rename rules ----------

// Map of src-relative path -> new file name (same directory)
const FILE_RENAME_RULES = new Map([
  // App UI bootstrap
  ["app/ui/index.js", "uiBootstrap.js"],

  // Engine spec
  ["engine/spec/index.js", "engineSpec.js"],

  // Engine setters folder index
  ["engine/setters/index.js", "engineSetters.js"],

  // Engine state
  ["engine/state/generateDefaultState.js", "generateDefaultEngineState.js"],
  ["engine/state/loadVersionedDefaults.js", "loadVersionedEngineDefaults.js"],

  // Engine settings
  ["engine/settings/defaultSettings.js", "defaultEngineSettings.js"],
  ["engine/settings/loadSettings.js", "loadEngineSettings.js"],
  ["engine/settings/saveSettings.js", "saveEngineSettings.js"],
  ["engine/settings/SettingsStore.js", "EngineSettingsStore.js"],
  ["engine/settings/validateSettings.js", "validateEngineSettings.js"],

  // Engine utils
  ["engine/utils.js", "engineUtils.js"],

  // Engine setters
  ["engine/setters/setParms.js", "setEngineParams.js"],

  // UI runtime
  ["ui/dirty.js", "markUIAsDirty.js"],
  ["ui/scheduleRender.js", "scheduleUIRender.js"],
  ["ui/renderUIFromState.js", "renderUIFromEngineState.js"],

  // UI settings
  ["ui/settings/SettingsPanel.js", "UISettingsPanel.js"],
  ["ui/settings/settingsPanelAPI.js", "uiSettingsPanelAPI.js"],
]);

function buildFileRenameAndMovePlans(jsFiles) {
  const renameEntries = [];
  const moveEntries = [];
  const renameMapAbs = new Map(); // oldAbs -> newAbs

  for (const file of jsFiles) {
    const rel = toSrcRelative(file);
    const newName = FILE_RENAME_RULES.get(rel);
    if (!newName) continue;

    const dir = path.dirname(file);
    const newAbs = path.join(dir, newName);

    renameEntries.push({
      file: rel,
      newName,
    });

    moveEntries.push({
      from: rel,
      to: toSrcRelative(newAbs),
    });

    renameMapAbs.set(path.resolve(file), path.resolve(newAbs));
  }

  return { renameEntries, moveEntries, renameMapAbs };
}

// ---------- import rewrite plan ----------

function buildImportRewritePlan(jsFiles, importsByFile, renameMapAbs) {
  const plan = [];

  for (const file of jsFiles) {
    const imports = importsByFile.get(file) || [];
    const fromDir = path.dirname(file);

    for (const imp of imports) {
      const spec = imp.specifier;
      if (!spec.startsWith(".")) continue;

      const resolved = path.resolve(fromDir, spec);
      const newTargetAbs = renameMapAbs.get(path.resolve(resolved));
      if (!newTargetAbs) continue;

      const newSpec = normalizeImportPath(file, newTargetAbs);

      if (newSpec !== spec) {
        plan.push({
          file: toSrcRelative(file),
          old: spec,
          new: newSpec,
        });
      }
    }
  }

  return plan;
}

// ---------- delete plan ----------

function buildDeletePlan(unusedFiles, unusedExports) {
  const files = unusedFiles.map((f) => toSrcRelative(f));

  const extraFiles = [];
  const engineSettersTxt = path.join(
    SRC_ROOT,
    "engine",
    "setters",
    "moduleSetters.js.txt"
  );
  if (fs.existsSync(engineSettersTxt)) {
    extraFiles.push(toSrcRelative(engineSettersTxt));
  }

  return {
    unusedFiles: files,
    unusedExports,
    extraFiles,
  };
}

// ---------- main ----------

function main() {
  ensureAnalysisDirEmptyOrExit();

  if (!fs.existsSync(SRC_ROOT)) {
    console.error(`src/ directory not found at ${SRC_ROOT}`);
    process.exit(1);
  }

  const jsFiles = walkJsFiles(SRC_ROOT);

  const { importsByFile, exportsByFile, graph } = analyzeFiles(jsFiles);
  const reachable = computeReachable(graph);
  const unusedFiles = computeUnusedFiles(jsFiles, reachable);
  const unusedExports = computeUnusedExports(exportsByFile, importsByFile);

  const { renameEntries, moveEntries, renameMapAbs } =
    buildFileRenameAndMovePlans(jsFiles);

  const importRewritePlan = buildImportRewritePlan(
    jsFiles,
    importsByFile,
    renameMapAbs
  );

  const deletePlan = buildDeletePlan(unusedFiles, unusedExports);

  const renamePlan = {
    files: renameEntries,
    functions: [], // placeholder for future function-level renames
  };

  fs.writeFileSync(
    RENAME_PLAN_PATH,
    JSON.stringify(renamePlan, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    MOVE_PLAN_PATH,
    JSON.stringify(moveEntries, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    IMPORT_REWRITE_PLAN_PATH,
    JSON.stringify(importRewritePlan, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    DELETE_PLAN_PATH,
    JSON.stringify(deletePlan, null, 2),
    "utf8"
  );

  console.log("Analysis complete. Plans written to /analysis/:");
  console.log(" - rename-plan.json");
  console.log(" - move-plan.json");
  console.log(" - import-rewrite-plan.json");
  console.log(" - delete-plan.json");
}

main();
