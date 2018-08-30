import fs from 'fs';
import path from 'path';

import { isExists } from './typecheck';

const tildeError = '\'~/\' was recognized as a directory name. '
  + 'If you want the correct behavior, should use \'process.env.HOME\'.';

export function createDirectory(target) {
  const result = path.parse(target);
  const components = target.split(path.sep);
  let current = '';
  if (isExists(result.root) && result.root.length > 0) {
    current = result.root;
  }
  if (target.startsWith('~')) {
    // eslint-disable-next-line no-console
    console.error(tildeError);
  }
  for (let idx = current.length > 0 ? 1 : 0; idx < components.length; idx += 1) {
    current = path.join(current, components[idx]);
    if (!fs.existsSync(current)) {
      fs.mkdirSync(current);
    }
  }
}

export function removeDirectory(target) {
  if (fs.existsSync(target) && fs.lstatSync(target).isDirectory()) {
    if (target.startsWith('~')) {
      // eslint-disable-next-line no-console
      console.error(tildeError);
    }
    fs.readdirSync(target).forEach((subpath) => {
      const current = path.join(target, subpath);
      if (fs.lstatSync(current).isDirectory()) {
        removeDirectory(current);
      } else {
        fs.unlinkSync(current);
      }
    });
    fs.rmdirSync(target);
  }
}
