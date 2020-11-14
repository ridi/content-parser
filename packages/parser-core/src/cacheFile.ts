import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';

import { isExists, isString } from './typecheck';
import Errors, { createError } from './errors';

const sha256 = (key: string): string => {
  return crypto.createHash('sha256').update(key).digest('base64');
}

/**
 * Get path to store cache
 */
export function getCachePath(): string {
  return path.join(os.tmpdir(), 'parser-cache');
}

/**
 * Get a path to a stored cache
 */
function getCacheFilePath(key: string): string {
  if (!isExists(key) || !isString(key)) {
    throw createError(Errors.EINVAL, 'key', 'key', key);
  }
  return path.join(getCachePath(), `${sha256(key)}.dat`);
}

/**
 * Remove the cache file with a key
 */
export function removeCacheFile(key: string): void {
  const filePath = getCacheFilePath(key);
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
}
/**
 * Remove every cache file
 * @returns {void}
 */
export function removeAllCacheFiles(): void {
  const cachePath = getCachePath();
  if (fs.existsSync(cachePath)) {
    fs.removeSync(cachePath);
  }
}

/**
 * Read the cache file with a key
 */
export function readCacheFile(key: string): string | null {
  const filePath = getCacheFilePath(key);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

/**
 * Write cache file
 */
export function writeCacheFile(key: string, message: string, overwrite = false): void {
  const filePath = getCacheFilePath(key);
  const cachePath = path.dirname(filePath);
  if (!fs.existsSync(cachePath)) {
    fs.mkdirpSync(cachePath);
  }
  fs.writeFileSync(filePath, message, { flag: overwrite ? 'w' : 'a', encoding: 'utf8' });
}
