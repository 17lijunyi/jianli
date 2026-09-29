// Format and size conversion only. Artwork is the user-approved ImageGen JL icon.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const sharp = require('../magic-resume/node_modules/sharp');

async function build() {
  const source = path.join(__dirname, 'branding/jianli-jl-fullbleed.png');
  const iconset = path.join(__dirname, 'app.iconset');
  const publicDir = path.resolve(__dirname, '../magic-resume/public');
  fs.mkdirSync(iconset, { recursive: true });
  for (const size of [16, 32, 128, 256, 512]) {
    for (const scale of [1, 2]) {
      const output = path.join(iconset, `icon_${size}x${size}${scale === 2 ? '@2x' : ''}.png`);
      await sharp(source).resize(size * scale, size * scale).png().toFile(output);
    }
  }
  execFileSync('iconutil', ['-c', 'icns', iconset, '-o', path.join(__dirname, 'app.icns')]);
  await sharp(source).resize(512, 512).png().toFile(path.join(publicDir, 'icon.png'));

  // ICO supports PNG image entries; keep alpha at all browser/favicon sizes.
  const sizes = [16, 32, 48, 256];
  const images = await Promise.all(sizes.map(size => sharp(source).resize(size, size).png().toBuffer()));
  const header = Buffer.alloc(6 + sizes.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((size, index) => {
    const entry = 6 + index * 16;
    header[entry] = header[entry + 1] = size === 256 ? 0 : size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(images[index].length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += images[index].length;
  });
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.concat([header, ...images]));
  console.log('JL icon converted to ICNS, 512px PNG and multi-size ICO.');
}
build().catch(error => { console.error(error); process.exitCode = 1; });
