import * as fs from 'fs';
import * as path from 'path';
import naturalCompare from 'string-natural-compare';

import { isString } from './typecheck';

export function safePath(target: string): string {
  return target.replace(/\\/g, '/').replace(/(?<![A-Z]):\/(?!\/)/, '://');
}

export function safeDirname(target: string): string {
  return path.dirname(safePath(target));
}
export function safePathJoin(...components: string[]): string {
  if (components.findIndex(component => !isString(component)) >= 0) {
    return '';
  }
  return safePath(path.join(...components));
}

export function getPathes(target: string): string[] {
  return fs.readdirSync(target).reduce((subpathes: string[], subpath) => {
    const fullPath = path.join(target, subpath);
    const isDirectory = fs.statSync(fullPath).isDirectory();
    return subpathes.concat(isDirectory ? getPathes(fullPath) : [fullPath]);
  }, []).sort(naturalCompare);
}
