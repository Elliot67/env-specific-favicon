import fs from 'fs-extra';
import { r, log } from './utils';

export async function writeStaticAssets(): Promise<void> {
  const assetNames = ['icon-128.png', 'icon-512.png', 'icon.svg'];
  const outputDir = r('extension/assets');

  if (!fs.existsSync(outputDir)) {
    await fs.mkdir(outputDir);
  }

  const promises = assetNames.map((name) => fs.copyFile(r(`src/assets/static/${name}`), `${outputDir}/${name}`));
  await Promise.all(promises);

  log('PRE', 'write static assets : ' + assetNames.join(', '));
}

writeStaticAssets();
