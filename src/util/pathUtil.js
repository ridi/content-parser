import { orderBy } from 'natural-orderby';
import fs from 'fs';
import path from 'path';

import { isString } from './typecheck';

export function safePath(target) {
  const sep = process.platform === 'win32' ? `${path.sep}${path.sep}` : path.sep;
  return target.replace(new RegExp(sep, 'g'), '/');
}

export function safePathNormalize(target) {
  return path.normalize(target);
}

export function safeDirname(target) {
  return safePath(path.dirname(target));
}

export function safePathJoin(...components) {
  if (components.findIndex(component => !isString(component)) >= 0) {
    return '';
  }
  return safePath(path.join(...components));
}

export function getPathes(target) {
  return orderBy(fs.readdirSync(target).reduce((subpathes, subpath) => {
    const fullPath = path.join(target, subpath);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    return subpathes.concat(isDirectory ? getPathes(fullPath) : [fullPath]);
  }, []));
}
