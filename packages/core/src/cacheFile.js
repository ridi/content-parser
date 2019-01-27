import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import sha1 from 'sha1';

import { isExists, isString } from './typecheck';
import Errors, { createError } from './errors';

export function getCachePath() {
  return path.join(os.tmpdir(), 'parser-cache');
}

function getCacheFilePath(key) {
  if (!isExists(key) || !isString(key)) {
    throw createError(Errors.EINVAL, 'key', 'key', key);
  }
  return path.join(getCachePath(), `${sha1(key)}.dat`);
}

export function removeCacheFile(key) {
  const filePath = getCacheFilePath(key);
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
}

export function readCacheFile(key) {
  const filePath = getCacheFilePath(key);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

export function writeCacheFile(key, message, reset = false) {
  const filePath = getCacheFilePath(key);
  const cachePath = path.dirname(filePath);
  if (reset) {
    removeCacheFile(key);
  }
  if (!fs.existsSync(cachePath)) {
    fs.mkdirpSync(cachePath);
  }
  fs.writeFileSync(filePath, message, { flag: 'a', encoding: 'binary' });
}
