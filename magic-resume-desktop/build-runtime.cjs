const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const upstream = path.resolve(__dirname, '../magic-resume');
const requireUpstream = createRequire(path.join(upstream, 'package.json'));
const esbuild = requireUpstream(requireUpstream.resolve('esbuild', { paths: [requireUpstream.resolve('vite')] }));
async function build() {
  let source = fs.readFileSync(path.join(upstream, 'server.mjs'), 'utf8');
  source = source.replace('console.log(`Server running at http://${host}:${port}`);', 'console.log(`Server running at http://${host}:${port}`); process.parentPort?.postMessage({type: "ready"});');
  const runtime = path.join(__dirname, 'runtime');
  fs.mkdirSync(runtime, { recursive: true });
  await esbuild.build({
    stdin: { contents: source, sourcefile: 'desktop-server.mjs', resolveDir: upstream },
    bundle: true, platform: 'node', format: 'esm', target: 'node22',
    outfile: path.join(runtime, 'server.mjs'),
    define: { 'process.env.NODE_ENV': '"production"' },
    banner: { js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);' },
    logOverride: { 'ignored-bare-import': 'silent' }, logLevel: 'warning'
  });
  const clientOutput = path.join(runtime, 'dist/client');
  fs.rmSync(clientOutput, { recursive: true, force: true });
  fs.cpSync(path.join(upstream, 'dist/client'), clientOutput, { recursive: true });
  fs.copyFileSync(path.join(upstream, 'LICENSE'), path.join(__dirname, 'LICENSE.upstream'));
  console.log('Standalone runtime ready.');
}
build().catch(error => { console.error(error); process.exit(1); });
