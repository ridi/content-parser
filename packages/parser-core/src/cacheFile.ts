import * as fs from "fs-extra";
import sha1 from "sha1";

import os from "os";
import path from "path";

import Errors, { createError } from "./errors";
import { isExists, isString } from "./typecheck";

/**
 * Get path to store cache
 * @returns {string} Path of a temp directory
 */
export function getCachePath() {
  return path.join(os.tmpdir(), "parser-cache");
}

/**
 * Get a path to a stored cache
 * @param {string} key Key of a cache file
 * @returns {string} Path to a cache file
 */
function getCacheFilePath(key: string) {
  if (!isExists(key) || !isString(key)) {
    throw createError(Errors.EINVAL, "key", "key", key);
  }
  return path.join(getCachePath(), `${sha1(key)}.dat`);
}

/**
 * Remove the cache file with a key
 * @param {string} key Key of a cache file
 * @returns {void}
 */
export function removeCacheFile(key: string) {
  const filePath = getCacheFilePath(key);
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
}
/**
 * Remove every cache file
 * @returns {void}
 */
export function removeAllCacheFiles() {
  const cachePath = getCachePath();
  if (fs.existsSync(cachePath)) {
    fs.removeSync(cachePath);
  }
}

/**
 * Read the cache file with a key
 * @param {string} key Key of a cache file
 * @returns {string|null} `null` if cache does not exists, `string` otherwise
 */
export function readCacheFile(key: string): string | null {
  const filePath = getCacheFilePath(key);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, { encoding: "utf8" });
}

/**
 * Write cache file
 * @param {string} key Key of a cache file
 * @param {string | NodeJS.ArrayBufferView} message Message to store
 * @param {boolean} [overwrite=false]
 * @returns {void}
 */
export function writeCacheFile(
  key: string,
  message: string | NodeJS.ArrayBufferView,
  overwrite = false
) {
  const filePath = getCacheFilePath(key);
  const cachePath = path.dirname(filePath);
  if (!fs.existsSync(cachePath)) {
    fs.mkdirpSync(cachePath);
  }
  fs.writeFileSync(filePath, message, {
    flag: overwrite ? "w" : "a",
    encoding: "utf8",
  });
}
