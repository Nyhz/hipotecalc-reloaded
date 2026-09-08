import {build} from 'esbuild';
import sharp from 'sharp';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const temp=await mkdtemp(join(tmpdir(),'ihec-assets-'));
try {
  await build({entryPoints:['src/analytics/images.ts','src/analytics/model.ts'],bundle:true,platform:'node',format:'esm',outdir:temp,outExtension:{'.js':'.mjs'}});
  const {chartSVG}=await import(pathToFileURL(join(temp,'images.mjs')));
  const {versions,completeQuarters}=await import(pathToFileURL(join(temp,'model.mjs')));
  let count=0;
  for(const source of Object.values(versions)) for(const lang of ['es','en']) {
    const directory=`public/img/analytics/${source.version}/${lang}`;
    await mkdir(directory,{recursive:true});
    for(const q of completeQuarters(source)) {
      const svg=chartSVG(q,lang,source), stem=`${directory}/${q.toLowerCase()}`;
      await writeFile(stem+'.svg',svg);
      await sharp(Buffer.from(svg)).png().toFile(stem+'.png');
      for(const width of [800,1200]) await sharp(Buffer.from(svg)).resize(width).webp({quality:85}).toFile(`${stem}-${width}.webp`);
      count++;
    }
  }
  console.log(`Generated ${count} versioned charts, PNG + SVG + responsive WebP.`);
} finally {await rm(temp,{recursive:true,force:true});}
