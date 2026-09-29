const path = require('node:path');
const { execFileSync } = require('node:child_process');
async function build() {
  const { packager } = await import('@electron/packager');
  const outputs = await packager({
    dir: __dirname, name: '简励', executableName: 'Jianli',
    platform: 'darwin', arch: 'arm64', out: path.join(__dirname, 'release'),
    appBundleId: 'local.magicresume.desktop', appVersion: '2.0.9',
    icon: path.join(__dirname, 'app.icns'), overwrite: true, asar: false,
    ignore: [/^\/(node_modules|\.npm-cache|release|tests|artifacts|backups|app\.iconset|branding)(\/|$)/, /^\/(build-runtime|build-native|build-icon|package)\.cjs$/],
    extendInfo: { CFBundleDisplayName: '简励', NSHighResolutionCapable: true, LSMinimumSystemVersion: '13.0' }
  });
  // Packager derives CFBundleDisplayName from executableName after extendInfo.
  // Keep the executable ASCII while Finder/Dock display the Chinese brand.
  for (const output of outputs) {
    execFileSync('plutil', ['-replace', 'CFBundleDisplayName', '-string', '简励', path.join(output, '简励.app/Contents/Info.plist')]);
  }
  console.log(outputs.join('\n'));
}
build().catch(error => { console.error(error); process.exit(1); });
