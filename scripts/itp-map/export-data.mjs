import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
const temp = await mkdtemp(join(tmpdir(), "hipotecalc-map-"));
try {
  const out = join(temp, "case.mjs");
  await build({
    entryPoints: [fileURLToPath(new URL("./case.ts", import.meta.url))],
    outfile: out,
    bundle: true,
    platform: "node",
    format: "esm",
  });
  const { mapData } = await import(pathToFileURL(out).href);
  process.stdout.write(JSON.stringify(mapData()));
} finally {
  await rm(temp, { recursive: true, force: true });
}
