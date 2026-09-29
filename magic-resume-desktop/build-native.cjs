const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const headers = process.env.NODE_INCLUDE_DIR || path.resolve(path.dirname(process.execPath), '../include/node');
if (!fs.existsSync(path.join(headers, 'node_api.h'))) throw new Error('Set NODE_INCLUDE_DIR to the directory containing node_api.h.');
const result = spawnSync('clang++', [
  '-std=c++17', '-fobjc-arc', '-shared', '-undefined', 'dynamic_lookup',
  `-I${headers}`, '-framework', 'AppKit', '-framework', 'QuartzCore',
  '-mmacosx-version-min=13.0', path.join(__dirname, 'native/glass.mm'),
  '-o', path.join(__dirname, 'native/glass.node'),
], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
