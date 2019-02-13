import fs from 'fs';
import path from 'path';
import naturalCompare from 'string-natural-compare';

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
  return fs.readdirSync(target).reduce((subpathes, subpath) => {
    const fullPath = path.join(target, subpath);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    return subpathes.concat(isDirectory ? getPathes(fullPath) : [fullPath]);
  }, []).sort(naturalCompare);
}
