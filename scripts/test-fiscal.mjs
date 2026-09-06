import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
const dir = await mkdtemp(join(tmpdir(), "hipotecalc-tests-"));
try {
  const outfile = join(dir, "fiscal.test.mjs");
  await build({
    entryPoints: ["tests/fiscal.test.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile,
    sourcemap: "inline",
  });
  const run = spawnSync(process.execPath, ["--test", outfile], {
    stdio: "inherit",
  });
  process.exitCode = run.status ?? 1;
} finally {
  await rm(dir, { recursive: true, force: true });
}
