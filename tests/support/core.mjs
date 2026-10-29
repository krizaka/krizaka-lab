// The lab's pure logic (src/core) for the tests, compiled in memory from the sources: the lab is not a package
// (ADR-008 §6), so there is no dist/ to import.
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";

const result = await build({
  configFile: false,
  logLevel: "silent",
  build: {
    write: false,
    minify: false,
    lib: { entry: new URL("../../src/core/index.ts", import.meta.url).pathname, formats: ["es"], fileName: "core" },
  },
});
const output = (Array.isArray(result) ? result[0] : result).output[0].code;
const dir = mkdtempSync(join(tmpdir(), "kz-motion-core-"));
const file = join(dir, "core.mjs");
writeFileSync(file, output);
export const core = await import(pathToFileURL(file).href);
