import naturalCompare from "string-natural-compare";

import fs from "fs";
import path from "path";

import { isString } from "./typecheck";

export function safePath(target: string) {
  return target.replace(/\\/g, "/").replace(/(?<![A-Z]):\/(?!\/)/, "://");
}

export function safeDirname(target: string) {
  return path.dirname(safePath(target));
}

export function safePathJoin(...components: string[]) {
  if (components.findIndex((component) => !isString(component)) >= 0) {
    return "";
  }
  return safePath(path.join(...components));
}

export function getPathes(target: string): string[] {
  return fs
    .readdirSync(target)
    .reduce<string[]>((subpathes, subpath) => {
      const fullPath = path.join(target, subpath);
      const isDirectory = fs.statSync(fullPath).isDirectory();
      return subpathes.concat(isDirectory ? getPathes(fullPath) : [fullPath]);
    }, [])
    .sort(naturalCompare);
}
