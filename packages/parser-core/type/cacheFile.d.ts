/**
 * Get path to store cache
 * @returns {string} Path of a temp directory
 */
export function getCachePath(): string;
/**
 * Remove the cache file with a key
 * @param {string} key Key of a cache file
 * @returns {void}
 */
export function removeCacheFile(key: string): void;
/**
 * Remove every cache file
 * @returns {void}
 */
export function removeAllCacheFiles(): void;
/**
 * Read the cache file with a key
 * @param {string} key Key of a cache file
 * @returns {string|null} `null` if cache does not exists, `string` otherwise
 */
export function readCacheFile(key: string): string | null;
/**
 * Write cache file
 * @param {string} key Key of a cache file
 * @param {string | NodeJS.ArrayBufferView} message Message to store
 * @param {boolean} [overwrite=false]
 * @returns {void}
 */
export function writeCacheFile(key: string, message: string | NodeJS.ArrayBufferView, overwrite?: boolean): void;
