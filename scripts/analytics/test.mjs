import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir = await mkdtemp(join(tmpdir(), 'hipotecalc-analytics-tests-'));
try {
  const outfile = join(dir, 'analytics.test.mjs');
  await build({entryPoints:['scripts/analytics/model.test.ts'],bundle:true,platform:'node',format:'esm',outfile});
  process.exitCode = spawnSync(process.execPath,['--test',outfile],{stdio:'inherit'}).status ?? 1;
} finally { await rm(dir,{recursive:true,force:true}); }
