import fs from 'fs';
import { orderBy } from 'natural-orderby';
import path from 'path';

import { isString } from './typecheck';

export function safePath(target) {
  return target.replace(/\\/g, '/');
}

export function safeDirname(target) {
  return path.dirname(safePath(target));
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
